import Image from 'next/image';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { getCaseStudy } from '@/data';
import { homeCaseStudySlugs } from '@/data/home-content';
import type { CaseStudy, CaseStudyCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<CaseStudyCategory, string> = {
  web: 'Web',
  ecommerce: 'E-commerce',
  apps: 'App',
  marketing: 'Marketing',
};

/** Category pills — same ramp colors as the portfolio cards site-wide. */
const CATEGORY_PILL: Record<CaseStudyCategory, string> = {
  web: 'border-transparent bg-[#FF4D00] text-white',
  ecommerce: 'border-transparent bg-[#FFB020] text-[#161613]',
  apps: 'border-transparent bg-[#7A5AF8] text-white',
  marketing: 'border-transparent bg-[#0FA36B] text-white',
};

/**
 * WORK SHOWCASE — ink canvas with hairline-framed case-study cards:
 * cover image, grotesk title and a ramp-colored category pill. Image
 * zoom on hover is a compositor-cheap transform.
 */
export function WorkSection() {
  const studies = homeCaseStudySlugs
    .map(getCaseStudy)
    .filter((c): c is CaseStudy => Boolean(c));

  return (
    <section id="portfolio" className="section-black relative overflow-hidden py-20 md:py-28">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="Portfolio"
          title="Our **Recent Work**"
          description="Real projects, measurable results — a few studio favorites that shipped, ranked, and sold."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study, i) => (
            <Reveal key={study.slug} delay={i * 70} className="h-full">
              <Link
                href={`/portfolio/${study.slug}`}
                ariaLabel={`Read the ${study.title} case study`}
                className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors duration-200 hover:border-white/30"
              >
                <div className="relative h-52 overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={study.coverImage}
                    alt={study.coverAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-5">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">{study.title}</h3>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em]',
                      CATEGORY_PILL[study.category],
                    )}
                  >
                    {CATEGORY_LABELS[study.category]}
                  </span>
                </div>
                <p className="px-1 pb-1 pt-1 text-[15px] leading-relaxed text-white/55">{study.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/portfolio" className="btn-ghost-dark">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
