import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { ACCENT_TEXT } from '@/lib/accent';
import { homeProcess } from '@/data';
import { cn } from '@/lib/utils';

/**
 * PROCESS — ink canvas with four hairline-ruled rows: giant grotesk
 * index numbers cycling through the accent ramp, bold step titles and a
 * roomy description. Solid colors + 1px borders only.
 */
export function ProcessSection() {
  return (
    <section id="process" className="section-black py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="Process"
          title="How We **Work**"
          description="Four clear steps from first hello to launch day — fixed scope, fixed quote, zero surprises."
        />

        <div className="flex flex-col">
          {homeProcess.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="grid items-baseline gap-2 border-t border-white/10 py-8 md:grid-cols-[130px_minmax(0,1fr)_minmax(0,2fr)] md:gap-8 md:py-10">
                <p
                  className={cn('font-display text-6xl font-bold tracking-tight md:text-7xl', ACCENT_TEXT[i % ACCENT_TEXT.length])}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-2xl font-semibold text-white md:text-4xl">{step.title}</h3>
                <p className="max-w-2xl text-base leading-relaxed text-white/60 md:justify-self-end md:text-lg">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
