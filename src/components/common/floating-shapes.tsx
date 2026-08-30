import { cn } from '@/lib/utils';

interface FloatingShapesProps {
  className?: string;
  variant?: 'default' | 'subtle';
}

/**
 * Decorative floating shapes — styling removed for now.
 * Kept as a no-op so existing call sites render nothing.
 */
export function FloatingShapes({ className }: FloatingShapesProps) {
  return null;
}

/** Dark-section variant — no-op. */
export function FloatingShapesDark({ className }: FloatingShapesProps) {
  return null;
}
