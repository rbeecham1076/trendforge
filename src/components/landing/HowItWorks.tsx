"use client";

import { Search, BarChart3, Package } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Enter a Niche or Trend",
    description:
      "Tell our AI what you're interested in — a niche, keyword, or emerging trend. We'll scan thousands of data points across multiple marketplaces.",
  },
  {
    icon: BarChart3,
    title: "AI Analyzes Competition & Demand",
    description:
      "Our algorithms evaluate search volume, competition levels, pricing trends, and seasonal patterns to calculate your opportunity score.",
  },
  {
    icon: Package,
    title: "Get Scored Product Ideas",
    description:
      "Receive a curated list of product opportunities with ready-to-use listing content, SEO keywords, and bundle suggestions.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            How It{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Three simple steps to find your next best-selling product
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50" />

          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 shadow-xl shadow-indigo-500/10 group-hover:shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
                <step.icon className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="mt-6">
                <div className="text-sm font-semibold text-indigo-400 mb-2">
                  STEP {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
