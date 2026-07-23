/**
 * Google Trends data integration for TrendForge AI.
 * All functions gracefully fall back to null if Google Trends is unavailable.
 */
import type { MarketData } from "@/lib/types";

// ─── Types for Google Trends API responses ────────────────────────────

interface TrendsTimelinePoint {
  time: number;
  value: number | number[];
}

interface TrendsTimelineData {
  default?: {
    timelineData?: TrendsTimelinePoint[];
  };
}

interface RankedKeyword {
  query: string;
  value?: number;
}

interface RankedList {
  rankedListName: string;
  rankedKeyword?: RankedKeyword[];
}

interface TrendsRelatedData {
  default?: {
    rankedList?: RankedList[];
  };
}

interface GeoMapEntry {
  geoName: string;
  value?: number[];
}

interface TrendsGeoData {
  default?: {
    geoMapData?: GeoMapEntry[];
  };
}

// ─── Dynamic import of google-trends-api ──────────────────────────────

let googleTrends: typeof import("google-trends-api") | null = null;

async function getGoogleTrends(): Promise<typeof import("google-trends-api") | null> {
  if (googleTrends) return googleTrends;
  try {
    googleTrends = await import("google-trends-api");
    return googleTrends;
  } catch {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────

function parseTrendsJSON(raw: string): unknown {
  try {
    // google-trends-api sometimes returns JSON wrapped in ")]}',\n"
    const cleaned = raw.replace(/^\)\]\}',\s*/, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Get default date range: 12 months ago to today
 */
function getDefaultTimeRange(): { startTime: Date; endTime: Date } {
  const endTime = new Date();
  const startTime = new Date();
  startTime.setFullYear(startTime.getFullYear() - 1);
  return { startTime, endTime };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Core data functions ───────────────────────────────────────────────

/**
 * Fetch 12-month interest-over-time timeline for a keyword.
 * Returns normalized timeline data or null on failure.
 */
export async function getInterestOverTime(
  keyword: string,
  timeframe?: { startTime: Date; endTime: Date }
): Promise<{ month: string; value: number }[] | null> {
  const gt = await getGoogleTrends();
  if (!gt) return null;

  try {
    const { startTime, endTime } = timeframe || getDefaultTimeRange();
    const raw = await gt.interestOverTime({
      keyword,
      startTime,
      endTime,
    });

    const parsed = parseTrendsJSON(raw) as TrendsTimelineData | null;
    if (!parsed?.default?.timelineData) return null;

    const timeline: { month: string; value: number }[] = [];

    for (const point of parsed.default.timelineData) {
      const date = new Date(point.time * 1000);
      const month = MONTH_NAMES[date.getUTCMonth()];
      const val =
        typeof point.value === "number"
          ? point.value
          : Array.isArray(point.value)
            ? point.value[0]
            : 0;

      timeline.push({ month, value: val });
    }

    // If we got more than 14 entries, downsample to ~12
    if (timeline.length > 14) {
      const step = Math.floor(timeline.length / 12);
      const sampled: typeof timeline = [];
      for (let i = 0; i < timeline.length; i += step) {
        sampled.push(timeline[i]);
      }
      // Always include last point
      if (sampled[sampled.length - 1] !== timeline[timeline.length - 1]) {
        sampled.push(timeline[timeline.length - 1]);
      }
      return sampled.slice(0, 13);
    }

    return timeline;
  } catch {
    return null;
  }
}

/**
 * Fetch related queries (rising + top) for a keyword.
 * Returns top 5 rising related terms.
 */
export async function getRelatedQueries(
  keyword: string
): Promise<string[] | null> {
  const gt = await getGoogleTrends();
  if (!gt) return null;

  try {
    const raw = await gt.relatedQueries({ keyword });
    const parsed = parseTrendsJSON(raw) as TrendsRelatedData | null;
    if (!parsed?.default?.rankedList) return null;

    // Try rising first, then fall back to top
    const risingList = parsed.default.rankedList.find(
      (rl) => rl.rankedListName === "Rising"
    );
    const list = risingList || parsed.default.rankedList[0];
    if (!list?.rankedKeyword) return null;

    const queries: string[] = list.rankedKeyword
      .slice(0, 5)
      .map((rk) => rk.query);

    return queries.filter(Boolean);
  } catch {
    return null;
  }
}

/**
 * Fetch regional interest breakdown for a keyword.
 * Returns top 3 regions (countries/cities).
 */
export async function getRegionalInterest(
  keyword: string
): Promise<string[] | null> {
  const gt = await getGoogleTrends();
  if (!gt) return null;

  try {
    const raw = await gt.interestByRegion({
      keyword,
      resolution: "COUNTRY",
    });
    const parsed = parseTrendsJSON(raw) as TrendsGeoData | null;
    if (!parsed?.default?.geoMapData) return null;

    const regions: string[] = parsed.default.geoMapData
      .slice(0, 3)
      .map((g) => g.geoName);

    return regions.filter(Boolean);
  } catch {
    return null;
  }
}

// ─── Aggregate summary ─────────────────────────────────────────────────

/**
 * Detect trend direction from a timeline.
 */
function detectTrendDirection(
  timeline: { month: string; value: number }[]
): "rising" | "falling" | "stable" {
  if (timeline.length < 3) return "stable";

  // Compare first third average to last third average
  const third = Math.max(1, Math.floor(timeline.length / 3));
  const firstAvg =
    timeline.slice(0, third).reduce((s, p) => s + p.value, 0) / third;
  const lastAvg =
    timeline.slice(-third).reduce((s, p) => s + p.value, 0) / third;

  const change = lastAvg - firstAvg;
  const threshold = Math.max(1, firstAvg * 0.1); // 10% threshold

  if (change > threshold) return "rising";
  if (change < -threshold) return "falling";
  return "stable";
}

/**
 * Detect seasonality pattern from timeline.
 * Returns a description string or null if no clear pattern.
 */
function detectSeasonality(
  timeline: { month: string; value: number }[]
): string | null {
  if (timeline.length < 12) return null;

  // Simple check: look for recurring peaks
  const values = timeline.map((p) => p.value);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  if (avg === 0) return null;

  // Find months with significant deviation
  const peaks: string[] = [];
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].value > avg * 1.3) {
      peaks.push(timeline[i].month);
    }
  }

  if (peaks.length === 0) return null;

  // Check for recurring patterns (same month appearing twice)
  const counts: Record<string, number> = {};
  for (const m of peaks) {
    counts[m] = (counts[m] || 0) + 1;
  }
  const recurring = Object.entries(counts)
    .filter(([, c]) => c >= 2)
    .map(([m]) => m);

  if (recurring.length >= 1) {
    return `Peaks in ${recurring.join(", ")}`;
  }

  // Check for Q4 holiday pattern
  const holidayMonths = ["Nov", "Dec", "Oct"];
  if (peaks.some((p) => holidayMonths.includes(p))) {
    return "Holiday season peak (Q4)";
  }

  return null;
}

/**
 * Fetch and aggregate all Google Trends data for a keyword.
 * Returns a MarketData object or null on failure.
 */
export async function getTrendSummary(
  keyword: string
): Promise<MarketData | null> {
  try {
    // Run all three queries in parallel
    const [timeline, relatedQueries, topRegions] = await Promise.all([
      getInterestOverTime(keyword),
      getRelatedQueries(keyword),
      getRegionalInterest(keyword),
    ]);

    // We need at least the timeline for a valid summary
    if (!timeline || timeline.length < 2) return null;

    const trendDirection = detectTrendDirection(timeline);
    const seasonality = detectSeasonality(timeline);

    return {
      trendDirection,
      interestTimeline: timeline,
      relatedQueries: relatedQueries || [],
      topRegions: topRegions || [],
      seasonality,
    };
  } catch {
    return null;
  }
}
