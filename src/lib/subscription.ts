import { prisma } from "@/lib/prisma";

export type Plan = "free" | "pro" | "business";

export interface SubscriptionInfo {
  plan: Plan;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

const PLAN_LIMITS: Record<Plan, { searchesPerDay: number; savedProjects: number; teamSeats: number; csvExport: boolean; apiAccess: boolean }> = {
  free: { searchesPerDay: 10, savedProjects: 5, teamSeats: 1, csvExport: false, apiAccess: false },
  pro: { searchesPerDay: Infinity, savedProjects: Infinity, teamSeats: 1, csvExport: true, apiAccess: false },
  business: { searchesPerDay: Infinity, savedProjects: Infinity, teamSeats: 5, csvExport: true, apiAccess: true },
};

/**
 * Get a user's subscription, creating a free one if none exists.
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  let sub = await prisma.subscription.findUnique({ where: { userId } });

  if (!sub) {
    sub = await prisma.subscription.create({
      data: { userId, plan: "free", status: "active" },
    });
  }

  return {
    plan: sub.plan as Plan,
    status: sub.status,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
  };
}

/**
 * Check whether a user's subscription allows access to a feature.
 */
export function canAccess(subscription: SubscriptionInfo, feature: "unlimited_searches" | "csv_export" | "api_access" | "team_seats"): boolean {
  const limits = PLAN_LIMITS[subscription.plan];

  switch (feature) {
    case "unlimited_searches": return limits.searchesPerDay === Infinity;
    case "csv_export": return limits.csvExport;
    case "api_access": return limits.apiAccess;
    case "team_seats": return limits.teamSeats > 1;
    default: return false;
  }
}

/**
 * Get the search limit for a plan.
 */
export function getSearchLimit(plan: Plan): number {
  return PLAN_LIMITS[plan].searchesPerDay;
}

/**
 * Get all limits for a plan (useful for displaying plan comparisons).
 */
export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan];
}

/**
 * Upsert subscription from Stripe webhook data.
 */
export async function upsertSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: Plan;
  status: string;
}) {
  return prisma.subscription.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      plan: params.plan,
      status: params.status,
    },
    update: {
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      plan: params.plan,
      status: params.status,
    },
  });
}

/**
 * Mark a subscription as cancelled/inactive.
 */
export async function cancelSubscription(stripeSubscriptionId: string) {
  return prisma.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: { plan: "free", status: "cancelled", stripeSubscriptionId: null },
  });
}
