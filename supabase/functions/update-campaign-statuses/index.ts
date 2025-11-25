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

    console.log('Running campaign status updates...');

    // Call the database function to update statuses
    const { error } = await supabaseAdmin.rpc('update_campaign_statuses');

    if (error) {
      console.error('Error updating campaign statuses:', error);
      throw error;
    }

    // Get summary of current campaigns
    const { data: campaigns, error: fetchError } = await supabaseAdmin
      .from('promotional_campaigns')
      .select('status')
      .in('status', ['scheduled', 'active', 'expired']);

    if (fetchError) {
      console.error('Error fetching campaigns:', fetchError);
      throw fetchError;
    }

    const summary = {
      scheduled: campaigns?.filter(c => c.status === 'scheduled').length || 0,
      active: campaigns?.filter(c => c.status === 'active').length || 0,
      expired: campaigns?.filter(c => c.status === 'expired').length || 0,
    };

    console.log('Campaign status update complete:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Campaign statuses updated',
        summary,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-campaign-statuses:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
