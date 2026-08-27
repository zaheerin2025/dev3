import { site } from './site';
import type { CaseStudy, FAQ, PricingBlock, PricingTier, Service, Testimonial, BlogPost, TeamMember } from './types';

const abs = (path: string) => `${site.url}${path === '/' ? '' : path}`;

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: abs('/logo.svg'),
    description: site.description,
    foundingDate: String(site.founded),
    email: site.email,
    telephone: site.phoneIntl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    sameAs: Object.values(site.socials),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: site.phoneIntl,
        contactType: 'sales',
        email: site.email,
        availableLanguage: 'English',
      },
    ],
  };
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${site.url}/#localbusiness`,
    name: site.name,
    url: site.url,
    image: abs('/images/og-image.png'),
    logo: abs('/logo.svg'),
    description: site.description,
    telephone: site.phoneIntl,
    email: site.email,
    priceRange: '$$',
    foundingDate: String(site.founded),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: Object.values(site.socials),
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.name,
    url: site.url,
    description: site.description,
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function buildServiceSchema(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}/${service.slug}#service`,
    name: service.name,
    serviceType: service.primaryKeyword,
    description: service.metaDescription,
    url: abs(`/${service.slug}`),
    areaServed: 'Worldwide',
    provider: { '@id': `${site.url}/#organization` },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      description: `Starting at ${service.startingPrice}`,
      url: abs(`/${service.slug}`),
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildFaqPageSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildReviewSchema(testimonial: Testimonial) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: testimonial.rating,
      bestRating: 5,
    },
    author: {
      '@type': 'Person',
      name: testimonial.name,
      jobTitle: testimonial.role,
      worksFor: testimonial.company,
    },
    reviewBody: testimonial.quote,
    itemReviewed: { '@id': `${site.url}/#organization` },
  };
}

export function buildArticleSchema(post: BlogPost, author?: TeamMember) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: abs(`/blog/${post.slug}`),
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    image: abs('/images/og-image.png'),
    author: {
      '@type': 'Person',
      name: author?.name ?? site.name,
      jobTitle: author?.role,
      worksFor: { '@id': `${site.url}/#organization` },
    },
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export function buildCaseStudySchema(study: CaseStudy) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.metaTitle,
    description: study.metaDescription,
    url: abs(`/portfolio/${study.slug}`),
    mainEntityOfPage: abs(`/portfolio/${study.slug}`),
    image: abs(study.coverImage),
    articleSection: study.industry,
    author: { '@id': `${site.url}/#organization` },
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export function buildOfferCatalogSchema(tiers: PricingTier[], blocks: PricingBlock[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${site.name} Services & Pricing`,
    url: abs('/pricing'),
    itemListElement: [
      ...tiers.map((tier) => ({
        '@type': 'Offer',
        name: tier.name,
        price: tier.price,
        priceCurrency: 'USD',
        description: tier.blurb,
      })),
      ...blocks.map((block) => ({
        '@type': 'Offer',
        name: block.name,
        price: block.startingAt,
        priceCurrency: 'USD',
        description: `${block.blurb} (${block.unit})`,
      })),
    ],
  };
}
