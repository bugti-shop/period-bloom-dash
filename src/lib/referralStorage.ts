import { supabase } from "@/integrations/supabase/client";

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  is_active: boolean;
}

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  referral_code: string;
  status: 'pending' | 'confirmed' | 'rewarded';
  created_at: string;
  confirmed_at: string | null;
}

export interface FreeMonthsReward {
  id: string;
  user_id: string;
  months_earned: number;
  months_used: number;
  source: string;
  referral_id: string | null;
  created_at: string;
}

const REFERRAL_CODE_CACHE_KEY = "referral_code_cache";

// Cache user's referral code locally
export const cacheReferralCode = (code: string): void => {
  localStorage.setItem(REFERRAL_CODE_CACHE_KEY, code);
};

export const getCachedReferralCode = (): string | null => {
  return localStorage.getItem(REFERRAL_CODE_CACHE_KEY);
};

export const clearCachedReferralCode = (): void => {
  localStorage.removeItem(REFERRAL_CODE_CACHE_KEY);
};

// Check if referral code is available
export const checkCodeAvailability = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_referral_code_available', {
      code_to_check: code
    });
    
    if (error) {
      console.error('Error checking code availability:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error checking code availability:', error);
    return false;
  }
};

// Create a new referral code for the user
export const createReferralCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if code is available
    const isAvailable = await checkCodeAvailability(code);
    if (!isAvailable) {
      return { success: false, error: 'Code already taken' };
    }

    const { error } = await supabase
      .from('referral_codes')
      .insert({
        user_id: user.id,
        code: code.trim(),
        is_active: true
      });

    if (error) {
      console.error('Error creating referral code:', error);
      return { success: false, error: error.message };
    }

    cacheReferralCode(code);
    return { success: true };
  } catch (error) {
    console.error('Error creating referral code:', error);
    return { success: false, error: 'Failed to create referral code' };
  }
};

// Get user's referral code
export const getUserReferralCode = async (): Promise<ReferralCode | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No code found
        return null;
      }
      console.error('Error fetching referral code:', error);
      return null;
    }

    if (data) {
      cacheReferralCode(data.code);
    }

    return data;
  } catch (error) {
    console.error('Error fetching referral code:', error);
    return null;
  }
};

// Apply referral code when signing up
export const applyReferralCode = async (code: string, referredUserId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get referrer info
    const { data: referrerData, error: referrerError } = await supabase.rpc('get_referrer_by_code', {
      referral_code: code
    });

    if (referrerError || !referrerData || referrerData.length === 0) {
      return { success: false, error: 'Invalid referral code' };
    }

    const referrerId = referrerData[0].user_id;

    // Prevent self-referral
    if (referrerId === referredUserId) {
      return { success: false, error: 'Cannot use your own referral code' };
    }

    // Create referral record
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_user_id: referrerId,
        referred_user_id: referredUserId,
        referral_code: code,
        status: 'pending'
      });

    if (error) {
      console.error('Error creating referral:', error);
      return { success: false, error: 'Failed to apply referral code' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, error: 'Failed to apply referral code' };
  }
};

// Confirm referral when user subscribes to paid plan
export const confirmReferral = async (userId: string): Promise<void> => {
  try {
    // Find pending referral for this user
    const { data: referrals, error: fetchError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .eq('status', 'pending')
      .limit(1);

    if (fetchError || !referrals || referrals.length === 0) {
      return;
    }

    const referral = referrals[0];

    // Update referral status to confirmed
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error confirming referral:', updateError);
      return;
    }

    // Process reward
    const { error: rewardError } = await supabase.rpc('process_referral_reward', {
      referral_id_param: referral.id
    });

    if (rewardError) {
      console.error('Error processing reward:', rewardError);
    }
  } catch (error) {
    console.error('Error confirming referral:', error);
  }
};

// Get user's earned free months
export const getFreeMonthsBalance = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('free_months_rewards')
      .select('months_earned, months_used')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching free months:', error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const totalEarned = data.reduce((sum, reward) => sum + reward.months_earned, 0);
    const totalUsed = data.reduce((sum, reward) => sum + reward.months_used, 0);

    return totalEarned - totalUsed;
  } catch (error) {
    console.error('Error fetching free months:', error);
    return 0;
  }
};

// Get referral statistics
export const getReferralStats = async (): Promise<{ total: number; confirmed: number; rewarded: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { total: 0, confirmed: 0, rewarded: 0 };
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_user_id', user.id);

    if (error) {
      console.error('Error fetching referral stats:', error);
      return { total: 0, confirmed: 0, rewarded: 0 };
    }

    if (!data) {
      return { total: 0, confirmed: 0, rewarded: 0 };
    }

    return {
      total: data.length,
      confirmed: data.filter(r => r.status === 'confirmed' || r.status === 'rewarded').length,
      rewarded: data.filter(r => r.status === 'rewarded').length
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return { total: 0, confirmed: 0, rewarded: 0 };
  }
};
