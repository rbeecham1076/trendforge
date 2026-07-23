"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendResults } from "@/components/dashboard/TrendResults";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
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
  ImagePlus,
  Flame,
  Lightbulb,
} from "lucide-react";
import type { TrendAnalysisResult, ImageAnalysis } from "@/lib/types";

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
  const [showInspiration, setShowInspiration] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPlatform =
    platforms.find((p) => p.id === platform) || platforms[0];

  // ─── Autocomplete fetch ─────────────────────────────────────────
  const fetchSuggestions = useCallback(
    async (q: string, plat: string) => {
      if (q.length < 1 && !showSuggestions) return;
      setSuggestionsLoading(true);
      try {
        const res = await fetch(
          `/api/suggest?q=${encodeURIComponent(q)}&platform=${encodeURIComponent(plat)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          if (q.length === 0) {
            setTrendingSearches(data.suggestions || []);
          }
        }
      } catch {
        // silently fail
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [showSuggestions]
  );

  // Fetch trending on mount
  useEffect(() => {
    fetchSuggestions("", platform);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  // Debounced fetch as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query, platform);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, platform, fetchSuggestions]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string, searchPlatform: string) => {
      setIsLoading(true);
      setError(null);
      setResults(null);
      setShowSuggestions(false);

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
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
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

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      performSearch(suggestion, platform);
    },
    [platform, performSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // ─── Image analysis handler ─────────────────────────────────────
  const handleImageAnalysis = useCallback(
    (analysis: ImageAnalysis) => {
      // Auto-fill search with keywords from the image
      const keywordQuery = analysis.keywords.slice(0, 4).join(" ");
      setQuery(keywordQuery);
      setShowInspiration(false);
      // Optionally auto-search
      // performSearch(keywordQuery, platform);
    },
    []
  );

  // ─── Combined suggestions for display ───────────────────────────
  const displaySuggestions =
    query.length > 0 ? suggestions : trendingSearches;

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
      <div className="relative mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-1.5 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-indigo-500/5">
          {/* Input with autocomplete */}
          <div className="flex-1 flex items-center gap-3 px-4 py-2 relative">
            <Search className="h-5 w-5 text-gray-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., boho home decor, minimalist jewelry, cottagecore..."
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 text-base focus:outline-none"
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-white/10 my-1" />

          {/* Inspiration upload toggle */}
          <button
            type="button"
            onClick={() => setShowInspiration(!showInspiration)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium ${
              showInspiration
                ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300"
                : "bg-white/[0.05] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
            disabled={isLoading}
          >
            <ImagePlus className="h-4 w-4" />
            Inspiration
          </button>

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

        {/* Autocomplete dropdown */}
        {showSuggestions && displaySuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/10 bg-gray-950/95 backdrop-blur-xl shadow-2xl z-30 overflow-hidden animate-in slide-in-from-top-2 duration-200"
          >
            {/* Category header */}
            {query.length === 0 && (
              <div className="px-4 py-2 border-b border-white/5">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-orange-400" />
                  Trending Now
                </p>
              </div>
            )}
            {query.length > 0 && (
              <div className="px-4 py-2 border-b border-white/5">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Lightbulb className="h-3 w-3 text-amber-400" />
                  Suggestions
                </p>
              </div>
            )}

            {/* Suggestions list */}
            {displaySuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors text-left ${
                  index === selectedSuggestionIndex
                    ? "bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                <span>{suggestion}</span>
              </button>
            ))}

            {/* Loading indicator */}
            {suggestionsLoading && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/5">
                <Loader2 className="h-3.5 w-3.5 text-gray-500 animate-spin" />
                <span className="text-xs text-gray-500">
                  Fetching suggestions...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Inspiration upload panel */}
      {showInspiration && (
        <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
          <ImageUpload
            onAnalysisComplete={handleImageAnalysis}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Results area */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-violet-500/20 blur-2xl" />
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
      />

      {/* Tip */}
      {hasSearched && !isLoading && !error && (
        <div className="mt-8 rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/5 via-fuchsia-500/5 to-violet-500/5 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-fuchsia-400" />
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
