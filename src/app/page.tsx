import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { MarketplaceSpotlight } from "@/components/sections/marketplace-spotlight";
import { FeaturesSection } from "@/components/sections/features";
import { SecurityShowcase } from "@/components/sections/security-showcase";
import { CtaBanner } from "@/components/sections/cta-banner";

export const metadata: Metadata = {
  title: "KoreDao - Bangladesh's Academic & Handwritten Project Marketplace",
  description:
    "Connect with verified peer helpers from BUET, DU, IUT, SUST, and NSU for assignments, lab reports, thesis research, and handwritten hardcopy projects with 100% escrow protection.",
  openGraph: {
    title: "KoreDao - Academic Freelance & Campus Project Engine",
    description:
      "Bank-grade escrow, handwriting style matching, and verified campus peers for student assignments.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <StatsSection />
      <MarketplaceSpotlight />
      <FeaturesSection />
      <SecurityShowcase />
      <CtaBanner />
    </div>
  );
}
