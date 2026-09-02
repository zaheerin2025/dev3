import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';
import { seedDefaultData } from '@/lib/seed';
import type { Prisma } from '@prisma/client';
import { slugify } from '@/lib/utils';
import { blogPosts } from '@/data/blog-posts';

type PostPayload = {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  category?: unknown;
  image?: unknown;
  authorName?: unknown;
  authorRole?: unknown;
  content?: unknown;
  readTime?: unknown;
  published?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Compute reading time automatically based on word count (~200 wpm) */
function calculateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Ensure slug uniqueness by appending -2, -3, … on conflicts. */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const clean = base || 'post';
  let candidate = clean;
  for (let n = 2; ; n += 1) {
    const existing = await db.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${clean}-${n}`;
  }
}

/** GET /api/admin/posts — 3-tier fail-safe retrieval (Prisma -> Raw SQL -> Static Fallback). */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  // Migrate legacy 2025 dates in Neon DB to current date
  await db.$executeRawUnsafe(`UPDATE "Post" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" < '2026-01-01'`).catch(() => null);

  // Tier 1: Try Prisma ORM query
  try {
    const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } });
    if (posts && posts.length > 0) {
      return NextResponse.json({ ok: true, posts });
    }
  } catch (err) {
    console.warn('[admin/posts] Prisma findMany failed, trying raw SQL fallback:', err);
  }

  // Tier 2: Try Raw PostgreSQL query
  try {
    const rawPosts = await db.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "Post" ORDER BY "createdAt" DESC`
    );
    if (rawPosts && rawPosts.length > 0) {
      const posts = rawPosts.map((r) => ({
        id: String(r.id ?? r.slug ?? ''),
        slug: String(r.slug ?? ''),
        title: String(r.title ?? ''),
        excerpt: String(r.excerpt ?? ''),
        category: String(r.category ?? 'General'),
        image: typeof r.image === 'string' ? r.image : null,
        authorName: String(r.authorName ?? 'Developers3 Team'),
        authorRole: String(r.authorRole ?? 'Contributor'),
        content: String(r.content ?? ''),
        readTime: Number(r.readTime) || 5,
        published: Boolean(r.published),
        metaTitle: typeof r.metaTitle === 'string' ? r.metaTitle : null,
        metaDescription: typeof r.metaDescription === 'string' ? r.metaDescription : null,
        createdAt: r.createdAt ? new Date(r.createdAt as string).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt as string).toISOString() : new Date().toISOString(),
      }));
      return NextResponse.json({ ok: true, posts });
    }
  } catch (err) {
    console.warn('[admin/posts] Raw SQL query failed, returning static fallback:', err);
  }

  // Tier 3: Return static blog posts fallback
  const fallbackPosts = blogPosts.map((p) => ({
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

  return NextResponse.json({ ok: true, posts: fallbackPosts });
}

async function ensurePostColumns(): Promise<void> {
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;`);
    await db.$executeRawUnsafe(`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;`);
  } catch (e) {
    console.warn('[admin/posts] ensurePostColumns warning:', e);
  }
}

/** POST /api/admin/posts — create. Title/excerpt/content required. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    await ensurePostColumns();
    const body = (await request.json().catch(() => null)) as PostPayload | null;
    const title = str(body?.title);
    const excerpt = str(body?.excerpt);
    const content = str(body?.content);
    const category = str(body?.category) || 'General';
    const image = str(body?.image) || null;
    const authorName = str(body?.authorName) || 'Developers3 Team';
    const authorRole = str(body?.authorRole) || 'Contributor';
    const metaTitle = str(body?.metaTitle) || null;
    const metaDescription = str(body?.metaDescription) || null;

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { ok: false, error: 'Title, excerpt and content are required.' },
        { status: 400 }
      );
    }

    const readTimeRaw = Number(body?.readTime);
    const readTime = Number.isFinite(readTimeRaw) && readTimeRaw > 0 ? Math.round(readTimeRaw) : calculateReadTime(content);
    const published = body?.published === undefined ? true : Boolean(body?.published);
    const slug = await uniqueSlug(slugify(str(body?.slug) || title));
    const newId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Tier 1: Try Prisma ORM create
    try {
      const post = await db.post.create({
        data: {
          id: newId,
          slug,
          title,
          excerpt,
          category,
          image,
          authorName,
          authorRole,
          content,
          readTime,
          published,
          metaTitle,
          metaDescription,
        },
      });
      return NextResponse.json({ ok: true, post }, { status: 201 });
    } catch (err) {
      console.warn('[admin/posts] Prisma create failed, trying raw SQL fallback:', err);
    }

    // Tier 2: Try Raw PostgreSQL insert
    await db.$executeRawUnsafe(
      `INSERT INTO "Post" ("id", "slug", "title", "excerpt", "category", "image", "authorName", "authorRole", "content", "readTime", "published", "metaTitle", "metaDescription", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      newId,
      slug,
      title,
      excerpt,
      category,
      image,
      authorName,
      authorRole,
      content,
      readTime,
      published,
      metaTitle,
      metaDescription
    );

    const post = {
      id: newId,
      slug,
      title,
      excerpt,
      category,
      image,
      authorName,
      authorRole,
      content,
      readTime,
      published,
      metaTitle,
      metaDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin/posts] POST failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** PUT /api/admin/posts — update by body.id or slug (creates if not in DB). */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    await ensurePostColumns();
    const body = (await request.json().catch(() => null)) as PostPayload | null;
    const id = str(body?.id);
    const title = str(body?.title);
    const excerpt = str(body?.excerpt);
    const content = str(body?.content);
    const category = str(body?.category) || 'General';
    const image = body?.image !== undefined ? (str(body?.image) || null) : null;
    const authorName = str(body?.authorName) || 'Developers3 Team';
    const authorRole = str(body?.authorRole) || 'Contributor';
    const metaTitle = body?.metaTitle !== undefined ? (str(body?.metaTitle) || null) : null;
    const metaDescription = body?.metaDescription !== undefined ? (str(body?.metaDescription) || null) : null;
    const readTime = Number.isFinite(Number(body?.readTime)) && Number(body?.readTime) > 0 ? Math.round(Number(body?.readTime)) : calculateReadTime(content);
    const published = body?.published === undefined ? true : Boolean(body?.published);

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { ok: false, error: 'Title, excerpt and content are required.' },
        { status: 400 }
      );
    }

    const targetSlug = slugify(str(body?.slug) || title);
    const targetId = id || targetSlug;

    // Tier 1: Try Prisma ORM update / upsert
    try {
      let existing = id ? await db.post.findFirst({ where: { OR: [{ id }, { slug: id }, { slug: targetSlug }] } }).catch(() => null) : null;
      if (existing) {
        const post = await db.post.update({
          where: { id: existing.id },
          data: {
            title,
            excerpt,
            content,
            category,
            image: image !== null ? image : existing.image,
            authorName,
            authorRole,
            readTime,
            published,
            metaTitle,
            metaDescription,
          },
        });
        return NextResponse.json({ ok: true, post });
      } else {
        const post = await db.post.create({
          data: {
            id: targetId,
            slug: targetSlug,
            title,
            excerpt,
            category,
            image,
            authorName,
            authorRole,
            content,
            readTime,
            published,
            metaTitle,
            metaDescription,
          },
        });
        return NextResponse.json({ ok: true, post });
      }
    } catch (err) {
      console.warn('[admin/posts] Prisma PUT failed, trying raw SQL fallback:', err);
    }

    // Tier 2: Direct Raw PostgreSQL UPSERT
    await db.$executeRawUnsafe(
      `INSERT INTO "Post" ("id", "slug", "title", "excerpt", "category", "image", "authorName", "authorRole", "content", "readTime", "published", "metaTitle", "metaDescription", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("slug") DO UPDATE SET
         "title" = EXCLUDED."title",
         "excerpt" = EXCLUDED."excerpt",
         "content" = EXCLUDED."content",
         "category" = EXCLUDED."category",
         "image" = EXCLUDED."image",
         "authorName" = EXCLUDED."authorName",
         "authorRole" = EXCLUDED."authorRole",
         "readTime" = EXCLUDED."readTime",
         "published" = EXCLUDED."published",
         "metaTitle" = EXCLUDED."metaTitle",
         "metaDescription" = EXCLUDED."metaDescription",
         "updatedAt" = CURRENT_TIMESTAMP`,
      targetId,
      targetSlug,
      title,
      excerpt,
      category,
      image,
      authorName,
      authorRole,
      content,
      readTime,
      published,
      metaTitle,
      metaDescription
    );

    const post = {
      id: targetId,
      slug: targetSlug,
      title,
      excerpt,
      category,
      image,
      authorName,
      authorRole,
      content,
      readTime,
      published,
      metaTitle,
      metaDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin/posts] PUT failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** DELETE /api/admin/posts?id=… — delete a post. */
export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const id = request.nextUrl.searchParams.get('id') ?? '';
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Post id is required.' }, { status: 400 });
    }

    try {
      await db.post.deleteMany({ where: { OR: [{ id }, { slug: id }] } });
      return NextResponse.json({ ok: true });
    } catch {
      await db.$executeRawUnsafe(`DELETE FROM "Post" WHERE "id" = $1 OR "slug" = $1`, id);
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin/posts] DELETE failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
