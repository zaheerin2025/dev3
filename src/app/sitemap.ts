import type { MetadataRoute } from 'next';
import { blogPosts, caseStudies, services } from '@/data';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/portfolio`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${site.url}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const servicePaths: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${site.url}/${service.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const caseStudyPaths: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${site.url}/portfolio/${study.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const blogPaths: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPaths, ...servicePaths, ...caseStudyPaths, ...blogPaths];
}
