-- Create enum for reward types
CREATE TYPE public.reward_type AS ENUM ('credit', 'discount', 'trial_extension', 'premium_access');

-- Create reward_config table for configurable rewards
CREATE TABLE public.reward_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reward_type reward_type NOT NULL,
  reward_value NUMERIC NOT NULL,
  reward_unit TEXT, -- e.g., 'days', 'percent', 'dollars'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_referral_action BOOLEAN NOT NULL DEFAULT true,
  required_action TEXT, -- e.g., 'first_period_log', 'complete_profile'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_rewards table to track earned rewards
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_config_id UUID NOT NULL REFERENCES reward_config(id) ON DELETE CASCADE,
  reward_type reward_type NOT NULL,
  reward_value NUMERIC NOT NULL,
  reward_unit TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, used, expired
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  source_referral_id UUID REFERENCES partner_referrals(id) ON DELETE SET NULL,
  metadata JSONB
);

-- Create reward_transactions table for audit trail
CREATE TABLE public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES user_rewards(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- earned, activated, used, expired
  amount NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create indexes
CREATE INDEX idx_reward_config_active ON reward_config(is_active);
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_status ON user_rewards(status);
CREATE INDEX idx_user_rewards_referral_id ON user_rewards(source_referral_id);
CREATE INDEX idx_reward_transactions_user_id ON reward_transactions(user_id);

-- Enable RLS
ALTER TABLE public.reward_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reward_config (all users can read active configs)
CREATE POLICY "Users can view active reward configs"
  ON public.reward_config FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON public.user_rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for reward_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.reward_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Function to get user's total available credits
CREATE OR REPLACE FUNCTION get_user_available_credits(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_credits NUMERIC;
BEGIN
  SELECT COALESCE(SUM(reward_value), 0)
  INTO total_credits
  FROM user_rewards
  WHERE user_id = p_user_id
    AND reward_type = 'credit'
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now());
  
  RETURN total_credits;
END;
$$;

-- Function to distribute rewards automatically
CREATE OR REPLACE FUNCTION distribute_referral_reward(
  p_referral_id UUID,
  p_partner_user_id UUID,
  p_referred_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward_config RECORD;
  v_reward_id UUID;
  v_partner_reward_id UUID;
  v_referred_reward_id UUID;
BEGIN
  -- Get active reward configuration
  SELECT * INTO v_reward_config
  FROM reward_config
  WHERE is_active = true
    AND NOT requires_referral_action
  LIMIT 1;

  IF NOT FOUND THEN
    -- No active reward config, just return true
    RETURN true;
  END IF;

  -- Create reward for partner (referrer)
  INSERT INTO user_rewards (
    user_id,
    reward_config_id,
    reward_type,
    reward_value,
    reward_unit,
    status,
    source_referral_id,
    activated_at,
    expires_at,
    metadata
  ) VALUES (
    p_partner_user_id,
    v_reward_config.id,
    v_reward_config.reward_type,
    v_reward_config.reward_value,
    v_reward_config.reward_unit,
    'active',
    p_referral_id,
    now(),
    CASE 
      WHEN v_reward_config.reward_type = 'credit' THEN now() + interval '365 days'
      WHEN v_reward_config.reward_type = 'trial_extension' THEN now() + interval '90 days'
      ELSE NULL
    END,
    jsonb_build_object('auto_distributed', true)
  ) RETURNING id INTO v_partner_reward_id;

  -- Log transaction for partner
  INSERT INTO reward_transactions (
    user_id,
    reward_id,
    transaction_type,
    amount,
    description
  ) VALUES (
    p_partner_user_id,
    v_partner_reward_id,
    'earned',
    v_reward_config.reward_value,
    'Reward earned from referral'
  );

  -- Create reward for referred user (optional welcome bonus)
  IF v_reward_config.reward_type IN ('credit', 'trial_extension') THEN
    INSERT INTO user_rewards (
      user_id,
      reward_config_id,
      reward_type,
      reward_value,
      reward_unit,
      status,
      source_referral_id,
      activated_at,
      expires_at,
      metadata
    ) VALUES (
      p_referred_user_id,
      v_reward_config.id,
      v_reward_config.reward_type,
      v_reward_config.reward_value * 0.5, -- Give referred user 50% of reward value
      v_reward_config.reward_unit,
      'active',
      p_referral_id,
      now(),
      CASE 
        WHEN v_reward_config.reward_type = 'credit' THEN now() + interval '365 days'
        WHEN v_reward_config.reward_type = 'trial_extension' THEN now() + interval '90 days'
        ELSE NULL
      END,
      jsonb_build_object('auto_distributed', true, 'welcome_bonus', true)
    ) RETURNING id INTO v_referred_reward_id;

    -- Log transaction for referred user
    INSERT INTO reward_transactions (
      user_id,
      reward_id,
      transaction_type,
      amount,
      description
    ) VALUES (
      p_referred_user_id,
      v_referred_reward_id,
      'earned',
      v_reward_config.reward_value * 0.5,
      'Welcome bonus for joining'
    );
  END IF;

  -- Update partner_rewards table
  INSERT INTO partner_rewards (
    referral_id,
    partner_user_id,
    reward_type,
    reward_value
  ) VALUES (
    p_referral_id,
    p_partner_user_id,
    v_reward_config.reward_type::TEXT,
    v_reward_config.reward_value
  );

  RETURN true;
END;
$$;

-- Insert default reward configurations
INSERT INTO reward_config (name, reward_type, reward_value, reward_unit, description, requires_referral_action) VALUES
  ('Default Credit Reward', 'credit', 10, 'dollars', 'Earn $10 credit for each successful referral', false),
  ('Premium Trial Extension', 'trial_extension', 30, 'days', 'Get 30 extra days of premium access', false),
  ('Discount Coupon', 'discount', 20, 'percent', 'Receive 20% discount on next purchase', false);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reward_config_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for reward_config
CREATE TRIGGER trigger_update_reward_config_updated_at
  BEFORE UPDATE ON reward_config
  FOR EACH ROW
  EXECUTE FUNCTION update_reward_config_updated_at();