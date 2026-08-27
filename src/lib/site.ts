// Central site configuration for Developers3.
// Update contact details here when the client provides final assets.

export const site = {
  name: 'Developers3',
  legalName: 'Developers3 Digital LLC',
  domain: 'developers3.com',
  url: 'https://developers3.com',
  tagline: 'Web, App & Software Development Company',
  description:
    'Developers3 is a full-service web development agency building custom websites, WordPress, e-commerce stores, mobile apps and software that convert. Get a free quote today.',
  email: 'hello@developers3.com',
  phoneDisplay: '+1 (555) 013-4567',
  phoneHref: 'tel:+15550134567',
  phoneIntl: '+15550134567',
  whatsappNumber: '15550134567',
  whatsappMessage: "Hi Developers3! I'd like to discuss a project. Can we chat?",
  address: {
    street: '1200 Market Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'US',
  },
  geo: { lat: 37.7749, lng: -122.4194 },
  hours: 'Mon–Fri, 9:00 AM – 6:00 PM (PT)',
  hoursSchema: ['Mo-Fr 09:00-18:00'],
  founded: 2017,
  stats: {
    projects: '50+',
    clients: '30+',
    years: '8+',
    satisfaction: '98%',
    specialists: '12+',
  },
  socials: {
    linkedin: 'https://www.linkedin.com/company/developers3',
    twitter: 'https://x.com/developers3',
    instagram: 'https://www.instagram.com/developers3',
    facebook: 'https://www.facebook.com/developers3',
    github: 'https://github.com/developers3',
  },
} as const;

export function whatsappLink(message: string = site.whatsappMessage): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
