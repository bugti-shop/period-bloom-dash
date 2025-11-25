-- Create enum for campaign status
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'active', 'expired', 'cancelled');

-- Create enum for campaign bonus type
CREATE TYPE public.campaign_bonus_type AS ENUM ('multiplier', 'fixed_bonus', 'percentage_increase');

-- Create promotional_campaigns table
CREATE TABLE public.promotional_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_code TEXT UNIQUE,
  status campaign_status NOT NULL DEFAULT 'draft',
  bonus_type campaign_bonus_type NOT NULL DEFAULT 'multiplier',
  bonus_value NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  applies_to_reward_types TEXT[], -- e.g., ['credit', 'discount']
  min_referrals INTEGER DEFAULT 1,
  target_user_segment TEXT, -- e.g., 'new_partners', 'top_performers', 'all'
  banner_text TEXT,
  banner_color TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_bonus_value CHECK (bonus_value > 0)
);

-- Create campaign_rewards table to track rewards earned during campaigns
CREATE TABLE public.campaign_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES partner_referrals(id) ON DELETE SET NULL,
  original_reward_value NUMERIC NOT NULL,
  bonus_reward_value NUMERIC NOT NULL,
  total_reward_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_participants table to track who's eligible
CREATE TABLE public.campaign_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rewards_earned INTEGER NOT NULL DEFAULT 0,
  total_bonus_earned NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(campaign_id, user_id)
);

-- Create indexes
CREATE INDEX idx_campaigns_status ON promotional_campaigns(status);
CREATE INDEX idx_campaigns_dates ON promotional_campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_code ON promotional_campaigns(campaign_code);
CREATE INDEX idx_campaign_rewards_campaign_id ON campaign_rewards(campaign_id);
CREATE INDEX idx_campaign_rewards_user_id ON campaign_rewards(user_id);
CREATE INDEX idx_campaign_participants_campaign_user ON campaign_participants(campaign_id, user_id);

-- Enable RLS
ALTER TABLE public.promotional_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotional_campaigns
CREATE POLICY "Public campaigns are viewable by all authenticated users"
  ON public.promotional_campaigns FOR SELECT
  USING (is_public = true AND status = 'active');

-- RLS Policies for campaign_rewards
CREATE POLICY "Users can view their own campaign rewards"
  ON public.campaign_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for campaign_participants
CREATE POLICY "Users can view their own campaign participation"
  ON public.campaign_participants FOR SELECT
  USING (auth.uid() = user_id);

-- Function to get active campaigns
CREATE OR REPLACE FUNCTION get_active_campaigns()
RETURNS SETOF promotional_campaigns
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM promotional_campaigns
  WHERE status = 'active'
    AND start_date <= now()
    AND end_date > now()
    AND is_public = true
  ORDER BY created_at DESC;
$$;

-- Function to calculate campaign bonus
CREATE OR REPLACE FUNCTION calculate_campaign_bonus(
  p_base_value NUMERIC,
  p_bonus_type campaign_bonus_type,
  p_bonus_value NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bonus_amount NUMERIC;
BEGIN
  CASE p_bonus_type
    WHEN 'multiplier' THEN
      -- e.g., 2x rewards means multiply by 2
      v_bonus_amount := p_base_value * (p_bonus_value - 1);
    WHEN 'fixed_bonus' THEN
      -- e.g., +$10 bonus
      v_bonus_amount := p_bonus_value;
    WHEN 'percentage_increase' THEN
      -- e.g., +50% means multiply by 0.5
      v_bonus_amount := p_base_value * (p_bonus_value / 100);
    ELSE
      v_bonus_amount := 0;
  END CASE;
  
  RETURN v_bonus_amount;
END;
$$;

-- Function to apply campaign bonus to reward
CREATE OR REPLACE FUNCTION apply_campaign_bonus_to_reward(
  p_user_id UUID,
  p_referral_id UUID,
  p_base_reward_value NUMERIC,
  p_reward_type reward_type
)
RETURNS TABLE(
  total_value NUMERIC,
  bonus_value NUMERIC,
  campaign_id UUID,
  campaign_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign RECORD;
  v_bonus NUMERIC := 0;
  v_total NUMERIC;
BEGIN
  -- Find applicable active campaign
  SELECT * INTO v_campaign
  FROM promotional_campaigns
  WHERE status = 'active'
    AND start_date <= now()
    AND end_date > now()
    AND is_public = true
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND (applies_to_reward_types IS NULL OR p_reward_type::TEXT = ANY(applies_to_reward_types))
  ORDER BY bonus_value DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- No active campaign, return base values
    RETURN QUERY SELECT p_base_reward_value, 0::NUMERIC, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Calculate bonus
  v_bonus := calculate_campaign_bonus(
    p_base_reward_value,
    v_campaign.bonus_type,
    v_campaign.bonus_value
  );

  v_total := p_base_reward_value + v_bonus;

  -- Record campaign reward
  INSERT INTO campaign_rewards (
    campaign_id,
    user_id,
    referral_id,
    original_reward_value,
    bonus_reward_value,
    total_reward_value
  ) VALUES (
    v_campaign.id,
    p_user_id,
    p_referral_id,
    p_base_reward_value,
    v_bonus,
    v_total
  );

  -- Update campaign usage
  UPDATE promotional_campaigns
  SET current_uses = current_uses + 1
  WHERE id = v_campaign.id;

  -- Update or create participant record
  INSERT INTO campaign_participants (
    campaign_id,
    user_id,
    rewards_earned,
    total_bonus_earned
  ) VALUES (
    v_campaign.id,
    p_user_id,
    1,
    v_bonus
  )
  ON CONFLICT (campaign_id, user_id)
  DO UPDATE SET
    rewards_earned = campaign_participants.rewards_earned + 1,
    total_bonus_earned = campaign_participants.total_bonus_earned + v_bonus;

  RETURN QUERY SELECT v_total, v_bonus, v_campaign.id, v_campaign.name;
END;
$$;

-- Function to update campaign status automatically
CREATE OR REPLACE FUNCTION update_campaign_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Activate scheduled campaigns that have reached their start date
  UPDATE promotional_campaigns
  SET status = 'active',
      activated_at = now()
  WHERE status = 'scheduled'
    AND start_date <= now()
    AND end_date > now();

  -- Expire active campaigns that have passed their end date
  UPDATE promotional_campaigns
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date <= now();

  -- Mark campaigns as expired if max uses reached
  UPDATE promotional_campaigns
  SET status = 'expired'
  WHERE status = 'active'
    AND max_uses IS NOT NULL
    AND current_uses >= max_uses;
END;
$$;

-- Update the distribute_referral_reward function to include campaign bonuses
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
  v_campaign_bonus RECORD;
  v_final_partner_value NUMERIC;
  v_final_referred_value NUMERIC;
BEGIN
  -- Get active reward configuration
  SELECT * INTO v_reward_config
  FROM reward_config
  WHERE is_active = true
    AND NOT requires_referral_action
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- Apply campaign bonus for partner
  SELECT * INTO v_campaign_bonus
  FROM apply_campaign_bonus_to_reward(
    p_partner_user_id,
    p_referral_id,
    v_reward_config.reward_value,
    v_reward_config.reward_type
  );

  v_final_partner_value := COALESCE(v_campaign_bonus.total_value, v_reward_config.reward_value);

  -- Create reward for partner
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
    v_final_partner_value,
    v_reward_config.reward_unit,
    'active',
    p_referral_id,
    now(),
    CASE 
      WHEN v_reward_config.reward_type = 'credit' THEN now() + interval '365 days'
      WHEN v_reward_config.reward_type = 'trial_extension' THEN now() + interval '90 days'
      ELSE NULL
    END,
    jsonb_build_object(
      'auto_distributed', true,
      'campaign_bonus', v_campaign_bonus.bonus_value,
      'campaign_id', v_campaign_bonus.campaign_id,
      'campaign_name', v_campaign_bonus.campaign_name
    )
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
    v_final_partner_value,
    CASE 
      WHEN v_campaign_bonus.campaign_name IS NOT NULL 
      THEN 'Reward earned from referral with ' || v_campaign_bonus.campaign_name || ' bonus'
      ELSE 'Reward earned from referral'
    END
  );

  -- Create welcome bonus for referred user
  IF v_reward_config.reward_type IN ('credit', 'trial_extension') THEN
    v_final_referred_value := v_reward_config.reward_value * 0.5;
    
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
      v_final_referred_value,
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
      v_final_referred_value,
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
    v_final_partner_value
  );

  RETURN true;
END;
$$;

-- Trigger to update campaign updated_at
CREATE TRIGGER trigger_update_campaign_updated_at
  BEFORE UPDATE ON promotional_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_reward_config_updated_at();