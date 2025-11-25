import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PartnerCodeGenerator = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  useEffect(() => {
    loadExistingCode();
  }, []);

  const loadExistingCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('partner_codes')
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setCode(data.code);
    } catch (error) {
      console.error('Error loading code:', error);
    }
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('partner-code-generate');
      
      if (error) throw error;
      
      setCode(data.code);
      toast.success(data.isRegenerated ? 'Code regenerated!' : 'Partner code generated!');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setShowRegenerateDialog(true);
  };

  const confirmRegenerate = async () => {
    setShowRegenerateDialog(false);
    await generateCode();
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success('Code copied!');
    }
  };

  const shareCode = async () => {
    if (code) {
      const shareLink = `${window.location.origin}/?partner=${code}`;
      try {
        await navigator.share({
          title: 'Join Lufi',
          text: `Join Lufi using my partner code: ${code}`,
          url: shareLink
        });
      } catch (error) {
        navigator.clipboard.writeText(shareLink);
        toast.success('Share link copied!');
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Partner Sharing</CardTitle>
          <CardDescription>
            Generate a code to invite others and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {code ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold text-center">{code}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyCode} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={shareCode} size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Code
              </Button>
            </>
          ) : (
            <Button onClick={generateCode} className="w-full" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Partner Code'}
            </Button>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Partner Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new code and invalidate your old one. Existing referrals will not be affected,
              but new users will need to use the new code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegenerate}>Regenerate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
