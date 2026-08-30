import { Sparkle } from 'lucide-react';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { homeProcess } from '@/data';

/**
 * PROCESS — cream section, four numbered steps connected by a dashed
 * gradient line with small floating sparkles between them.
 */
export function ProcessSection() {
  return (
    <section id="process" className="section-cream py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="PROCESS"
          title="How We **Work**"
          description="Four clear steps from first hello to launch day — fixed scope, fixed quote, zero surprises."
        />

        <div className="relative">
          {/* Dashed connector line behind the step numbers (desktop only) */}
          <span
            aria-hidden="true"
            className="absolute top-10 right-[12%] left-[12%] hidden border-t-2 border-dashed border-gray-300 lg:block"
          />

          {/* Floating sparkles between steps (desktop only) */}
          <Sparkle
            aria-hidden="true"
            className="animate-float absolute top-2 left-[31%] hidden size-5 fill-gray-300 text-gray-300 lg:block"
          />
          <Sparkle
            aria-hidden="true"
            className="animate-float-slow absolute top-14 left-[56%] hidden size-4 fill-gray-400 text-gray-400 lg:block"
          />
          <Sparkle
            aria-hidden="true"
            className="animate-float absolute top-4 left-[80%] hidden size-4 fill-gray-300 text-gray-300 [animation-delay:-2s] lg:block"
          />

          <div className="relative grid gap-10 lg:grid-cols-4">
            {homeProcess.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <p className="text-gradient font-display text-6xl font-bold">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-xl font-bold text-[#0a0a0a]">{step.title}</h3>
                <p className="mt-2 line-clamp-3 text-[#4b5563]">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
