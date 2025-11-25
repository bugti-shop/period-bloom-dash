import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const PartnerClaimDialog = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkForPartnerCode();
  }, []);

  const checkForPartnerCode = async () => {
    // Check URL for partner code
    const params = new URLSearchParams(window.location.search);
    const partnerCode = params.get('partner');
    
    if (partnerCode) {
      setCode(partnerCode);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user already has a referral
        const { data: existingReferral } = await supabase
          .from('partner_referrals')
          .select('*')
          .eq('referred_user_id', user.id)
          .maybeSingle();

        if (!existingReferral) {
          setOpen(true);
        }
      }
    } else {
      // Check if user is logged in and doesn't have a referral
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: existingReferral } = await supabase
          .from('partner_referrals')
          .select('*')
          .eq('referred_user_id', user.id)
          .maybeSingle();

        // Only show dialog if no referral exists
        if (!existingReferral) {
          // Show dialog after a short delay for better UX
          setTimeout(() => setOpen(true), 2000);
        }
      }
    }
  };

  const claimCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter a partner code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('partner-claim', {
        body: { code: code.trim() }
      });
      
      if (error) throw error;
      
      toast.success('Partner code claimed successfully!');
      setOpen(false);
      
      // Clear partner code from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('partner');
      window.history.replaceState({}, '', url.toString());
    } catch (error: any) {
      console.error('Error claiming code:', error);
      toast.error(error.message || 'Failed to claim partner code');
    } finally {
      setLoading(false);
    }
  };

  const skipForNow = () => {
    setOpen(false);
    
    // Clear partner code from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('partner');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Partner Code</DialogTitle>
          <DialogDescription>
            Do you have a partner code? Enter it below to support your referrer and unlock rewards.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
          />
          <div className="flex gap-2">
            <Button onClick={claimCode} disabled={loading} className="flex-1">
              {loading ? 'Claiming...' : 'Claim Code'}
            </Button>
            <Button onClick={skipForNow} variant="outline" className="flex-1">
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
