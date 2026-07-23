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

export interface TrendAnalysisResult {
  opportunityScore: number;
  marketInsight: string;
  products: ProductOpportunity[];
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
