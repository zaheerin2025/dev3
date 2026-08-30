import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  /** kept for API compat — every variant renders the tangerine band */
  variant?: 'dark' | 'gradient';
  reverse?: boolean;
  speed?: 'normal' | 'slow';
  /** indexes of items rendered in ink (contrast pop on tangerine) */
  accentIndexes?: number[];
  className?: string;
}

/**
 * Infinite scrolling marquee strip used as a section separator — the
 * full-bleed tangerine band: white grotesk items, ink accents, sparkle
 * separators. Content is duplicated exactly twice inside a w-max track
 * that translates -50%, producing a seamless loop (transform-only).
 */
export function Marquee({
  items,
  reverse = false,
  speed = 'normal',
  accentIndexes = [],
  className,
}: MarqueeProps) {
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex w-max shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span
            className={cn(
              'px-5 font-display text-xl font-bold uppercase tracking-tight md:px-7 md:text-2xl',
              accentIndexes.includes(i) && 'text-[#161613]',
            )}
          >
            {item}
          </span>
          <Sparkle className="size-4 shrink-0 fill-white text-white md:size-4.5" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'marquee-hover-pause relative overflow-hidden border-y border-[#D63E00] bg-[#FF4D00] py-4 text-white md:py-5',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-max',
          speed === 'normal' ? 'animate-marquee' : 'animate-marquee-slow',
          reverse && 'marquee-reverse',
        )}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
