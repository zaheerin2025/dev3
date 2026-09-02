import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { seedDefaultData } from '@/lib/seed';

/**
 * GET /api/admin/setup — Diagnostic: checks if all DB tables exist
 * POST /api/admin/setup — Creates all tables via Prisma and seeds default data
 */

async function checkTables() {
  const results: Record<string, boolean> = {};
  const tables = ['Lead', 'NewsletterSubscriber', 'Post', 'Setting', 'Portfolio'] as const;

  for (const table of tables) {
    try {
      // Use raw SQL to check if the table exists in PostgreSQL
      const rows = await db.$queryRawUnsafe<{ exists: boolean }[]>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        ) as exists`,
        table.toLowerCase()
      );
      results[table] = rows[0]?.exists ?? false;
    } catch {
      results[table] = false;
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const tables = await checkTables();
    const allExist = Object.values(tables).every(Boolean);
    let postCount = 0;
    let portfolioCount = 0;
    if (tables['Post']) {
      postCount = await db.post.count().catch(() => 0);
    }
    if (tables['Portfolio']) {
      portfolioCount = await db.portfolio.count().catch(() => 0);
    }
    return NextResponse.json({
      ok: true,
      tables,
      allTablesExist: allExist,
      postCount,
      portfolioCount,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      directUrl: process.env.DIRECT_URL ? 'SET' : 'MISSING',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg, tables: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    // Step 1: Create tables using raw SQL DDL (Prisma-compatible schema)
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Lead" (
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
      );
    `);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "NewsletterSubscriber_email_key" UNIQUE ("email")
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Post" (
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
      );
    `);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Post_published_createdAt_idx" ON "Post"("published","createdAt");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Portfolio" (
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
      );
    `);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Portfolio_published_order_idx" ON "Portfolio"("published","order");`);

    // Step 2: Seed default data
    const seedResult = await seedDefaultData(true);

    return NextResponse.json({
      ok: true,
      message: 'Database tables created and seeded successfully.',
      ...seedResult,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin/setup] POST failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
