'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ────────────────────────────────────────────────────────────────
 * ADSENSE SETUP (one step)
 * ────────────────────────────────────────────────────────────────
 * 1. Add to `.env`:
 *      NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 * 2. Restart the dev server / redeploy.
 *
 * The AdSense loader script (layout.tsx) is injected automatically
 * when the env var exists, and every <AdSlot> below switches from
 * its placeholder to a real responsive ad unit. Create the ad units
 * in your AdSense dashboard and (optionally) map slot IDs in
 * AD_SLOTS below — ads show even without explicit slot IDs, using
 * auto placement.
 * ────────────────────────────────────────────────────────────────
 */

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';

/** Optional: per-placement AdSense ad-unit IDs from your dashboard. */
export const AD_SLOTS: Record<AdFormat, string> = {
  leaderboard: '',
  rectangle: '',
  sidebar: '',
  infeed: '',
};

export type AdFormat = 'leaderboard' | 'rectangle' | 'sidebar' | 'infeed';

const FORMAT_LABEL: Record<AdFormat, string> = {
  leaderboard: 'Advertisement — 728×90 / responsive',
  rectangle: 'Advertisement — 336×280 / responsive',
  sidebar: 'Advertisement — 300×600',
  infeed: 'Advertisement — in-feed',
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ format = 'leaderboard', className }: { format?: AdFormat; className?: string }) {
  React.useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      /* AdSense not ready yet — it will fill on next render */
    }
  }, []);

  if (!ADSENSE_CLIENT) {
    // Neutral, professional placeholder — shows exactly where ads render
    // once NEXT_PUBLIC_ADSENSE_CLIENT is configured.
    return (
      <div
        aria-hidden="true"
        className={cn(
          'flex min-h-[90px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50',
          format === 'sidebar' && 'min-h-[240px]',
          format === 'rectangle' && 'min-h-[140px]',
          className
        )}
      >
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Advertisement
        </span>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-hidden', className)} aria-label={FORMAT_LABEL[format]}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS[format] || undefined}
        data-ad-format={format === 'infeed' ? 'fluid' : 'auto'}
        data-ad-layout-key={format === 'infeed' ? '-fb+5w+4e-db+86' : undefined}
        data-full-width-responsive="true"
      />
    </div>
  );
}
