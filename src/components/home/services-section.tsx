import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/common/link';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { homeServiceCards } from '@/data/home-content';

/**
 * SERVICES — paper section with a hairline-ruled card grid: ink icon
 * tiles, mono index numbers and serif titles. Hover darkens the rule
 * (color transition only — no paint-heavy effects).
 */
export function ServicesSection() {
  return (
    <section id="services" className="section-white py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="What We **Do Best**"
          description="Six ways we turn your website into your best salesperson — design, code, and growth under one roof."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeServiceCards.map((card, i) => (
            <Reveal key={card.slug} delay={i * 70} className="h-full">
              <Link
                href={`/${card.slug}`}
                ariaLabel={`Learn more about our ${card.title} service`}
                className="group card-soft card-hover relative block h-full p-7"
              >
                {/* Mono index number — warms to signal on hover */}
                <span
                  aria-hidden="true"
                  className="absolute top-6 right-6 font-mono text-xs tracking-[0.14em] text-[#b3b2a8] transition-colors duration-200 group-hover:text-[#ff4d00]"
                >
                  {String(card.num).padStart(2, '0')}
                </span>

                <span className="icon-tile size-11">
                  <ServiceIconGlyph icon={card.icon} />
                </span>

                <h3 className="mt-6 font-display text-2xl font-medium text-[#161613]">{card.title}</h3>
                <p className="mt-2 text-[#6f6e66]">{card.tagline}</p>

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#161613]">
                  Learn more
                  <ArrowRight
                    className="size-4 text-[#ff4d00] transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
