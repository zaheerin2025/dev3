import type { FAQ, PricingBlock, PricingComparisonRow, PricingTier } from '@/lib/types';

export const websiteTiers: PricingTier[] = [
  {
    name: 'Starter Website',
    price: '$699',
    period: 'one-time',
    bestFor: 'Small businesses that need a polished online presence, fast',
    blurb:
      'A conversion-focused 5-page website with everything you need to look credible and start getting inquiries — nothing you do not.',
    features: [
      'Up to 5 custom-designed pages',
      'Mobile-first responsive design',
      'Contact form + click-to-call setup',
      'On-page SEO (meta, schema, sitemap)',
      'Google Analytics 4 installation',
      'Speed & Core Web Vitals optimization',
      '30 days post-launch support',
      'Delivery in 2–3 weeks',
    ],
    ctaLabel: 'Start with Starter',
  },
  {
    name: 'Business Website',
    price: '$1,499',
    period: 'one-time',
    bestFor: 'Growing companies that need to rank on Google and convert',
    blurb:
      'Our most popular package: a fully custom site with CMS, keyword-driven page structure, and conversion tracking wired in from day one.',
    features: [
      'Up to 12 pages + custom CMS & blog',
      'Everything in Starter, plus:',
      'Keyword research & SEO page structure',
      'Blog launch with 2 seeded articles',
      'Advanced GA4 conversion tracking',
      'Newsletter & lead capture integration',
      '90 days post-launch support',
      'Delivery in 3–4 weeks',
    ],
    ctaLabel: 'Choose Business',
    highlighted: true,
  },
  {
    name: 'E-commerce / Custom',
    price: '$2,999+',
    period: 'one-time',
    bestFor: 'Online stores and products that need custom functionality',
    blurb:
      'A full online store on Shopify or WooCommerce — or a custom web application — built to sell, scale, and integrate with your tools.',
    features: [
      'Full store (Shopify or WooCommerce)',
      'Up to 50 products loaded + variants',
      'Payment gateway & shipping setup',
      'Abandoned-cart & email flows',
      'Custom functionality & integrations',
      'Product schema for Google Shopping',
      'Staff training session recorded',
      '90 days post-launch support',
    ],
    ctaLabel: 'Get E-commerce Quote',
  },
];

export const comparisonTable: PricingComparisonRow[] = [
  { feature: 'Pages included', starter: '5', business: 'Up to 12', ecommerce: 'Store + up to 50 products' },
  { feature: 'Design', starter: 'Template-based, customized', business: 'Fully custom', ecommerce: 'Fully custom' },
  { feature: 'CMS / blog', starter: '—', business: 'Included', ecommerce: 'Included' },
  { feature: 'On-page SEO', starter: 'Setup', business: 'Setup + keyword structure', ecommerce: 'Setup + product schema' },
  { feature: 'E-commerce', starter: '—', business: '—', ecommerce: 'Full store' },
  { feature: 'Conversion tracking', starter: 'GA4 basics', business: 'GA4 events + goals', ecommerce: 'GA4 + cart funnels' },
  { feature: 'Integrations', starter: 'Contact form', business: 'Newsletter + CRM-ready', ecommerce: 'Payments, shipping, email' },
  { feature: 'Post-launch support', starter: '30 days', business: '90 days', ecommerce: '90 days' },
  { feature: 'Delivery time', starter: '2–3 weeks', business: '3–4 weeks', ecommerce: '4–8 weeks' },
];

export const servicePricingBlocks: PricingBlock[] = [
  {
    serviceSlug: 'wordpress-development',
    name: 'WordPress Development',
    icon: 'wordpress',
    startingAt: '$649',
    unit: 'one-time',
    blurb: 'Custom themes, WooCommerce, speed optimization, and migrations.',
  },
  {
    serviceSlug: 'software-development',
    name: 'Custom Software',
    icon: 'cpu',
    startingAt: '$8,500',
    unit: 'per project',
    blurb: 'Dashboards, portals, APIs, and internal tools built to spec.',
  },
  {
    serviceSlug: 'mobile-app-development',
    name: 'Mobile Apps',
    icon: 'smartphone',
    startingAt: '$4,500',
    unit: 'per platform',
    blurb: 'iOS & Android apps with Flutter — one codebase, both stores.',
  },
  {
    serviceSlug: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: 'pen-tool',
    startingAt: '$950',
    unit: 'per project',
    blurb: 'Research, wireframes, and pixel-perfect design systems.',
  },
  {
    serviceSlug: 'seo-services',
    name: 'SEO Services',
    icon: 'trending-up',
    startingAt: '$350',
    unit: 'per month',
    blurb: 'Technical audits, content strategy, links, and reporting.',
  },
  {
    serviceSlug: 'google-ads-management',
    name: 'Google Ads',
    icon: 'target',
    startingAt: '$299',
    unit: 'per month + ad spend',
    blurb: 'Campaign build-out, optimization, and conversion tracking.',
  },
  {
    serviceSlug: 'social-media-marketing',
    name: 'Social Media',
    icon: 'megaphone',
    startingAt: '$299',
    unit: 'per month',
    blurb: 'Content calendars, design, scheduling, and engagement.',
  },
  {
    serviceSlug: 'website-maintenance',
    name: 'Maintenance',
    icon: 'wrench',
    startingAt: '$49',
    unit: 'per month',
    blurb: 'Updates, backups, security monitoring, and small edits.',
  },
];

export const pricingFaqs: FAQ[] = [
  {
    question: 'How much does a website cost in 2025?',
    answer:
      'In the 2025 US market, small sites typically run $500–$1,500, e-commerce builds $1,500–$3,000, and custom web applications $8,000+. The main drivers are design customization, number of pages, integrations, and content volume. Our packages start at $699 with fixed, itemized pricing.',
  },
  {
    question: 'Do you offer payment plans?',
    answer:
      'Yes — standard terms are 40% to start, 40% at design approval, and 20% at launch. Projects over $2,500 can be split into monthly installments at no extra cost, and retainer services (SEO, ads, maintenance) are billed monthly.',
  },
  {
    question: 'What is included in the price?',
    answer:
      'Strategy, design, development, on-page SEO, analytics setup, testing, and launch are all included. The only extras are third-party costs like hosting (from $10/month), premium plugins, or paid assets — always approved by you before purchase.',
  },
  {
    question: 'Are there any monthly fees?',
    answer:
      'Only if you want them: hosting from $10/month, maintenance from $49/month, and marketing retainers for SEO or ads. A website from us has zero mandatory recurring fees — you own it outright and can host it anywhere.',
  },
  {
    question: 'Why are you more affordable than larger agencies?',
    answer:
      'We are a lean senior team with low overhead — no sales commissions, no layers of account managers. You pay for engineering and design time, not for our office ping-pong table. Senior people do the work, which also means fewer costly revision cycles.',
  },
  {
    question: 'What if I need changes after launch?',
    answer:
      'Every package includes 30–90 days of free post-launch support. After that, small edits are covered by maintenance plans from $49/month, or billed at $55/hour with an upfront estimate. You will never get a surprise invoice.',
  },
];
