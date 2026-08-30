// ─────────────────────────────────────────────────────────────
// Editable site content — single source of truth.
//
// Every entry maps a Setting key to a human label, a default value,
// and where it appears. Three consumers:
//   1. src/views/*          → effectiveValue(settings, key) renders it
//   2. <Editable id="…"/>   → on-page click-to-edit (visual editor)
//   3. admin panel          → the Site Content tab lists the same fields
//
// An empty saved value always means "use the default".
// ─────────────────────────────────────────────────────────────

export type ContentPage = 'home' | 'about' | 'contact' | 'footer' | 'site';

export interface ContentField {
  key: string;
  label: string;
  /** Which page/area the field belongs to (drives editor grouping). */
  page: ContentPage;
  /** Group heading shown in the editor panel and admin tab. */
  group: string;
  type: 'text' | 'textarea';
  defaultValue: string;
  hint?: string;
  /** True when the value is clickable on the page via <Editable>. */
  visual: boolean;
}

export const CONTENT_FIELDS: ContentField[] = [
  /* ── Home ── */
  {
    key: 'hero.headline',
    label: 'Hero headline',
    page: 'home',
    group: 'Hero',
    type: 'text',
    defaultValue: 'Your Business Needs A Better Website — We Make It Happen',
    hint: 'Shown as the home page H1. Saved text replaces the animated default headline.',
    visual: true,
  },
  {
    key: 'hero.subheadline',
    label: 'Hero subheadline',
    page: 'home',
    group: 'Hero',
    type: 'textarea',
    defaultValue:
      'Design. Development. Results. Your business deserves a website that actually works.',
    visual: true,
  },
  {
    key: 'cta.body',
    label: 'Final CTA text',
    page: 'home',
    group: 'Closing CTA',
    type: 'textarea',
    defaultValue: 'Let’s build something amazing together.',
    visual: true,
  },

  /* ── About ── */
  {
    key: 'about.intro',
    label: 'About intro',
    page: 'about',
    group: 'About page',
    type: 'textarea',
    defaultValue:
      'Senior engineers, itemized fixed quotes, and code you own — one rule: treat every client’s business like our own.',
    visual: true,
  },
  {
    key: 'about.mission',
    label: 'Mission statement',
    page: 'about',
    group: 'About page',
    type: 'textarea',
    defaultValue:
      'Make agency-quality digital products accessible to every serious small business — with transparent pricing, senior craft, and results you can measure.',
    visual: true,
  },

  /* ── Contact ── */
  {
    key: 'contact.email',
    label: 'Contact email',
    page: 'contact',
    group: 'Contact details',
    type: 'text',
    defaultValue: 'info@developers3.com',
    visual: true,
  },
  {
    key: 'contact.businessEmail',
    label: 'Business email',
    page: 'contact',
    group: 'Contact details',
    type: 'text',
    defaultValue: 'marketing@developers3.com',
    visual: true,
    hint: 'Shown for business queries, partnerships and promotions.',
  },
  {
    key: 'contact.phoneDisplay',
    label: 'Phone (display)',
    page: 'contact',
    group: 'Contact details',
    type: 'text',
    defaultValue: '',
    hint: 'Leave empty to hide phone links everywhere. Example: +1 (555) 013-4567.',
    visual: true,
  },
  {
    key: 'contact.whatsappNumber',
    label: 'WhatsApp number',
    page: 'contact',
    group: 'Contact details',
    type: 'text',
    defaultValue: '923110671019',
    hint: 'Digits only with country code, e.g. 923110671019. Empty hides WhatsApp links.',
    visual: true,
  },
  {
    key: 'contact.addressLine',
    label: 'Address line',
    page: 'contact',
    group: 'Contact details',
    type: 'text',
    defaultValue: '',
    hint: 'One line, e.g. 1200 Market Street, San Francisco, CA. Empty hides the address block.',
    visual: true,
  },
  {
    key: 'contact.hours',
    label: 'Business hours',
    page: 'contact',
    group: 'Contact details',
    type: 'text',
    defaultValue: '',
    hint: 'e.g. Mon–Fri, 9:00 AM – 6:00 PM. Empty hides the hours row.',
    visual: true,
  },

  /* ── YouTube video (home) ── */
  {
    key: 'video.title',
    label: 'Video section title',
    page: 'home',
    group: 'YouTube video',
    type: 'text',
    defaultValue: 'Fresh From Our YouTube Channel',
    visual: true,
  },
  {
    key: 'video.latestUrl',
    label: 'Latest video URL',
    page: 'home',
    group: 'YouTube video',
    type: 'text',
    defaultValue: '',
    hint:
      'Paste the full YouTube link — youtube.com/watch?v=…, youtu.be/… or youtube.com/shorts/… all work. Leave empty to hide the section.',
    visual: false,
  },

  /* ── Footer (visible on every page) ── */
  {
    key: 'footer.blurb',
    label: 'Footer blurb',
    page: 'footer',
    group: 'Footer',
    type: 'textarea',
    defaultValue:
      'We design, build, and grow websites, apps, and software for ambitious businesses — with senior people on every project.',
    visual: true,
  },

  /* ── Site-wide (admin tab only — not on-page clickable) ── */
  ...(
    [
      { key: 'socials.linkedin', label: 'LinkedIn URL' },
      { key: 'socials.twitter', label: 'X (Twitter) URL' },
      { key: 'socials.instagram', label: 'Instagram URL' },
      { key: 'socials.facebook', label: 'Facebook URL' },
      { key: 'socials.github', label: 'GitHub URL' },
    ] as const
  ).map((s) => ({
    key: s.key,
    label: s.label,
    page: 'site' as const,
    group: 'Social profiles',
    type: 'text' as const,
    defaultValue: '',
    hint: 'Paste a full profile URL. Empty networks stay hidden in the footer and contact page.',
    visual: false,
  })),
];

export function getContentField(key: string): ContentField | undefined {
  return CONTENT_FIELDS.find((field) => field.key === key);
}

/**
 * Resolved value for rendering: the saved override when non-empty,
 * otherwise the schema default. Falls back to '' for unknown keys.
 */
export function effectiveValue(settings: Record<string, string>, key: string): string {
  const saved = settings[key];
  if (typeof saved === 'string' && saved.length > 0) return saved;
  return getContentField(key)?.defaultValue ?? '';
}

/** Fields grouped by their group heading, page groups in a stable order. */
export function groupedFields(): { group: string; fields: ContentField[] }[] {
  const order: ContentPage[] = ['home', 'about', 'contact', 'footer', 'site'];
  const groups = new Map<string, ContentField[]>();
  for (const field of CONTENT_FIELDS) {
    const list = groups.get(field.group) ?? [];
    list.push(field);
    groups.set(field.group, list);
  }
  return [...groups.entries()]
    .map(([group, fields]) => ({ group, fields }))
    .sort(
      (a, b) =>
        order.indexOf(a.fields[0].page) - order.indexOf(b.fields[0].page)
    );
}
