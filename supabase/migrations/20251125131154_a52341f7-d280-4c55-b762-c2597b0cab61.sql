-- Create enum for referral status
CREATE TYPE public.referral_status AS ENUM ('pending', 'confirmed', 'rewarded');

-- Create enum for partner event types
CREATE TYPE public.partner_event_type AS ENUM (
  'code_generated',
  'code_regenerated',
  'code_claimed',
  'referral_confirmed',
  'payout_requested'
);

-- Create partner_codes table
CREATE TABLE public.partner_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  regenerated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT code_length CHECK (length(code) >= 6 AND length(code) <= 8),
  CONSTRAINT code_numeric CHECK (code ~ '^\d+$')
);

-- Create partner_referrals table
CREATE TABLE public.partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status referral_status NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_user_id),
  CONSTRAINT no_self_referral CHECK (partner_user_id != referred_user_id)
);

-- Create partner_rewards table
CREATE TABLE public.partner_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES partner_referrals(id) ON DELETE CASCADE,
  partner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value NUMERIC NOT NULL DEFAULT 0,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner_events table for analytics
CREATE TABLE public.partner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type partner_event_type NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_partner_codes_user_id ON partner_codes(user_id);
CREATE INDEX idx_partner_codes_code ON partner_codes(code);
CREATE INDEX idx_partner_referrals_partner_user_id ON partner_referrals(partner_user_id);
CREATE INDEX idx_partner_referrals_referred_user_id ON partner_referrals(referred_user_id);
CREATE INDEX idx_partner_referrals_status ON partner_referrals(status);
CREATE INDEX idx_partner_events_user_id ON partner_events(user_id);
CREATE INDEX idx_partner_events_created_at ON partner_events(created_at);

-- Enable Row Level Security
ALTER TABLE public.partner_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_codes
CREATE POLICY "Users can view their own partner code"
  ON public.partner_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partner code"
  ON public.partner_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner code"
  ON public.partner_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for partner_referrals
CREATE POLICY "Partners can view their referrals"
  ON public.partner_referrals FOR SELECT
  USING (auth.uid() = partner_user_id);

CREATE POLICY "Referred users can view their referral record"
  ON public.partner_referrals FOR SELECT
  USING (auth.uid() = referred_user_id);

CREATE POLICY "Users can create referral records"
  ON public.partner_referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);

-- RLS Policies for partner_rewards
CREATE POLICY "Partners can view their rewards"
  ON public.partner_rewards FOR SELECT
  USING (auth.uid() = partner_user_id);

-- RLS Policies for partner_events
CREATE POLICY "Users can view their own events"
  ON public.partner_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.partner_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to generate a unique 6-digit code
CREATE OR REPLACE FUNCTION generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-digit code
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM partner_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to log partner events
CREATE OR REPLACE FUNCTION log_partner_event(
  p_user_id UUID,
  p_event_type partner_event_type,
  p_event_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO partner_events (user_id, event_type, event_data)
  VALUES (p_user_id, p_event_type, p_event_data)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;