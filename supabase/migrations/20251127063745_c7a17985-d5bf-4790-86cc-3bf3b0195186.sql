-- Fix security warnings by setting search_path for all functions

-- Drop and recreate check_referral_code_available with proper search_path
DROP FUNCTION IF EXISTS public.check_referral_code_available(TEXT);

CREATE OR REPLACE FUNCTION public.check_referral_code_available(code_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.referral_codes
    WHERE code = code_to_check AND is_active = true
  );
END;
$$;

-- Drop and recreate get_referrer_by_code with proper search_path
DROP FUNCTION IF EXISTS public.get_referrer_by_code(TEXT);

CREATE OR REPLACE FUNCTION public.get_referrer_by_code(referral_code TEXT)
RETURNS TABLE (user_id UUID, code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT rc.user_id, rc.code
  FROM public.referral_codes rc
  WHERE rc.code = referral_code AND rc.is_active = true
  LIMIT 1;
END;
$$;

-- Drop and recreate process_referral_reward with proper search_path
DROP FUNCTION IF EXISTS public.process_referral_reward(UUID);

CREATE OR REPLACE FUNCTION public.process_referral_reward(referral_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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