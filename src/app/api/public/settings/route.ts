import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** GET /api/public/settings — all Setting rows as a plain key/value object. */
export async function GET() {
  try {
    const rows = await db.setting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key] = row.value;
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error('[public/settings] GET failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load settings.' }, { status: 500 });
  }
}
