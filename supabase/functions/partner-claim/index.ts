import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a referral
    const { data: existingReferral } = await supabaseClient
      .from('partner_referrals')
      .select('*')
      .eq('referred_user_id', user.id)
      .maybeSingle();

    if (existingReferral) {
      return new Response(
        JSON.stringify({ error: 'You have already used a partner code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate code
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: partnerCode, error: codeError } = await supabaseAdmin
      .from('partner_codes')
      .select('user_id, code, is_active')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError || !partnerCode) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive partner code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for self-referral
    if (partnerCode.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot use your own partner code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create referral record
    const { error: insertError } = await supabaseClient
      .from('partner_referrals')
      .insert({
        partner_user_id: partnerCode.user_id,
        referred_user_id: user.id,
        code_used: code,
        status: 'pending'
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Log claim event
    await supabaseClient.rpc('log_partner_event', {
      p_user_id: user.id,
      p_event_type: 'code_claimed',
      p_event_data: { code, partner_user_id: partnerCode.user_id }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Partner code claimed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in partner-claim:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
