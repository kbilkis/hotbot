import AdvancedSections from "@/components/landing/AdvancedSections";
import ComparisonSection from "@/components/landing/ComparisonSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import PricingSection from "@/components/landing/PricingSection";
import ProductContextSection from "@/components/landing/ProductContextSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import ValuePropositionSection from "@/components/landing/ValuePropositionSection";
import { useMouseTracking } from "@/hooks/useMouseTracking";
import { page, landingPageEffect } from "@/styles/layout/layout.css";

export default function LandingPage() {
  useMouseTracking();

  return (
    <div className={`${page} ${landingPageEffect}`}>
      <HeroSection />
      <IntegrationsSection />
      <SocialProofSection />
      <ValuePropositionSection />
      <ProductContextSection />
      <HowItWorksSection />
      <ComparisonSection />
      <PricingSection />
      <AdvancedSections />
    </div>
  );
}
