"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur-sm p-12 sm:p-16 shadow-2xl shadow-indigo-500/10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Find Your Next{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Bestseller?
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Join hundreds of sellers using TrendForge AI to discover winning
            products before the competition.
          </p>
          <div className="mt-8">
            <Link href="/sign-up?plan=pro">
              <Button size="xl" variant="premium">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
