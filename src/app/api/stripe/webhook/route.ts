import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { upsertSubscription, cancelSubscription } from "@/lib/subscription";
import type { Plan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// Stripe webhook secret — skip verification if not set (dev mode)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = (await headers()).get("stripe-signature");

    if (!isStripeConfigured()) {
      console.warn("[stripe/webhook] Stripe not configured — webhook ignored");
      return NextResponse.json({ received: true, mock: true });
    }

    const stripe = getStripe()!;
    let event;

    if (sig && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error("[stripe/webhook] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      // Dev mode: parse event without verification
      try {
        event = JSON.parse(body);
      } catch {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }
    }

    // Handle key events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = (session.metadata?.plan || "pro") as Plan;

        if (userId) {
          await upsertSubscription({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan,
            status: "active",
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const subId = subscription.id;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        if (status === "active" || status === "trialing") {
          const priceId = subscription.items.data[0]?.price.id;
          const plan: Plan =
            priceId === process.env.STRIPE_BUSINESS_PRICE_ID ? "business" : "pro";

          // Update by subscription ID
          const { prisma } = await import("@/lib/prisma");
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { plan, status, stripeCustomerId: customerId },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await cancelSubscription(subscription.id);
        break;
      }

      default:
        // Unhandled event — log for debugging
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}
