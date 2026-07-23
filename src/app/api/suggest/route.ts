import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// ─── Popular / trending searches (seed suggestions) ──────────────────
const TRENDING_SEARCHES = [
  "boho home decor",
  "minimalist jewelry",
  "custom pet portraits",
  "aesthetic wall art",
  "vintage clothing",
  "personalized gifts",
  "cottagecore decor",
  "dark academia style",
  "y2k fashion",
  "sustainable products",
  "kawaii stationery",
  "mushroom decor",
];

// ─── Platform-specific suggestions ───────────────────────────────────
const PLATFORM_SUGGESTIONS: Record<string, string[]> = {
  Etsy: [
    "handmade ceramic mugs",
    "macramé wall hanging",
    "personalized name necklace",
    "crochet tote bag",
    "resin art supplies",
    "digital planner stickers",
  ],
  Shopify: [
    "gym apparel dropshipping",
    "eco-friendly water bottles",
    "smartphone accessories",
    "pet grooming products",
    "ergonomic office gear",
    "subscription box ideas",
  ],
  "Amazon Handmade": [
    "wooden cutting boards",
    "hand poured soy candles",
    "leather journal covers",
    "beaded bracelets",
    "knit baby blankets",
    "metal wall art",
  ],
  POD: [
    "funny cat t-shirts",
    "motivational quote posters",
    "retro travel mugs",
    "tote bag designs",
    "hoodie print ideas",
    "phone case designs",
  ],
};

// ─── Fetch Google Trends autocomplete ────────────────────────────────
async function fetchGoogleTrendsSuggestions(
  query: string
): Promise<string[]> {
  try {
    const googleTrends = await import("google-trends-api");
    const results = await googleTrends.autoComplete({ keyword: query });
    // autoComplete returns an object like { default: { topics: [...], ... } }
    const suggestions: string[] = [];

    if (results?.default?.topics) {
      for (const topic of results.default.topics) {
        if (topic.title) suggestions.push(topic.title);
      }
    }

    // Also check the old format: array of strings
    if (Array.isArray(results)) {
      for (const item of results) {
        if (typeof item === "string") suggestions.push(item);
        if (typeof item === "object" && item?.title) suggestions.push(item.title);
      }
    }

    return suggestions.slice(0, 8);
  } catch {
    // Google Trends API unavailable — fall back gracefully
    return [];
  }
}

// ─── Local fuzzy match ───────────────────────────────────────────────
function fuzzyMatchSuggestions(
  query: string,
  searchSpace: string[]
): string[] {
  const lower = query.toLowerCase();
  const matches = searchSpace.filter((s) =>
    s.toLowerCase().includes(lower)
  );
  // Sort: exact match first, then starts-with, then contains
  matches.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aStarts = aLower.startsWith(lower) ? 1 : 0;
    const bStarts = bLower.startsWith(lower) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    return a.length - b.length;
  });
  return matches.slice(0, 6);
}

// ─── Route handler ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const platform =
      searchParams.get("platform")?.trim() || "Etsy";

    // Build the search space: trending + platform-specific
    const platformSpecific = PLATFORM_SUGGESTIONS[platform] || [];
    const allSuggestions = Array.from(
      new Set([...TRENDING_SEARCHES, ...platformSpecific])
    );

    let suggestions: string[];

    if (q.length > 0) {
      // Get Google Trends autocomplete
      const googleSuggestions = await fetchGoogleTrendsSuggestions(q);

      // Merge with local fuzzy match
      const localMatches = fuzzyMatchSuggestions(q, allSuggestions);

      // Deduplicate, prioritize Google results
      const seen = new Set<string>();
      const merged: string[] = [];
      for (const s of [...googleSuggestions, ...localMatches]) {
        const lower = s.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          merged.push(s);
        }
      }
      suggestions = merged.slice(0, 10);
    } else {
      // No query — return trending + platform-specific (shuffled)
      suggestions = [...allSuggestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[suggest] Unexpected error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
