import { NextRequest, NextResponse } from 'next/server';
import { expectedAdminToken } from '@/lib/admin-auth';

/**
 * POST /api/admin/auth — simple passcode login.
 * Body: { passcode: string } → { ok: true, token } | 401 { ok: false }.
 * The token is the expected passcode value (ADMIN_PASSCODE env, default
 * 'developers3-admin'); clients send it back as the `x-admin-token` header.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { passcode?: unknown } | null;
    const passcode = typeof body?.passcode === 'string' ? body.passcode : '';

    if (!passcode || passcode !== expectedAdminToken()) {
      return NextResponse.json({ ok: false, error: 'Invalid passcode.' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, token: expectedAdminToken() });
  } catch (error) {
    console.error('[admin/auth] failed:', error);
    return NextResponse.json({ ok: false, error: 'Authentication failed.' }, { status: 500 });
  }
}
