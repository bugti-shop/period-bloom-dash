import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

interface CampaignParticipation {
  campaign_id: string;
  rewards_earned: number;
  total_bonus_earned: number;
}

export const CampaignStats = () => {
  const [participation, setParticipation] = useState<CampaignParticipation[]>([]);
  const [totalBonus, setTotalBonus] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    loadCampaignStats();
  }, []);

  const loadCampaignStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user's campaign participation
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setParticipation(data || []);

      // Calculate totals
      const totalBonusEarned = data?.reduce((sum, p) => sum + Number(p.total_bonus_earned), 0) || 0;
      const totalRewardsEarned = data?.reduce((sum, p) => sum + p.rewards_earned, 0) || 0;

      setTotalBonus(totalBonusEarned);
      setTotalRewards(totalRewardsEarned);

    } catch (error) {
      console.error('Error loading campaign stats:', error);
    }
  };

  if (participation.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Campaign Bonuses
        </CardTitle>
        <CardDescription>Extra rewards from promotional campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Campaign Rewards</div>
            <div className="text-2xl font-bold">{totalRewards}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Bonus</div>
            <div className="text-2xl font-bold text-green-600">${totalBonus.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
