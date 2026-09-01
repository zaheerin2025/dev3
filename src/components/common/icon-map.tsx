import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  Cpu,
  LayoutTemplate,
  Megaphone,
  PenTool,
  ShoppingCart,
  Smartphone,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import type { ServiceIcon } from '@/lib/types';
import { cn } from '@/lib/utils';

export const serviceIconMap: Record<ServiceIcon, LucideIcon> = {
  code: Code2,
  wordpress: LayoutTemplate,
  cart: ShoppingCart,
  cpu: Cpu,
  smartphone: Smartphone,
  'pen-tool': PenTool,
  'trending-up': TrendingUp,
  target: Target,
  megaphone: Megaphone,
  wrench: Wrench,
};

interface ServiceIconGlyphProps {
  icon: ServiceIcon;
  className?: string;
}

/** Resolves a ServiceIcon key to its Lucide icon component. */
export function ServiceIconGlyph({ icon, className }: ServiceIconGlyphProps) {
  const Icon = serviceIconMap[icon] ?? Code2;
  return <Icon className={cn('h-6 w-6', className)} aria-hidden="true" />;
}
