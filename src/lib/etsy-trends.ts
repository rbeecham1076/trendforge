/**
 * Etsy Trends Scraper
 *
 * Scrapes real trending data from Etsy's public pages with heavy caching
 * (once per hour max). Falls back gracefully if Etsy blocks scraping.
 *
 * Sources scraped:
 *  - Etsy trends page (https://www.etsy.com/trends)
 *  - Etsy homepage for trending sections
 *
 * Returns structured data: { trendingSearches, popularTags, risingCategories }
 */

import type { EtsyTrendingData } from "@/lib/types";

// ─── Cache ─────────────────────────────────────────────────
// In-memory cache: fetches at most once per hour
// In production this would use Redis or a DB-backed cache

interface CacheEntry {
  data: EtsyTrendingData;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Hardcoded fallback data (curated from real Etsy trending patterns) ───
// Updated regularly with real trending themes observed on Etsy
const FALLBACK_TRENDING: EtsyTrendingData = {
  trendingSearches: [
    "personalized gifts",
    "custom svg files",
    "birthday shirt design",
    "nurse sublimation",
    "teacher svg bundle",
    "cow print svg",
    "western png",
    "christmas svg bundle",
    "nursery wall art",
    "boho svg",
    "tumbler wrap",
    "dtf transfer ready to press",
    "valentines day svg",
    "family matching shirts",
    "coquette png",
    "retro groovy font",
    "wedding signage template",
    "baby announcement svg",
    "funny dog svg",
    "aesthetic sticker pack",
    "spring sublimation design",
    "script font bundle",
    "minimalist line art svg",
    "sports mom svg",
    "halloween svg bundle",
    "fall png clipart",
    "cottagecore svg",
    "disney style svg",
    "mushroom svg design",
    "sunflower svg bundle",
  ],
  popularTags: [
    "svg cut file",
    "png clipart",
    "commercial use",
    "instant download",
    "dtf transfer",
    "sublimation design",
    "cricut compatible",
    "silhouette cameo",
    "digital download",
    "wall art printable",
    "sticker sheet",
    "tumbler design",
    "shirt design",
    "bundle deal",
    "trending now",
    "bestseller",
    "handmade",
    "small shop",
    "gift idea",
  ],
  risingCategories: [
    "SVG Cut Files",
    "Digital Prints & Wall Art",
    "Sublimation Designs",
    "DTF Transfers",
    "Clipart Collections",
    "Sticker Sheets",
    "Tumbler Wraps",
    "Printable Planner Templates",
    "Nursery & Kids Decor",
    "Seasonal Holiday Designs",
  ],
  fetchedAt: new Date().toISOString(),
  source: "fallback",
};

// ─── Scraper: fetch from Etsy trends page ───────────────────

async function fetchEtsyTrendsPage(): Promise<EtsyTrendingData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://www.etsy.com/trends", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TrendForgeBot/1.0; trend analysis)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();

    // Try to find any JSON data embedded in the page (Etsy sometimes
    // includes __NEXT_DATA__ or similar hydration payloads)
    const jsonMatch = html.match(
      /<script[^>]*id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/
    );
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        // Walk the props tree looking for trend data
        const trends = findTrendDataInObject(parsed);
        if (trends) return trends;
      } catch {
        // Fall through to HTML parsing
      }
    }

    // HTML scraping: look for trending terms in meta tags and content
    const trendingSearches = extractTrendingFromHTML(html);
    if (trendingSearches.length > 0) {
      return {
        trendingSearches,
        popularTags: [
          ...FALLBACK_TRENDING.popularTags.slice(0, 10),
          ...designRelatedTagsFromSearches(trendingSearches),
        ],
        risingCategories: FALLBACK_TRENDING.risingCategories,
        fetchedAt: new Date().toISOString(),
        source: "etsy-scrape",
      };
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Etsy homepage scraper (trending sections) ──────────────

async function fetchEtsyHomepageTrending(): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://www.etsy.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TrendForgeBot/1.0; trend analysis)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) return [];

    const html = await response.text();
    return extractTrendingFromHTML(html);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// ─── HTML extraction helper ─────────────────────────────────

function extractTrendingFromHTML(html: string): string[] {
  const results = new Set<string>();

  // Look for popular search terms in various Etsy page structures
  // Pattern 1: data-search-query attributes
  const searchQueryRegex = /data-search-query="([^"]+)"/g;
  let match;
  while ((match = searchQueryRegex.exec(html)) !== null) {
    const term = match[1].trim().toLowerCase();
    if (term.length > 2 && !term.match(/^\d+$/)) {
      results.add(term);
    }
  }

  // Pattern 2: Popular searches section text
  const popularRegex =
    /popular.{0,20}(search|trend).{0,100}(?:<a[^>]*>([^<]+)<\/a>)/gi;
  while ((match = popularRegex.exec(html)) !== null) {
    if (match[1]) {
      results.add(match[1].trim().toLowerCase());
    }
  }

  // Pattern 3: Look for trending links with Etsy-style URLs
  const linkRegex = /href="\/search\?q=([^"&]+)/g;
  while ((match = linkRegex.exec(html)) !== null) {
    const term = decodeURIComponent(match[1]).trim().toLowerCase();
    if (term.length > 2) {
      results.add(term);
    }
  }

  // Filter to design-relevant terms
  const designKeywords = [
    "svg",
    "png",
    "dtf",
    "print",
    "design",
    "sticker",
    "sublimation",
    "tumbler",
    "shirt",
    "clip",
    "art",
    "wall",
    "bundle",
    "digital",
    "template",
    "cricut",
    "silhouette",
    "cut",
    "file",
    "transfer",
    "craft",
    "diy",
    "printable",
  ];

  const filtered = Array.from(results).filter(
    (term) =>
      // Keep terms that contain design keywords OR are short/generic enough
      designKeywords.some((kw) => term.includes(kw)) || term.split(" ").length <= 2
  );

  return filtered.slice(0, 30);
}

// ─── Recursively search JSON for trend data ─────────────────

function findTrendDataInObject(
  obj: unknown,
  depth = 0
): EtsyTrendingData | null {
  if (!obj || typeof obj !== "object" || depth > 10) return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findTrendDataInObject(item, depth + 1);
      if (result) return result;
    }
    return null;
  }

  const record = obj as Record<string, unknown>;

  // Check if this looks like a trends object
  const hasTrending =
    "trendingSearches" in record || "trendingQueries" in record;
  if (hasTrending) {
    return {
      trendingSearches: (Array.isArray(record.trendingSearches)
        ? record.trendingSearches
        : Array.isArray(record.trendingQueries)
          ? record.trendingQueries
          : []
      ).map((s: unknown) => String(s)),
      popularTags: Array.isArray(record.popularTags)
        ? record.popularTags.map((t: unknown) => String(t))
        : FALLBACK_TRENDING.popularTags,
      risingCategories: Array.isArray(record.risingCategories)
        ? record.risingCategories.map((c: unknown) => String(c))
        : FALLBACK_TRENDING.risingCategories,
      fetchedAt: new Date().toISOString(),
      source: "etsy-json",
    };
  }

  // Walk deeper
  for (const value of Object.values(record)) {
    const result = findTrendDataInObject(value, depth + 1);
    if (result) return result;
  }

  return null;
}

// ─── Design-related tag generator ───────────────────────────

function designRelatedTagsFromSearches(searches: string[]): string[] {
  const designTerms = [
    "svg",
    "png",
    "dtf transfer",
    "sublimation",
    "clip art",
    "cut file",
    "cricut",
    "bundle",
    "digital download",
    "wall art",
    "sticker",
    "tumbler",
    "shirt design",
    "printable",
    "craft file",
  ];

  // Return tags that overlap with trending searches
  return designTerms.filter((tag) =>
    searches.some((s) => s.includes(tag))
  );
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Fetch Etsy trending data, with 1-hour caching.
 *
 * Tries live scraping first, falls back to curated data if scraping fails
 * or Etsy blocks the request.
 */
export async function getEtsyTrendingData(): Promise<EtsyTrendingData> {
  // Return cached data if still fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  // Try the Etsy trends page
  const liveData = await fetchEtsyTrendsPage();
  if (liveData && liveData.trendingSearches.length > 0) {
    cache = { data: liveData, timestamp: Date.now() };
    return liveData;
  }

  // Try homepage as secondary source
  const homepageSearches = await fetchEtsyHomepageTrending();
  if (homepageSearches.length > 0) {
    const data: EtsyTrendingData = {
      trendingSearches: homepageSearches,
      popularTags: [
        ...FALLBACK_TRENDING.popularTags.slice(0, 10),
        ...designRelatedTagsFromSearches(homepageSearches),
      ],
      risingCategories: FALLBACK_TRENDING.risingCategories,
      fetchedAt: new Date().toISOString(),
      source: "etsy-homepage",
    };
    cache = { data, timestamp: Date.now() };
    return data;
  }

  // Fallback to curated data
  console.log("[etsy-trends] Scraping blocked or failed — using curated fallback");
  const fallback = { ...FALLBACK_TRENDING, fetchedAt: new Date().toISOString() };
  cache = { data: fallback, timestamp: Date.now() };
  return fallback;
}

/**
 * Get popular design-related search keywords from Etsy.
 * Derived from trending data but focused on design/print niches.
 */
export async function getDesignKeywords(): Promise<string[]> {
  const trends = await getEtsyTrendingData();
  return trends.trendingSearches.filter(
    (s) =>
      s.includes("svg") ||
      s.includes("png") ||
      s.includes("dtf") ||
      s.includes("design") ||
      s.includes("print") ||
      s.includes("sticker") ||
      s.includes("sublimation") ||
      s.includes("bundle") ||
      s.includes("clip") ||
      s.includes("wall")
  );
}

/**
 * Force-refresh the cache (for admin/testing use).
 */
export function clearEtsyCache(): void {
  cache = null;
}
