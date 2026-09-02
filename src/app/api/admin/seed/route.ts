import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { seedDefaultData } from '@/lib/seed';

/** POST /api/admin/seed — populate default blog posts and portfolio items into the database. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const result = await seedDefaultData(true);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[admin/seed] POST failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not seed database.' }, { status: 500 });
  }
}
