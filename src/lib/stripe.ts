import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

/**
 * Returns a Stripe server client if STRIPE_SECRET_KEY is configured,
 * or null if Stripe is not set up yet (graceful fallback).
 */
export function getStripe(): Stripe | null {
  if (!stripeSecretKey) {
    return null;
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-06-01.basil" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

/**
 * Check if Stripe is configured.
 */
export function isStripeConfigured(): boolean {
  return !!stripeSecretKey;
}

/**
 * Plan-to-price-ID mapping. Falls back to placeholder IDs when env vars aren't set.
 */
export const PRICE_IDS: Record<"pro" | "business", string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder",
  business: process.env.STRIPE_BUSINESS_PRICE_ID || "price_business_placeholder",
};

/**
 * Plan name to display label mapping.
 */
export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};
