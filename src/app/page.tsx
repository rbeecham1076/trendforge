import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { SocialProof } from "@/components/landing/SocialProof";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <SocialProof />
      <PricingPreview />
      <CTABanner />
      <Footer />
    </main>
  );
}
