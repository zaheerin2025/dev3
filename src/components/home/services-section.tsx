import { ArrowRight } from 'lucide-react';
import { Link } from '@/components/common/link';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { ACCENT_TEXT, ACCENT_TILE } from '@/lib/accent';
import { homeServiceCards } from '@/data/home-content';
import { cn } from '@/lib/utils';

/**
 * SERVICES — paper section with a card grid: icon tiles cycle through
 * the 4-color accent ramp, mono index numbers warm to tangerine on
 * hover. Color transitions and transforms only — no paint-heavy effects.
 */
export function ServicesSection() {
  return (
    <section id="services" className="section-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="What We **Do Best**"
          description="Six ways we turn your website into your best salesperson — design, code, and growth under one roof."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {homeServiceCards.map((card, i) => (
            <Reveal key={card.slug} delay={i * 70} className="h-full">
              <Link
                href={`/${card.slug}`}
                ariaLabel={`Learn more about our ${card.title} service`}
                className="group card-soft card-hover relative block h-full p-8"
              >
                {/* Mono index number — warms to tangerine on hover */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute right-7 top-7 font-mono text-sm font-bold tracking-[0.14em] text-[#b3b2a8] transition-colors duration-200 group-hover:text-[#FF4D00]',
                  )}
                >
                  {String(card.num).padStart(2, '0')}
                </span>

                <span
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xl',
                    ACCENT_TILE[i % ACCENT_TILE.length],
                  )}
                >
                  <ServiceIconGlyph icon={card.icon} />
                </span>

                <h3 className="mt-7 font-display text-2xl font-semibold tracking-tight text-[#161613] md:text-[1.75rem]">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#6f6e66] md:text-base">{card.tagline}</p>

                <span className={cn('mt-7 inline-flex items-center gap-1.5 text-[15px] font-bold', ACCENT_TEXT[i % ACCENT_TEXT.length])}>
                  Learn more
                  <ArrowRight
                    className="size-4.5 transition-transform group-hover:translate-x-1"
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
