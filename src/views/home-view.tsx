'use client';

import { Marquee } from '@/components/common/marquee';
import { FAQSection } from '@/components/common/faq-section';
import { Hero } from '@/components/home/hero';
import { ServicesSection } from '@/components/home/services-section';
import { WorkSection } from '@/components/home/work-section';
import { TrendingToolsSection } from '@/components/home/trending-tools-section';
import { PromisesSection } from '@/components/home/promises-section';
import { ProcessSection } from '@/components/home/process-section';
import { VideoSection } from '@/components/home/video-section';
import { CtaSection } from '@/components/home/cta-section';
import { homeFaqs } from '@/data/company';
import { marqueeCta, marqueeWork, marqueeWorkAccents } from '@/data/home-content';

/**
 * HOME — the clean creative page: hero, marquees, services, work showcase,
 * tools, process, FAQ and CTA. Every section is self-contained (data +
 * admin-editable copy) and the video section hides itself until a YouTube
 * URL is configured in the admin panel.
 */
export function HomeView() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Marquee items={marqueeWork} accentIndexes={marqueeWorkAccents} />
      <ServicesSection />
      <WorkSection />
      <TrendingToolsSection />
      <PromisesSection />
      <ProcessSection />
      <VideoSection />
      <Marquee items={marqueeCta} variant="gradient" reverse speed="slow" />
      <section className="section-white py-20 md:py-24" id="faq">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <FAQSection
            faqs={homeFaqs}
            title="Questions, Answered"
            description="Straight answers about working with us — pricing, timelines and process."
          />
        </div>
      </section>
      <CtaSection />
    </div>
  );
}

export default HomeView;
