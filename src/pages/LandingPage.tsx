import { lazy } from "preact/compat";

// Immediate load components (above the fold)
import HeroSection from "../components/landing/HeroSection";
import IntegrationsSection from "../components/landing/IntegrationsSection";
import LazySection from "../components/landing/LazySection";
import ValuePropositionSection from "../components/landing/ValuePropositionSection";
import { useMouseTracking } from "../hooks/useMouseTracking";
import { page, landingPageEffect } from "../styles/layout/layout.css";

// Lazy load components for better performance
const ProductContextSection = lazy(
  () => import("../components/landing/ProductContextSection")
);
const HowItWorksSection = lazy(
  () => import("../components/landing/HowItWorksSection")
);
const PricingSection = lazy(
  () => import("../components/landing/PricingSection")
);
const AdvancedSections = lazy(
  () => import("../components/landing/AdvancedSections")
);

export default function LandingPage() {
  useMouseTracking();

  return (
    <div className={`${page} ${landingPageEffect}`}>
      {/* Critical above-the-fold content */}
      <HeroSection />
      <IntegrationsSection />
      <ValuePropositionSection />

      {/* Lazy-loaded sections for better performance */}
      <LazySection>
        <ProductContextSection />
      </LazySection>
      <LazySection>
        <HowItWorksSection />
      </LazySection>
      <LazySection>
        <PricingSection />
      </LazySection>
      <LazySection>
        <AdvancedSections />
      </LazySection>
    </div>
  );
}
