-- Fix search_path for generate_partner_code function
CREATE OR REPLACE FUNCTION generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path for log_partner_event function
CREATE OR REPLACE FUNCTION log_partner_event(
  p_user_id UUID,
  p_event_type partner_event_type,
  p_event_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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