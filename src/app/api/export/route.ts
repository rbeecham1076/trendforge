import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

// CSV escape helper
function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

// Build CSV from product data (updated with design-specific fields)
function buildProductCsv(
  products: Array<{
    name?: string;
    opportunityScore?: number;
    competitionLevel?: string;
    estimatedDemand?: string;
    priceRange?: string;
    seoTitle?: string;
    etsyTags?: string[];
    description?: string;
    designType?: string;
    fileFormat?: string;
    niches?: string[];
    estimatedSales?: number;
    designTips?: string;
    mockupPrompt?: string;
    trendSource?: string;
    seasonalRelevance?: string;
    bundleIdeas?: string[];
  }>
): string {
  const headers = [
    "Design Name",
    "Design Type",
    "File Format",
    "Opportunity Score",
    "Competition",
    "Demand",
    "Est. Monthly Sales",
    "Price Range",
    "Trend Source",
    "SEO Title",
    "Etsy Tags",
    "Niches",
    "Description",
    "Design Tips",
    "Mockup Prompt",
    "Seasonal Relevance",
    "Bundle Ideas",
  ];

  const rows = products.map((p) => [
    csvEscape(p.name || ""),
    csvEscape(p.designType || ""),
    csvEscape(p.fileFormat || ""),
    String(p.opportunityScore ?? ""),
    csvEscape(p.competitionLevel || ""),
    csvEscape(p.estimatedDemand || ""),
    String(p.estimatedSales ?? ""),
    csvEscape(p.priceRange || ""),
    csvEscape(p.trendSource || ""),
    csvEscape(p.seoTitle || ""),
    csvEscape((p.etsyTags || []).join(", ")),
    csvEscape((p.niches || []).join(", ")),
    csvEscape(p.description || ""),
    csvEscape(p.designTips || ""),
    csvEscape(p.mockupPrompt || ""),
    csvEscape(p.seasonalRelevance || ""),
    csvEscape((p.bundleIdeas || []).join(" | ")),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// POST /api/export — export CSV from a search or project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { searchId, projectId, results } = body as {
      searchId?: string;
      projectId?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results?: { products?: any[] };
    };

    let products: Array<Record<string, unknown>> = [];

    // Case 1: Direct results passed from client (most common — export current search)
    if (results && Array.isArray(results.products)) {
      products = results.products as Array<Record<string, unknown>>;
    }
    // Case 2: Fetch from saved search
    else if (searchId) {
      const prisma = await getPrisma();
      const search = await prisma.search.findUnique({
        where: { id: searchId },
        select: { results: true, userId: true },
      });
      if (!search || search.userId !== userId) {
        return NextResponse.json(
          { error: "Search not found" },
          { status: 404 }
        );
      }
      const searchResults = search.results as
        | { products?: Record<string, unknown>[] }
        | null;
      if (searchResults && Array.isArray(searchResults.products)) {
        products = searchResults.products;
      }
    }
    // Case 3: Fetch from saved project
    else if (projectId) {
      const prisma = await getPrisma();
      const project = await prisma.savedProject.findUnique({
        where: { id: projectId },
        select: { data: true, userId: true },
      });
      if (!project || project.userId !== userId) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
      const projectData = project.data as
        | { products?: Record<string, unknown>[] }
        | null;
      if (projectData && Array.isArray(projectData.products)) {
        products = projectData.products;
      }
    } else {
      return NextResponse.json(
        { error: "Either results, searchId, or projectId is required" },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No products found to export" },
        { status: 400 }
      );
    }

    const csv = buildProductCsv(
      products as Array<{
        name?: string;
        opportunityScore?: number;
        competitionLevel?: string;
        estimatedDemand?: string;
        priceRange?: string;
        seoTitle?: string;
        etsyTags?: string[];
        description?: string;
      }>
    );

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `trendforge-export-${timestamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[export] Failed:", error);
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}
