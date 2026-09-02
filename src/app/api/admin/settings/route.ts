import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';

/** Only allow safe characters in setting keys. */
const SAFE_KEY_RE = /^[a-zA-Z0-9._-]+$/;

/** GET /api/admin/settings — every Setting row as a plain key/value object. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const rows = await db.setting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key] = row.value;
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error('[admin/settings] GET failed:', error);
    return NextResponse.json({ ok: true, settings: {} });
  }
}

type SettingEntry = { key?: unknown; value?: unknown };

/**
 * PUT /api/admin/settings — upsert a batch of entries.
 * Body: { entries: [{ key, value }] } — max 40 entries, values max 8000 chars.
 */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => null)) as { entries?: unknown } | null;
    const entries = Array.isArray(body?.entries) ? (body?.entries as SettingEntry[]) : null;

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'entries array is required.' },
        { status: 400 }
      );
    }
    if (entries.length > 40) {
      return NextResponse.json(
        { ok: false, error: 'Too many entries (max 40 per request).' },
        { status: 400 }
      );
    }

    const clean: { key: string; value: string }[] = [];
    for (const entry of entries) {
      const key = typeof entry?.key === 'string' ? entry.key.trim() : '';
      const value = typeof entry?.value === 'string' ? entry.value : '';
      if (!key || key.length > 120 || !SAFE_KEY_RE.test(key)) {
        return NextResponse.json(
          { ok: false, error: `Invalid key "${key.slice(0, 30)}…". Keys must be 1-120 alphanumeric characters with dots, underscores, or hyphens.` },
          { status: 400 }
        );
      }
      if (value.length > 8000) {
        return NextResponse.json(
          { ok: false, error: `Value for "${key}" exceeds 8000 characters.` },
          { status: 400 }
        );
      }
      clean.push({ key, value });
    }

    await db.$transaction(
      clean.map((entry) =>
        db.setting.upsert({
          where: { key: entry.key },
          update: { value: entry.value },
          create: { key: entry.key, value: entry.value },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/settings] PUT failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save settings.' }, { status: 500 });
  }
}
