// Central site configuration for Developers3.
// Identity fields below are intentionally EMPTY — no placeholder/fake data.
// The owner enters real contact details in the admin panel (Site Content);
// UI that depends on them stays hidden until real values exist.

export const site = {
  name: 'Developers3',
  legalName: 'Developers3',
  domain: 'developers3.com',
  url: 'https://developers3.com',
  tagline: 'Web, App & Software Development Company',
  description:
    'Developers3 is a full-service web development agency building custom websites, WordPress, e-commerce stores, mobile apps and software that convert. Get a free quote today.',
  email: '',
  phoneDisplay: '',
  phoneHref: '',
  phoneIntl: '',
  whatsappNumber: '',
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
