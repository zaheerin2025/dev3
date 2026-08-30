import { getToolMeta } from '@/data/tools/registry';
import { site } from './site';
import type { BlogPost, CaseStudy, Service } from './types';

export type RouteMatch =
  | { kind: 'home' }
  | { kind: 'services-hub' }
  | { kind: 'service'; slug: string }
  | { kind: 'portfolio' }
  | { kind: 'case-study'; slug: string }
  | { kind: 'pricing' }
  | { kind: 'about' }
  | { kind: 'contact' }
  | { kind: 'blog' }
  | { kind: 'blog-post'; slug: string }
  | { kind: 'admin' }
  | { kind: 'tools-hub' }
  | { kind: 'tool'; slug: string }
  | { kind: 'privacy' }
  | { kind: 'terms' }
  | { kind: 'not-found'; path: string };

export interface RouteData {
  services: Service[];
  caseStudies: CaseStudy[];
  blogPosts: BlogPost[];
}

export function resolveRoute(path: string, data: RouteData): RouteMatch {
  const clean = path.replace(/\/+$/, '') || '/';

  switch (clean) {
    case '/':
      return { kind: 'home' };
    case '/services':
      return { kind: 'services-hub' };
    case '/portfolio':
      return { kind: 'portfolio' };
    case '/pricing':
      return { kind: 'pricing' };
    case '/about':
      return { kind: 'about' };
    case '/contact':
      return { kind: 'contact' };
    case '/blog':
      return { kind: 'blog' };
    case '/privacy-policy':
      return { kind: 'privacy' };
    case '/terms':
      return { kind: 'terms' };
  }

  if (clean.startsWith('/portfolio/')) {
    const slug = clean.slice('/portfolio/'.length);
    if (slug && !slug.includes('/')) {
      return data.caseStudies.some((c) => c.slug === slug)
        ? { kind: 'case-study', slug }
        : { kind: 'not-found', path };
    }
  }

  // Tools portal: /tools (hub) and /tools/<slug> (one tool).
  if (clean === '/tools') {
    return { kind: 'tools-hub' };
  }
  if (clean.startsWith('/tools/')) {
    const slug = clean.slice('/tools/'.length);
    if (slug && !slug.includes('/')) {
      return { kind: 'tool', slug };
    }
  }

  // Admin panel — exact match only, kept out of public navigation.
  if (clean === '/admin') {
    return { kind: 'admin' };
  }

  // Any /blog/{slug} resolves to the post view: static posts come from data,
  // admin-created posts are fetched from /api/public/posts by the view itself
  // (unknown slugs render the view's own "Post not found" state).
  if (clean.startsWith('/blog/')) {
    const slug = clean.slice('/blog/'.length);
    if (slug && !slug.includes('/')) {
      return { kind: 'blog-post', slug };
    }
  }

  const serviceSlug = clean.slice(1);
  if (serviceSlug && !serviceSlug.includes('/') && data.services.some((s) => s.slug === serviceSlug)) {
    return { kind: 'service', slug: serviceSlug };
  }

  return { kind: 'not-found', path };
}

export interface RouteSeo {
  title: string;
  description: string;
}

export function getRouteSeo(match: RouteMatch, data: RouteData): RouteSeo {
  switch (match.kind) {
    case 'home':
      return {
        title: 'Web Development Company | Websites, Apps & Software — Developers3',
        description: site.description,
      };
    case 'services-hub':
      return {
        title: 'Web & Digital Services — Design, Development & Marketing | Developers3',
        description:
          'Custom websites, WordPress, e-commerce, software, mobile apps, UI/UX, SEO, Google Ads, social media and maintenance — one senior team, transparent pricing. Explore all Developers3 services.',
      };
    case 'service': {
      const service = data.services.find((s) => s.slug === match.slug);
      return service
        ? { title: service.metaTitle, description: service.metaDescription }
        : { title: `Services | ${site.name}`, description: site.description };
    }
    case 'portfolio':
      return {
        title: 'Portfolio — Web, App & Marketing Case Studies | Developers3',
        description:
          'Real results from real projects: e-commerce replatforms, fintech dashboards, mobile apps and SEO campaigns. Browse Developers3 case studies with measurable outcomes.',
      };
    case 'case-study': {
      const study = data.caseStudies.find((c) => c.slug === match.slug);
      return study
        ? { title: study.metaTitle, description: study.metaDescription }
        : { title: `Case Studies | ${site.name}`, description: site.description };
    }
    case 'pricing':
      return {
        title: 'Website & Digital Services Pricing | Developers3',
        description:
          'Transparent, fixed pricing: websites from $699, e-commerce from $2,999, SEO from $350/month. Compare packages, see what is included, and get a free custom quote.',
      };
    case 'about':
      return {
        title: 'About Us — A Senior Team Obsessed With Results | Developers3',
        description:
          'Meet the senior-only studio behind Developers3 — designers, engineers and marketers who treat every client\'s business like our own.'
      };
    case 'contact':
      return {
        title: 'Contact Us — Get a Free Project Quote | Developers3',
        description:
          'Tell us about your project and get a free, itemized quote within one business day — straight advice from senior engineers.'
      };
    case 'blog':
      return {
        title: 'Blog — Web Development, SEO & Growth Guides | Developers3',
        description:
          'Practical guides on website costs, platform choices, SEO, and app development from the Developers3 team. No fluff, real numbers.',
      };
    case 'blog-post': {
      const post = data.blogPosts.find((p) => p.slug === match.slug);
      return post
        ? { title: post.metaTitle, description: post.metaDescription }
        : { title: `Blog | ${site.name}`, description: site.description };
    }
    case 'tools-hub':
      return {
        title: '100 Free Online Tools — QR, PDF, SEO, Image & Dev Utilities | Developers3',
        description:
          '100 genuinely free online tools: QR codes, passwords, invoices, image converters, SEO and developer utilities. No signup, no watermarks — everything runs in your browser.',
      };
    case 'tool': {
      const tool = getToolMeta(match.slug);
      return tool
        ? { title: `${tool.name} — Free Online Tool | Developers3 Tools`, description: tool.seoDescription }
        : { title: 'Free Online Tools | Developers3', description: 'Free browser-based tools by Developers3.' };
    }
    case 'admin':
      return {
        title: 'Admin — Developers3',
        description: 'Developers3 admin panel — manage blog posts, pricing, and site content.',
      };
    case 'privacy':
      return {
        title: 'Privacy Policy | Developers3',
        description:
          'How Developers3 collects, uses, and protects your personal information when you use developers3.com.',
      };
    case 'terms':
      return {
        title: 'Terms & Conditions | Developers3',
        description: 'The terms that govern use of developers3.com and Developers3 services.',
      };
    case 'not-found':
      return {
        title: `Page Not Found — ${site.name}`,
        description: 'The page you are looking for does not exist. Explore our services or get in touch.',
      };
  }
}
