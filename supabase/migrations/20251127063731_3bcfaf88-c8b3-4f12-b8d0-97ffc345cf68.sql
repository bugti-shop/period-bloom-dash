-- Create referral_codes table to store user-generated referral codes
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT referral_code_length CHECK (char_length(code) >= 4 AND char_length(code) <= 20),
  CONSTRAINT referral_code_format CHECK (code ~ '^[A-Za-z0-9_-]+$')
);

-- Create referrals table to track successful referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rewarded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT no_self_referral CHECK (referrer_user_id != referred_user_id),
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

-- Create free_months_rewards table to track earned free months
CREATE TABLE public.free_months_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  months_earned INTEGER NOT NULL DEFAULT 1,
  months_used INTEGER NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'referral',
  referral_id UUID REFERENCES public.referrals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT positive_months CHECK (months_earned > 0 AND months_used >= 0)
);

-- Enable Row Level Security
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_months_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they made or received"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Anyone can create a referral record"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- RLS Policies for free_months_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.free_months_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
  ON public.free_months_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own rewards"
  ON public.free_months_rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to check if code exists
CREATE OR REPLACE FUNCTION public.check_referral_code_available(code_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.referral_codes
    WHERE code = code_to_check AND is_active = true
  );
END;
$$;

-- Create function to get referrer info by code
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(referral_code TEXT)
RETURNS TABLE (user_id UUID, code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT rc.user_id, rc.code
  FROM public.referral_codes rc
  WHERE rc.code = referral_code AND rc.is_active = true
  LIMIT 1;
END;
$$;

-- Create function to process confirmed referral and grant reward
CREATE OR REPLACE FUNCTION public.process_referral_reward(referral_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_status TEXT;
BEGIN
  -- Get referral details
  SELECT referrer_user_id, status INTO v_referrer_id, v_status
  FROM public.referrals
  WHERE id = referral_id_param;
  
  -- Only process if status is confirmed and not already rewarded
  IF v_status = 'confirmed' THEN
    -- Insert reward
    INSERT INTO public.free_months_rewards (user_id, months_earned, source, referral_id)
    VALUES (v_referrer_id, 1, 'referral', referral_id_param);
    
    -- Update referral status
    UPDATE public.referrals
    SET status = 'rewarded'
    WHERE id = referral_id_param;
  END IF;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_free_months_user_id ON public.free_months_rewards(user_id);