export type DesignType =
  | "SVG"
  | "PNG"
  | "DTF"
  | "Wall Art"
  | "Sublimation"
  | "Stickers";

export type TrendSource =
  | "etsy-trending"
  | "google-trends"
  | "seasonal"
  | "ai-generated";

export interface ProductOpportunity {
  name: string;
  opportunityScore: number;
  competitionLevel: "Low" | "Medium" | "High";
  estimatedDemand: "Low" | "Medium" | "High";
  priceRange: string;
  seoTitle: string;
  etsyTags: string[];
  description: string;
  bundleIdeas: string[];
  seasonalRelevance: string;
  // ─── Design-specific fields ─────────────────────────────
  designType: DesignType;
  fileFormat: string;
  niches: string[];
  estimatedSales: number;
  designTips: string;
  mockupPrompt: string;
  trendSource: TrendSource;
}

export interface ImageAnalysis {
  keywords: string[];
  products: string[];
  palette: string[];
  niche: string;
}

export interface TrendAnalysisResult {
  opportunityScore: number;
  marketInsight: string;
  products: ProductOpportunity[];
  etsyTrendingData?: EtsyTrendingData;
}

export interface TrendSearchRequest {
  query: string;
  platform: string;
}

export interface SavedProject {
  id: string;
  query: string;
  platform: string;
  result: TrendAnalysisResult;
  savedAt: string;
}

// ─── Etsy trend scraper types ─────────────────────────────

export interface EtsyTrendingData {
  trendingSearches: string[];
  popularTags: string[];
  risingCategories: string[];
  fetchedAt: string;
  source: string;
}
