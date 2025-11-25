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

    // Get partner code
    const { data: partnerCode } = await supabaseClient
      .from('partner_codes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!partnerCode) {
      return new Response(
        JSON.stringify({ error: 'No partner code found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get referrals count by status
    const { data: referrals, error: referralsError } = await supabaseClient
      .from('partner_referrals')
      .select('status, created_at')
      .eq('partner_user_id', user.id);

    if (referralsError) throw referralsError;

    const stats = {
      totalReferrals: referrals?.length || 0,
      pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
      confirmedReferrals: referrals?.filter(r => r.status === 'confirmed').length || 0,
      rewardedReferrals: referrals?.filter(r => r.status === 'rewarded').length || 0,
    };

    // Get total rewards
    const { data: rewards, error: rewardsError } = await supabaseClient
      .from('partner_rewards')
      .select('reward_value')
      .eq('partner_user_id', user.id);

    if (rewardsError) throw rewardsError;

    const totalEarnings = rewards?.reduce((sum, r) => sum + Number(r.reward_value), 0) || 0;

    // Get recent activity
    const { data: events, error: eventsError } = await supabaseClient
      .from('partner_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) throw eventsError;

    return new Response(
      JSON.stringify({
        code: partnerCode.code,
        stats,
        totalEarnings,
        recentActivity: events || [],
        shareLink: `${Deno.env.get('APP_URL') || 'https://app.example.com'}/install?partner=${partnerCode.code}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in partner-dashboard:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
