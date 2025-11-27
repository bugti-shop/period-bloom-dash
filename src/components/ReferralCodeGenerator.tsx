import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Gift } from "lucide-react";
import { toast } from "sonner";
import {
  getUserReferralCode,
  createReferralCode,
  checkCodeAvailability,
  getReferralStats,
  getFreeMonthsBalance,
} from "@/lib/referralStorage";

export const ReferralCodeGenerator = () => {
  const [code, setCode] = useState("");
  const [userCode, setUserCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, rewarded: 0 });
  const [freeMonths, setFreeMonths] = useState(0);

  useEffect(() => {
    loadUserCode();
    loadStats();
  }, []);

  const loadUserCode = async () => {
    const existingCode = await getUserReferralCode();
    if (existingCode) {
      setUserCode(existingCode.code);
    }
  };

  const loadStats = async () => {
    const [referralStats, monthsBalance] = await Promise.all([
      getReferralStats(),
      getFreeMonthsBalance(),
    ]);
    setStats(referralStats);
    setFreeMonths(monthsBalance);
  };

  const handleGenerateCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter a code");
      return;
    }

    if (code.length < 4 || code.length > 20) {
      toast.error("Code must be between 4-20 characters");
      return;
    }

    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      toast.error("Code can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    setLoading(true);

    const isAvailable = await checkCodeAvailability(code);
    if (!isAvailable) {
      toast.error("This code is already taken. Try another one!");
      setLoading(false);
      return;
    }

    const result = await createReferralCode(code);
    
    if (result.success) {
      setUserCode(code);
      setCode("");
      toast.success("Referral code created successfully!");
      loadStats();
    } else {
      toast.error(result.error || "Failed to create code");
    }

    setLoading(false);
  };

  const handleCopyCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5" style={{ color: '#ee5ea6' }} />
        <h3 className="text-base font-semibold text-foreground">
          Refer Friends & Earn Free Months
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Get 1 month free for every friend who subscribes with your code!
      </p>

      {freeMonths > 0 && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(238, 94, 166, 0.1)' }}>
          <p className="text-sm font-semibold" style={{ color: '#ee5ea6' }}>
            🎉 You have {freeMonths} free month{freeMonths !== 1 ? 's' : ''} available!
          </p>
        </div>
      )}

      {userCode ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={userCode}
              readOnly
              className="flex-1 font-mono text-center text-base font-semibold"
              style={{ borderColor: '#ee5ea6' }}
            />
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" style={{ color: '#ee5ea6' }} />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {stats.total > 0 && (
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>📊 {stats.total} friend{stats.total !== 1 ? 's' : ''} referred</p>
              {stats.rewarded > 0 && (
                <p style={{ color: '#ee5ea6' }}>
                  ✅ {stats.rewarded} converted to paid • {stats.rewarded} free month{stats.rewarded !== 1 ? 's' : ''} earned
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CREATE YOUR CODE"
            className="text-center font-mono"
            maxLength={20}
            disabled={loading}
          />
          <Button
            onClick={handleGenerateCode}
            disabled={loading}
            className="w-full"
            style={{ backgroundColor: '#ee5ea6' }}
          >
            {loading ? "Creating..." : "Generate My Referral Code"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            4-20 characters • Letters, numbers, hyphens & underscores only
          </p>
        </div>
      )}
    </div>
  );
};
