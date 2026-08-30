import type { ServiceIcon } from '@/lib/types';

/**
 * Curated content for the colorful home page.
 * Cards map to real service slugs so "Learn more" links
 * land on the matching service detail pages.
 */
export interface HomeServiceCard {
  slug: string;
  title: string;
  tagline: string;
  icon: ServiceIcon;
  /** Tailwind gradient classes for the icon tile */
  gradient: string;
  num: string;
}

export const homeServiceCards: HomeServiceCard[] = [
  {
    slug: 'custom-website-development',
    title: 'Website Design',
    tagline: 'Conversion-focused custom websites built to win clients and rank on Google.',
    icon: 'pen-tool',
    gradient: 'from-pink-600 to-rose-500',
    num: '01',
  },
  {
    slug: 'ui-ux-design',
    title: 'Website Redesign',
    tagline: 'Turn an outdated site into a modern experience visitors instantly trust.',
    icon: 'target',
    gradient: 'from-pink-500 to-orange-400',
    num: '02',
  },
  {
    slug: 'ecommerce-development',
    title: 'E-Commerce',
    tagline: 'Online stores engineered for speed, trust and repeat purchases.',
    icon: 'cart',
    gradient: 'from-pink-500 to-amber-400',
    num: '03',
  },
  {
    slug: 'wordpress-development',
    title: 'Landing Pages',
    tagline: 'Fast, focused campaign pages that turn ad clicks into real leads.',
    icon: 'wordpress',
    gradient: 'from-orange-500 to-amber-400',
    num: '04',
  },
  {
    slug: 'seo-services',
    title: 'SEO & Speed',
    tagline: 'Higher rankings and sub-second loads that keep you ahead of competitors.',
    icon: 'trending-up',
    gradient: 'from-yellow-400 to-orange-400',
    num: '05',
  },
  {
    slug: 'website-maintenance',
    title: 'Maintenance & Support',
    tagline: 'Updates, backups and monitoring so your site never skips a beat.',
    icon: 'wrench',
    gradient: 'from-rose-500 to-pink-600',
    num: '06',
  },
];

export const homeStats = [
  { value: '50+', label: 'Projects delivered' },
  { value: '98%', label: 'Client satisfaction' },
  { value: '8+', label: 'Years of craft' },
  { value: '24hr', label: 'Response time' },
];

export const marqueeWork = ['WEB DESIGN', 'REDESIGN', 'E-COMMERCE', 'LANDING PAGES', 'SEO', 'MAINTENANCE'];
/** Which marquee words scroll with gradient text */
export const marqueeWorkAccents = [1, 4];

export const marqueeCta = ["LET'S WORK TOGETHER"];

/** Case studies featured in the home work showcase (tilted black section) */
export const homeCaseStudySlugs = [
  'lumina-boutique',
  'northpay',
  'meridian-dental',
  'atlas-logistics',
  'pulsefit',
  'vantage-realty',
];

/** Testimonials featured on the home page (ids from src/data/testimonials.ts). */
export const homeTestimonialIds = ['t1', 't2', 't5'];
