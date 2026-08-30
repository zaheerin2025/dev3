import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  /** dark = ink band (only variant) */
  variant?: 'dark' | 'gradient';
  reverse?: boolean;
  speed?: 'normal' | 'slow';
  /** indexes of items rendered brighter (dark variant) */
  accentIndexes?: number[];
  className?: string;
}

/**
 * Infinite scrolling marquee strip used as a section separator — ink
 * band, serif display items, sparkle separators, hairline rules.
 * Content is duplicated exactly twice inside a w-max track that
 * translates -50%, producing a seamless loop.
 */
export function Marquee({
  items,
  variant = 'dark',
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
              'px-5 font-display text-lg font-medium tracking-[-0.01em] md:px-7 md:text-2xl',
              variant === 'dark' && accentIndexes.includes(i) && 'italic text-white',
            )}
          >
            {item}
          </span>
          <Sparkle
            className={cn(
              'size-3.5 shrink-0 md:size-4',
              variant === 'dark' ? 'fill-[#ff4d00] text-[#ff4d00]' : 'fill-white/60 text-white/60',
            )}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'marquee-hover-pause relative overflow-hidden border-y border-white/10 py-4 md:py-5',
        'bg-[#131316] text-white',
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
