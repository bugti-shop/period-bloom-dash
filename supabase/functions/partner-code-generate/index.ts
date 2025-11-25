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

    // Check if user already has a code
    const { data: existingCode } = await supabaseClient
      .from('partner_codes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let code;
    let isRegenerated = false;

    if (existingCode) {
      // Regenerate code
      const { data: newCodeData } = await supabaseClient.rpc('generate_partner_code');
      code = newCodeData;

      const { error: updateError } = await supabaseClient
        .from('partner_codes')
        .update({
          code: code,
          regenerated_at: new Date().toISOString(),
          is_active: true
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log regeneration event
      await supabaseClient.rpc('log_partner_event', {
        p_user_id: user.id,
        p_event_type: 'code_regenerated',
        p_event_data: { code }
      });

      isRegenerated = true;
    } else {
      // Generate new code
      const { data: newCodeData } = await supabaseClient.rpc('generate_partner_code');
      code = newCodeData;

      const { error: insertError } = await supabaseClient
        .from('partner_codes')
        .insert({
          user_id: user.id,
          code: code
        });

      if (insertError) throw insertError;

      // Log generation event
      await supabaseClient.rpc('log_partner_event', {
        p_user_id: user.id,
        p_event_type: 'code_generated',
        p_event_data: { code }
      });
    }

    return new Response(
      JSON.stringify({
        code,
        isRegenerated,
        shareLink: `${Deno.env.get('APP_URL') || 'https://app.example.com'}/install?partner=${code}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in partner-code-generate:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
