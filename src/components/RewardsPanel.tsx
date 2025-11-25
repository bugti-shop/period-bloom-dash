import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, DollarSign, Clock, TrendingUp, Percent, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Reward {
  id: string;
  reward_type: string;
  reward_value: number;
  reward_unit: string;
  status: string;
  earned_at: string;
  activated_at?: string;
  expires_at?: string;
  used_at?: string;
  metadata?: any;
}

interface RewardTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
}

export const RewardsPanel = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

      // Load reward transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Get total available credits
      const { data: creditsData, error: creditsError } = await supabase.rpc(
        'get_user_available_credits',
        { p_user_id: user.id }
      );

      if (creditsError) throw creditsError;
      setTotalCredits(creditsData || 0);

    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'discount':
        return <Percent className="h-5 w-5 text-blue-600" />;
      case 'trial_extension':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'premium_access':
        return <TrendingUp className="h-5 w-5 text-orange-600" />;
      default:
        return <Gift className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      active: { variant: "default", label: "Active" },
      used: { variant: "outline", label: "Used" },
      expired: { variant: "destructive", label: "Expired" }
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatRewardValue = (reward: Reward) => {
    switch (reward.reward_type) {
      case 'credit':
        return `$${reward.reward_value}`;
      case 'discount':
        return `${reward.reward_value}%`;
      case 'trial_extension':
        return `${reward.reward_value} ${reward.reward_unit}`;
      case 'premium_access':
        return `${reward.reward_value} ${reward.reward_unit}`;
      default:
        return reward.reward_value.toString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Credits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Available Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${totalCredits.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Use your credits on premium features
          </p>
        </CardContent>
      </Card>

      {/* All Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rewards</CardTitle>
          <CardDescription>All rewards you've earned from referrals</CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rewards yet. Start referring friends to earn rewards!
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getRewardIcon(reward.reward_type)}
                    <div>
                      <div className="font-medium capitalize">
                        {reward.reward_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Earned {format(new Date(reward.earned_at), 'MMM d, yyyy')}
                      </div>
                      {reward.expires_at && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Expires {format(new Date(reward.expires_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatRewardValue(reward)}
                      </div>
                    </div>
                    {getStatusBadge(reward.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your reward activity history</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border-b"
                >
                  <div>
                    <div className="font-medium capitalize">
                      {transaction.transaction_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  {transaction.amount && (
                    <div className="font-bold text-green-600">
                      +${transaction.amount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
