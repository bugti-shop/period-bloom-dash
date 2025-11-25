import { supabase } from "@/integrations/supabase/client";

/**
 * Track user action and automatically confirm referral if eligible
 */
export const trackUserAction = async (action: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Call the auto-confirm edge function
    const { data, error } = await supabase.functions.invoke('auto-confirm-referrals', {
      body: { userId: user.id, action }
    });

    if (error) {
      console.error('Error tracking user action:', error);
      return;
    }

    console.log('User action tracked:', data);
    return data;
  } catch (error) {
    console.error('Error in trackUserAction:', error);
  }
};

/**
 * Common user actions that can trigger reward distribution
 */
export const UserActions = {
  FIRST_PERIOD_LOG: 'first_period_log',
  COMPLETE_PROFILE: 'complete_profile',
  FIRST_SYMPTOM_LOG: 'first_symptom_log',
  ENABLE_PREGNANCY_MODE: 'enable_pregnancy_mode',
  FIRST_WEEK_USAGE: 'first_week_usage',
  SHARE_APP: 'share_app'
} as const;
