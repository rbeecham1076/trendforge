"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TrendResults } from "@/components/dashboard/TrendResults";
import {
  Search,
  Sparkles,
  TrendingUp,
  Loader2,
  ChevronDown,
  Globe,
  ShoppingBag,
  Truck,
  Palette,
} from "lucide-react";
import type { TrendAnalysisResult } from "@/lib/types";

const platforms = [
  {
    id: "Etsy",
    label: "Etsy",
    icon: ShoppingBag,
    gradient: "from-orange-500 to-pink-500",
  },
  {
    id: "Shopify",
    label: "Shopify",
    icon: Globe,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "Amazon Handmade",
    label: "Amazon Handmade",
    icon: Truck,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "POD",
    label: "Print-on-Demand",
    icon: Palette,
    gradient: "from-purple-500 to-violet-600",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("Etsy");
  const [results, setResults] = useState<TrendAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);

  const selectedPlatform = platforms.find((p) => p.id === platform) || platforms[0];

  const performSearch = useCallback(
    async (searchQuery: string, searchPlatform: string) => {
      setIsLoading(true);
      setError(null);
      setResults(null);

      try {
        const res = await fetch("/api/trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, platform: searchPlatform }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }

        const data: TrendAnalysisResult = await res.json();
        setResults(data);
        setHasSearched(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) return;
    await performSearch(query.trim(), platform);
  }, [query, platform, performSearch]);

  const handleRelatedSearch = useCallback(
    (term: string) => {
      setQuery(term);
      performSearch(term, platform);
    },
    [platform, performSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trend Search</h1>
        <p className="text-gray-400">
          Enter a niche or keyword to discover winning product opportunities
          with AI-powered analysis.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-1.5 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-indigo-500/5">
          {/* Input */}
          <div className="flex-1 flex items-center gap-3 px-4 py-2">
            <Search className="h-5 w-5 text-gray-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., boho home decor, minimalist jewelry, cottagecore..."
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 text-base focus:outline-none"
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-white/10 my-1" />

          {/* Platform selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors text-white text-sm font-medium"
              disabled={isLoading}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${selectedPlatform.gradient}`}
              >
                <selectedPlatform.icon className="h-3.5 w-3.5 text-white" />
              </div>
              {selectedPlatform.label}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {platformDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPlatformDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-gray-950 shadow-2xl z-20 py-1.5 backdrop-blur-xl">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPlatform(p.id);
                        setPlatformDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                        platform === p.id
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${p.gradient}`}
                      >
                        <p.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <Button
            variant="premium"
            size="lg"
            onClick={handleSearch}
            disabled={isLoading || query.trim().length < 2}
            className="shrink-0 rounded-xl px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Trends
              </>
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Results area */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10">
              <TrendingUp className="h-10 w-10 text-gray-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to discover winning products?
          </h3>
          <p className="text-gray-400 max-w-md">
            Try &quot;boho home decor&quot;, &quot;minimalist jewelry&quot;, or
            &quot;cottagecore accessories&quot; — our AI will analyze trends and
            suggest profitable product ideas.
          </p>
        </div>
      )}

      <TrendResults
        data={results}
        isLoading={isLoading}
        query={query.trim()}
        platform={selectedPlatform.label}
        onSearchRelated={handleRelatedSearch}
      />

      {/* Tip */}
      {hasSearched && !isLoading && !error && (
        <div className="mt-8 rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Want even better results?
            </p>
            <p className="text-sm text-gray-400">
              Be specific with your niche. Instead of &quot;jewelry&quot;, try
              &quot;minimalist gold pendant necklaces&quot; for more targeted
              product ideas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
