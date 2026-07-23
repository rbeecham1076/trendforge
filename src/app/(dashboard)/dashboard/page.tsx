"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/SubscribeButton";
import {
  Search,
  TrendingUp,
  Bookmark,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Crown,
  Download,
  FolderOpen,
} from "lucide-react";

interface SearchRecord {
  id: string;
  query: string;
  platform: string;
  results: { products?: { length: number }[] } | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const firstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "there";

  const [stats, setStats] = useState({
    searches: 0,
    products: 0,
    saved: 0,
  });
  const [planInfo, setPlanInfo] = useState<{
    plan: string;
    status: string;
  }>({ plan: "free", status: "active" });
  const [recentSearches, setRecentSearches] = useState<
    { title: string; description: string; time: string; icon: typeof Sparkles }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch searches + projects in parallel
        const [searchesRes, projectsRes] = await Promise.all([
          fetch("/api/searches"),
          fetch("/api/projects"),
        ]);

        let searches: SearchRecord[] = [];
        let searchCount = 0;
        let totalProducts = 0;

        if (searchesRes.ok) {
          const data = await searchesRes.json();
          searches = data.searches || [];
          searchCount = data.count || searches.length;
          for (const s of searches) {
            if (s.results?.products && Array.isArray(s.results.products)) {
              totalProducts += s.results.products.length;
            }
          }
        }

        let savedCount = 0;
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          savedCount = data.count || 0;
        }

        setStats({
          searches: searchCount,
          products: totalProducts,
          saved: savedCount,
        });

        // Recent activity from searches
        const recent = searches.slice(0, 3).map((s) => ({
          title: `Searched: "${s.query}"`,
          description: `Platform: ${s.platform} — ${
            s.results?.products && Array.isArray(s.results.products)
              ? `${s.results.products.length} products found`
              : "Analysis complete"
          }`,
          time: formatTimeAgo(s.createdAt),
          icon: Search,
        }));

        setRecentSearches(
          recent.length > 0
            ? recent
            : [
                {
                  title: "Welcome to TrendForge!",
                  description:
                    "Start your first trend search to discover winning products for your store.",
                  time: "Just now",
                  icon: Sparkles,
                },
              ]
        );
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    }

    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          setPlanInfo({
            plan: data.plan || "free",
            status: data.status || "active",
          });
        }
      } catch {
        // Keep defaults
      }
    }

    fetchData();
    fetchSubscription();
  }, []);

  const statsCards = [
    {
      label: "Searches Run",
      value: loading ? "..." : String(stats.searches),
      icon: Search,
      gradient: "from-indigo-500 to-blue-500",
      href: "/dashboard/search",
    },
    {
      label: "Products Found",
      value: loading ? "..." : String(stats.products),
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      href: "/dashboard/search",
    },
    {
      label: "Saved Projects",
      value: loading ? "..." : String(stats.saved),
      icon: Bookmark,
      gradient: "from-amber-500 to-orange-500",
      href: "/dashboard/projects",
    },
  ];

  const quickActions = [
    {
      label: "New Trend Search",
      description: "Discover trending products with AI-powered analysis",
      icon: Search,
      href: "/dashboard/search",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      label: "View Projects",
      description: "Browse your saved product research",
      icon: FolderOpen,
      href: "/dashboard/projects",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Export Data",
      description: "Download your trend data as CSV",
      icon: Download,
      href: "/dashboard/projects",
      gradient: "from-emerald-500 to-green-600",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back,{" "}
          <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="mt-2 text-gray-400">
          Discover trending products and stay ahead of the competition.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Plan Info Card */}
      {planInfo.plan === "free" ? (
        <div className="rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    Free Plan
                  </h2>
                  <Badge className="bg-white/10 text-gray-300 border-none text-xs">
                    Current
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Upgrade to Pro for unlimited searches, CSV exports, and
                  priority support.
                </p>
              </div>
            </div>
            <SubscribeButton
              plan="pro"
              variant="premium"
              size="lg"
              className="shrink-0"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    {planInfo.plan === "pro" ? "Pro" : "Business"} Plan
                  </h2>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  You have full access to all{" "}
                  {planInfo.plan === "pro" ? "Pro" : "Business"} features.
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="lg" className="shrink-0">
                Manage Plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {action.label}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 mb-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Start a New Trend Search
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Enter a product niche or keyword and let AI find the best
                opportunities for you.
              </p>
            </div>
          </div>
          <Link href="/dashboard/search">
            <Button variant="premium" size="lg" className="shrink-0">
              <Search className="mr-2 h-4 w-4" />
              New Search
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentSearches.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New user empty state */}
      {!loading && stats.searches === 0 && (
        <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to find your next bestseller?
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            TrendForge uses AI to analyze market trends and identify product
            opportunities before your competitors do.
          </p>
          <Link href="/dashboard/search">
            <Button variant="premium" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Run Your First Search
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
