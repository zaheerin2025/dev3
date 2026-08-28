import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const subscribeSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX, 'Valid email is required').max(200),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const existing = await db.newsletterSubscriber.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ ok: true, message: "You're already subscribed — see you in the next issue!" });
    }

    await db.newsletterSubscriber.create({ data: { email } });
    console.log(`[newsletter] new subscriber: ${email}`);

    return NextResponse.json({ ok: true, message: 'Welcome aboard — one useful email a month, no spam.' });
  } catch (error) {
    console.error('[newsletter] failed to subscribe:', error);
    return NextResponse.json(
      { ok: false, error: 'Subscription failed. Please try again later.' },
      { status: 500 }
    );
  }
}
