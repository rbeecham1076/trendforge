import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

// GET /api/projects — fetch all saved projects for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = await getPrisma();

    const projects = await prisma.savedProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Count products in each project
    const enriched = projects.map((p) => {
      const data = p.data as Record<string, unknown> | null;
      const products = (data && Array.isArray((data as { products?: unknown[] }).products)
        ? (data as { products: unknown[] }).products
        : []);
      return {
        ...p,
        productCount: products.length,
        data,
      };
    });

    return NextResponse.json({ projects: enriched, count: projects.length });
  } catch (error) {
    console.error("[projects] Failed to fetch:", error);
    return NextResponse.json({ projects: [], count: 0 });
  }
}

// POST /api/projects — save a new project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, data } = body as {
      title?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?: Record<string, any>;
    };

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project data is required" },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();

    const serializedData = JSON.parse(JSON.stringify(data));

    const project = await prisma.savedProject.create({
      data: {
        title: title.trim().slice(0, 200),
        data: serializedData,
        userId,
      },
      select: {
        id: true,
        title: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[projects] Failed to create:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects — remove a project by id
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();

    // Verify ownership before deleting
    const existing = await prisma.savedProject.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.savedProject.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[projects] Failed to delete:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
