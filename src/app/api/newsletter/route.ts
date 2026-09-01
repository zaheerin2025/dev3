import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { rateLimitOr429 } from '@/lib/api-security';
import { EMAIL_REGEX } from '@/lib/utils';

const subscriberSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX, 'Valid email is required').max(200),
});

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimitOr429(request, 'newsletter', 5, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: 'Too many subscription attempts. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = subscriberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    console.log(`[newsletter] Subscribed <${email}> (${subscriber.id})`);

    return NextResponse.json({ ok: true, id: subscriber.id });
  } catch (error) {
    console.error('[newsletter] POST failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
