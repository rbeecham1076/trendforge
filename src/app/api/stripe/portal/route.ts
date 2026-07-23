import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fallback: if Stripe isn't configured, return a mock
    if (!isStripeConfigured()) {
      console.warn("[stripe/portal] Stripe not configured — returning mock");
      return NextResponse.json({
        url: "/dashboard/settings",
        mock: true,
      });
    }

    const stripe = getStripe()!;
    const sub = await getUserSubscription(userId);

    if (!sub.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please subscribe first." },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/portal] Error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session." },
      { status: 500 }
    );
  }
}
