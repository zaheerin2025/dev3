import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingShapesProps {
  className?: string;
  /** 'default' = full-strength blobs; 'subtle' = fewer, lighter shapes for busy sections (forms, reading areas) */
  variant?: 'default' | 'subtle';
}

/**
 * Decorative floating shapes: blurred gradient blobs + ✦ stars + circles.
 * Place inside a `relative` section; pure decoration (aria-hidden).
 */
export function FloatingShapes({ className, variant = 'default' }: FloatingShapesProps) {
  if (variant === 'subtle') {
    return (
      <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden opacity-60', className)}>
        <div className="blob animate-blob left-[-8%] top-[-10%] size-64 bg-gradient-to-br from-purple-400 to-pink-400 md:size-80" />
        <div className="blob animate-blob-alt right-[-8%] top-[8%] size-56 bg-gradient-to-br from-blue-400 to-cyan-300" />
        <Sparkle className="animate-float absolute left-[6%] top-[16%] size-4 fill-yellow-300 text-yellow-300" />
        <Sparkle className="animate-float-slow absolute right-[7%] top-[6%] size-3.5 fill-pink-300 text-pink-300" />
        <span className="animate-float-slow absolute left-[40%] top-[4%] size-2.5 rounded-full border-2 border-orange-200" />
      </div>
    );
  }

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Blurred gradient blobs */}
      <div className="blob animate-blob left-[-6%] top-[-8%] size-72 bg-gradient-to-br from-purple-500 to-pink-500 md:size-96" />
      <div className="blob animate-blob-alt right-[-8%] top-[22%] size-64 bg-gradient-to-br from-blue-500 to-cyan-400" />
      <div className="blob animate-blob bottom-[-12%] left-[28%] size-72 bg-gradient-to-br from-pink-500 to-orange-400" />

      {/* ✦ stars */}
      <Sparkle className="animate-float absolute left-[8%] top-[24%] size-5 fill-yellow-300 text-yellow-300" />
      <Sparkle className="animate-float-slow absolute right-[9%] top-[14%] size-4 fill-pink-400 text-pink-400" />
      <Sparkle className="animate-float absolute bottom-[20%] right-[24%] size-6 fill-purple-400 text-purple-400 [animation-delay:-2s]" />
      <Sparkle className="animate-float-slow absolute bottom-[14%] left-[16%] size-4 fill-orange-300 text-orange-300 [animation-delay:-4s]" />

      {/* Circles */}
      <span className="animate-float-slow absolute left-[46%] top-[10%] size-3 rounded-full border-2 border-orange-300" />
      <span className="animate-float absolute bottom-[10%] left-[38%] size-4 rounded-full bg-lime-300/70 [animation-delay:-1.5s]" />
    </div>
  );
}

/** Star variant for dark/black sections (lighter, subtle). */
export function FloatingShapesDark({ className }: FloatingShapesProps) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="blob animate-blob left-[-6%] top-[-10%] size-80 bg-gradient-to-br from-purple-600 to-pink-600 md:size-[28rem]" />
      <div className="blob animate-blob-alt bottom-[-14%] right-[-6%] size-72 bg-gradient-to-br from-pink-600 to-orange-500" />
      <Sparkle className="animate-float absolute right-[10%] top-[18%] size-5 fill-yellow-300/80 text-yellow-300/80" />
      <Sparkle className="animate-float-slow absolute bottom-[22%] left-[7%] size-4 fill-pink-400/80 text-pink-400/80 [animation-delay:-3s]" />
      <span className="animate-float absolute left-[20%] top-[12%] size-3 rounded-full border-2 border-purple-400/60" />
    </div>
  );
}
