import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().regex(EMAIL_REGEX, 'Valid email is required').max(200),
  phone: z.string().trim().max(40).optional().default(''),
  service: z.string().trim().max(120).optional().default(''),
  budget: z.string().trim().max(60).optional().default(''),
  message: z.string().trim().min(10, 'Please add some detail').max(5000),
  source: z.string().trim().max(120).optional().default('contact'),
  website: z.string().optional().default(''), // honeypot — must stay empty
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Please check the highlighted fields and try again.' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Honeypot filled → silently accept without storing (bot trap).
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const lead = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        service: data.service || null,
        budget: data.budget || null,
        message: data.message,
        source: data.source || 'contact',
      },
    });

    // Server-side log so leads are visible even without an inbox hookup.
    console.log(`[lead] #${lead.id} "${data.name}" <${data.email}> service=${data.service || '—'} source=${data.source}`);

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error('[leads] failed to store lead:', error);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong on our side. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}
