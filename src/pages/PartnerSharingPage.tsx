import { useState } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { PartnerCodeGenerator } from "@/components/PartnerCodeGenerator";
import { PartnerClaimDialog } from "@/components/PartnerClaimDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift } from "lucide-react";

const PartnerSharingContent = () => {
  const [partnerCode, setPartnerCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClaimCode = async () => {
    if (!partnerCode.trim()) {
      toast.error("Please enter a partner code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('partner-claim', {
        body: { code: partnerCode.trim() }
      });

      if (error) throw error;

      toast.success("Partner code claimed successfully!");
      setPartnerCode("");
    } catch (error: any) {
      console.error('Error claiming code:', error);
      toast.error(error.message || 'Failed to claim code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
      <header className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Partner Sharing</h2>
        <p className="text-muted-foreground">Share your code or claim a partner code</p>
      </header>

      <div className="space-y-6">
        {/* Generate Your Code Section */}
        <PartnerCodeGenerator />

        {/* Claim Partner Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Have a Partner Code?
            </CardTitle>
            <CardDescription>
              Enter a partner code to get access to partner benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter partner code"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleClaimCode} 
                disabled={loading || !partnerCode.trim()}
              >
                {loading ? 'Claiming...' : 'Claim Code'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function PartnerSharingPage() {
  return (
    <AuthProvider>
      <PartnerSharingContent />
    </AuthProvider>
  );
}
