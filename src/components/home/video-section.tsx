'use client';

import * as React from 'react';
import { Youtube } from 'lucide-react';
import { Editable } from '@/components/admin/editable';
import { Sticker } from '@/components/common/sticker';
import { useSiteSettings } from '@/lib/use-site-settings';
import { effectiveValue } from '@/lib/content-schema';
import { trackEvent } from '@/lib/analytics';

/** Extract the video ID from any common YouTube URL shape, or ''. */
function youTubeId(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{6,20})/i,
    /(?:youtu\.be\/)([\w-]{6,20})/i,
    /(?:youtube\.com\/shorts\/)([\w-]{6,20})/i,
    /(?:youtube\.com\/embed\/)([\w-]{6,20})/i,
    /(?:youtube\.com\/live\/)([\w-]{6,20})/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  // Bare ID pasted directly.
  return /^[\w-]{11}$/.test(value) ? value : '';
}

/**
 * "Latest video" — the newest upload from the Developers3 YouTube channel.
 * The URL is managed from the admin panel (Site Content → YouTube video).
 * When no video URL is saved the whole section stays hidden — no stubs.
 */
export function VideoSection() {
  const settings = useSiteSettings((s) => s.settings);
  const title = effectiveValue(settings, 'video.title') || 'Fresh From Our YouTube Channel';
  const videoId = youTubeId(effectiveValue(settings, 'video.latestUrl'));

  if (!videoId) return null;

  // Last two words get the gradient — but only when there are enough words.
  const words = title.split(' ');
  const head = words.length > 2 ? words.slice(0, -2).join(' ') : '';
  const tail = words.length > 2 ? words.slice(-2).join(' ') : title;

  return (
    <section aria-labelledby="latest-video-heading" className="section-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Sticker>▶ Latest Video</Sticker>
          <Editable id="video.title">
            <h2
              id="latest-video-heading"
              className="text-balance font-display text-3xl font-bold tracking-tight text-[#0a0a0a] sm:text-4xl lg:text-5xl"
            >
              {head ? `${head} ` : ''}
              <span className="text-gradient">{tail}</span>
            </h2>
          </Editable>
        </div>

        <div className="gradient-border mt-10 overflow-hidden rounded-[24px] bg-[#0a0a0a] shadow-[0_32px_64px_-32px_rgb(5_150_105/0.35)]">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              title={`${title} — Developers3 on YouTube`}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <a
            href="https://www.youtube.com/results?search_query=developers3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('youtube_click', { location: 'video_section' })}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:border-[#0a0a0a] hover:text-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Youtube className="size-4.5 text-red-600" aria-hidden="true" />
            Watch on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
