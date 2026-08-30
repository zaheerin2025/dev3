import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickerProps {
  children: ReactNode;
  className?: string;
  /** rotation in degrees — default -2 for the signature tilted-sticker look */
  rotate?: number;
}

/**
 * Sticker-style pill badge: white background, 2px black border,
 * hard offset shadow, slightly rotated. Rotate via prop or extra classes.
 */
export function Sticker({ children, className, rotate = -2 }: StickerProps) {
  return (
    <span
      className={cn('sticker select-none', className)}
      style={{ rotate: `${rotate}deg` } as CSSProperties}
    >
      {children}
    </span>
  );
}
