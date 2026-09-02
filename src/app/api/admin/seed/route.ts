import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { blogPosts } from '@/data/blog-posts';

function formatPostContent(post: typeof blogPosts[number]): string {
  const parts: string[] = [];
  for (const section of post.sections) {
    if (section.heading) {
      parts.push(`## ${section.heading}`);
    }
    for (const paragraph of section.paragraphs) {
      parts.push(paragraph);
    }
    if (section.bullets && section.bullets.length > 0) {
      parts.push(section.bullets.map((b) => `- ${b}`).join('\n'));
    }
  }
  return parts.join('\n\n');
}

const DEFAULT_PORTFOLIO_ITEMS = [
  {
    title: 'Lumina Boutique — E-Commerce Platform',
    url: 'https://developers3.com/portfolio/lumina-boutique',
    description: 'High-converting Shopify e-commerce store with automated email flows, instant search, and localized checkout.',
    category: 'E-Commerce',
    imageUrl: '/images/portfolio/lumina-boutique.png',
    order: 1,
    published: true,
  },
  {
    title: 'Meridian Dental — Patient Portal & Booking',
    url: 'https://developers3.com/portfolio/meridian-dental',
    description: 'Custom Next.js clinic website with online booking, SMS appointment reminders, and patient intake forms.',
    category: 'Website',
    imageUrl: '/images/portfolio/meridian-dental.png',
    order: 2,
    published: true,
  },
  {
    title: 'PulseFit — Health & Fitness Tracker App',
    url: 'https://developers3.com/portfolio/pulsefit',
    description: 'Cross-platform Flutter mobile app featuring workout tracking, real-time metrics, and Apple Health / Google Fit sync.',
    category: 'Mobile App',
    imageUrl: '/images/portfolio/pulsefit.png',
    order: 3,
    published: true,
  },
  {
    title: 'Vantage Realty — Interactive Property Search',
    url: 'https://developers3.com/portfolio/vantage-realty',
    description: 'Real estate portal with map-based property search, virtual tours, and automated lead routing.',
    category: 'Website',
    imageUrl: '/images/portfolio/vantage-realty.png',
    order: 4,
    published: true,
  },
];

/** POST /api/admin/seed — seed default blog posts and portfolio items into the database. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const errors: string[] = [];
  let postsSeeded = 0;
  let portfoliosSeeded = 0;

  // Seed blog posts with upsert
  for (const p of blogPosts) {
    const authorName =
      p.authorId === 'alex-morgan'
        ? 'Alex Morgan'
        : p.authorId === 'priya-sharma'
        ? 'Priya Sharma'
        : 'Sofia Alvarez';
    const authorRole =
      p.authorId === 'alex-morgan'
        ? 'Lead Web Architect'
        : p.authorId === 'priya-sharma'
        ? 'Senior Full-Stack Engineer'
        : 'Head of E-commerce';

    const postData = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      image: null,
      authorName,
      authorRole,
      content: formatPostContent(p),
      readTime: parseInt(p.readTime) || 5,
      published: true,
      createdAt: new Date(p.date),
    };

    try {
      await db.post.upsert({
        where: { slug: p.slug },
        update: {},
        create: postData,
      });
      postsSeeded += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[seed] Failed to upsert post "${p.slug}":`, msg);
      errors.push(`Post "${p.slug}": ${msg}`);
    }
  }

  // Seed portfolio items
  for (const item of DEFAULT_PORTFOLIO_ITEMS) {
    try {
      const existing = await db.portfolio.findFirst({ where: { url: item.url } });
      if (!existing) {
        await db.portfolio.create({ data: item });
        portfoliosSeeded += 1;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[seed] Failed to create portfolio "${item.title}":`, msg);
      errors.push(`Portfolio "${item.title}": ${msg}`);
    }
  }

  if (errors.length > 0 && postsSeeded === 0) {
    return NextResponse.json(
      { ok: false, error: 'Seeding failed', details: errors },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, postsSeeded, portfoliosSeeded, errors });
}
