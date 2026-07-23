"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Multi-color gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/20 via-fuchsia-600/15 to-coral-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-violet-600/20 via-fuchsia-600/15 to-coral-600/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-teal-600/10 to-cyan-600/10 rounded-full blur-[80px] animate-pulse" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <Badge variant="gradient" className="mb-6 text-sm px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            AI-Powered Product Discovery
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Discover Winning Products{" "}
            <span className="gradient-text-vibrant">
              Before Your Competitors Do
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered trend analysis for Etsy, Shopify, Amazon Handmade, and
            POD sellers. Find high-demand, low-competition products in minutes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" variant="vibrant">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="xl" variant="outline">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required · 3 free searches daily
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-20 mx-auto max-w-5xl animate-fade-in-up animation-delay-300">
          <div className="relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-2xl shadow-fuchsia-500/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-gray-500 ml-2">
                TrendForge AI · Dashboard
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
                  <div className="text-xs text-gray-500 mb-1">Niche</div>
                  <div className="text-sm text-white font-medium">
                    Boho Home Decor
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Opportunity Score
                  </div>
                  <div className="text-sm text-emerald-400 font-medium">
                    87/100 · High Potential
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Products Found
                  </div>
                  <div className="text-sm text-white font-medium">
                    24 matches · 6 high-opportunity
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 text-sm font-bold">
                      #{i}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">
                        Macrame Wall Hanging Kit
                      </div>
                      <div className="text-xs text-gray-500">
                        ⭐ 4.8 · 2.3k sales/mo · Low competition
                      </div>
                    </div>
                    <Badge variant="success">High Opp</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
