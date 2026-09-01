import { cn } from '@/lib/utils';
import type { ProcessStep } from '@/lib/types';
import { Reveal } from './reveal';

interface ProcessStepsProps {
  steps: ProcessStep[];
  dark?: boolean;
  className?: string;
}

/**
 * Numbered process timeline with a connecting gradient line that runs through
 * the step badges (horizontal on desktop, vertical on mobile).
 */
export function ProcessSteps({ steps, dark, className }: ProcessStepsProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Connector line (desktop) */}
      <span
        className={cn(
          'absolute left-0 right-0 top-6 hidden h-px lg:block',
          dark
            ? 'bg-gradient-to-r from-transparent via-gray-400/40 to-transparent'
            : 'bg-gradient-to-r from-transparent via-gray-500/35 to-transparent'
        )}
        aria-hidden="true"
      />
      {/* Connector line (mobile, vertical) */}
      <span
        className={cn(
          'absolute bottom-6 left-6 top-6 w-px lg:hidden',
          dark
            ? 'bg-gradient-to-b from-transparent via-gray-400/40 to-transparent'
            : 'bg-gradient-to-b from-transparent via-gray-500/35 to-transparent'
        )}
        aria-hidden="true"
      />
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {steps.map((step, index) => (
          <Reveal
            key={step.title}
            delay={index * 110}
            className="relative"
          >
            <li className="relative flex gap-4 lg:flex-col lg:gap-0">
              {/* Badge on the line */}
              <span
                className={cn(
                  'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-base font-bold',
                  dark
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-[#0a0a0a] shadow-[0_0_24px_-4px_rgb(0_0_0/0.6)]'
                    : 'bg-gradient-to-br from-gray-500 to-gray-800 text-white shadow-[0_8px_20px_-8px_rgb(0_0_0/0.7)]'
                )}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div
                className={cn(
                  'flex flex-col gap-1.5 rounded-2xl p-1 pt-1 lg:mt-5 lg:p-0',
                )}
              >
                <h3 className={cn('text-xl font-semibold lg:pt-3', dark ? 'text-white' : 'text-foreground')}>
                  {step.title}
                </h3>
                <p
                  className={cn(
                    'text-base leading-relaxed',
                    dark ? 'text-gray-100/70' : 'text-muted-foreground'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
