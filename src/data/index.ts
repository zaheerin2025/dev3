import { servicesPriority } from './services-priority';
import { servicesExtended } from './services-extended';
import { caseStudiesBatch1 } from './case-studies-1';
import { caseStudiesBatch2 } from './case-studies-2';
import { testimonials } from './testimonials';
import { blogPosts } from './blog-posts';
import { teamMembers } from './team';
import { pricingFaqs, servicePricingBlocks, websiteTiers, comparisonTable } from './pricing';
import {
  aboutStory,
  clientNames,
  companyValues,
  homeFaqs,
  homeProcess,
  legalLastUpdated,
  privacySections,
  termsSections,
  timeline,
  whyChooseUs,
} from './company';
import type { BlogPost, CaseStudy, Service, TeamMember, Testimonial } from '@/lib/types';

export const services: Service[] = [...servicesPriority, ...servicesExtended];
export const caseStudies: CaseStudy[] = [...caseStudiesBatch1, ...caseStudiesBatch2];

export {
  testimonials,
  blogPosts,
  teamMembers,
  websiteTiers,
  servicePricingBlocks,
  comparisonTable,
  pricingFaqs,
  homeFaqs,
  whyChooseUs,
  homeProcess,
  clientNames,
  companyValues,
  timeline,
  aboutStory,
  privacySections,
  termsSections,
  legalLastUpdated,
};

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/**
 * Services surfaced in the header mega menu + mobile nav.
 * Kept to exactly 5 so the menu stays scannable on every device —
 * the full catalogue lives on /services ("View all services").
 */
export const featuredServiceSlugs = [
  'custom-website-development',
  'ecommerce-development',
  'mobile-app-development',
  'seo-services',
  'ui-ux-design',
] as const;

export const featuredServices: Service[] = featuredServiceSlugs
  .map(getService)
  .filter((s): s is Service => Boolean(s));

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getTestimonial(id: string): Testimonial | undefined {
  return testimonials.find((t) => t.id === id);
}

export function getTestimonials(ids: string[]): Testimonial[] {
  return ids.map(getTestimonial).filter((t): t is Testimonial => Boolean(t));
}

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function getServiceCaseStudies(service: Service): CaseStudy[] {
  return service.caseStudySlugs
    .map(getCaseStudy)
    .filter((c): c is CaseStudy => Boolean(c));
}

export function getRelatedServices(service: Service): Service[] {
  return service.relatedServiceSlugs
    .map(getService)
    .filter((s): s is Service => Boolean(s));
}
