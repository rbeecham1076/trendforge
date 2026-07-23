import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "TrendForge AI — Discover Winning Products Before Your Competitors",
    template: "%s | TrendForge AI",
  },
  description:
    "AI-powered trend analysis for Etsy, Shopify, Amazon Handmade, and POD sellers. Find high-demand, low-competition products in minutes.",
  keywords: [
    "product research",
    "trend analysis",
    "Etsy seller tools",
    "Shopify product research",
    "AI product discovery",
    "marketplace trends",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trendforge.ai",
    siteName: "TrendForge AI",
    title: "TrendForge AI — Discover Winning Products Before Your Competitors",
    description:
      "AI-powered trend analysis for Etsy, Shopify, Amazon Handmade, and POD sellers. Find high-demand, low-competition products in minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendForge AI — Discover Winning Products Before Your Competitors",
    description:
      "AI-powered trend analysis for Etsy, Shopify, Amazon Handmade, and POD sellers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white antialiased">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}