import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** GET /api/public/portfolios — published portfolio items, admin ordering. */
export async function GET() {
  try {
    const portfolios = await db.portfolio.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        category: true,
        imageUrl: true,
      },
    });
    return NextResponse.json(
      { ok: true, portfolios },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[public/portfolios] GET failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not load portfolio items.' },
      { status: 500 }
    );
  }
}
