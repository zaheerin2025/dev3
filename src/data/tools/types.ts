import type { LucideIcon } from 'lucide-react';

/** The five tool categories (order = display order on the hub). */
export const TOOL_CATEGORIES = [
  {
    id: 'website',
    label: 'Website & Web Development',
    short: 'Website',
    gradient: 'from-gray-800 to-gray-500',
    pill: 'bg-gray-100 text-gray-800',
    description:
      'Free website tools: uptime and security header checks, SEO meta tag and robots.txt generators, sitemap builders, code minifiers and policy generators.',
  },
  {
    id: 'mobile',
    label: 'Mobile App Development',
    short: 'Mobile',
    gradient: 'from-gray-500 to-gray-400',
    pill: 'bg-gray-100 text-gray-800',
    description:
      'App launch toolkit: store screenshot resizers, mockup generators, ASO analyzers, push notification previews and app cost calculators.',
  },
  {
    id: 'software',
    label: 'Software & Developer Utilities',
    short: 'Developer',
    gradient: 'from-gray-500 to-gray-400',
    pill: 'bg-gray-100 text-gray-800',
    description:
      'Daily developer utilities: JSON and SQL formatters, regex tester, hash and UUID generators, QR codes, CSS generators and diff checking.',
  },
  {
    id: 'social',
    label: 'Social Media Marketing',
    short: 'Social',
    gradient: 'from-gray-500 to-gray-400',
    pill: 'bg-gray-100 text-gray-800',
    description:
      'Social media tools: font and caption generators, ad budget calculators, engagement analyzers, image resizers and content calendar templates.',
  },
  {
    id: 'business',
    label: 'Business, SEO & Client Tools',
    short: 'Business',
    gradient: 'from-gray-400 to-gray-500',
    pill: 'bg-gray-100 text-gray-800',
    description:
      'Business and SEO tools: invoice and quote generators, profit and ROI calculators, keyword analyzers, schema builders and client brief templates.',
  },
] as const;

export type ToolCategoryId = (typeof TOOL_CATEGORIES)[number]['id'];

export function getCategory(id: string) {
  return TOOL_CATEGORIES.find((c) => c.id === id) ?? TOOL_CATEGORIES[0];
}

/** How a tool runs — selects the engine pattern used on its page. */
export type ToolEngine =
  | 'generator' // guided form → document/code output
  | 'text' // paste text → transform
  | 'analyze' // paste text → report
  | 'calc' // inputs → numbers
  | 'image' // upload → canvas output
  | 'url' // URL → live report (via /api/tools/fetch)
  | 'bespoke'; // custom interactive UI

export interface ToolFaq {
  q: string;
  a: string;
}

/** Static metadata for every tool — cards, SEO, related linking. */
export interface ToolMeta {
  /** URL slug under /#/tools/<slug> — unique across the registry. */
  slug: string;
  name: string;
  /** One-line card copy, ≤ 90 chars. */
  blurb: string;
  category: ToolCategoryId;
  engine: ToolEngine;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Meta title, ≤ 60 chars. */
  seoTitle: string;
  /** Meta description, 140–160 chars. */
  seoDescription: string;
  /** Free tool badge label shown on cards/pages. */
  badge?: string;
}

/** Per-tool page content — MUST be unique for every tool (no duplication). */
export interface ToolDoc {
  /** 2–3 sentence intro shown under the H1 (unique per tool). */
  longDescription: string;
  /** 3–4 numbered "How to use" steps (unique per tool). */
  howTo: string[];
  /** 2–3 FAQs (unique per tool). */
  faqs: ToolFaq[];
}

/** A fully implemented tool = metadata + interactive component + page copy. */
export interface ToolDefinition {
  meta: ToolMeta;
  Component: React.ComponentType;
  doc: ToolDoc;
}
