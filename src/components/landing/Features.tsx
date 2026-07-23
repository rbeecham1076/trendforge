"use client";

import {
  TrendingUp,
  Target,
  Shield,
  FileText,
  PackageSearch,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "AI Trend Discovery",
    description:
      "Our AI scans millions of data points across Etsy, Shopify, Amazon, and social platforms to identify emerging trends before they peak.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-400",
    accent: "indigo",
  },
  {
    icon: Target,
    title: "Opportunity Scoring",
    description:
      "Every product idea gets a proprietary score based on demand, competition, margin potential, and seasonal timing — so you know exactly what to pursue.",
    gradient: "from-fuchsia-500/20 to-pink-500/20",
    iconColor: "text-fuchsia-400",
    accent: "fuchsia",
  },
  {
    icon: Shield,
    title: "Competition Analysis",
    description:
      "See exactly how many sellers are competing, their price points, review counts, and estimated monthly sales for any product niche.",
    gradient: "from-teal-500/20 to-cyan-500/20",
    iconColor: "text-teal-400",
    accent: "teal",
  },
  {
    icon: FileText,
    title: "SEO-Ready Listings",
    description:
      "Get optimized titles, descriptions, tags, and keywords for every product idea — formatted for Etsy, Shopify, or Amazon listings.",
    gradient: "from-coral-500/20 to-pink-500/20",
    iconColor: "text-coral-400",
    accent: "coral",
  },
  {
    icon: PackageSearch,
    title: "Bundle Suggestions",
    description:
      "Discover complementary products to bundle together for higher average order value and better margins.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
    accent: "amber",
  },
  {
    icon: Calendar,
    title: "Seasonal Forecasting",
    description:
      "Plan your inventory months ahead with AI-powered seasonal trend predictions and demand forecasting.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    accent: "emerald",
  },
];

// Static class maps for Tailwind JIT (dynamic classes won't be generated)
const hoverBorderMap: Record<string, string> = {
  indigo: "hover:border-indigo-500/40",
  fuchsia: "hover:border-fuchsia-500/40",
  teal: "hover:border-teal-500/40",
  coral: "hover:border-coral-500/40",
  amber: "hover:border-amber-500/40",
  emerald: "hover:border-emerald-500/40",
};

const hoverShadowMap: Record<string, string> = {
  indigo: "hover:shadow-indigo-500/10",
  fuchsia: "hover:shadow-fuchsia-500/10",
  teal: "hover:shadow-teal-500/10",
  coral: "hover:shadow-coral-500/10",
  amber: "hover:shadow-amber-500/10",
  emerald: "hover:shadow-emerald-500/10",
};

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Everything You Need to{" "}
            <span className="gradient-text-vibrant">Win</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Powerful AI tools designed specifically for marketplace sellers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative rounded-xl border border-white/5 bg-white/[0.05] backdrop-blur-sm p-6 hover:bg-white/[0.08] ${hoverBorderMap[feature.accent]} transition-all duration-300 hover:shadow-xl ${hoverShadowMap[feature.accent]}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} border border-white/10 group-hover:scale-110 transition-all duration-300`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
