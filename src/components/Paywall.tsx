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
      <div className="max-w-md w-full space-y-8">
        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-center text-foreground leading-tight">
          Start your 3-day FREE trial to continue.
        </h1>

        {/* Timeline */}
        <div className="space-y-6 py-8">
          {/* Today */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                <Lock className="w-6 h-6 text-background" />
              </div>
              <div className="w-0.5 h-16 bg-muted-foreground/30 mt-2" />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">Today</h3>
              <p className="text-sm text-muted-foreground">
                Unlock all app features like Calculating, Adding Notes, Unlimited Goals and more.
              </p>
            </div>
          </div>

          {/* In 2 Days */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                <Bell className="w-6 h-6 text-background" />
              </div>
              <div className="w-0.5 h-16 bg-muted-foreground/30 mt-2" />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">In 2 Days - Reminder</h3>
              <p className="text-sm text-muted-foreground">
                We'll send you a reminder before your trial ends.
              </p>
            </div>
          </div>

          {/* In 3 Days */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                <Crown className="w-6 h-6 text-background" />
              </div>
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">In 3 Days - Billing Starts</h3>
              <p className="text-sm text-muted-foreground">
                You'll be charged after 3 days unless you cancel anytime before.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 p-6 rounded-2xl border-2 transition-colors ${
              selectedPlan === "monthly"
                ? "border-foreground bg-foreground/5"
                : "border-border bg-background"
            }`}
          >
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground mb-2">Monthly</div>
              <div className="text-lg text-muted-foreground">$3.99/mo</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`flex-1 p-6 rounded-2xl border-2 transition-colors relative ${
              selectedPlan === "yearly"
                ? "border-foreground bg-foreground/5"
                : "border-border bg-background"
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-full text-xs font-semibold">
              3 DAYS FREE
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground mb-2">Yearly</div>
              <div className="text-lg text-muted-foreground">$2.35/mo</div>
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
