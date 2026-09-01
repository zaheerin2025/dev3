import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedDefaultData } from '@/lib/seed';

/**
 * GET /api/public/posts — published posts, newest first.
 * Optional ?slug=… returns at most that one post (still an array).
 */
export async function GET(request: NextRequest) {
  try {
    await seedDefaultData();
    const slug = request.nextUrl.searchParams.get('slug');
    const posts = await db.post.findMany({
      where: { published: true, ...(slug ? { slug } : {}) },
      orderBy: { createdAt: 'desc' },
      ...(slug ? { take: 1 } : {}),
    });
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    console.error('[public/posts] GET failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load posts.' }, { status: 500 });
  }
}
