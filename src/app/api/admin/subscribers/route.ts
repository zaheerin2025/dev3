import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';

/** GET /api/admin/subscribers — list all newsletter subscribers, newest first. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ok: true, subscribers });
  } catch (error) {
    console.error('[admin/subscribers] GET failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not load subscribers.' },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/subscribers?id=… — remove a subscriber. */
export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const id = request.nextUrl.searchParams.get('id') ?? '';
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Subscriber id is required.' }, { status: 400 });
    }

    await db.newsletterSubscriber.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/subscribers] DELETE failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not delete subscriber.' },
      { status: 500 }
    );
  }
}
