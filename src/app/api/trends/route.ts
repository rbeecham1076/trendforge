import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type {
  TrendAnalysisResult,
  ProductOpportunity,
  DesignType,
  TrendSource,
} from "@/lib/types";
import { getEtsyTrendingData } from "@/lib/etsy-trends";

export const dynamic = "force-dynamic";

// ─── Rate limiting (simple in-memory) ───────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
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

// ─── Design type definitions ──────────────────────────────────────────

const DESIGN_TYPES: {
  type: DesignType;
  fileFormats: string[];
  priceRange: string;
  icon: string;
}[] = [
  {
    type: "SVG",
    fileFormats: ["SVG bundle", "SVG + PNG combo", "SVG + DXF + EPS bundle"],
    priceRange: "$4-8",
    icon: "✂️",
  },
  {
    type: "PNG",
    fileFormats: ["PNG 300dpi", "PNG clipart pack", "PNG + JPEG bundle"],
    priceRange: "$3-6",
    icon: "🖼️",
  },
  {
    type: "DTF",
    fileFormats: ["DTF transfer", "DTF gang sheet", "DTF ready-to-press"],
    priceRange: "$5-10",
    icon: "👕",
  },
  {
    type: "Wall Art",
    fileFormats: [
      "Printable wall art (multiple sizes)",
      "Gallery wall set",
      "Digital print 300dpi",
    ],
    priceRange: "$8-15",
    icon: "🖼️",
  },
  {
    type: "Sublimation",
    fileFormats: [
      "Sublimation PNG",
      "Tumbler wrap design",
      "Sublimation transfer sheet",
    ],
    priceRange: "$4-9",
    icon: "🪄",
  },
  {
    type: "Stickers",
    fileFormats: [
      "Printable sticker sheet",
      "Digital sticker pack",
      "Sticker PNG bundle",
    ],
    priceRange: "$2-4",
    icon: "⭐",
  },
];

// ─── Design tips by niche ─────────────────────────────────────────────

const DESIGN_TIPS_BY_NICHE: Record<string, string[]> = {
  teacher: [
    "Use bold, readable fonts — teachers love typography-based designs",
    "Include grade-level specific variations (K, 1st, 2nd, etc.)",
    "Apple, pencil, and book motifs always sell well",
    "Offer both funny/sarcastic AND heartfelt options in one bundle",
    "Make designs layer-friendly for easy customization",
  ],
  nurse: [
    "Heartbeat lines, stethoscopes, and RN symbols perform best",
    "Include both subtle minimalist AND bold statement designs",
    "Scrub-life humor and nurse puns drive engagement",
    "Offer multiple colorways — hospitals have different color scrubs",
    "Create specialty variations (ER, ICU, NICU, etc.)",
  ],
  wedding: [
    "Script and calligraphy fonts are essential for wedding designs",
    "Offer matching sets (invitation + signage + favor tags)",
    "Rustic, boho, and minimalist styles are currently trending",
    "Include both bride AND groom focused designs",
    "Neutral color palettes with one accent color convert better",
  ],
  baby: [
    "Soft watercolor textures and pastel palettes are top sellers",
    "Include milestone cards and growth chart designs",
    "Name personalization templates are a must-have",
    "Neutral/gender-neutral designs reach wider audience",
    "Safari, woodland, and celestial themes are trending",
  ],
  christmas: [
    "Vintage/retro Christmas aesthetics are having a moment",
    "Include both religious and secular options in bundles",
    "Buffalo plaid, gnomes, and truck themes are perennial sellers",
    "Create matching family sets — they command premium pricing",
    "Start listing by September — early shoppers pay more",
  ],
  halloween: [
    "Spooky-but-cute sells better than genuinely scary",
    "Boo baskets and classroom party designs are high volume",
    "Include matching family costume SVG sets",
    "Glow-in-the-dark compatible designs get premium placement",
    "Modern minimalist Halloween is a fast-growing niche",
  ],
  pet: [
    "Breed-specific designs dramatically outperform generic ones",
    "Funny pet parent sayings drive viral sharing",
    "Include both dog AND cat options — don't limit your market",
    "Pet memorial/rainbow bridge designs are a high-emotion niche",
    "Matching pet+owner designs are a growing trend",
  ],
  sports: [
    "Target specific sports AND specific positions for less competition",
    "Mom-of designs (Soccer Mom, etc.) are consistent sellers",
    "Retro/vintage team colors without licensed logos stay safe",
    "Include number customization options",
    "Seasonal — list 4-6 weeks before each sport's season starts",
  ],
  boho: [
    "Neutral earth tones with gold accents perform best",
    "Rainbow, sun, and celestial motifs are core designs",
    "Layer with textured backgrounds for premium look",
    "Pampas grass and dried flower elements are trending",
    "Macrame-inspired line art adds boho authenticity",
  ],
  western: [
    "Cow print, cowhide patterns, and hat motifs are hot right now",
    "Turquoise and warm terracotta color palettes convert well",
    "Include both rustic AND glam western styles",
    "Boot designs and horse motifs are perennial sellers",
    "Rodeo mom and country designs have loyal audiences",
  ],
  default: [
    "Use high-contrast designs that read well at thumbnail size",
    "Include both light AND dark background versions",
    "Offer at least 10-15 design variations per bundle",
    "Add a commercial-use license note — it increases perceived value",
    "Test designs on mockup photos before finalizing",
    "Include a mix of simple AND detailed designs in bundles",
  ],
};

// ─── Mockup prompts by design type ────────────────────────────────────

function generateMockupPrompt(
  designType: DesignType,
  niche: string
): string {
  const prompts: Record<DesignType, string> = {
    SVG: `Professional mockup of a ${niche} SVG cut file design applied to a black t-shirt on a flat-lay background with craft supplies — Cricut weeding tool, cutting mat, and vinyl rolls nearby. Soft natural lighting, clean composition, Etsy product photography style.`,
    PNG: `Flat-lay mockup of ${niche} PNG clipart designs displayed on a laptop screen and printed on white cardstock. Colorful, commercial-use clipart packaged as a bundle. Clean desk setup with plants and stationery. Bright, airy aesthetic.`,
    DTF: `Mockup of a ${niche} DTF transfer sheet being heat-pressed onto a sweatshirt. Heat press machine visible, vibrant transfer colors, professional print shop setting. Finished garment shown folded neatly alongside transfer sheets.`,
    "Wall Art": `Interior mockup of ${niche} wall art prints in modern minimalist frames, hanging in a bright, airy living room. Multiple sizes shown in a gallery wall arrangement. Scandinavian interior design style, natural light, cozy aesthetic.`,
    Sublimation: `Mockup of ${niche} sublimation design applied to a stainless steel tumbler with sparkly epoxy finish. Tumbler on a light pad with scattered glitter and rhinestones. Professional tumbler-maker setup, bright clean lighting.`,
    Stickers: `Flat-lay mockup of ${niche} sticker sheets, some peeled and stuck onto a laptop, water bottle, and notebook. Matte vinyl sticker finish shown. Colorful and fun aesthetic, lifestyle product photography style.`,
  };
  return prompts[designType];
}

// ─── Name generator ───────────────────────────────────────────────────

function generateDesignName(
  designType: DesignType,
  niche: string,
  index: number
): string {
  const capNiche = capitalizeWords(niche);

  const templates: Record<DesignType, string[]> = {
    SVG: [
      `${capNiche} SVG Bundle — ${12 + index * 4} Designs for Cricut & Silhouette`,
      `${capNiche} Cut File Set — Commercial Use SVG + DXF + EPS`,
      `Trending ${capNiche} SVG Pack — ${15 + index * 3} Layered Designs`,
      `Mega ${capNiche} SVG Bundle — ${20 + index * 5} Designs with Commercial License`,
      `Premium ${capNiche} SVG Collection — ${10 + index * 3} Unique Cut Files`,
    ],
    PNG: [
      `${capNiche} PNG Clipart Pack — ${20 + index * 4} Transparent Background 300dpi`,
      `${capNiche} Digital Clip Art — ${15 + index * 5} Watercolor Style PNGs`,
      `${capNiche} PNG Bundle — ${24 + index * 6} Commercial Use Clipart`,
      `Vintage ${capNiche} PNG Set — ${12 + index * 4} High Resolution Designs`,
      `${capNiche} Clipart Collection — ${30 + index * 5} PNG Files with BONUS SVGs`,
    ],
    DTF: [
      `${capNiche} DTF Transfer — Ready to Press Gang Sheet`,
      `${capNiche} DTF Print — ${3 + index} Colorways, Premium Transfer`,
      `Custom ${capNiche} DTF Gang Sheet — ${5 + index} Designs Per Sheet`,
      `${capNiche} DTF Transfer Bundle — ${8 + index * 2} Ready-to-Press Prints`,
      `Trending ${capNiche} DTF — Ultra-Soft Feel Transfer Sheet`,
    ],
    "Wall Art": [
      `${capNiche} Wall Art Set — ${5 + index} Printable Sizes, Instant Download`,
      `${capNiche} Gallery Wall Bundle — ${7 + index} Modern Prints`,
      `${capNiche} Digital Art Print — ${4 + index} Ratio Sizes, 300dpi`,
      `Boho ${capNiche} Wall Decor — ${6 + index} Printable Art Files`,
      `${capNiche} Nursery Wall Art — ${5 + index} Prints, Gender Neutral`,
    ],
    Sublimation: [
      `${capNiche} Sublimation Design — Tumbler, Mug & Shirt Ready`,
      `${capNiche} Sublimation PNG — ${8 + index * 2} Designs for 20oz Tumbler`,
      `${capNiche} Tumbler Wrap Bundle — ${6 + index} Sublimation Transfers`,
      `${capNiche} Sublimation Transfer — ${10 + index * 2} PNG Files 300dpi`,
      `Trending ${capNiche} Sublimation — ${12 + index * 3} Designs Commercial Use`,
    ],
    Stickers: [
      `${capNiche} Sticker Sheet — Digital Download, ${8 + index * 2} Designs`,
      `${capNiche} Printable Sticker Pack — ${12 + index * 3} PNG + PDF`,
      `Cute ${capNiche} Sticker Bundle — ${15 + index * 3} Planner Stickers`,
      `${capNiche} Digital Sticker Set — ${10 + index * 2} Designs, Instant Download`,
      `Aesthetic ${capNiche} Sticker Pack — ${20 + index * 4} PNG Files`,
    ],
  };

  const options = templates[designType];
  return options[index % options.length];
}

// ─── Etsy tag generator ───────────────────────────────────────────────

function generateTags(
  niche: string,
  designType: DesignType
): string[] {
  const nicheLower = niche.toLowerCase();
  const baseTags: Record<DesignType, string[]> = {
    SVG: [
      "svg cut file",
      "cricut design",
      "silhouette cameo",
      "svg bundle",
      "commercial use svg",
      "layered svg",
      "digital download",
      "craft file",
      "instant download",
      "vinyl ready",
      "cutting machine",
      "diy craft",
      "trending svg",
    ],
    PNG: [
      "png clipart",
      "digital download",
      "commercial use",
      "transparent background",
      "clipart bundle",
      "watercolor clipart",
      "300dpi png",
      "printable art",
      "scrapbooking",
      "card making",
      "sublimation png",
      "design resource",
      "graphics pack",
    ],
    DTF: [
      "dtf transfer",
      "ready to press",
      "dtf gang sheet",
      "custom transfer",
      "heat press design",
      "dtf print",
      "shirt transfer",
      "apparel design",
      "trending now",
      "small shop",
      "dtf bundle",
      "commercial use",
      "premium transfer",
    ],
    "Wall Art": [
      "wall art print",
      "digital download",
      "printable wall art",
      "gallery wall",
      "nursery decor",
      "home decor print",
      "modern wall art",
      "minimalist print",
      "boho wall decor",
      "instant download",
      "multiple sizes",
      "living room art",
      "trending decor",
    ],
    Sublimation: [
      "sublimation design",
      "tumbler wrap",
      "sublimation png",
      "tumbler design",
      "20oz tumbler",
      "sublimation transfer",
      "cup design",
      "digital download",
      "trending now",
      "commercial use",
      "heat transfer",
      "diy tumbler",
      "sparkle tumbler",
    ],
    Stickers: [
      "sticker sheet",
      "digital sticker",
      "printable sticker",
      "planner sticker",
      "aesthetic sticker",
      "cute sticker pack",
      "digital download",
      "journal sticker",
      "scrapbook sticker",
      "water bottle sticker",
      "laptop sticker",
      "trending sticker",
      "png sticker",
    ],
  };

  const tags = [...baseTags[designType]];
  tags.unshift(nicheLower);
  if (nicheLower.includes(" ")) {
    tags.unshift(...nicheLower.split(" "));
  }

  // Add niche-specific variant tags
  const variants = [
    `${nicheLower} ${designType.toLowerCase()}`,
    `${nicheLower} design`,
  ];
  tags.push(...variants);

  return [...new Set(tags)].slice(0, 13);
}

// ─── Mock data generator — DESIGN-FOCUSED ─────────────────────────────

function generateMockResults(
  query: string,
  platform: string,
  etsyTrends: { trendingSearches: string[]; popularTags: string[] }
): TrendAnalysisResult {
  const niche = query.toLowerCase();
  const capNiche = capitalizeWords(query);

  // Seed-based randomization for consistent results per query
  const seed = niche.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = (min: number, max: number) => {
    const x = Math.sin(seed + min * 12.9898 + max * 78.233) * 43758.5453;
    return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
  };

  // Detect niche category for targeted tips
  let nicheCategory = "default";
  for (const [key] of Object.entries(DESIGN_TIPS_BY_NICHE)) {
    if (niche.includes(key)) {
      nicheCategory = key;
      break;
    }
  }

  // Check if Etsy has trending data related to this query
  const etsyRelevantTerms = etsyTrends.trendingSearches.filter(
    (s) =>
      s.includes(niche) ||
      niche
        .split(" ")
        .some((word) => word.length > 3 && s.includes(word))
  );
  const hasEtsyTrendData = etsyRelevantTerms.length > 0;

  // Generate 5 products, one of each major design type
  const selectedDesignTypes: DesignType[] = [
    "SVG",
    "PNG",
    "DTF",
    "Wall Art",
    "Stickers",
  ];

  // Sprinkle in Sublimation sometimes based on query
  if (
    niche.includes("tumbler") ||
    niche.includes("sublimation") ||
    niche.includes("cup") ||
    niche.includes("mug")
  ) {
    selectedDesignTypes[4] = "Sublimation";
  }

  const products: ProductOpportunity[] = selectedDesignTypes.map(
    (designType, i) => {
      const dt = DESIGN_TYPES.find((d) => d.type === designType)!;
      const fileFormat = dt.fileFormats[i % dt.fileFormats.length];
      const designTips =
        DESIGN_TIPS_BY_NICHE[nicheCategory] || DESIGN_TIPS_BY_NICHE.default;
      const tips = designTips.slice(i, i + 2).join(". ") || designTips[0];

      // Determine trend source
      let trendSource: TrendSource = "ai-generated";
      if (hasEtsyTrendData) trendSource = "etsy-trending";
      else if (
        niche.includes("christmas") ||
        niche.includes("halloween") ||
        niche.includes("valentine") ||
        niche.includes("summer") ||
        niche.includes("fall") ||
        niche.includes("spring") ||
        niche.includes("winter")
      ) {
        trendSource = "seasonal";
      }

      return {
        name: generateDesignName(designType, niche, i),
        opportunityScore: rng(68, 94),
        competitionLevel:
          i === 0
            ? "Low"
            : i === 1
              ? "Medium"
              : i === 2
                ? "Low"
                : i === 3
                  ? "Medium"
                  : "Low",
        estimatedDemand:
          i === 0 || i === 2 || i === 4 ? "High" : "Medium",
        priceRange: dt.priceRange,
        seoTitle: `${generateDesignName(designType, niche, i)} | ${platform} Design | ${capitalizeWords(designType)} Cut File Commercial Use`,
        etsyTags: generateTags(niche, designType),
        description: `This ${designType.toLowerCase()} design bundle for ${niche} is optimized for ${platform} sellers. Designed with current market trends in mind — ${tips.toLowerCase()}. Includes ${fileFormat.toLowerCase()} files, ready for your customers to create with. Perfect for ${platform} shops looking to add trending ${designType.toLowerCase()} products to their catalog with minimal effort and maximum profit potential.`,
        bundleIdeas: [
          `Bundle with matching ${designType === "SVG" ? "PNG clipart" : designType === "PNG" ? "SVG cut files" : "SVG + PNG combo"} pack`,
          `Create a ${niche} mega-bundle with all 5 design types`,
          `Add coordinating ${niche} mockups and listing photos`,
          `Pair with a ${niche} marketing kit (social media templates)`,
        ],
        seasonalRelevance:
          i === 3
            ? "Peaks in fall/winter (indoor crafting season)"
            : i === 4
              ? "November-December holiday peak"
              : "Year-round (peaks in spring and holiday season)",
        designType,
        fileFormat,
        niches: [
          `${capNiche} designs`,
          `${designType} cut files`,
          "Digital downloads",
          "Craft supplies",
          "DIY projects",
        ],
        estimatedSales: rng(100, 450),
        designTips: tips,
        mockupPrompt: generateMockupPrompt(designType, niche),
        trendSource,
      };
    }
  );

  const overallScore = Math.round(
    products.reduce((sum, p) => sum + p.opportunityScore, 0) /
      products.length
  );

  // Build market insight with real Etsy data when available
  let marketInsight = "";
  if (hasEtsyTrendData && etsyRelevantTerms.length > 0) {
    marketInsight = `"${niche}" is actively trending on Etsy right now — related searches like "${etsyRelevantTerms.slice(0, 3).join('", "')}" are seeing strong buyer interest. The design/printable market for this niche shows ${rng(30, 60)}% year-over-year growth with low-to-medium competition. SVG bundles ($4-8) and wall art prints ($8-15) are the top-performing formats. Early movers are capturing significant market share with unique, high-quality designs.`;
  } else {
    const platformInsights: Record<string, string> = {
      Etsy: "a 35% year-over-year increase in design/printable search volume with relatively few sellers specializing in this exact niche",
      Shopify: "rising consumer interest driven by social media trends, with a 28% quarter-over-quarter uptick in related design searches",
      "Amazon Handmade": "growing demand for print-on-demand designs with limited competition — early movers are capturing significant market share",
      POD: "consistent print-on-demand demand fueled by TikTok and Instagram, with trending hashtags driving discovery for design assets",
    };
    marketInsight = `The "${niche}" design niche on ${platform} is showing strong growth with ${platformInsights[platform] || platformInsights.Etsy}. Competition is mostly low to medium — an excellent entry point for design sellers. Focus on unique, high-quality SVG bundles ($4-8) and wall art sets ($8-15). Design-based products in this niche average ${rng(150, 400)}+ monthly searches with climbing interest.`;
  }

  return {
    opportunityScore: overallScore,
    marketInsight,
    products,
  };
}

// ─── OpenAI call (updated for design focus) ───────────────────────────

async function callOpenAI(
  query: string,
  platform: string
): Promise<TrendAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[trends] No OPENAI_API_KEY — using mock data");
    const etsyTrends = await getEtsyTrendingData();
    return generateMockResults(query, platform, etsyTrends);
  }

  const prompt = `You are a design trend analyst for print-on-demand and craft sellers. Analyze the design niche "${query}" on the platform "${platform}" and return a JSON object with DESIGN-focused product opportunities — these are digital design assets sellers can produce, NOT physical products.

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "opportunityScore": <number 0-100>,
  "marketInsight": "<2-3 sentence market overview focused on design/printable trends>",
  "products": [
    {
      "name": "<product name emphasizing design format>",
      "opportunityScore": <number 0-100>,
      "competitionLevel": "<Low|Medium|High>",
      "estimatedDemand": "<Low|Medium|High>",
      "priceRange": "<$min-max>",
      "seoTitle": "<SEO-optimized Etsy listing title for this design>",
      "etsyTags": ["<tag1>", "<tag2>", ..., up to 13 tags],
      "description": "<2-3 sentence compelling product description from a design seller perspective>",
      "bundleIdeas": ["<design bundle idea>", ...],
      "seasonalRelevance": "<seasonal pattern>",
      "designType": "<SVG|PNG|DTF|Wall Art|Sublimation|Stickers>",
      "fileFormat": "<SVG bundle|PNG 300dpi|DTF transfer|Printable wall art|Sublimation PNG|Sticker sheet>",
      "niches": ["<niche1>", "<niche2>", ...],
      "estimatedSales": <monthly Etsy sales estimate, number>,
      "designTips": "<1-2 sentences of design advice for this niche>",
      "mockupPrompt": "<DALL-E/Midjourney prompt for generating a product mockup>",
      "trendSource": "<etsy-trending|seasonal|ai-generated>"
    }
  ]
}

Provide exactly 5 products covering different design types: SVG, PNG, DTF, Wall Art, and Stickers (or Sublimation if relevant). Scores should vary between 65-95. Competition levels should be mostly Low-Medium. Focus on what makes a good SELLABLE design, not a physical product.`;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a design trend analyst for print-on-demand sellers. Always respond with valid JSON only — no markdown, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";
    const json = content
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "");
    return JSON.parse(json) as TrendAnalysisResult;
  } catch (error) {
    console.error("[trends] OpenAI call failed, falling back to mock:", error);
    const etsyTrends = await getEtsyTrendingData();
    return generateMockResults(query, platform, etsyTrends);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Route handler ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        {
          error: "Please provide a valid search query (at least 2 characters).",
        },
        { status: 400 }
      );
    }

    const sanitizedQuery = query.trim().slice(0, 200);
    const sanitizedPlatform = platform?.trim() || "Etsy";

    // ── Fetch Etsy trending data (non-blocking, cached) ──
    let etsyTrendingData;
    try {
      etsyTrendingData = await getEtsyTrendingData();
    } catch {
      // Non-fatal — proceed without Etsy data
      console.warn("[trends] Failed to fetch Etsy trending data");
    }

    // ── Get trend analysis ──
    const results = await callOpenAI(sanitizedQuery, sanitizedPlatform);

    // Inject Etsy trending data into results
    if (etsyTrendingData) {
      results.etsyTrendingData = etsyTrendingData;
    }

    // ── Save to database (non-blocking) ──
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
