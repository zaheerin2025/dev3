import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedDefaultData } from '@/lib/seed';
import { blogPosts } from '@/data/blog-posts';

function staticPostFallback(slug?: string | null) {
  const filtered = slug
    ? blogPosts.filter((p) => p.slug === slug)
    : blogPosts;
  return filtered.map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    image: null,
    authorName: p.authorId === 'alex-morgan' ? 'Alex Morgan' : p.authorId === 'priya-sharma' ? 'Priya Sharma' : 'Sofia Alvarez',
    authorRole: p.authorId === 'alex-morgan' ? 'Lead Web Architect' : p.authorId === 'priya-sharma' ? 'Senior Full-Stack Engineer' : 'Head of E-commerce',
    content: p.sections.map((s) => `${s.heading ? `## ${s.heading}\n\n` : ''}${s.paragraphs.join('\n\n')}`).join('\n\n'),
    readTime: parseInt(p.readTime) || 5,
    published: true,
    metaTitle: p.title,
    metaDescription: p.excerpt,
    createdAt: p.date,
    updatedAt: p.date,
  }));
}

/**
 * GET /api/public/posts — published posts, newest first.
 * Optional ?slug=… returns at most that one post (still an array).
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  try {
    // Migrate legacy 2025 dates & author names in Neon DB to current standards
    await db.$executeRawUnsafe(`UPDATE "Post" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" < '2026-01-01'`).catch(() => null);
    await db.$executeRawUnsafe(`UPDATE "Post" SET "authorName" = 'Alex Morgan', "authorRole" = 'Lead Web Architect' WHERE "slug" = 'how-much-does-a-website-cost'`).catch(() => null);
    await db.$executeRawUnsafe(`UPDATE "Post" SET "authorName" = 'Priya Sharma', "authorRole" = 'Senior Full-Stack Engineer' WHERE "slug" = 'custom-website-vs-wordpress'`).catch(() => null);
    await db.$executeRawUnsafe(`UPDATE "Post" SET "authorName" = 'Sofia Alvarez', "authorRole" = 'Head of E-commerce' WHERE "slug" = 'shopify-vs-woocommerce'`).catch(() => null);
    await db.$executeRawUnsafe(`UPDATE "Post" SET "authorName" = 'Priya Sharma', "authorRole" = 'Senior Full-Stack Engineer' WHERE "slug" = 'flutter-vs-react-native'`).catch(() => null);

    const posts = await db.post.findMany({
      where: { published: true, ...(slug ? { slug } : {}) },
      orderBy: { createdAt: 'desc' },
      ...(slug ? { take: 1 } : {}),
    });
    if (posts && posts.length > 0) {
      return NextResponse.json({ ok: true, posts });
    }
    return NextResponse.json({ ok: true, posts: staticPostFallback(slug) });
  } catch (error) {
    console.error('[public/posts] GET DB error, returning static posts fallback:', error);
    return NextResponse.json({ ok: true, posts: staticPostFallback(slug) });
  }
}
