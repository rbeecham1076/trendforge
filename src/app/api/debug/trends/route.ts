import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getInterestOverTime,
  getRelatedQueries,
  getRegionalInterest,
  getTrendSummary,
} from "@/lib/trends-data";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint for Google Trends data.
 * GET /api/debug/trends?keyword=boho%20decor
 * Returns raw trend data for testing / inspection.
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyword = request.nextUrl.searchParams.get("keyword");
  if (!keyword || keyword.trim().length < 2) {
    return NextResponse.json(
      { error: "Missing or invalid ?keyword= parameter" },
      { status: 400 }
    );
  }

  console.log(`[debug/trends] Fetching trends data for: "${keyword}"`);

  const [interestOverTime, relatedQueries, regionalInterest, trendSummary] =
    await Promise.all([
      getInterestOverTime(keyword),
      getRelatedQueries(keyword),
      getRegionalInterest(keyword),
      getTrendSummary(keyword),
    ]);

  return NextResponse.json({
    keyword,
    fetchedAt: new Date().toISOString(),
    interestOverTime,
    relatedQueries,
    regionalInterest,
    trendSummary,
  });
}
