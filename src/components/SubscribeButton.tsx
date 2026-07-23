"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowRight } from "lucide-react";

interface SubscribeButtonProps {
  plan: "pro" | "business";
  currentPlan?: string;
  variant?: "premium" | "vibrant" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "xl";
  className?: string;
}

export function SubscribeButton({
  plan,
  currentPlan,
  variant = "premium",
  size = "default",
  className,
}: SubscribeButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentPlan = currentPlan === plan;

  async function handleSubscribe() {
    if (loading || isCurrentPlan) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
      // If mock, the redirect will handle it — nothing to do
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Not loaded yet — show skeleton
  if (!isLoaded) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Already subscribed to this plan
  if (isCurrentPlan) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <Check className="mr-2 h-4 w-4 text-emerald-400" />
        Current Plan
      </Button>
    );
  }

  // Not signed in — show signup CTA
  if (!isSignedIn) {
    const planParam = plan === "pro" ? "?plan=pro" : "?plan=business";
    return (
      <SignUpButton mode="modal" fallbackRedirectUrl={`/pricing${planParam}`}>
        <Button variant={variant} size={size} className={className}>
          {plan === "pro" ? "Start Free Trial" : "Contact Sales"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </SignUpButton>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            {plan === "pro" ? "Start Free Trial" : "Subscribe"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
