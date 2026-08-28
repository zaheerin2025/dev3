import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';
import type { Prisma } from '@prisma/client';

type PostPayload = {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  category?: unknown;
  image?: unknown;
  content?: unknown;
  readTime?: unknown;
  published?: unknown;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** URL-safe slug: lowercase, alphanumerics and single dashes. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);
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
    const posts = await db.post.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    console.error('[admin/posts] GET failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load posts.' }, { status: 500 });
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

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { ok: false, error: 'Title, excerpt and content are required.' },
        { status: 400 }
      );
    }

    const readTimeRaw = Number(body?.readTime);
    const readTime = Number.isFinite(readTimeRaw) && readTimeRaw > 0 ? Math.round(readTimeRaw) : 5;
    const published = body?.published === undefined ? true : Boolean(body?.published);
    const slug = await uniqueSlug(slugify(str(body?.slug) || title));

    const post = await db.post.create({
      data: { slug, title, excerpt, category, image, content, readTime, published },
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

    const data: Prisma.PostUpdateInput = {
      title,
      excerpt,
      content,
      category: str(body?.category) || existing.category,
      image: str(body?.image) || null,
      readTime:
        Number.isFinite(Number(body?.readTime)) && Number(body?.readTime) > 0
          ? Math.round(Number(body?.readTime))
          : existing.readTime,
      published: body?.published === undefined ? existing.published : Boolean(body?.published),
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
