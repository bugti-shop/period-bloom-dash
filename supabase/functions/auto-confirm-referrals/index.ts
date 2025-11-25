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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'User ID and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking referral eligibility for user ${userId} after action: ${action}`);

    // Get pending referral for this user
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('partner_referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (referralError) {
      console.error('Error fetching referral:', referralError);
      throw referralError;
    }

    if (!referral) {
      console.log('No pending referral found for user');
      return new Response(
        JSON.stringify({ message: 'No pending referral found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the action qualifies for reward distribution
    const { data: rewardConfigs } = await supabaseAdmin
      .from('reward_config')
      .select('*')
      .eq('is_active', true)
      .eq('requires_referral_action', true)
      .contains('required_action', action);

    const shouldConfirm = rewardConfigs && rewardConfigs.length > 0;

    if (!shouldConfirm) {
      console.log('Action does not qualify for automatic confirmation');
      // Still confirm the referral, but with a note
      await supabaseAdmin
        .from('partner_referrals')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      return new Response(
        JSON.stringify({ 
          message: 'Referral confirmed but action does not qualify for rewards',
          confirmed: true,
          rewardsDistributed: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Confirm referral and distribute rewards
    console.log('Confirming referral and distributing rewards...');

    await supabaseAdmin
      .from('partner_referrals')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    // Distribute rewards
    const { data: rewardResult, error: rewardError } = await supabaseAdmin.rpc(
      'distribute_referral_reward',
      {
        p_referral_id: referral.id,
        p_partner_user_id: referral.partner_user_id,
        p_referred_user_id: referral.referred_user_id
      }
    );

    if (rewardError) {
      console.error('Error distributing rewards:', rewardError);
    }

    // Update to rewarded status
    await supabaseAdmin
      .from('partner_referrals')
      .update({ status: 'rewarded' })
      .eq('id', referral.id);

    // Log event
    await supabaseAdmin.rpc('log_partner_event', {
      p_user_id: referral.partner_user_id,
      p_event_type: 'referral_confirmed',
      p_event_data: { 
        referral_id: referral.id, 
        action,
        auto_confirmed: true
      }
    });

    console.log('Referral confirmed and rewards distributed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Referral confirmed and rewards distributed',
        confirmed: true,
        rewardsDistributed: !!rewardResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-confirm-referrals:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
