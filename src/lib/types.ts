// ─────────────────────────────────────────────────────────────
// Developers3 — site-wide content type contract.
// Every data file in src/data must satisfy these definitions.
// ─────────────────────────────────────────────────────────────

export type ServiceIcon =
  | 'code'
  | 'wordpress'
  | 'cart'
  | 'cpu'
  | 'smartphone'
  | 'pen-tool'
  | 'trending-up'
  | 'target'
  | 'megaphone'
  | 'wrench';

export type ServiceCategory = 'development' | 'design' | 'marketing' | 'support';

export interface ServiceOffering {
  title: string;
  description: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  icon: ServiceIcon;
  category: ServiceCategory;
  /** One-line description used on cards (~12-20 words). */
  tagline: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSub: string;
  /** "Ideal for" one sentence, used on the services hub. */
  idealFor: string;
  offerings: ServiceOffering[];
  whyTitle: string;
  whyIntro: string;
  whyBenefits: ServiceBenefit[];
  process: ProcessStep[];
  technologies: string[];
  caseStudySlugs: string[];
  startingPrice: string;
  pricingNote: string;
  testimonialIds: string[];
  faqs: FAQ[];
  relatedServiceSlugs: string[];
}

export type CaseStudyCategory = 'web' | 'ecommerce' | 'apps' | 'marketing';

export interface CaseStudyResult {
  metric: string;
  label: string;
}

export interface CaseStudyShowcase {
  title: string;
  blurb: string;
  /** Tailwind gradient classes, e.g. "from-blue-500 to-cyan-600". */
  gradient: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  category: CaseStudyCategory;
  industry: string;
  /** Related service slugs, e.g. ["ecommerce-development"]. */
  services: string[];
  /** One-line result used on portfolio cards. */
  summary: string;
  coverImage: string;
  coverAlt: string;
  challenge: string[];
  solution: string[];
  techStack: string[];
  results: CaseStudyResult[];
  showcase: CaseStudyShowcase[];
  testimonialId?: string;
  metaTitle: string;
  metaDescription: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  initials: string;
  avatar?: string;
}

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** One of: alex-morgan | priya-sharma | daniel-reeves | sofia-alvarez */
  authorId: string;
  /** ISO date, e.g. "2025-01-20". */
  date: string;
  readTime: string;
  /** Tailwind gradient classes for the cover, e.g. "from-blue-500 to-cyan-600". */
  coverGradient: string;
  sections: BlogSection[];
  keyTakeaways: string[];
  relatedServiceSlug: string;
  metaTitle: string;
  metaDescription: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  initials: string;
  funFact?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  bestFor: string;
  blurb: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
}

export interface PricingBlock {
  serviceSlug: string;
  name: string;
  icon: ServiceIcon;
  startingAt: string;
  unit: string;
  blurb: string;
}

export interface PricingComparisonRow {
  feature: string;
  starter: string;
  business: string;
  ecommerce: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}
