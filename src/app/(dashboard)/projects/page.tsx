"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  Search,
  Trash2,
  ExternalLink,
  Calendar,
  ShoppingBag,
  Globe,
  Truck,
  Palette,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Package,
} from "lucide-react";
import type { ProductOpportunity } from "@/lib/types";

interface SavedProject {
  id: string;
  title: string;
  data: {
    query?: string;
    platform?: string;
    opportunityScore?: number;
    marketInsight?: string;
    products?: ProductOpportunity[];
  } | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Etsy: ShoppingBag,
  Shopify: Globe,
  "Amazon Handmade": Truck,
  POD: Palette,
};

const platformGradients: Record<string, string> = {
  Etsy: "from-orange-500 to-pink-500",
  Shopify: "from-green-500 to-emerald-600",
  "Amazon Handmade": "from-blue-500 to-cyan-500",
  POD: "from-purple-500 to-violet-600",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExport(project: SavedProject) {
    setExportingId(project.id);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trendforge-project-${project.id.slice(0, 8)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore silently
    } finally {
      setExportingId(null);
    }
  }

  function scoreColor(score: number): string {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Saved Projects</h1>
        <p className="text-gray-400 mb-8">Your saved product research.</p>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="h-5 w-48 bg-white/5 rounded mb-3" />
              <div className="h-4 w-72 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Saved Projects</h1>
        <p className="text-gray-400 mb-8">
          Your saved product research and trend analyses.
        </p>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                <FolderOpen className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No projects yet
              </h2>
              <p className="text-gray-400 max-w-sm mb-6">
                When you find product opportunities you like, click the bookmark
                icon to save them here for later reference.
              </p>
              <Link href="/dashboard/search">
                <Button variant="premium">
                  <Search className="mr-2 h-4 w-4" />
                  Start Your First Search
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Saved Projects
          </h1>
          <p className="text-gray-400">
            {projects.length} saved {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Link href="/dashboard/search">
          <Button variant="premium">
            <Search className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const data = project.data;
          const products = data?.products || [];
          const product = products[0];
          const platform = data?.platform || "Etsy";
          const query = data?.query || project.title;
          const PlatformIcon = platformIcons[platform] || Globe;
          const gradient = platformGradients[platform] || "from-gray-500 to-gray-600";
          const isExpanded = expandedId === project.id;

          return (
            <Card
              key={project.id}
              className="border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-all duration-300 group"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  {/* Main row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${gradient}`}
                        >
                          <PlatformIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {project.title}
                        </h3>
                        {data?.opportunityScore != null && (
                          <span
                            className={`text-sm font-bold ${scoreColor(data.opportunityScore)}`}
                          >
                            {data.opportunityScore}/100
                          </span>
                        )}
                      </div>

                      {/* Subtitle */}
                      <p className="text-sm text-gray-400 mb-3">
                        {query !== project.title
                          ? `Searched "${query}" on ${platform}`
                          : `Platform: ${platform}`}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Package className="h-3 w-3 mr-1" />
                          {project.productCount}{" "}
                          {project.productCount === 1 ? "product" : "products"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                        {product && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {product.competitionLevel} competition
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {product.priceRange}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-indigo-400"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : project.id)
                        }
                        title={isExpanded ? "Collapse" : "View details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-emerald-400"
                        onClick={() => handleExport(project)}
                        disabled={exportingId === project.id}
                        title="Export CSV"
                      >
                        {exportingId === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-400"
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        title="Delete project"
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded — product list */}
                  {isExpanded && products.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-400" />
                        Products in this project
                      </h4>
                      {products.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-gray-600 font-mono">
                              #{i + 1}
                            </span>
                            <p className="text-sm text-gray-200 truncate">
                              {p.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-xs font-bold ${scoreColor(p.opportunityScore)}`}
                            >
                              {p.opportunityScore}
                            </span>
                            <Link
                              href={`/dashboard/search?q=${encodeURIComponent(query)}`}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-indigo-400"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
