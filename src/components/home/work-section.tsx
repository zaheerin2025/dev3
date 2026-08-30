import Image from 'next/image';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { FloatingShapesDark } from '@/components/common/floating-shapes';
import { getCaseStudy } from '@/data';
import { homeCaseStudySlugs } from '@/data/home-content';
import type { CaseStudy, CaseStudyCategory } from '@/lib/types';

/** Category pill colours for the dark showcase (spec palette). */
const CATEGORY_PILLS: Record<CaseStudyCategory, string> = {
  web: 'bg-gray-500/20 text-gray-300',
  ecommerce: 'bg-gray-500/20 text-gray-300',
  apps: 'bg-gray-400/20 text-gray-300',
  marketing: 'bg-gray-500/20 text-gray-300',
};

const CATEGORY_LABELS: Record<CaseStudyCategory, string> = {
  web: 'Web',
  ecommerce: 'E-commerce',
  apps: 'App',
  marketing: 'Marketing',
};

/**
 * WORK SHOWCASE — black contrast section with alternating tilted
 * case-study cards floating over the dark canvas.
 */
export function WorkSection() {
  const studies = homeCaseStudySlugs
    .map(getCaseStudy)
    .filter((c): c is CaseStudy => Boolean(c));

  return (
    <section id="portfolio" className="section-black relative overflow-hidden py-20 md:py-24">
      <FloatingShapesDark />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="PORTFOLIO"
          title="Our **Recent Work**"
          description="Real projects, measurable results — a few studio favorites that shipped, ranked, and sold."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study, i) => (
            <Reveal key={study.slug} delay={i * 70} className="h-full">
              <Link
                href={`/portfolio/${study.slug}`}
                ariaLabel={`Read the ${study.title} case study`}
                className={`group block tilt-hover rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 hover:ring-gray-500/50 ${
                  i % 2 === 0 ? 'tilt-l' : 'tilt-r'
                }`}
              >
                <div className="relative h-48 overflow-hidden rounded-xl bg-white/5">
                  <Image
                    src={study.coverImage}
                    alt={study.coverAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
                  <h3 className="font-display text-lg font-bold text-white">{study.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${CATEGORY_PILLS[study.category]}`}
                  >
                    {CATEGORY_LABELS[study.category]}
                  </span>
                </div>
                <p className="px-1 pb-1 text-sm text-white/60">{study.summary}</p>
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
