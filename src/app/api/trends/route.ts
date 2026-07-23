import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { TrendAnalysisResult, ProductOpportunity } from "@/lib/types";

export const dynamic = "force-dynamic";

// ─── Rate limiting (simple in-memory) ───────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // max requests per day per user
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── Mock data generator ─────────────────────────────────────────────
function generateMockResults(query: string, platform: string): TrendAnalysisResult {
      const niche = query.toLowerCase();
      const capQuery = capitalizeWords(query);

      const seed = niche.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const rng = (min: number, max: number) => {
        const x = Math.sin(seed + min * 12.9898 + max * 78.233) * 43758.5453;
        return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
      };

      // ── Upscale Boutique Design Templates ──────────────────────────
      // Each template generates premium design assets (SVG, PNG, DTF, etc.)
      // targeted at boutique, luxury, and high-end POD markets

      const isWedding = niche.includes("wedding") || niche.includes("bride") || niche.includes("bridal");
      const isFashion = niche.includes("fashion") || niche.includes("style") || niche.includes("luxury") || niche.includes("chic") || niche.includes("couture");
      const isBeauty = niche.includes("beauty") || niche.includes("salon") || niche.includes("spa") || niche.includes("nails") || niche.includes("makeup") || niche.includes("skincare");
      const isBusiness = niche.includes("brand") || niche.includes("logo") || niche.includes("business") || niche.includes("marketing") || niche.includes("social media");
      const isHome = niche.includes("home") || niche.includes("decor") || niche.includes("interior") || niche.includes("farmhouse") || niche.includes("modern");
      const isAesthetic = niche.includes("aesthetic") || niche.includes("soft") || niche.includes("dream") || niche.includes("vintage") || niche.includes("retro") || niche.includes("pastel");
      const isHoliday = niche.includes("christmas") || niche.includes("holiday") || niche.includes("halloween") || niche.includes("thanksgiving") || niche.includes("easter");

      interface DesignTemplate {
        designType: string;
        fileFormat: string;
        names: string[];
        scoreRange: [number, number];
        priceRange: string;
        monthlySales: [number, number];
        tags: string[];
        designTips: string;
        mockupPrompts: string[];
        niches: string[];
      }

      const templates: DesignTemplate[] = [
        isWedding ? {
          designType: "SVG",
          fileFormat: "SVG Bundle",
          names: [
            `Elegant ${capQuery} Monogram Suite — 24 Luxury SVG Files`,
            `${capQuery} Calligraphy Place Card Collection — Editable SVG`,
            `Boutique ${capQuery} Invitation Template Bundle — 6 Designs`,
            `Premium ${capQuery} Foil Press SVG — Letterpress Style`,
            `Luxury ${capQuery} Table Number Set — Modern Calligraphy SVG`,
          ],
          scoreRange: [85, 96],
          priceRange: "$12-24",
          monthlySales: [180, 350],
          tags: ["wedding svg", "luxury invitation", "calligraphy design", "boutique wedding", "premium template", "editable svg", "gold foil", "elegant suite", "custom monogram"],
          designTips: "Use slim serif fonts with delicate flourishes. White space is your friend — let the design breathe. Gold foil effect overlays command 35% higher prices. Offer matching suites (invite + rsvp + place card + table number) to increase AOV.",
          mockupPrompts: ["A boutique wedding invitation suite displayed on silk ribbon with dried flowers, soft natural lighting, beige linen background, editorial photography style"],
          niches: ["wedding stationery", "luxury invitations", "bridal suite", "calligraphy"],
        } : null,
        isFashion || isBeauty ? {
          designType: "PNG",
          fileFormat: "PNG Clipart 300dpi",
          names: [
            `Haute Couture ${capQuery} Illustration Set — 18 PNG Files`,
            `${capQuery} Editorial Fashion Sketch Bundle — Commercial Use`,
            `Chic ${capQuery} Logo & Branding Kit — Boutique Style PNG`,
            `Runway-Inspired ${capQuery} Pattern Collection — Seamless PNG`,
            `Glam ${capQuery} Aesthetic Clipart — Luxury Beauty Illustrations`,
          ],
          scoreRange: [78, 92],
          priceRange: "$10-22",
          monthlySales: [150, 320],
          tags: ["fashion illustration", "boutique clipart", "editorial style", "luxury design", "commercial use", "chic aesthetic", "premium png", "haute couture", "beauty branding"],
          designTips: "Hand-drawn look with intentional imperfection reads as 'artisan' not 'amateur'. Watercolor textures add perceived value. Offer both light and dark background versions. Create coordinating sets (logo + patterns + illustrations) for brand kit upsells.",
          mockupPrompts: ["A luxury fashion illustration printed on textured cotton paper, styled with gold accessories and silk ribbon on a marble surface, soft studio lighting"],
          niches: ["fashion design", "boutique branding", "editorial illustration", "beauty art"],
        } : null,
        isBusiness || isAesthetic ? {
          designType: "Wall Art",
          fileFormat: "Digital Print Set",
          names: [
            `${capQuery} Gallery Wall Collection — 12 Premium Prints`,
            `Modern ${capQuery} Art Print Bundle — Museum Quality 300dpi`,
            `Boutique ${capQuery} Wall Art — Abstract Luxury Design`,
            `${capQuery} Aesthetic Poster Set — Scandinavian Style 8x10`,
            `Designer ${capQuery} Print Suite — Gallery Wall Ready`,
          ],
          scoreRange: [82, 95],
          priceRange: "$14-28",
          monthlySales: [200, 450],
          tags: ["wall art set", "gallery wall", "premium print", "aesthetic decor", "museum quality", "large format", "boutique art", "modern design", "instant download"],
          designTips: "Offer in 5+ ratio sizes (2:3, 3:4, 4:5, 11:14, ISO). Include a gallery wall layout guide as a freebie — it increases review rates by 40%. Neutral palettes outsell bold 3:1 in premium segments. Mockups should show framed, styled rooms.",
          mockupPrompts: ["A curated gallery wall featuring abstract art prints in gold frames, styled living room with neutral tones, interior design magazine quality"],
          niches: ["wall art", "gallery prints", "home decor", "digital download"],
        } : null,
        isHome || isAesthetic ? {
          designType: "DTF",
          fileFormat: "DTF Transfer",
          names: [
            `Boutique ${capQuery} DTF Transfer — Ready to Press Design`,
            `Premium ${capQuery} Heat Transfer Bundle — 8 DTF Prints`,
            `Luxury ${capQuery} Apparel Transfer — Commercial Grade DTF`,
            `Chic ${capQuery} T-Shirt Design — Boutique Quality DTF`,
            `Designer ${capQuery} DTF Gang Sheet — 12 Mixed Designs`,
          ],
          scoreRange: [76, 90],
          priceRange: "$8-18",
          monthlySales: [120, 280],
          tags: ["dtf transfer", "ready to press", "apparel design", "boutique shirt", "heat transfer", "commercial grade", "custom apparel", "small business", "gang sheet"],
          designTips: "Boutique DTF buyers look for designs they can't find at big box stores. Retro typography, vintage illustrations, and elevated humor sell best. Include size guides and pressing instructions. Offer coordinated mini-collections (mom + me sets, couple designs).",
          mockupPrompts: ["A premium DTF printed t-shirt displayed on a boutique clothing rack, soft lighting, minimalist store interior, editorial fashion style"],
          niches: ["apparel design", "dtf prints", "boutique clothing", "heat transfer"],
        } : null,
        isHoliday || isAesthetic ? {
          designType: "Sublimation",
          fileFormat: "Sublimation PNG",
          names: [
            `Designer ${capQuery} Sublimation Bundle — 20+ PNG Files`,
            `Boutique ${capQuery} Tumbler Wrap — Seamless Sublimation`,
            `${capQuery} Luxury Mug Design Set — High-End Sublimation`,
            `Premium ${capQuery} Blanket Template — Oversized Sublimation`,
            `${capQuery} Boutique Apparel Sublimation — Designer Collection`,
          ],
          scoreRange: [72, 88],
          priceRange: "$9-20",
          monthlySales: [140, 310],
          tags: ["sublimation design", "tumbler wrap", "luxury template", "boutique png", "seamless", "high resolution", "apparel design", "mug template", "commercial use"],
          designTips: "Seamless patterns that wrap continuously command premium prices. Watercolor textures with metallic accents (gold foil simulation) sell at 2x standard designs. Offer coordinating bundles (tumbler + mug + shirt using same design family).",
          mockupPrompts: ["A collection of luxury sublimation tumblers with metallic gold accents displayed on a marble countertop, boutique retail styling, product photography"],
          niches: ["sublimation", "tumbler design", "apparel template", "luxury drinkware"],
        } : null,
        {
          designType: "Stickers",
          fileFormat: "Digital Sticker Sheet",
          names: [
            `${capQuery} Premium Sticker Bundle — 50+ Boutique Designs`,
            `Luxury ${capQuery} Digital Sticker Sheet — Commercial Use`,
            `${capQuery} Aesthetic Planner Stickers — Designer Collection`,
            `Boutique ${capQuery} Label Stickers — Small Business Packaging`,
            `Chic ${capQuery} Decal Set — Waterproof Vinyl Stickers`,
          ],
          scoreRange: [80, 93],
          priceRange: "$6-16",
          monthlySales: [220, 500],
          tags: ["digital stickers", "planner aesthetic", "boutique label", "commercial use", "vinyl decal", "premium design", "small business", "packaging", "cute aesthetic"],
          designTips: "Coordinated sticker 'aesthetic packs' (matching color palettes, themes) convert 3x better than random assortments. Offer both printable + pre-cut options. Small business packaging labels are an underserved premium niche — shops pay $12-18 for professional label designs.",
          mockupPrompts: ["Luxury sticker sheets arranged on a white desk with gold scissors and washi tape, natural light, clean aesthetic, boutique product photography"],
          niches: ["digital stickers", "planner goods", "packaging labels", "vinyl decals"],
        },
      ].filter((t): t is DesignTemplate => t !== null);

      // Generate 5 products from templates
      const products: ProductOpportunity[] = templates.slice(0, 5).map((t, i) => {
        const nameIndex = i % t.names.length;
        const sales = rng(t.monthlySales[0], t.monthlySales[1]);
        return {
          name: t.names[nameIndex],
          opportunityScore: rng(t.scoreRange[0], t.scoreRange[1]),
          competitionLevel: (i < 2 ? "Low" : i < 4 ? "Medium" : "High") as "Low" | "Medium" | "High",
          estimatedDemand: (sales > 250 ? "High" : sales > 150 ? "Medium" : "Low") as "Low" | "Medium" | "High",
          priceRange: t.priceRange,
          seoTitle: `${t.names[nameIndex]} | Commercial Use | ${capQuery} Boutique Design`,
          etsyTags: [...t.tags, capQuery.toLowerCase(), "premium", "luxury", "boutique"].slice(0, 13),
          description: `Boutique-grade ${t.designType.toLowerCase()} design for discerning creators. ${t.designTips.split(".")[0]}. Estimated ${sales}+ units/month on Etsy in this niche. Price point optimized for the premium segment — buyers in this category willingly pay more for designs that feel exclusive and professionally crafted.`,
          bundleIdeas: [
            `Bundle with coordinating ${t.designType.toLowerCase()} set (save 25%)`,
            "Add matching brand kit upgrade",
            "Include commercial license for small business use",
          ],
          seasonalRelevance: isHoliday ? "Peaks 6-8 weeks before holiday" : "Year-round with Q4 holiday boost",
          designType: t.designType,
          fileFormat: t.fileFormat,
          niches: t.niches,
          estimatedSales: `${sales}+ monthly`,
          designTips: t.designTips,
          mockupPrompt: t.mockupPrompts[0],
        } as ProductOpportunity & { designType: string; fileFormat: string; niches: string[]; estimatedSales: string; designTips: string; mockupPrompt: string };
      });

      const overallScore = Math.round(products.reduce((sum, p) => sum + p.opportunityScore, 0) / products.length);

      return {
        opportunityScore: overallScore,
        marketInsight: `The "${query}" design niche on ${platform} shows strong demand from boutique and luxury buyers. Premium-positioned designs at $8-24 price points are clearing ${rng(150, 500)}+ units/month. Competition is ${overallScore > 85 ? "surprisingly low" : "moderate"} — sellers offering coordinated design suites and commercial licenses are capturing the highest margins. Focus on ${isWedding ? "elegant, timeless aesthetics" : isFashion ? "editorial-quality illustrations" : isBeauty ? "chic, sophisticated branding" : isHome ? "curated, designer-grade collections" : "elegant, boutique-quality designs"} that feel exclusive rather than mass-market.`,
        products: products as ProductOpportunity[],
      };
    }

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── OpenAI call ─────────────────────────────────────────────────────
async function callOpenAI(
  query: string,
  platform: string
): Promise<TrendAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[trends] No OPENAI_API_KEY — using mock data");
    return generateMockResults(query, platform);
  }

  const prompt = `You are a product trend analyst for e-commerce sellers. Analyze the niche "${query}" on the platform "${platform}" and return a JSON object with product opportunities.

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "opportunityScore": <number 0-100>,
  "marketInsight": "<2-3 sentence market overview>",
  "products": [
    {
      "name": "<catchy product name>",
      "opportunityScore": <number 0-100>,
      "competitionLevel": "<Low|Medium|High>",
      "estimatedDemand": "<Low|Medium|High>",
      "priceRange": "<$min-max>",
      "seoTitle": "<SEO-optimized listing title>",
      "etsyTags": ["<tag1>", "<tag2>", ..., up to 13 tags],
      "description": "<2-3 sentence compelling product description>",
      "bundleIdeas": ["<idea1>", "<idea2>", "<idea3>", "<idea4>"],
      "seasonalRelevance": "<seasonal pattern description>"
    }
  ]
}

Provide exactly 5 products. Make data realistic and actionable. Scores should vary between 65-95. Competition levels should be mostly Low-Medium.`;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a product trend analyst. Always respond with valid JSON only — no markdown, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";
    // Strip markdown code fences if present
    const json = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(json) as TrendAnalysisResult;
  } catch (error) {
    console.error("[trends] OpenAI call failed, falling back to mock:", error);
    return generateMockResults(query, platform);
  }
}

// ─── Route handler ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can run 10 searches per day." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query, platform } = body as {
      query?: string;
      platform?: string;
    };

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid search query (at least 2 characters)." },
        { status: 400 }
      );
    }

    const sanitizedQuery = query.trim().slice(0, 200);
    const sanitizedPlatform = platform?.trim() || "Etsy";

    // Get trend analysis
    const results = await callOpenAI(sanitizedQuery, sanitizedPlatform);

    // Save to database (don't block on failure)
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.search.create({
        data: {
          query: sanitizedQuery,
          niche: sanitizedQuery,
          platform: sanitizedPlatform,
          results: JSON.parse(JSON.stringify(results)),
          userId,
        },
      });
    } catch (dbError) {
      console.error("[trends] Failed to save search to DB:", dbError);
      // Non-fatal — still return results
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[trends] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
