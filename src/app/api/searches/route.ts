import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = await getPrisma();

    const searches = await prisma.search.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        query: true,
        platform: true,
        results: true,
        createdAt: true,
      },
    });

    const count = await prisma.search.count({ where: { userId } });

    return NextResponse.json({ searches, count });
  } catch (error) {
    console.error("[searches] Failed to fetch:", error);
    return NextResponse.json({ searches: [], count: 0 });
  }
}
