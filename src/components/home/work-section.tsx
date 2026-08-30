import Image from 'next/image';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { getCaseStudy } from '@/data';
import { homeCaseStudySlugs } from '@/data/home-content';
import type { CaseStudy, CaseStudyCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<CaseStudyCategory, string> = {
  web: 'Web',
  ecommerce: 'E-commerce',
  apps: 'App',
  marketing: 'Marketing',
};

/**
 * WORK SHOWCASE — ink canvas with hairline-framed case-study cards:
 * cover image, serif title and a mono category label. Image zoom on
 * hover is a compositor-cheap transform.
 */
export function WorkSection() {
  const studies = homeCaseStudySlugs
    .map(getCaseStudy)
    .filter((c): c is CaseStudy => Boolean(c));

  return (
    <section id="portfolio" className="section-black relative overflow-hidden py-20 md:py-24">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="Portfolio"
          title="Our **Recent Work**"
          description="Real projects, measurable results — a few studio favorites that shipped, ranked, and sold."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study, i) => (
            <Reveal key={study.slug} delay={i * 70} className="h-full">
              <Link
                href={`/portfolio/${study.slug}`}
                ariaLabel={`Read the ${study.title} case study`}
                className="group block h-full rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors duration-200 hover:border-white/30"
              >
                <div className="relative h-48 overflow-hidden rounded-lg bg-white/5">
                  <Image
                    src={study.coverImage}
                    alt={study.coverAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-4">
                  <h3 className="font-display text-xl font-medium text-white">{study.title}</h3>
                  <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
                    {CATEGORY_LABELS[study.category]}
                  </span>
                </div>
                <p className="px-1 pb-1 text-sm text-white/55">{study.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/portfolio" className="btn-ghost-dark">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
