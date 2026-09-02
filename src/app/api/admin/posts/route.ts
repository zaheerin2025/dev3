import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';
import { seedDefaultData } from '@/lib/seed';
import type { Prisma } from '@prisma/client';
import { slugify } from '@/lib/utils';

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

/** GET /api/admin/posts — all posts, newest first. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    await seedDefaultData();
    const posts = await db.post.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin/posts] GET failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** POST /api/admin/posts — create. Title/excerpt/content required. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
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

    if (title.length > 300 || excerpt.length > 500 || content.length > 100_000) {
      return NextResponse.json(
        { ok: false, error: 'Field length exceeded (title: 300, excerpt: 500, content: 100,000).' },
        { status: 400 }
      );
    }

    const readTimeRaw = Number(body?.readTime);
    const readTime = Number.isFinite(readTimeRaw) && readTimeRaw > 0 ? Math.round(readTimeRaw) : calculateReadTime(content);
    const published = body?.published === undefined ? true : Boolean(body?.published);
    const slug = await uniqueSlug(slugify(str(body?.slug) || title));

    const post = await db.post.create({
      data: {
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
  } catch (error) {
    console.error('[admin/posts] POST failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not create the post.' }, { status: 500 });
  }
}

/** PUT /api/admin/posts — update by body.id. */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => null)) as PostPayload | null;
    const id = str(body?.id);
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Post id is required.' }, { status: 400 });
    }

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Post not found.' }, { status: 404 });
    }

    const title = str(body?.title);
    const excerpt = str(body?.excerpt);
    const content = str(body?.content);
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { ok: false, error: 'Title, excerpt and content are required.' },
        { status: 400 }
      );
    }

    if (title.length > 300 || excerpt.length > 500 || content.length > 100_000) {
      return NextResponse.json(
        { ok: false, error: 'Field length exceeded (title: 300, excerpt: 500, content: 100,000).' },
        { status: 400 }
      );
    }

    const data: Prisma.PostUpdateInput = {
      title,
      excerpt,
      content,
      category: str(body?.category) || existing.category,
      image: body?.image !== undefined ? (str(body?.image) || null) : existing.image,
      authorName: str(body?.authorName) || existing.authorName,
      authorRole: str(body?.authorRole) || existing.authorRole,
      readTime:
        Number.isFinite(Number(body?.readTime)) && Number(body?.readTime) > 0
          ? Math.round(Number(body?.readTime))
          : calculateReadTime(content),
      published: body?.published === undefined ? existing.published : Boolean(body?.published),
      metaTitle: body?.metaTitle !== undefined ? (str(body?.metaTitle) || null) : existing.metaTitle,
      metaDescription: body?.metaDescription !== undefined ? (str(body?.metaDescription) || null) : existing.metaDescription,
    };

    const requestedSlug = str(body?.slug);
    if (requestedSlug && slugify(requestedSlug) !== existing.slug) {
      data.slug = await uniqueSlug(slugify(requestedSlug) || existing.slug, id);
    }

    const post = await db.post.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    console.error('[admin/posts] PUT failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not update the post.' }, { status: 500 });
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

    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Post not found.' }, { status: 404 });
    }

    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/posts] DELETE failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not delete the post.' }, { status: 500 });
  }
}
