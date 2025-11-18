--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: generate_share_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_share_code() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate 6-digit code
    code := LPAD(FLOOR(random() * 1000000)::text, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.partner_shares WHERE share_code = code) INTO exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: partner_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    share_code text NOT NULL,
    share_name text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    share_period_data boolean DEFAULT true,
    share_symptoms boolean DEFAULT true,
    share_health_data boolean DEFAULT true,
    share_notes boolean DEFAULT false
);


--
-- Name: partner_shares partner_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shares
    ADD CONSTRAINT partner_shares_pkey PRIMARY KEY (id);


--
-- Name: partner_shares partner_shares_share_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shares
    ADD CONSTRAINT partner_shares_share_code_key UNIQUE (share_code);


--
-- Name: partner_shares partner_shares_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shares
    ADD CONSTRAINT partner_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: partner_shares Anyone can view shares by code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view shares by code" ON public.partner_shares FOR SELECT USING (true);


--
-- Name: partner_shares Users can create shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create shares" ON public.partner_shares FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: partner_shares Users can delete their own shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own shares" ON public.partner_shares FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: partner_shares Users can view their own shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own shares" ON public.partner_shares FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: partner_shares; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_shares ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


