import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { homeProcess } from '@/data';

/**
 * PROCESS — ink canvas with four hairline-ruled rows: giant serif index,
 * serif step title and a muted description. Pure typography and 1px
 * borders — the most editorial section on the page.
 */
export function ProcessSection() {
  return (
    <section id="process" className="section-black py-20 md:py-24">
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
              <div className="grid items-baseline gap-2 border-t border-white/10 py-7 md:grid-cols-[110px_minmax(0,1fr)_minmax(0,2fr)] md:gap-8 md:py-9">
                <p className="font-display text-5xl font-medium text-white/20 md:text-6xl" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-2xl font-medium text-white md:text-3xl">{step.title}</h3>
                <p className="max-w-2xl leading-relaxed text-white/55 md:justify-self-end">
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
