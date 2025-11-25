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

    const { referralId, action } = await req.json();

    if (!referralId) {
      return new Response(
        JSON.stringify({ error: 'Referral ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to update referral status
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the referral
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('partner_referrals')
      .select('*')
      .eq('id', referralId)
      .maybeSingle();

    if (referralError || !referral) {
      return new Response(
        JSON.stringify({ error: 'Referral not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update referral status to confirmed
    const { error: updateError } = await supabaseAdmin
      .from('partner_referrals')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', referralId);

    if (updateError) {
      console.error('Error updating referral:', updateError);
      throw updateError;
    }

    // Distribute rewards automatically using the database function
    const { data: rewardResult, error: rewardError } = await supabaseAdmin.rpc(
      'distribute_referral_reward',
      {
        p_referral_id: referralId,
        p_partner_user_id: referral.partner_user_id,
        p_referred_user_id: referral.referred_user_id
      }
    );

    if (rewardError) {
      console.error('Error distributing rewards:', rewardError);
      // Don't fail the request if reward distribution fails
      // The referral is still confirmed
    }

    // Log confirmation event
    await supabaseAdmin.rpc('log_partner_event', {
      p_user_id: referral.partner_user_id,
      p_event_type: 'referral_confirmed',
      p_event_data: { referral_id: referralId, action }
    });

    // Update referral status in partner_referrals to 'rewarded'
    await supabaseAdmin
      .from('partner_referrals')
      .update({ status: 'rewarded' })
      .eq('id', referralId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Referral confirmed and rewards distributed',
        rewardDistributed: !!rewardResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in partner-confirm-referral:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
