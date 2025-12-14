import { useState } from "react";
import { Lock, Bell, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallProps {
  onStartTrial: () => void;
}

export const Paywall = ({ onStartTrial }: PaywallProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

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
              <div className="text-sm text-muted-foreground">$0.00/mo</div>
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
              3 DAYS FREE
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-foreground mb-1">Yearly</div>
              <div className="text-sm text-muted-foreground">$0.00/mo</div>
              <div className="text-xs text-muted-foreground mt-0.5">Billed $0.00 annually</div>
            </div>
          </button>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onStartTrial}
          className="w-full py-7 text-lg font-semibold rounded-2xl"
          size="lg"
        >
          Start My 3-Day Free Trial
        </Button>

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
