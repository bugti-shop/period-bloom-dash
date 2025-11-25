import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, DollarSign, Percent, Calendar } from "lucide-react";

export const useRewardNotifications = () => {
  useEffect(() => {
    const channel = supabase
      .channel('reward-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_rewards'
        },
        (payload) => {
          const reward = payload.new;
          
          // Show toast notification for new reward
          const getRewardMessage = () => {
            switch (reward.reward_type) {
              case 'credit':
                return `You earned $${reward.reward_value} in credits!`;
              case 'discount':
                return `You unlocked a ${reward.reward_value}% discount!`;
              case 'trial_extension':
                return `You got ${reward.reward_value} extra ${reward.reward_unit}!`;
              case 'premium_access':
                return `You unlocked premium access!`;
              default:
                return 'You earned a new reward!';
            }
          };

          const getIcon = () => {
            switch (reward.reward_type) {
              case 'credit':
                return <DollarSign className="h-5 w-5" />;
              case 'discount':
                return <Percent className="h-5 w-5" />;
              case 'trial_extension':
                return <Calendar className="h-5 w-5" />;
              default:
                return <Gift className="h-5 w-5" />;
            }
          };

          toast.success(getRewardMessage(), {
            icon: getIcon(),
            duration: 5000,
            description: reward.metadata?.welcome_bonus 
              ? 'Welcome bonus for joining!' 
              : 'Thanks for referring a friend!',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
