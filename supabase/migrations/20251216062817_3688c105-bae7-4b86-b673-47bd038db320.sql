-- Drop the insecure policy that allows anyone to create referrals
DROP POLICY IF EXISTS "Anyone can create a referral record" ON public.referrals;

-- Create a secure policy that requires authentication and validates the referrer
CREATE POLICY "Authenticated users can create referrals as referrer"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_user_id);