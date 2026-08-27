import { cn } from '@/lib/utils';
import type { ProcessStep } from '@/lib/types';
import { Reveal } from './reveal';

interface ProcessStepsProps {
  steps: ProcessStep[];
  dark?: boolean;
  className?: string;
}

/** Numbered process timeline (Discover → Design → ...). */
export function ProcessSteps({ steps, dark, className }: ProcessStepsProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {steps.map((step, index) => (
        <Reveal
          key={step.title}
          delay={index * 100}
          className={cn(
            'relative flex flex-col gap-3 rounded-2xl p-6',
            dark ? 'bg-white/5 ring-1 ring-inset ring-emerald-400/15' : 'bg-white shadow-sm ring-1 ring-inset ring-emerald-600/10'
          )}
        >
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl font-display text-base font-bold',
              dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-600 text-white'
            )}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className={cn('text-lg font-semibold', dark ? 'text-white' : 'text-foreground')}>{step.title}</h3>
          <p className={cn('text-sm leading-relaxed', dark ? 'text-emerald-100/70' : 'text-muted-foreground')}>
            {step.description}
          </p>
        </Reveal>
      ))}
    </div>
  );
}
