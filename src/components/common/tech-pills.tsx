import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { ACCENT_DOT } from '@/lib/accent';

interface TechPillsProps {
  items: string[];
  dark?: boolean;
  className?: string;
}

/** Styled pills for technologies/tools lists — ramp-colored dots, flat surfaces. */
export function TechPills({ items, dark, className }: TechPillsProps) {
  return (
    <Reveal className={cn('flex flex-wrap justify-center gap-3', className)}>
      {items.map((item, index) => (
        <span
          key={item}
          className={cn(
            'inline-flex cursor-default items-center gap-2.5 rounded-full px-5 py-3 text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
            dark
              ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/20 hover:bg-white/10'
              : 'bg-white text-foreground ring-1 ring-inset ring-[#e6e5de] hover:ring-[#161613]'
          )}
        >
          <span
            className={cn('h-2.5 w-2.5 rounded-full', ACCENT_DOT[index % ACCENT_DOT.length])}
            aria-hidden="true"
          />
          {item}
        </span>
      ))}
    </Reveal>
  );
}
