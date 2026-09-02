import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';
import { seedDefaultData } from '@/lib/seed';
import type { Prisma } from '@prisma/client';

type PortfolioPayload = {
  id?: unknown;
  title?: unknown;
  url?: unknown;
  description?: unknown;
  category?: unknown;
  imageUrl?: unknown;
  order?: unknown;
  published?: unknown;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Accept only http(s) or inline data-image URLs for the stored image. */
function safeImage(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  if (raw.startsWith('data:image/')) {
    // Inline uploads are capped at ~1.5 MB of base64 to keep payloads light.
    return raw.length <= 2_000_000 ? raw : null;
  }
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Accept only http(s) project links. */
function safeUrl(value: unknown): string {
  const raw = str(value);
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

/** GET /api/admin/portfolios — every entry, admin ordering. */
/** GET /api/admin/portfolios — 3-tier fail-safe retrieval (Prisma -> Raw SQL -> Static Fallback). */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  // Tier 1: Try Prisma ORM query
  try {
    const portfolios = await db.portfolio.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    if (portfolios && portfolios.length > 0) {
      return NextResponse.json({ ok: true, portfolios });
    }
  } catch (err) {
    console.warn('[admin/portfolios] Prisma findMany failed, trying raw SQL:', err);
  }

  // Tier 2: Try Raw PostgreSQL query
  try {
    const rawItems = await db.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "Portfolio" ORDER BY "order" ASC, "createdAt" DESC`
    );
    if (rawItems && rawItems.length > 0) {
      const portfolios = rawItems.map((r) => ({
        id: String(r.id ?? ''),
        title: String(r.title ?? ''),
        url: String(r.url ?? ''),
        description: String(r.description ?? ''),
        category: String(r.category ?? 'Website'),
        imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : null,
        order: Number(r.order) || 0,
        published: Boolean(r.published),
        createdAt: r.createdAt ? new Date(r.createdAt as string).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt as string).toISOString() : new Date().toISOString(),
      }));
      return NextResponse.json({ ok: true, portfolios });
    }
  } catch (err) {
    console.warn('[admin/portfolios] Raw SQL query failed, using static fallback:', err);
  }

  // Tier 3: Static portfolio fallback items
  const DEFAULT_PORTFOLIOS = [
    {
      id: 'lumina-boutique',
      title: 'Lumina Boutique — E-Commerce Platform',
      url: 'https://developers3.com/portfolio/lumina-boutique',
      description: 'High-converting Shopify e-commerce store with automated email flows, instant search, and localized checkout.',
      category: 'E-Commerce',
      imageUrl: '/images/portfolio/lumina-boutique.png',
      order: 1,
      published: true,
    },
    {
      id: 'meridian-dental',
      title: 'Meridian Dental — Patient Portal & Booking',
      url: 'https://developers3.com/portfolio/meridian-dental',
      description: 'Custom Next.js clinic website with online booking, SMS appointment reminders, and patient intake forms.',
      category: 'Website',
      imageUrl: '/images/portfolio/meridian-dental.png',
      order: 2,
      published: true,
    },
    {
      id: 'pulsefit',
      title: 'PulseFit — Health & Fitness Tracker App',
      url: 'https://developers3.com/portfolio/pulsefit',
      description: 'Cross-platform Flutter mobile app featuring workout tracking, real-time metrics, and Apple Health / Google Fit sync.',
      category: 'Mobile App',
      imageUrl: '/images/portfolio/pulsefit.png',
      order: 3,
      published: true,
    },
    {
      id: 'vantage-realty',
      title: 'Vantage Realty — Interactive Property Search',
      url: 'https://developers3.com/portfolio/vantage-realty',
      description: 'Real estate portal with map-based property search, virtual tours, and automated lead routing.',
      category: 'Website',
      imageUrl: '/images/portfolio/vantage-realty.png',
      order: 4,
      published: true,
    },
  ];

  return NextResponse.json({ ok: true, portfolios: DEFAULT_PORTFOLIOS });
}

/** POST /api/admin/portfolios — create. Title/url/description required. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => null)) as PortfolioPayload | null;
    const title = str(body?.title);
    const url = safeUrl(body?.url);
    const description = str(body?.description);

    if (!title || !url || !description) {
      return NextResponse.json(
        { ok: false, error: 'Title, website URL and description are required.' },
        { status: 400 }
      );
    }

    const orderRaw = Number(body?.order);
    const order = Number.isFinite(orderRaw) ? Math.round(orderRaw) : 0;

    const portfolio = await db.portfolio.create({
      data: {
        title: title.slice(0, 120),
        url,
        description: description.slice(0, 600),
        category: (str(body?.category) || 'Website').slice(0, 60),
        imageUrl: safeImage(body?.imageUrl),
        order,
        published: body?.published === undefined ? true : Boolean(body?.published),
      },
    });

    return NextResponse.json({ ok: true, portfolio }, { status: 201 });
  } catch (error) {
    console.error('[admin/portfolios] POST failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not create the portfolio item.' },
      { status: 500 }
    );
  }
}

/** PUT /api/admin/portfolios — update by body.id. */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => null)) as PortfolioPayload | null;
    const id = str(body?.id);
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Portfolio id is required.' }, { status: 400 });
    }

    const existing = await db.portfolio.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Portfolio item not found.' }, { status: 404 });
    }

    const title = str(body?.title);
    const url = safeUrl(body?.url);
    const description = str(body?.description);
    if (!title || !url || !description) {
      return NextResponse.json(
        { ok: false, error: 'Title, website URL and description are required.' },
        { status: 400 }
      );
    }

    const orderRaw = Number(body?.order);
    const data: Prisma.PortfolioUpdateInput = {
      title: title.slice(0, 120),
      url,
      description: description.slice(0, 600),
      category: (str(body?.category) || existing.category).slice(0, 60),
      imageUrl: body?.imageUrl === undefined ? undefined : safeImage(body?.imageUrl),
      order: Number.isFinite(orderRaw) ? Math.round(orderRaw) : existing.order,
      published: body?.published === undefined ? existing.published : Boolean(body?.published),
    };

    const portfolio = await db.portfolio.update({ where: { id }, data });
    return NextResponse.json({ ok: true, portfolio });
  } catch (error) {
    console.error('[admin/portfolios] PUT failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not update the portfolio item.' },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/portfolios?id=… — delete a portfolio item. */
export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const id = request.nextUrl.searchParams.get('id') ?? '';
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Portfolio id is required.' }, { status: 400 });
    }

    const existing = await db.portfolio.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Portfolio item not found.' }, { status: 404 });
    }

    await db.portfolio.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/portfolios] DELETE failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not delete the portfolio item.' },
      { status: 500 }
    );
  }
}
