import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ImageAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// ─── Mock analysis based on filename ────────────────────────────────
function mockAnalysis(filename: string): ImageAnalysis {
  const name = filename.toLowerCase().replace(/\.[^.]+$/, "");
  const mockPalettes: Record<string, string[]> = {
    boho: ["#C9A96E", "#8B5E3C", "#D4A574", "#E8D5B7", "#6B8E4E"],
    minimalist: ["#F5F5F5", "#2C2C2C", "#9E9E9E", "#E0E0E0", "#616161"],
    vintage: ["#C49A6C", "#7B4B3A", "#DAB88B", "#E8D5B7", "#A0522D"],
    cottagecore: ["#A8C686", "#D4A76A", "#F5E6D3", "#8FBC8F", "#DEB887"],
    y2k: ["#FF69B4", "#00FFFF", "#C0C0C0", "#FF1493", "#9400D3"],
    dark: ["#1A1A2E", "#16213E", "#E94560", "#533483", "#0F3460"],
  };

  let paletteKey = "boho";
  for (const key of Object.keys(mockPalettes)) {
    if (name.includes(key)) {
      paletteKey = key;
      break;
    }
  }

  return {
    keywords: [
      paletteKey,
      "handmade",
      "aesthetic",
      "trending",
      "artisanal",
    ],
    products: [
      `${capitalizeWords(name)} Wall Art`,
      `${capitalizeWords(name)} Home Decor Set`,
      `${capitalizeWords(name)} Accessories Bundle`,
    ],
    palette: mockPalettes[paletteKey],
    niche: `${capitalizeWords(name)} & ${paletteKey} Style`,
  };
}

function capitalizeWords(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── OpenAI Vision analysis ──────────────────────────────────────────
async function analyzeWithVision(
  base64Image: string,
  mimeType: string,
  filename: string
): Promise<ImageAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[upload] No OPENAI_API_KEY — using mock analysis");
    return mockAnalysis(filename);
  }

  const prompt = `Analyze this inspiration/mood board image and extract product trend insights for an e-commerce seller. Return ONLY valid JSON (no markdown, no extra text) with this structure:
{
  "keywords": ["style keyword 1", "style keyword 2", ...],
  "products": ["product idea 1", "product idea 2", "product idea 3"],
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "niche": "primary niche category"
}

Extract 5-8 style/aesthetic keywords (like "minimalist", "boho", "vintage", "dark academia").
Suggest 3 specific product ideas that match this aesthetic.
Extract the top 5 dominant colors as hex codes.
Identify the primary niche this image represents.`;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a visual trend analyst for e-commerce. Always respond with valid JSON only — no markdown, no extra text.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "low",
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";
    const json = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(json) as ImageAnalysis;
  } catch (error) {
    console.error("[upload] OpenAI Vision call failed, falling back to mock:", error);
    return mockAnalysis(filename);
  }
}

// ─── Route handler ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: PNG, JPG, WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Read file as ArrayBuffer then convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Analyze the image
    const analysis = await analyzeWithVision(base64, file.type, file.name);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[upload] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image. Please try again." },
      { status: 500 }
    );
  }
}
