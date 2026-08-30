import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/common/link';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { homeServiceCards } from '@/data/home-content';

/**
 * SERVICES — white section, six playful gradient-tile cards that map
 * to the real service detail pages.
 */
export function ServicesSection() {
  return (
    <section id="services" className="section-white py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="OUR SERVICES"
          title="What We **Do Best**"
          description="Six ways we turn your website into your best salesperson — design, code, and growth under one roof."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeServiceCards.map((card, i) => (
            <Reveal key={card.slug} delay={i * 80} className="h-full">
              <Link
                href={`/${card.slug}`}
                ariaLabel={`Learn more about our ${card.title} service`}
                className="group card-soft card-hover relative block h-full rounded-[20px] p-7"
              >
                {/* Gradient border reveal on hover */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-[3px] rounded-t-[20px] bg-gradient-to-r ${card.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                {/* Sticker-style index number */}
                <span
                  aria-hidden="true"
                  className="absolute top-6 right-6 font-display text-sm font-bold text-gray-300"
                >
                  /{card.num}
                </span>

                <span
                  className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                >
                  <ServiceIconGlyph icon={card.icon} />
                </span>

                <h3 className="mt-5 text-xl font-bold text-[#0a0a0a]">{card.title}</h3>
                <p className="mt-2 text-[#4b5563]">{card.tagline}</p>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink-600">
                  Learn more
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
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
