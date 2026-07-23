import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getUserSubscription(userId);

    return NextResponse.json({
      plan: sub.plan,
      status: sub.status,
    });
  } catch (error) {
    console.error("[subscription] Error:", error);
    return NextResponse.json({ plan: "free", status: "active" });
  }
}
