"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/SubscribeButton";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI-powered product discovery.",
    features: [
      "1 search per day",
      "Basic opportunity scoring",
      "Etsy & Shopify support",
      "5 saved projects",
      "Community support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description:
      "For serious sellers who want unlimited access to all features.",
    features: [
      "Unlimited searches",
      "Advanced opportunity scoring",
      "All marketplace support",
      "Unlimited saved projects",
      "SEO-ready listings",
      "Bundle suggestions",
      "CSV exports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    plan: "pro" as const,
    featured: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "per month",
    description: "For teams and agencies managing multiple stores.",
    features: [
      "Everything in Pro",
      "Team access (5 seats)",
      "API access",
      "Advanced analytics",
      "Seasonal forecasting",
      "Custom integrations",
      "Dedicated account manager",
      "SLA support",
    ],
    cta: "Contact Sales",
    plan: "business" as const,
    featured: false,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Simple,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready to scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border backdrop-blur-sm p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                tier.featured
                  ? "border-indigo-500/30 bg-white/[0.05] shadow-xl shadow-indigo-500/10"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              {tier.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white border-none">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {tier.price}
                </span>
                <span className="text-gray-400 ml-2">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {"plan" in tier ? (
                <SubscribeButton
                  plan={tier.plan as "pro" | "business"}
                  variant={tier.featured ? "premium" : "outline"}
                  size="lg"
                  className="w-full"
                />
              ) : (
                <Link href={tier.href}>
                  <Button className="w-full" variant="outline" size="lg">
                    {tier.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
