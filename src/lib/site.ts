// Central site configuration for Developers3.
// Contact fields hold the owner's REAL details (also editable from the
// admin panel, whose saved overrides always win over these defaults).

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://developers3.com';
const siteDomain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const site = {
  name: 'Developers3',
  legalName: 'Developers3',
  domain: siteDomain,
  url: siteUrl,
  tagline: 'Web, App & Software Development Company',
  description:
    'Developers3 is a full-service web development agency building custom websites, WordPress, e-commerce stores, mobile apps and software that convert. Get a free quote today.',
  email: 'info@developers3.com',
  businessEmail: 'marketing@developers3.com',
  phoneDisplay: '',
  phoneHref: '',
  phoneIntl: '',
  whatsappNumber: '923110671019',
  whatsappDisplay: '+92 311 0671019',
  whatsappMessage: "Hi Developers3! I'd like to discuss a project. Can we chat?",
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  },
  geo: { lat: 0, lng: 0 },
  hours: '',
  hoursSchema: [] as string[],
  founded: 0,
  stats: {
    projects: '',
    clients: '',
    years: '',
    satisfaction: '',
    specialists: '',
  },
  socials: {
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    github: '',
  },
};

/**
 * WhatsApp deep link. Returns an empty string when no real WhatsApp number
 * is configured, so callers can hide WhatsApp UI entirely.
 */
export function whatsappLink(message: string = site.whatsappMessage): string {
  if (!site.whatsappNumber) return '';
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
