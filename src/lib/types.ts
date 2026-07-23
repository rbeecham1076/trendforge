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
}

export interface MarketData {
  trendDirection: "rising" | "falling" | "stable";
  interestTimeline: { month: string; value: number }[];
  relatedQueries: string[];
  topRegions: string[];
  seasonality: string | null;
}

export interface TrendAnalysisResult {
  opportunityScore: number;
  marketInsight: string;
  products: ProductOpportunity[];
  marketData?: MarketData;
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
