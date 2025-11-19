-- Drop the partner_shares table (this will automatically drop all RLS policies)
DROP TABLE IF EXISTS public.partner_shares CASCADE;

-- Drop the generate_share_code function
DROP FUNCTION IF EXISTS public.generate_share_code() CASCADE;