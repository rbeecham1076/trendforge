"use client";

import { Users, Package, DollarSign, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Active Sellers",
  },
  {
    icon: Package,
    value: "12,000+",
    label: "Products Discovered",
  },
  {
    icon: DollarSign,
    value: "$4.2M",
    label: "Revenue Generated",
  },
  {
    icon: Clock,
    value: "85%",
    label: "Time Saved on Research",
  },
];

export function SocialProof() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Trusted by Sellers{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Join hundreds of sellers already using TrendForge AI
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                <stat.icon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="mt-4 text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
