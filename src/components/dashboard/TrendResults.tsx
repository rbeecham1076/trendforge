"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  ShoppingBag,
  Package,
  Star,
  Bookmark,
  BookmarkCheck,
  DollarSign,
  Gauge,
  Users,
  Calendar,
  Search,
  Download,
  Loader2,
} from "lucide-react";
import type { TrendAnalysisResult, ProductOpportunity } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────
function scoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 80)
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    };
  if (score >= 50)
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
    };
  return {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  };
}

function scoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-500 to-green-600";
  if (score >= 50) return "from-amber-500 to-orange-600";
  return "from-red-500 to-rose-600";
}

// ─── Skeleton loader ──────────────────────────────────────────────────
function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="h-8 w-48 bg-white/5 rounded mb-3" />
        <div className="h-4 w-full bg-white/5 rounded mb-2" />
        <div className="h-4 w-3/4 bg-white/5 rounded" />
      </div>
      {/* Product card skeletons */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="h-6 w-48 bg-white/5 rounded" />
            <div className="h-6 w-16 bg-white/5 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-12 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
        <Search className="h-8 w-8 text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Ready to discover trends
      </h3>
      <p className="text-gray-400 max-w-sm">
        Enter a niche or keyword above and let our AI find profitable product
        opportunities for your store.
      </p>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────
function ProductCard({
  product,
  index,
  onSave,
  isSaved,
}: {
  product: ProductOpportunity;
  index: number;
  onSave: (product: ProductOpportunity) => void;
  isSaved: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = scoreColor(product.opportunityScore);

  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-600 font-mono">
                #{index + 1}
              </span>
              <h3 className="text-lg font-semibold text-white truncate">
                {product.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold border ${color.border} ${color.bg} ${color.text}`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {product.opportunityScore}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isSaved ? "text-amber-400" : "text-gray-500 hover:text-amber-400"}`}
              onClick={() => onSave(product)}
              title={isSaved ? "Saved to projects" : "Save to projects"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Gauge className="h-3 w-3" />
              Competition
            </div>
            <p
              className={`text-sm font-semibold ${
                product.competitionLevel === "Low"
                  ? "text-emerald-400"
                  : product.competitionLevel === "Medium"
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {product.competitionLevel}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Users className="h-3 w-3" />
              Demand
            </div>
            <p
              className={`text-sm font-semibold ${
                product.estimatedDemand === "High"
                  ? "text-emerald-400"
                  : product.estimatedDemand === "Medium"
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {product.estimatedDemand}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <DollarSign className="h-3 w-3" />
              Price Range
            </div>
            <p className="text-sm font-semibold text-white">
              {product.priceRange}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar className="h-3 w-3" />
              Season
            </div>
            <p className="text-sm font-semibold text-white truncate">
              {product.seasonalRelevance}
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {expanded ? "Hide details" : "Show SEO & listing details"}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* SEO Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <FileText className="h-3.5 w-3.5" />
                SEO Title
              </div>
              <p className="text-sm text-gray-200 bg-white/[0.03] border border-white/10 rounded-lg p-3">
                {product.seoTitle}
              </p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <ShoppingBag className="h-3.5 w-3.5" />
                Product Description
              </div>
              <p className="text-sm text-gray-300 bg-white/[0.03] border border-white/10 rounded-lg p-3 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Tag className="h-3.5 w-3.5" />
                Tags ({product.etsyTags.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.etsyTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bundle Ideas */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Package className="h-3.5 w-3.5" />
                Bundle Ideas
              </div>
              <ul className="space-y-1.5">
                {product.bundleIdeas.map((idea, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main results component ───────────────────────────────────────────
export function TrendResults({
  data,
  isLoading,
  query,
  platform,
}: {
  data: TrendAnalysisResult | null;
  isLoading: boolean;
  query: string;
  platform: string;
}) {
  const [savedProducts, setSavedProducts] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = sessionStorage.getItem("trendforge-saved-products");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [exporting, setExporting] = useState(false);

  const handleSaveProduct = useCallback(
    async (product: ProductOpportunity) => {
      const key = `${product.name}-${query}`;

      setSavedProducts((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          // Already saved — we don't support unsave via this API currently
          // (could add DELETE but the task says save to projects)
        } else {
          next.add(key);
        }
        sessionStorage.setItem(
          "trendforge-saved-products",
          JSON.stringify(Array.from(next))
        );
        return next;
      });

      // Save to database via API
      try {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: product.name,
            data: {
              query,
              platform,
              opportunityScore: product.opportunityScore,
              marketInsight: "",
              products: [product],
            },
          }),
        });
      } catch {
        // Non-fatal — already updated the UI
      }
    },
    [query, platform]
  );

  const handleExport = useCallback(async () => {
    if (!data || exporting) return;
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: data,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Export failed:", err.error);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trendforge-export-${query.replace(/\s+/g, "-").slice(0, 30)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  }, [data, exporting, query]);

  if (isLoading) return <ResultsSkeleton />;
  if (!data) return <EmptyState />;

  const overviewColor = scoreColor(data.opportunityScore);

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
        {/* Gradient accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${scoreGradient(data.opportunityScore)}`}
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Opportunity Score</p>
              <div className="flex items-center gap-3">
                <span
                  className={`text-5xl sm:text-6xl font-bold ${overviewColor.text}`}
                >
                  {data.opportunityScore}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  data.opportunityScore >= 80
                    ? "success"
                    : data.opportunityScore >= 50
                      ? "default"
                      : "destructive"
                }
                className="text-sm px-3 py-1"
              >
                {data.opportunityScore >= 80
                  ? "🔥 Strong Opportunity"
                  : data.opportunityScore >= 50
                    ? "💡 Worth Exploring"
                    : "⚠️ High Competition"}
              </Badge>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {data.marketInsight}
          </p>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
            <span>
              Query: <span className="text-gray-300">{query}</span>
            </span>
            <span>•</span>
            <span>
              Platform: <span className="text-gray-300">{platform}</span>
            </span>
            <span>•</span>
            <span>
              Products:{" "}
              <span className="text-gray-300">{data.products.length}</span>
            </span>
            {/* Export button */}
            <span>•</span>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400" />
          Product Opportunities
        </h3>
        {data.products.map((product, i) => (
          <ProductCard
            key={i}
            product={product}
            index={i}
            onSave={handleSaveProduct}
            isSaved={savedProducts.has(`${product.name}-${query}`)}
          />
        ))}
      </div>

      {/* Bottom export bar */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Download className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-sm text-gray-400">
            Export all {data.products.length} products as CSV
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          className="shrink-0"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
