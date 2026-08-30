import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface TechPillsProps {
  items: string[];
  dark?: boolean;
  className?: string;
}

/** Styled, interactive-feeling pills for technologies/tools lists. */
export function TechPills({ items, dark, className }: TechPillsProps) {
  return (
    <Reveal className={cn('flex flex-wrap justify-center gap-3', className)}>
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            'inline-flex cursor-default items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5',
            dark
              ? 'bg-white/[0.06] text-pink-50 ring-1 ring-inset ring-pink-400/25 hover:bg-white/10 hover:shadow-[0_8px_20px_-8px_rgb(16_185_129/0.5)]'
              : 'bg-white text-foreground ring-1 ring-inset ring-pink-600/15 shadow-[0_1px_2px_rgb(5_19_14/0.05),0_6px_16px_-10px_rgb(5_19_14/0.15)] hover:ring-pink-500/40 hover:shadow-[0_10px_24px_-10px_rgb(5_150_105/0.4)]'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full bg-gradient-to-br shadow-[0_0_0_3px_rgb(16_185_129/0.15)]',
              dark ? 'from-pink-300 to-pink-400' : 'from-pink-500 to-pink-600'
            )}
            aria-hidden="true"
          />
          {item}
        </span>
      ))}
    </Reveal>
  );
}
