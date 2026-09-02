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

async function ensureTablesExist(): Promise<string[]> {
  const ddlErrors: string[] = [];

  const tableDDLs = [
    `CREATE TABLE IF NOT EXISTS "Lead" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "service" TEXT,
      "budget" TEXT,
      "timeline" TEXT,
      "message" TEXT NOT NULL,
      "source" TEXT NOT NULL DEFAULT 'contact',
      "read" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");`,
    `CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "NewsletterSubscriber_email_key" UNIQUE ("email")
    );`,
    `CREATE TABLE IF NOT EXISTS "Post" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "excerpt" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "image" TEXT,
      "authorName" TEXT NOT NULL DEFAULT 'Developers3 Team',
      "authorRole" TEXT NOT NULL DEFAULT 'Contributor',
      "content" TEXT NOT NULL,
      "readTime" INTEGER NOT NULL DEFAULT 5,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "metaTitle" TEXT,
      "metaDescription" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Post_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Post_slug_key" UNIQUE ("slug")
    );`,
    `CREATE INDEX IF NOT EXISTS "Post_published_createdAt_idx" ON "Post"("published","createdAt");`,
    `CREATE TABLE IF NOT EXISTS "Setting" (
      "key" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
    );`,
    `CREATE TABLE IF NOT EXISTS "Portfolio" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'Website',
      "imageUrl" TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE INDEX IF NOT EXISTS "Portfolio_published_order_idx" ON "Portfolio"("published","order");`,
  ];

  for (const ddl of tableDDLs) {
    try {
      await db.$executeRawUnsafe(ddl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[seed] Table DDL error:', msg);
      ddlErrors.push(msg);
    }
  }

  return ddlErrors;
}

/** POST /api/admin/seed — auto-creates missing tables then seeds default blog posts and portfolio items. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const errors: string[] = [];

  // Step 1: Automatically ensure tables exist in Neon PostgreSQL
  const ddlErrors = await ensureTablesExist();
  if (ddlErrors.length > 0) {
    errors.push(...ddlErrors);
  }

  let postsSeeded = 0;
  let portfoliosSeeded = 0;

  // Step 2: Seed blog posts with upsert
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

  // Step 3: Seed portfolio items
  for (const item of DEFAULT_PORTFOLIO_ITEMS) {
    try {
      const existing = await db.portfolio.findFirst({ where: { url: item.url } }).catch(() => null);
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
