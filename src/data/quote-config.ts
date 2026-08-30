// Global quote engine configuration — drives the QuoteBuilder component on
// every service page, the pricing page, and the contact page.
//
// Each service defines its own project types, scope sizes and add-ons, so the
// quote form is DYNAMIC per service instead of a generic dropdown. Numbers are
// guidance anchors tied to the prices already published on /pricing — the
// estimate is a range, and the final fixed quote is confirmed after scoping.

export interface QuoteChoice {
  value: string;
  label: string;
  hint?: string;
  /** Flat amount added to (or subtracted from) the estimate. */
  delta?: number;
  /** Multiplier applied to the base price. */
  multiplier?: number;
}

export interface QuoteAddon {
  value: string;
  label: string;
  /** Flat price added when selected. */
  price: number;
  /** Rendered as "+$X/mo" for monthly-billed services. */
  monthly?: boolean;
}

export interface ServiceQuoteConfig {
  slug: string;
  base: number;
  billing: 'one-time' | 'monthly';
  types: QuoteChoice[];
  sizes: QuoteChoice[];
  addons: QuoteAddon[];
}

export interface QuoteSelection {
  type: string;
  size: string;
  addons: string[];
  pace: string;
}

export interface EstimateLine {
  label: string;
  value: string;
  tone: 'base' | 'up' | 'down' | 'neutral';
}

export interface EstimateResult {
  low: number;
  high: number;
  lines: EstimateLine[];
  /** "" for one-time, "/mo" for monthly services. */
  suffix: string;
  /** "one-time" | "per month" caption under the number. */
  caption: string;
}

/* ------------------------------------------------------------------ */
/*  Timeline / commitment options                                      */
/* ------------------------------------------------------------------ */

export const ONE_TIME_PACE: QuoteChoice[] = [
  { value: 'standard', label: 'Standard pace', hint: 'Typical timeline', multiplier: 1 },
  { value: 'rush', label: 'ASAP — rush delivery', hint: 'Priority scheduling', multiplier: 1.2 },
  { value: 'flexible', label: 'Flexible schedule', hint: 'Save 5% — we fit around you', multiplier: 0.95 },
];

export const MONTHLY_PACE: QuoteChoice[] = [
  { value: '3mo', label: '3-month commitment', hint: 'Month to month after', multiplier: 1 },
  { value: '6mo', label: '6-month commitment', hint: 'Save 5%', multiplier: 0.95 },
  { value: '12mo', label: '12-month commitment', hint: 'Save 10%', multiplier: 0.9 },
];

/* ------------------------------------------------------------------ */
/*  Generic options (used when no service is configured yet)           */
/* ------------------------------------------------------------------ */

export const GENERIC_BUDGETS = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $2,500',
  '$2,500 – $5,000',
  '$5,000+',
  'Not sure yet',
];

export const GENERIC_TIMELINES = ['ASAP — this month', '1–3 months', '3–6 months', 'Just exploring'];

export const NOT_SURE_SLUG = 'not-sure';

/* ------------------------------------------------------------------ */
/*  Per-service configurations                                         */
/* ------------------------------------------------------------------ */

const CONFIGS: ServiceQuoteConfig[] = [
  {
    slug: 'custom-website-development',
    base: 1499,
    billing: 'one-time',
    types: [
      { value: 'new', label: 'New website from scratch', delta: 0 },
      { value: 'redesign', label: 'Redesign & rebuild', hint: 'We migrate your content', delta: 0 },
      { value: 'landing', label: 'Single landing page', hint: 'Campaign or product launch', delta: -600 },
    ],
    sizes: [
      { value: 's', label: '1–5 pages', hint: 'Most common starting point', multiplier: 1 },
      { value: 'm', label: '6–12 pages', multiplier: 1.5 },
      { value: 'l', label: '13–25 pages', multiplier: 2.2 },
      { value: 'xl', label: '25+ pages', hint: 'Large sites & directories', multiplier: 3 },
    ],
    addons: [
      { value: 'cms', label: 'Custom CMS & blog', price: 400 },
      { value: 'ecom', label: 'E-commerce functionality', price: 900 },
      { value: 'crm', label: 'CRM / booking integration', price: 500 },
      { value: 'i18n', label: 'Multilingual setup', price: 600 },
      { value: 'copy', label: 'SEO copywriting (per site)', price: 300 },
      { value: 'content', label: '5 extra SEO content pages', price: 450 },
    ],
  },
  {
    slug: 'wordpress-development',
    base: 649,
    billing: 'one-time',
    types: [
      { value: 'new', label: 'New WordPress site', delta: 0 },
      { value: 'redesign', label: 'Redesign or rebrand', delta: 150 },
      { value: 'speed', label: 'Speed optimization', hint: 'Core Web Vitals focused', delta: -150 },
      { value: 'migration', label: 'Migration to WordPress', delta: -100 },
    ],
    sizes: [
      { value: 's', label: 'Small site (up to 8 pages)', multiplier: 1 },
      { value: 'm', label: 'Medium site (9–20 pages)', multiplier: 1.6 },
      { value: 'l', label: 'Large site (20+ pages)', multiplier: 2.4 },
    ],
    addons: [
      { value: 'woo', label: 'WooCommerce store', price: 500 },
      { value: 'speed', label: 'Speed & Core Web Vitals pass', price: 200 },
      { value: 'security', label: 'Security hardening', price: 150 },
      { value: 'wpml', label: 'Multilingual (WPML)', price: 300 },
      { value: 'plugin', label: 'Custom plugin development', price: 400 },
    ],
  },
  {
    slug: 'ecommerce-development',
    base: 2999,
    billing: 'one-time',
    types: [
      { value: 'shopify', label: 'Shopify store', delta: 0 },
      { value: 'woo', label: 'WooCommerce store', delta: 0 },
      { value: 'custom', label: 'Custom storefront', hint: 'Headless or bespoke build', delta: 800 },
    ],
    sizes: [
      { value: 's', label: 'Up to 50 products', multiplier: 1 },
      { value: 'm', label: '50–500 products', multiplier: 1.5 },
      { value: 'l', label: '500+ products or multi-store', multiplier: 2.2 },
    ],
    addons: [
      { value: 'payments', label: 'Payment & shipping setup', price: 150 },
      { value: 'cart', label: 'Abandoned-cart email flows', price: 300 },
      { value: 'feed', label: 'Product schema & Google Shopping feed', price: 250 },
      { value: 'subs', label: 'Subscription products', price: 450 },
      { value: 'training', label: 'Recorded staff training session', price: 200 },
    ],
  },
  {
    slug: 'software-development',
    base: 8500,
    billing: 'one-time',
    types: [
      { value: 'webapp', label: 'Customer-facing web app', delta: 0 },
      { value: 'internal', label: 'Internal tool or dashboard', delta: 0 },
      { value: 'api', label: 'API & integrations backend', delta: -1500 },
      { value: 'portal', label: 'Portal or marketplace', delta: 1500 },
    ],
    sizes: [
      { value: 'mvp', label: 'MVP — core features only', hint: 'Fastest path to market', multiplier: 1 },
      { value: 'growth', label: 'Growth — full feature set', multiplier: 1.6 },
      { value: 'enterprise', label: 'Enterprise — SSO, audit logs, SLAs', multiplier: 2.5 },
    ],
    addons: [
      { value: 'auth', label: 'Authentication & role management', price: 1200 },
      { value: 'payments', label: 'Payment processing', price: 900 },
      { value: 'reporting', label: 'Reporting & analytics module', price: 800 },
      { value: 'integrations', label: 'Third-party integrations', price: 700 },
      { value: 'realtime', label: 'Realtime / live-updating features', price: 1100 },
    ],
  },
  {
    slug: 'mobile-app-development',
    base: 4500,
    billing: 'one-time',
    types: [
      { value: 'cross', label: 'iOS & Android — one codebase', hint: 'Flutter', delta: 0 },
      { value: 'single', label: 'Single platform', delta: -800 },
      { value: 'redesign', label: 'App redesign or rescue', delta: 400 },
    ],
    sizes: [
      { value: 's', label: 'Simple — up to 5 screens', multiplier: 1 },
      { value: 'm', label: 'Standard — 6–12 screens', multiplier: 1.6 },
      { value: 'l', label: 'Complex — 13+ screens', multiplier: 2.4 },
    ],
    addons: [
      { value: 'backend', label: 'Backend API & database', price: 1500 },
      { value: 'push', label: 'Push notifications', price: 400 },
      { value: 'iap', label: 'In-app purchases', price: 700 },
      { value: 'stores', label: 'App Store & Play Store submission', price: 250 },
      { value: 'analytics', label: 'Analytics & crash reporting', price: 300 },
    ],
  },
  {
    slug: 'ui-ux-design',
    base: 950,
    billing: 'one-time',
    types: [
      { value: 'product', label: 'Full product design', delta: 0 },
      { value: 'system', label: 'Design system only', delta: -200 },
      { value: 'audit', label: 'Audit & redesign recommendations', delta: -300 },
      { value: 'landing', label: 'Landing page design', delta: -350 },
    ],
    sizes: [
      { value: 's', label: '1–5 screens', multiplier: 1 },
      { value: 'm', label: '6–15 screens', multiplier: 1.8 },
      { value: 'l', label: '16+ screens', multiplier: 2.6 },
    ],
    addons: [
      { value: 'research', label: 'User research & interviews', price: 500 },
      { value: 'prototype', label: 'Clickable prototype', price: 450 },
      { value: 'handoff', label: 'Developer handoff documentation', price: 200 },
      { value: 'brand', label: 'Brand refresh (logo + palette)', price: 600 },
    ],
  },
  {
    slug: 'seo-services',
    base: 350,
    billing: 'monthly',
    types: [
      { value: 'local', label: 'Local SEO', hint: 'Map pack & local searches', delta: 0 },
      { value: 'national', label: 'National SEO', hint: 'Competitive keywords', delta: 150 },
      { value: 'ecom', label: 'E-commerce SEO', hint: 'Product & category pages', delta: 250 },
    ],
    sizes: [
      { value: 's', label: 'Small site (up to 10 pages)', multiplier: 1 },
      { value: 'm', label: 'Growing site (11–40 pages)', multiplier: 1.5 },
      { value: 'l', label: 'Large site (40+ pages)', multiplier: 2.1 },
    ],
    addons: [
      { value: 'content', label: 'Content writing — 2 posts/mo', price: 200, monthly: true },
      { value: 'links', label: 'Link building campaign', price: 250, monthly: true },
      { value: 'gbp', label: 'Google Business Profile management', price: 100, monthly: true },
      { value: 'cro', label: 'Conversion rate optimization', price: 150, monthly: true },
    ],
  },
  {
    slug: 'google-ads-management',
    base: 299,
    billing: 'monthly',
    types: [
      { value: 'search', label: 'Search campaigns', delta: 0 },
      { value: 'shopping', label: 'Shopping campaigns', delta: 100 },
      { value: 'display', label: 'Display & YouTube', delta: 150 },
      { value: 'full', label: 'Full-funnel mix', delta: 250 },
    ],
    sizes: [
      { value: 's', label: '1 campaign', multiplier: 1 },
      { value: 'm', label: '2–4 campaigns', multiplier: 1.5 },
      { value: 'l', label: '5+ campaigns', multiplier: 2.1 },
    ],
    addons: [
      { value: 'tracking', label: 'Conversion tracking setup', price: 200 },
      { value: 'landing', label: 'Landing page build', price: 350 },
      { value: 'feed', label: 'Product feed optimization', price: 250 },
      { value: 'remarketing', label: 'Remarketing audiences', price: 150 },
    ],
  },
  {
    slug: 'social-media-marketing',
    base: 299,
    billing: 'monthly',
    types: [
      { value: 'content', label: 'Content creation & scheduling', delta: 0 },
      { value: 'growth', label: 'Growth & engagement', delta: 100 },
      { value: 'ads', label: 'Paid social ads', delta: 200 },
    ],
    sizes: [
      { value: 's', label: '1 platform', multiplier: 1 },
      { value: 'm', label: '2–3 platforms', multiplier: 1.6 },
      { value: 'l', label: '4+ platforms', multiplier: 2.2 },
    ],
    addons: [
      { value: 'video', label: 'Short-form video / reels', price: 250, monthly: true },
      { value: 'community', label: 'Community management', price: 200, monthly: true },
      { value: 'influencer', label: 'Influencer outreach', price: 300, monthly: true },
      { value: 'report', label: 'Deep-dive monthly report', price: 100, monthly: true },
    ],
  },
  {
    slug: 'website-maintenance',
    base: 49,
    billing: 'monthly',
    types: [
      { value: 'standard', label: 'Standard care plan', delta: 0 },
      { value: 'ecom', label: 'E-commerce care plan', delta: 50 },
      { value: 'tuneup', label: 'Speed & security tune-up', delta: 100 },
    ],
    sizes: [
      { value: 's', label: 'Small site', multiplier: 1 },
      { value: 'm', label: 'Business site', hint: 'More pages & updates', multiplier: 1.5 },
      { value: 'l', label: 'E-commerce site', multiplier: 2 },
    ],
    addons: [
      { value: 'backups', label: 'Daily backups', price: 20, monthly: true },
      { value: 'sla', label: 'Priority 4-hour response SLA', price: 60, monthly: true },
      { value: 'edits', label: 'Content edits — 2 hrs/mo', price: 80, monthly: true },
      { value: 'uptime', label: 'Uptime monitoring & alerts', price: 15, monthly: true },
    ],
  },
];

const CONFIG_MAP = new Map(CONFIGS.map((config) => [config.slug, config]));

/** Returns the quote configuration for a service, or null for "not sure". */
export function getQuoteConfig(slug: string): ServiceQuoteConfig | null {
  return CONFIG_MAP.get(slug) ?? null;
}

/** Timeline options for a service (commitment plans for monthly services). */
export function getPaceOptions(config: ServiceQuoteConfig | null): QuoteChoice[] {
  return config?.billing === 'monthly' ? MONTHLY_PACE : ONE_TIME_PACE;
}

/* ------------------------------------------------------------------ */
/*  Estimate math                                                      */
/* ------------------------------------------------------------------ */

function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

function roundToStep(amount: number, step = 50): number {
  return Math.max(step, Math.round(amount / step) * step);
}

function findChoice(choices: QuoteChoice[], value: string): QuoteChoice {
  return choices.find((choice) => choice.value === value) ?? choices[0];
}

/**
 * Computes the guidance range for a selection.
 * estimate = base × size × pace + type + addons, shown as a rounded range.
 */
export function computeEstimate(
  config: ServiceQuoteConfig,
  selection: QuoteSelection
): EstimateResult {
  const type = findChoice(config.types, selection.type);
  const size = findChoice(config.sizes, selection.size);
  const pace = findChoice(getPaceOptions(config), selection.pace);

  const sizeMultiplier = size.multiplier ?? 1;
  const paceMultiplier = pace.multiplier ?? 1;
  const addons = config.addons.filter((addon) => selection.addons.includes(addon.value));
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);

  const raw = config.base * sizeMultiplier * paceMultiplier + (type.delta ?? 0) + addonsTotal;
  const low = roundToStep(raw * 0.92);
  const high = roundToStep(raw * 1.28);

  const lines: EstimateLine[] = [
    { label: 'Base service', value: formatMoney(config.base), tone: 'base' },
  ];
  if (type.delta) {
    lines.push({
      label: type.label,
      value: `${type.delta > 0 ? '+' : '−'}${formatMoney(Math.abs(type.delta))}`,
      tone: type.delta > 0 ? 'up' : 'down',
    });
  }
  if (sizeMultiplier !== 1) {
    lines.push({
      label: size.label,
      value: `×${sizeMultiplier}`,
      tone: 'up',
    });
  }
  if (addons.length > 0) {
    lines.push({
      label: `Add-ons (${addons.length})`,
      value: `+${formatMoney(addonsTotal)}`,
      tone: 'up',
    });
  }
  if (paceMultiplier !== 1) {
    const percent = Math.round((paceMultiplier - 1) * 100);
    lines.push({
      label: pace.label,
      value: `${percent > 0 ? '+' : ''}${percent}%`,
      tone: percent > 0 ? 'up' : 'down',
    });
  }

  return {
    low,
    high,
    lines,
    suffix: config.billing === 'monthly' ? '/mo' : '',
    caption: config.billing === 'monthly' ? 'per month' : 'one-time project',
  };
}

/** "$1,900 – $3,700" style label for storage & badges. */
export function estimateRangeLabel(estimate: EstimateResult): string {
  return `${formatMoney(estimate.low)} – ${formatMoney(estimate.high)}`;
}

/** Human-readable summary appended to the lead message. */
export function describeSelection(
  serviceName: string,
  config: ServiceQuoteConfig | null,
  selection: QuoteSelection,
  estimate: EstimateResult | null
): string[] {
  const lines: string[] = [`Service: ${serviceName}`];
  if (!config || !estimate) return lines;

  const type = findChoice(config.types, selection.type);
  const size = findChoice(config.sizes, selection.size);
  const pace = findChoice(getPaceOptions(config), selection.pace);
  const addons = config.addons.filter((addon) => selection.addons.includes(addon.value));

  lines.push(`Type: ${type.label}`);
  lines.push(`Scope: ${size.label}`);
  if (addons.length > 0) {
    lines.push(`Add-ons: ${addons.map((addon) => addon.label).join(', ')}`);
  }
  lines.push(`Timeline: ${pace.label}`);
  lines.push(`Instant estimate: ${estimateRangeLabel(estimate)} ${estimate.caption}`);
  return lines;
}

/** Structured config stored with the lead so admins see exactly what was picked. */
export function serializeSelection(
  serviceName: string,
  config: ServiceQuoteConfig | null,
  selection: QuoteSelection,
  estimate: EstimateResult | null
): string {
  const payload: Record<string, unknown> = { service: serviceName };
  if (config && estimate) {
    const type = findChoice(config.types, selection.type);
    const size = findChoice(config.sizes, selection.size);
    const pace = findChoice(getPaceOptions(config), selection.pace);
    const addons = config.addons.filter((addon) => selection.addons.includes(addon.value));
    payload.type = type.label;
    payload.scope = size.label;
    if (addons.length > 0) payload.addons = addons.map((addon) => addon.label);
    payload.timeline = pace.label;
    payload.estimateLow = estimate.low;
    payload.estimateHigh = estimate.high;
    payload.billing = config.billing;
  }
  return JSON.stringify(payload);
}
