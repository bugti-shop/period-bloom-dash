import { useState, useEffect } from "react";
import { Lock, Bell, Crown, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface PaywallProps {
  onStartTrial: () => void;
}

const ADMIN_CODE = "BUGTI";
const ADMIN_STORAGE_KEY = "lufi-admin-access";

export const Paywall = ({ onStartTrial }: PaywallProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const monthlyPrice = 2.99;
  const yearlyPrice = 1.99;
  const yearlyTotal = (yearlyPrice * 12).toFixed(2);

  // Check for remembered admin access on mount
  useEffect(() => {
    const savedAdminAccess = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (savedAdminAccess === "true") {
      toast.success("Welcome back, Admin!");
      onStartTrial();
    }
  }, [onStartTrial]);

  const handleAdminAccess = () => {
    if (adminCode.toUpperCase() === ADMIN_CODE) {
      if (rememberMe) {
        localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      }
      toast.success("Admin access granted!");
      onStartTrial();
    } else {
      toast.error("Invalid admin code");
      setAdminCode("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Main Heading */}
        <h1 className="text-2xl font-bold text-center text-black leading-tight">
          Start your 3-day FREE<br />trial to continue.
        </h1>

        {/* Timeline */}
        <div 
          className="py-4"
          style={{
            '--connector-width': '13px',
            '--connector-color': '#d1d5db',
            '--icon-gap': '68px'
          } as React.CSSProperties}
        >
          <div className="flex flex-col gap-6">
            {/* Today */}
            <div className="flex gap-3 relative">
              {/* Icon Column with Connector Line */}
              <div className="relative flex flex-col items-center" style={{ width: '40px' }}>
                {/* Vertical Connector Line - Absolutely Positioned Behind Icons */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    width: 'var(--connector-width)',
                    height: 'calc(var(--icon-gap) * 2 + 46px)',
                    top: '20px',
                    backgroundColor: 'var(--connector-color)',
                    borderRadius: '999px',
                    zIndex: 0
                  }}
                />
                
                {/* Icon */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center relative"
                  style={{ backgroundColor: '#ee5ea6', zIndex: 1 }}
                >
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-black mb-0.5">Today</h3>
                <p className="text-xs text-black">
                  Unlock all app features like Calculating, Adding Notes, Unlimited Goals and more.
                </p>
              </div>
            </div>

            {/* In 2 Days */}
            <div className="flex gap-3 relative">
              <div className="relative flex flex-col items-center" style={{ width: '40px' }}>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center relative"
                  style={{ backgroundColor: '#ee5ea6', zIndex: 1 }}
                >
                  <Bell className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-black mb-0.5">In 2 Days - Reminder</h3>
                <p className="text-xs text-black">
                  We'll send you a reminder before your trial ends.
                </p>
              </div>
            </div>

            {/* In 3 Days */}
            <div className="flex gap-3 relative">
              <div className="relative flex flex-col items-center" style={{ width: '40px' }}>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center relative"
                  style={{ backgroundColor: '#ee5ea6', zIndex: 1 }}
                >
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-black mb-0.5">In 3 Days - Billing Starts</h3>
                <p className="text-xs text-black">
                  You'll be charged after 3 days unless you cancel anytime before.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 p-3 rounded-2xl border-2 transition-colors ${
              selectedPlan === "monthly"
                ? "bg-foreground/5"
                : "border-border bg-background"
            }`}
            style={selectedPlan === "monthly" ? { borderColor: '#ee5ea6' } : {}}
          >
            <div className="text-center">
              <div className="text-base font-semibold text-foreground mb-1">Monthly</div>
              <div className="text-sm text-muted-foreground">${monthlyPrice}/mo</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`flex-1 p-3 rounded-2xl border-2 transition-colors relative ${
              selectedPlan === "yearly"
                ? "bg-foreground/5"
                : "border-border bg-background"
            }`}
            style={selectedPlan === "yearly" ? { borderColor: '#ee5ea6' } : {}}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: '#ee5ea6' }}>
              BEST VALUE
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-foreground mb-1">Yearly</div>
              <div className="text-sm text-muted-foreground">${yearlyPrice}/mo</div>
            </div>
          </button>
        </div>

        {/* Yearly Total - Only show when yearly is selected */}
        {selectedPlan === "yearly" && (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-foreground">
              Total: <span className="text-primary font-bold">${yearlyTotal}/year</span>
            </p>
            <p className="text-xs text-muted-foreground">Billed annually</p>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={onStartTrial}
          className="w-full py-7 text-lg font-semibold rounded-2xl"
          size="lg"
        >
          Start My 3-Day Free Trial
        </Button>

        {/* Admin Access */}
        <div className="pt-2">
          {!showAdminInput ? (
            <button
              onClick={() => setShowAdminInput(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <KeyRound className="w-3 h-3" />
              Admin Access
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleAdminAccess}
                  variant="outline"
                  size="sm"
                >
                  Submit
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Remember me on this device
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
