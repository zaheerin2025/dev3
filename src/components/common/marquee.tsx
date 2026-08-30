import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  /** dark = black band, gradient = purple→pink band */
  variant?: 'dark' | 'gradient';
  reverse?: boolean;
  speed?: 'normal' | 'slow';
  /** indexes of items rendered with gradient text (dark variant) */
  accentIndexes?: number[];
  className?: string;
}

/**
 * Infinite scrolling marquee strip used as a section separator.
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
              'px-5 font-display text-lg font-bold uppercase tracking-[0.06em] md:px-7 md:text-2xl',
              variant === 'dark' && accentIndexes.includes(i) && 'text-gradient-soft'
            )}
          >
            {item}
          </span>
          <Sparkle
            className={cn(
              'size-4 shrink-0 md:size-5',
              variant === 'dark' ? 'fill-white/25 text-white/25' : 'fill-white/60 text-white/60'
            )}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'marquee-hover-pause relative overflow-hidden py-4 md:py-5',
        variant === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
        className
      )}
    >
      <div
        className={cn(
          'flex w-max',
          speed === 'normal' ? 'animate-marquee' : 'animate-marquee-slow',
          reverse && 'marquee-reverse'
        )}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
