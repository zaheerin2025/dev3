import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickerProps {
  children: ReactNode;
  className?: string;
  /** rotation in degrees — default 0 (straight editorial badge) */
  rotate?: number;
}

/**
 * Mono editorial badge — hairline pill, straight by default. Rotate via
 * prop or extra classes if a sticker moment is ever needed.
 */
export function Sticker({ children, className, rotate = 0 }: StickerProps) {
  return (
    <span
      className={cn('sticker select-none', className)}
      style={{ rotate: `${rotate}deg` } as CSSProperties}
    >
      {children}
    </span>
  );
}
