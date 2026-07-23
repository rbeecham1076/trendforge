import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe, PRICE_IDS, isStripeConfigured } from "@/lib/stripe";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan as "pro" | "business";

    if (!plan || !["pro", "business"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Must be 'pro' or 'business'." }, { status: 400 });
    }

    // Check if user already has this plan
    const sub = await getUserSubscription(userId);
    if (sub.plan === plan && sub.status === "active") {
      return NextResponse.json({ error: `You are already on the ${plan} plan.` }, { status: 409 });
    }

    // Fallback: if Stripe isn't configured, return a mock success
    if (!isStripeConfigured()) {
      console.warn("[stripe/checkout] Stripe not configured — returning mock success");
      return NextResponse.json({
        url: `/dashboard?checkout=mock&plan=${plan}`,
        mock: true,
      });
    }

    const stripe = getStripe()!;
    const priceId = PRICE_IDS[plan];

    // Get the origin for success/cancel URLs
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success&plan=${plan}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      client_reference_id: userId,
      metadata: { userId, plan },
      ...(sub.stripeCustomerId
        ? { customer: sub.stripeCustomerId }
        : { customer_email: undefined }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
