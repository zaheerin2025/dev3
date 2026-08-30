import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';

/**
 * Admin leads inbox.
 *  GET    /api/admin/leads            → newest 200 leads + all subscribers
 *  PATCH  /api/admin/leads {id,read}  → toggle a lead's read state
 *  DELETE /api/admin/leads?id=&type=  → remove a lead or a subscriber
 */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const [leads, subscribers] = await Promise.all([
      db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      db.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }),
    ]);
    return NextResponse.json({ ok: true, leads, subscribers });
  } catch (error) {
    console.error('[admin/leads] GET failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load leads.' }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().min(1).max(64),
  read: z.boolean(),
});

/** PATCH — mark a lead read/unread. */
export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    }
    const { id, read } = parsed.data;
    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Lead not found.' }, { status: 404 });
    }
    await db.lead.update({ where: { id }, data: { read } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/leads] PATCH failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not update the lead.' }, { status: 500 });
  }
}

/** DELETE — remove a lead (?type=lead) or a newsletter subscriber (?type=subscriber). */
export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const id = request.nextUrl.searchParams.get('id') ?? '';
    const type = request.nextUrl.searchParams.get('type') ?? 'lead';
    if (!id || id.length > 64 || (type !== 'lead' && type !== 'subscriber')) {
      return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    }
    if (type === 'lead') {
      await db.lead.delete({ where: { id } });
    } else {
      await db.newsletterSubscriber.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/leads] DELETE failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not delete.' }, { status: 500 });
  }
}
