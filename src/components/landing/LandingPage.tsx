import { lazy, Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { Hero } from "@/components/landing/Hero";
import { Comparison } from "@/components/landing/Comparison";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";

// Below-the-fold: split into separate chunks to shrink initial JS payload
const Stats = lazy(() => import("@/components/landing/Stats").then(m => ({ default: m.Stats })));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks").then(m => ({ default: m.HowItWorks })));
const Pricing = lazy(() => import("@/components/landing/Pricing").then(m => ({ default: m.Pricing })));
const Testimonials = lazy(() => import("@/components/landing/Testimonials").then(m => ({ default: m.Testimonials })));
const FAQ = lazy(() => import("@/components/landing/FAQ").then(m => ({ default: m.FAQ })));
const Footer = lazy(() => import("@/components/landing/Footer").then(m => ({ default: m.Footer })));

const SectionFallback = () => (
  <div className="py-24 flex items-center justify-center min-h-[400px]">
    <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 dark font-sans relative">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <Stats />
          <HowItWorks />
        </Suspense>
        <Comparison />
        <Suspense fallback={<SectionFallback />}>
          <Pricing />
          <Testimonials />
          <FAQ />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
      <WhatsAppButton />
    </div>
  );
};
