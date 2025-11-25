import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  name: string;
  banner_text: string;
  banner_color: string;
  bonus_type: string;
  bonus_value: number;
  end_date: string;
}

export const CampaignBanner = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadActiveCampaign();
  }, []);

  const loadActiveCampaign = async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_campaigns');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const activeCampaign = data[0];
        const dismissedKey = `campaign_dismissed_${activeCampaign.id}`;
        const isDismissed = localStorage.getItem(dismissedKey) === 'true';
        
        if (!isDismissed) {
          setCampaign(activeCampaign);
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    }
  };

  const handleDismiss = () => {
    if (campaign) {
      localStorage.setItem(`campaign_dismissed_${campaign.id}`, 'true');
      setDismissed(true);
    }
  };

  const getBonusText = () => {
    if (!campaign) return '';
    
    switch (campaign.bonus_type) {
      case 'multiplier':
        return `${campaign.bonus_value}x`;
      case 'fixed_bonus':
        return `+$${campaign.bonus_value}`;
      case 'percentage_increase':
        return `+${campaign.bonus_value}%`;
      default:
        return '';
    }
  };

  if (!campaign || dismissed) return null;

  return (
    <div
      className="relative py-3 px-4 text-white shadow-md"
      style={{ backgroundColor: campaign.banner_color }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Gift className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">
              {campaign.banner_text || `${getBonusText()} Rewards - Limited Time!`}
            </div>
            <div className="text-sm opacity-90">
              Ends {new Date(campaign.end_date).toLocaleDateString()}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
