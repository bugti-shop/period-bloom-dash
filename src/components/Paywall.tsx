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
        <div className="space-y-1.5 py-4">
          {/* Today */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div className="w-2 h-12 bg-gray-300 mt-1" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-black mb-0.5">Today</h3>
              <p className="text-xs text-gray-600">
                Unlock all app features like Calculating, Adding Notes, Unlimited Goals and more.
              </p>
            </div>
          </div>

          {/* In 2 Days */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="w-2 h-12 bg-gray-300 mt-1" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-black mb-0.5">In 2 Days - Reminder</h3>
              <p className="text-xs text-gray-600">
                We'll send you a reminder before your trial ends.
              </p>
            </div>
          </div>

          {/* In 3 Days */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-black mb-0.5">In 3 Days - Billing Starts</h3>
              <p className="text-xs text-gray-600">
                You'll be charged after 3 days unless you cancel anytime before.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-colors ${
              selectedPlan === "monthly"
                ? "border-foreground bg-foreground/5"
                : "border-border bg-background"
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground mb-1">Monthly</div>
              <div className="text-base text-muted-foreground">$3.99/mo</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-colors relative ${
              selectedPlan === "yearly"
                ? "border-foreground bg-foreground/5"
                : "border-border bg-background"
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              3 DAYS FREE
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground mb-1">Yearly</div>
              <div className="text-base text-muted-foreground">$2.35/mo</div>
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
