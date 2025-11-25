import logo from "@/assets/logo.png";
import { BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  showArticlesToggle?: boolean;
  onArticlesToggle?: () => void;
  isArticlesMode?: boolean;
}

export const Header = ({ showArticlesToggle = false, onArticlesToggle, isArticlesMode = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [hasPartnerCode, setHasPartnerCode] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    checkPartnerStatus();
  }, []);

  const checkPartnerStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: codeData } = await supabase
        .from('partner_codes')
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (codeData) {
        setHasPartnerCode(true);

        // Get referral count
        const { data: referrals } = await supabase
          .from('partner_referrals')
          .select('id', { count: 'exact' })
          .eq('partner_user_id', user.id);

        if (referrals) {
          setReferralCount(referrals.length);
        }
      }
    } catch (error) {
      console.error('Error checking partner status:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Lufi" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">Lufi</span>
          </div>
          
          <div className="flex items-center gap-2">
            {hasPartnerCode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/partner-dashboard')}
                className="gap-2 relative"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Partner</span>
                {referralCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {referralCount}
                  </span>
                )}
              </Button>
            )}
            
            {showArticlesToggle && (
              <Button
                variant={isArticlesMode ? "default" : "ghost"}
                size="sm"
                onClick={onArticlesToggle}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learn</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
