'use client';

/**
 * Batch: instant calculators (task 23-d) — 20 tools on the shared CalcTool engine.
 * Every tool is a pure CalcConfig: fields in, stats/breakdown/verdict out, live recompute.
 * Slugs MUST match src/data/tools/registry.ts exactly.
 */

import * as React from 'react';
import { CalcTool, money, pct, type CalcConfig } from '../engines/calc-tool';
import type { BatchTool } from '../batch-types';

/* ── local helpers ───────────────────────────────────────────── */

const num = (v: string | undefined): number => {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const fmt = (n: number, d = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('en-US', { maximumFractionDigits: d });

const fmtLen = (s: number) => {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return r ? `${m}m ${r}s` : `${m}m`;
};

const snap = (x: number, ladder: number[]) =>
  ladder.reduce((best, p) => (Math.abs(p - x) < Math.abs(best - x) ? p : best), ladder[0]);

function makeCalc(config: CalcConfig): React.ComponentType {
  return function CalcView() {
    return <CalcTool config={config} />;
  };
}

/* ═══════════════════════════════════════════════════════════════
   1. HOSTING COST COMPARISON
   ═══════════════════════════════════════════════════════════════ */

const HostingCostComparison = makeCalc({
  fields: [
    { id: 'visits', label: 'Monthly visits', type: 'number', suffix: 'visits', default: '30000', min: 0, step: 5000, help: 'Use your busiest realistic month, not your average.' },
    { id: 'storage', label: 'Storage needed', type: 'number', suffix: 'GB', default: '10', min: 0, step: 1 },
    {
      id: 'need', label: 'What are you hosting?', type: 'select', default: 'business',
      options: [
        { value: 'blog', label: 'Blog / content site' },
        { value: 'business', label: 'Business / brochure site' },
        { value: 'webapp', label: 'Web app (Node, DB, APIs)' },
        { value: 'ecommerce', label: 'E-commerce / WooCommerce' },
      ],
    },
    {
      id: 'spikes', label: 'Spiky traffic (launches, campaigns)?', type: 'select', default: 'no', full: true,
      options: [
        { value: 'no', label: 'No — fairly steady traffic' },
        { value: 'yes', label: 'Yes — big swings month to month' },
      ],
    },
  ],
  compute(values) {
    const visits = num(values.visits);
    const storage = num(values.storage);
    const need = values.need ?? 'business';
    const spikes = values.spikes === 'yes';
    const needFactor = need === 'ecommerce' ? 1.8 : need === 'webapp' ? 1.6 : need === 'business' ? 1.15 : 1;

    // Shared: $5 base, 10GB disk incl., +$1/GB after; past ~25k visits/mo hosts throttle or force upgrades.
    const sharedDisk = 5 + Math.max(0, storage - 10);
    const sharedOverage = visits > 25000 ? Math.ceil((visits - 25000) / 25000) * 6 : 0;
    const shared = (sharedDisk + sharedOverage) * needFactor;

    // VPS: $20 (2 vCPU / 4GB), 100k visits + 50GB incl., +$8 per extra 50k visits, +$0.20/GB disk.
    const vpsTraffic = 20 + (visits > 100000 ? Math.ceil((visits - 100000) / 50000) * 8 : 0);
    const vps = (vpsTraffic + Math.max(0, storage - 50) * 0.2) * needFactor;

    // Managed cloud: $35, 250k visits + 100GB incl., +$12 per extra 100k; spiky traffic needs burst headroom.
    const cloudTraffic = 35 + (visits > 250000 ? Math.ceil((visits - 250000) / 100000) * 12 : 0);
    const cloud = (cloudTraffic + Math.max(0, storage - 100) * 0.1) * needFactor * (spikes ? 1.25 : 1);

    const sharedOk = visits <= 25000 && (need === 'blog' || need === 'business') && !spikes;
    const runtime = need === 'webapp' || need === 'ecommerce';
    const wantsCloud = spikes || visits > 250000 || (runtime && visits > 100000);
    const plan = sharedOk ? 'Shared hosting' : wantsCloud ? 'Managed cloud' : 'VPS';
    const cost = sharedOk ? shared : wantsCloud ? cloud : vps;
    const lo = Math.max(3, Math.round(cost));
    const hi = Math.round(lo * 1.35 + 3);
    const included = sharedOk ? 25000 : wantsCloud ? 250000 : 100000;
    const headroom = visits > 0 ? included / visits : 0;

    const verdict = sharedOk
      ? { tone: 'good' as const, title: 'Shared hosting is all you need', message: `At ~${fmt(visits)} visits/mo a quality shared plan ($3–10/mo street price) serves fine. Put Cloudflare's free CDN in front and spend the savings on content, not servers.` }
      : runtime
        ? { tone: 'warn' as const, title: 'Runtime apps need more than shared', message: `Web apps and stores need real workers, a database and backups — shared hosting can't run them reliably. ${plan === 'Managed cloud' ? 'Managed cloud with autoscaling' : 'A VPS with 2+ GB RAM'} is the floor; add ~$15–25/mo for a staging clone and nightly DB backups.` }
        : spikes
          ? { tone: 'warn' as const, title: 'Spikes break small boxes', message: 'Shared plans throttle and a fixed VPS falls over at burst. Managed cloud (autoscaling + load balancer) costs ~25% more but survives launches — and full-page caching cuts origin load 60–90%.' }
          : { tone: 'good' as const, title: 'A VPS is the sweet spot', message: `At ~${fmt(visits)} visits/mo a 2 vCPU / 4GB VPS serves comfortably with room to grow. Managed cloud's premium only pays off past ~100–250k visits/mo or with spiky traffic.` };

    return {
      stats: [
        { label: 'Recommended plan', value: plan, hint: runtime && plan !== 'Managed cloud' ? 'with staging + backups' : undefined, tone: 'good' },
        { label: 'Est. monthly cost', value: `${money(lo)}–${money(hi)}`, hint: 'street-pricing band' },
        { label: 'Yearly cost', value: money(lo * 12) },
        { label: 'Visit headroom', value: `${fmt(headroom, 1)}×`, hint: `${fmt(included)} visits included` },
      ],
      breakdown: [
        { label: 'Shared — fine ≤25k visits, throttles after', value: `${money(shared)}/mo` },
        { label: 'VPS 2vCPU/4GB — full control', value: `${money(vps)}/mo` },
        { label: 'Managed cloud — autoscaling, spike-proof', value: `${money(cloud)}/mo` },
        { label: 'Recommended band (provider variance)', value: `${money(lo)}–${money(hi)}/mo` },
      ],
      verdict,
      note: 'Street prices, 2025: shared $3–10/mo (Hostinger, Bluehost); VPS $6–24/mo for 2–4GB (Hetzner from ~€4.5, DigitalOcean, Linode); managed WordPress $30–60/mo (Kinsta from $35, WP Engine from $20); platform clouds (Vercel, Render, Fly) meter bandwidth ~$0.05–0.15/GB past free tiers. Rough transfer math: 100k visits/mo ≈ 15–60GB depending on page weight.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   2. APP LOCALIZATION COST
   ═══════════════════════════════════════════════════════════════ */

const AppLocalizationCost = makeCalc({
  fields: [
    { id: 'languages', label: 'New languages', type: 'number', suffix: 'langs', default: '5', min: 0, step: 1, help: 'Excluding your source language.' },
    { id: 'screens', label: 'Screens to localize', type: 'number', suffix: 'screens', default: '24', min: 0, step: 1 },
    { id: 'wps', label: 'Avg words per screen', type: 'number', suffix: 'words', default: '40', min: 0, step: 5, help: '40 is typical for a utility app; content apps run 80–150.' },
    {
      id: 'rate', label: 'Translation quality tier', type: 'select', default: 'pro',
      options: [
        { value: 'basic', label: 'Basic — $0.09/word (UI strings, help text)' },
        { value: 'pro', label: 'Pro — $0.18/word (reviewed human translation)' },
        { value: 'premium', label: 'Premium — $0.28/word (transcreation, legal, marketing)' },
      ],
    },
    {
      id: 'assets', label: 'Localize store assets too?', type: 'select', default: 'yes', full: true,
      options: [
        { value: 'yes', label: 'Yes — screenshots, keywords, description (~$120/lang)' },
        { value: 'no', label: 'No — strings only' },
      ],
    },
  ],
  compute(values) {
    const langs = Math.max(0, num(values.languages));
    const screens = num(values.screens);
    const wps = num(values.wps);
    const rate = values.rate === 'basic' ? 0.09 : values.rate === 'premium' ? 0.28 : 0.18;
    const words = langs * screens * wps;
    const translation = words * rate;
    const qa = translation * 0.15;
    const assets = values.assets === 'yes' ? langs * 120 : 0;
    const total = translation + qa + assets;
    const perLang = langs > 0 ? total / langs : 0;
    const weeks = words > 0 ? Math.max(1, Math.ceil(words / 2000 / 5) + 1) : 0;

    const verdict =
      langs >= 10
        ? { tone: 'warn' as const, title: 'At 10+ languages, process is the cost', message: 'Strings, screenshots and vendor hand-offs become a project of their own. Budget a TMS (Lokalise / Phrase from ~$120/mo) plus a localization lead, and plan future updates at ~60% of this figure thanks to translation memory.' }
        : rate === 0.09 && words > 5000
          ? { tone: 'warn' as const, title: 'Basic tier on a big word count', message: 'Basic rates ($0.06–0.10/word) suit UI strings and help text. For onboarding flows, marketing copy or anything revenue-critical, pro tier with review pays for itself in conversion — a broken checkout string costs more than the savings.' }
          : { tone: 'good' as const, title: 'Clean, quotable scope', message: `${fmt(words)} words across ${fmt(langs)} languages is a tidy vendor brief. Machine translation + human review can cut the basic tier 40–60% for support content — keep legal and checkout strings on full human translation.` };

    return {
      stats: [
        { label: 'Estimated total', value: money(total), tone: 'good' },
        { label: 'Per language', value: langs > 0 ? money(perLang) : '—' },
        { label: 'Timeline', value: weeks > 0 ? `≈ ${weeks} week${weeks > 1 ? 's' : ''}` : '—', hint: 'parallel per-language vendors' },
        { label: 'Translatable words', value: fmt(words) },
      ],
      breakdown: [
        { label: `Translation (${fmt(words)} words @ $${rate.toFixed(2)}/word)`, value: money(translation) },
        { label: 'QA & linguistic testing (+15%)', value: money(qa) },
        { label: 'Store listing assets', value: assets > 0 ? `${money(assets)} ($120 × ${fmt(langs)} langs)` : '—' },
        { label: 'Total one-time cost', value: money(total) },
      ],
      verdict,
      note: 'CSA Research: 76% of online shoppers prefer buying in their own language and 40% won’t buy at all in another. App Store supports 40+ storefront locales — localize keywords and screenshots too, not just strings. Translation memory typically discounts repeat strings 20–30% on updates; budget maintenance at ~60% of this one-time cost.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   3. IN-APP PURCHASE PRICE CONVERTER
   ═══════════════════════════════════════════════════════════════ */

type Market = { name: string; cur: string; factor: number; dec: 0 | 2; ladder: number[] };

const MARKETS: Market[] = [
  { name: 'United Kingdom', cur: '£', factor: 0.79, dec: 2, ladder: [0.49, 0.79, 0.99, 1.49, 1.79, 2.49, 2.99, 3.99, 4.99, 5.99, 7.99, 9.99, 14.99, 19.99, 29.99, 49.99, 99.99] },
  { name: 'Eurozone', cur: '€', factor: 0.93, dec: 2, ladder: [0.49, 0.99, 1.49, 1.99, 2.99, 3.99, 4.99, 5.99, 7.99, 9.99, 14.99, 19.99, 29.99, 49.99, 99.99] },
  { name: 'Japan', cur: '¥', factor: 130, dec: 0, ladder: [80, 120, 160, 240, 300, 360, 480, 600, 690, 780, 900, 1200, 1600, 2400, 3600, 4800, 9800] },
  { name: 'India', cur: '₹', factor: 80, dec: 0, ladder: [39, 49, 79, 99, 159, 199, 249, 299, 399, 499, 699, 999, 1499, 1999, 2999, 4999, 9999] },
  { name: 'Brazil', cur: 'R$', factor: 4.9, dec: 2, ladder: [1.99, 2.99, 3.99, 4.9, 6.9, 9.9, 12.9, 16.9, 19.9, 24.9, 34.9, 49.9, 69.9, 99.9, 149.9] },
  { name: 'Australia', cur: 'A$', factor: 1.55, dec: 2, ladder: [1.19, 1.69, 2.49, 2.99, 3.99, 4.99, 5.99, 7.49, 7.99, 9.99, 14.99, 19.99, 29.99, 49.99, 99.99] },
  { name: 'Canada', cur: 'C$', factor: 1.35, dec: 2, ladder: [0.99, 1.29, 1.99, 2.99, 3.99, 4.99, 5.99, 6.99, 7.99, 9.99, 14.99, 19.99, 29.99, 49.99, 99.99] },
  { name: 'Mexico', cur: 'MX$', factor: 19, dec: 0, ladder: [9, 19, 29, 39, 59, 79, 89, 99, 149, 199, 299, 499, 999] },
  { name: 'Türkiye', cur: '₺', factor: 8, dec: 2, ladder: [2.99, 4.99, 7.99, 12.99, 19.99, 29.99, 39.99, 59.99, 99.99, 149.99, 249.99, 399.99] },
  { name: 'Indonesia', cur: 'Rp', factor: 12000, dec: 0, ladder: [4900, 9900, 12000, 19000, 29000, 39000, 55000, 75000, 99000, 149000, 199000, 299000, 499000] },
  { name: 'Vietnam', cur: '₫', factor: 22000, dec: 0, ladder: [9900, 16000, 22000, 33000, 49000, 66000, 99000, 149000, 199000, 329000, 499000, 999000] },
  { name: 'Philippines', cur: '₱', factor: 50, dec: 0, ladder: [19, 29, 49, 79, 99, 149, 199, 249, 299, 449, 599, 999, 1999] },
  { name: 'Thailand', cur: '฿', factor: 35, dec: 0, ladder: [10, 19, 35, 55, 79, 99, 149, 199, 299, 449, 599, 999, 1999] },
  { name: 'Saudi Arabia', cur: 'SAR ', factor: 4, dec: 2, ladder: [1.99, 2.99, 3.99, 6.99, 8.99, 11.99, 17.99, 23.99, 34.99, 47.99, 89.99, 179.99] },
  { name: 'South Korea', cur: '₩', factor: 1300, dec: 0, ladder: [550, 900, 1200, 1900, 2500, 3300, 4400, 5500, 6600, 7700, 11000, 16500, 22000, 33000, 55000] },
  { name: 'Nigeria', cur: '₦', factor: 1500, dec: 0, ladder: [300, 600, 900, 1500, 2500, 3900, 5900, 7900, 11900, 19900, 29900, 49900, 99900] },
];

const InAppPurchasePriceConverter = makeCalc({
  fields: [
    { id: 'base', label: 'Base US price', type: 'number', suffix: 'USD', default: '4.99', min: 0, step: 0.5, help: 'The anchor every other market keys off.' },
    {
      id: 'category', label: 'Purchase type', type: 'select', default: 'consumable', full: true,
      options: [
        { value: 'consumable', label: 'Consumable (coins, credits, packs)' },
        { value: 'subscription', label: 'Subscription (monthly/auto-renew)' },
        { value: 'premium', label: 'Premium (one-time unlock / paid app)' },
      ],
    },
  ],
  compute(values) {
    const base = num(values.base);
    const category = values.category ?? 'consumable';

    if (base <= 0) {
      return {
        stats: [{ label: 'US base price', value: '—' }],
        verdict: { tone: 'bad', title: 'Enter a base price', message: 'Type your US price (e.g. 4.99) to generate tier-snapped suggestions for all 16 storefronts.' },
      };
    }

    const rows = MARKETS.map((m) => {
      const local = snap(base * m.factor, m.ladder);
      return { m, local, usd: local / m.factor };
    });
    const usds = rows.map((r) => r.usd);
    const minUsd = Math.min(...usds);
    const maxUsd = Math.max(...usds);
    const cheapest = rows.find((r) => r.usd === minUsd)!;
    const priciest = rows.find((r) => r.usd === maxUsd)!;
    const spread = base > 0 ? clamp(((maxUsd - minUsd) / base) * 100, 0, 999) : 0;

    const categoryNote =
      category === 'subscription'
        ? 'Subscriptions must use each store’s dedicated subscription tiers. Keep yearly ≈ 10× monthly (the “10-month rule”) and expect Apple’s 15% commission after a subscriber’s first year (or under $1M/yr).'
        : category === 'premium'
          ? 'Premium one-time pricing lives on a value ladder: the $0.99 / $2.99 / $4.99 segments carry the bulk of paid-download volume; pricing above $9.99 demands strong social proof or a niche with no substitute.'
          : 'Consumables convert best as anchored packs: a $2.99 “starter” makes the $9.99 “pro” pack feel reasonable. Stores take 30% (15% under Apple’s Small Business Program or Play’s first $1M/yr).';

    return {
      stats: [
        { label: 'US base price', value: money(base), tone: 'good' },
        { label: 'USD-equivalent range', value: `${money(minUsd)} – ${money(maxUsd)}`, hint: 'after ladder snapping' },
        { label: 'Cheapest store', value: cheapest.m.name, hint: `≈ ${money(minUsd)}` },
        { label: 'Priciest store', value: priciest.m.name, hint: `≈ ${money(maxUsd)}` },
      ],
      breakdown: rows.map((r) => ({
        label: r.m.name,
        value: `${r.m.cur}${fmt(r.local, r.m.dec)} · ≈ ${money(r.usd)}`,
      })),
      verdict:
        base < 0.99
          ? { tone: 'bad', title: 'Below the entry tier', message: 'Most stores won’t price below $0.99 / tier 1. Anchor at $0.99 or move this item into a bundle.' }
          : base > 99.99
            ? { tone: 'warn', title: 'High-ticket territory', message: 'Few catalogs price a single IAP above $99.99 — verify per-store maximums manually and consider splitting into tiers.' }
            : { tone: 'good', title: 'Parity looks sane', message: `Snapped prices land within a ${pct(spread, 0)} band around your US anchor across ${MARKETS.length} storefronts — right in line with what Apple/Google auto-conversion suggests.` },
      note: `${categoryNote} These are convention-based approximations of App Store/Play ladder tables (Apple now serves 175+ storefronts with thousands of price points). Always set final prices per store — local taxes (EU VAT-inclusive, India 18% GST) change what the buyer sees.`,
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   4. BATTERY USAGE ESTIMATOR
   ═══════════════════════════════════════════════════════════════ */

const BATT: { id: string; label: string; w: [number, number, number, number] }[] = [
  { id: 'gps', label: 'GPS & location', w: [0, 3, 6, 9] },
  { id: 'camera', label: 'Camera capture', w: [0, 2, 5, 8] },
  { id: 'sync', label: 'Background sync', w: [0, 1.5, 3, 5] },
  { id: 'push', label: 'Push notifications', w: [0, 0.5, 1.5, 3] },
  { id: 'anim', label: 'Animation-heavy UI', w: [0, 1, 2.5, 4] },
  { id: 'audio', label: 'Audio playback', w: [0, 1, 2, 3.5] },
];
const LV: Record<string, number> = { '0': 0, low: 1, medium: 2, heavy: 3 };
const LVNAME = ['off', 'low', 'medium', 'heavy'];
const LVLABEL: Record<string, string> = { '0': 'Off', low: 'Low', medium: 'Medium', heavy: 'Heavy' };

const BatteryUsageEstimator = makeCalc({
  fields: [
    ...BATT.map((b) => ({
      id: b.id,
      label: b.label,
      type: 'select' as const,
      default: b.id === 'gps' || b.id === 'anim' ? 'low' : b.id === 'sync' || b.id === 'push' ? 'medium' : '0',
      options: [
        { value: '0', label: 'Off' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'heavy', label: 'Heavy' },
      ],
    })),
    { id: 'screen', label: 'Screen-on time', type: 'number', suffix: 'min/day', default: '180', min: 0, step: 15, help: 'Minutes/day a typical user actively uses the app.' },
  ],
  compute(values) {
    const rows = BATT.map((b) => {
      const lv = LV[values[b.id] ?? '0'] ?? 0;
      return { ...b, lv, w: b.w[lv] };
    });
    const featureSum = rows.reduce((s, r) => s + r.w, 0);
    const drain = clamp(10 + featureSum, 5, 45); // 10%/hr baseline: screen + radios + OS on a 4,500mAh device
    const screenOn = num(values.screen);
    const minutesPerCharge = (100 / drain) * 60;
    const dailyPct = drain * (screenOn / 60);
    const charges = dailyPct / 100;

    const tone = drain > 26 ? 'bad' : drain > 19 ? 'warn' : 'good';

    return {
      stats: [
        { label: 'Drain per active hour', value: pct(drain, 1), tone, hint: 'of battery, whole-device active use' },
        { label: 'Screen time per charge', value: `${fmt(minutesPerCharge)} min`, hint: '4,500mAh reference device' },
        { label: 'Estimated use per day', value: pct(dailyPct, 0), hint: `with ${fmt(screenOn)} min screen-on` },
        { label: 'Charges per day', value: `${charges.toFixed(1)}×`, hint: charges < 1 ? 'one charge lasts the day' : 'mid-day top-up needed' },
      ],
      breakdown: [
        { label: 'Baseline (screen, radios, OS)', value: '+10%/hr' },
        ...rows.map((r) => ({ label: `${r.label} — ${LVLABEL[values[r.id] ?? '0'] ?? 'Off'}`, value: r.w > 0 ? `+${r.w}%/hr` : '0' })),
        { label: 'Total active-use drain', value: `${pct(drain, 1)}/hr` },
      ],
      verdict:
        drain > 26
          ? { tone: 'bad', title: 'Nav/video-class drain', message: `At ${pct(drain, 0)}/hr users will name your app in battery-settings screenshots — the classic 1-star review. Fix the top row in the breakdown: batch GPS (every 30s, not continuous), cap animation frame rates, and defer sync to Wi-Fi + charging.` }
          : drain > 19
            ? { tone: 'warn', title: 'Above the comfortable envelope', message: `Modern phones sustain ~15–20%/hr of full active use. At ${pct(drain, 1)}/hr the top contributor in the breakdown is worth optimizing before reviews start mentioning battery.` }
            : { tone: 'good', title: 'Healthy power envelope', message: `${pct(drain, 1)}/hr keeps a full day of realistic use on one charge. Keep it there: regressions usually sneak in via polling timers and “small” always-on animations.` },
      note: 'Reference points on a 4,500mAh Android: continuous GPS navigation ≈ 25–35%/hr, 4K video recording ≈ 15–20%/hr, background sync over Wi-Fi ≈ 1–3%/hr, overnight idle ≈ 0.5–1%/hr. Measure, don’t guess: Android Battery Historian (adb shell dumpsys batterystats) and Xcode’s Energy Impact gauge — iOS flags apps averaging high CPU/network in Organizer energy reports. Background drain while the screen is off adds another 2–5%/day.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   5. OFFLINE MODE DECISION
   ═══════════════════════════════════════════════════════════════ */

const OfflineModeDecision = makeCalc({
  fields: [
    {
      id: 'critical', label: 'Is core data useful with no connection?', type: 'select', default: 'yes',
      options: [
        { value: 'yes', label: 'Yes — users need it with no signal' },
        { value: 'sometimes', label: 'Sometimes — nice to have' },
        { value: 'no', label: 'No — pointless offline' },
      ],
    },
    {
      id: 'env', label: 'Where are users when they open it?', type: 'select', default: 'mixed',
      options: [
        { value: 'field', label: 'Field — trucks, sites, basements, flights' },
        { value: 'mixed', label: 'Mixed coverage' },
        { value: 'urban', label: 'Urban — solid connectivity' },
      ],
    },
    {
      id: 'fresh', label: 'How fresh must data be?', type: 'select', default: 'hourly',
      options: [
        { value: 'realtime', label: 'Real-time — seconds matter' },
        { value: 'hourly', label: 'Hourly is acceptable' },
        { value: 'daily', label: 'Daily is fine' },
      ],
    },
    {
      id: 'conflict', label: 'Conflict risk when edits sync later?', type: 'select', default: 'medium',
      options: [
        { value: 'high', label: 'High — many writers, same records' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low — one user, one device' },
      ],
    },
    {
      id: 'category', label: 'App category', type: 'select', default: 'productivity',
      options: [
        { value: 'fieldops', label: 'Field service, logistics, retail ops' },
        { value: 'productivity', label: 'Productivity, notes, forms' },
        { value: 'media', label: 'Content, media, reading' },
        { value: 'marketplace', label: 'Marketplace, e-commerce' },
        { value: 'social', label: 'Social feed' },
        { value: 'fintech', label: 'Fintech, payments' },
      ],
    },
    {
      id: 'budget', label: 'Budget for sync engineering?', type: 'select', default: 'mid',
      options: [
        { value: 'high', label: 'Healthy — can fund a sync engine' },
        { value: 'mid', label: 'Some — standard tools only' },
        { value: 'low', label: 'Tight — keep it simple' },
      ],
    },
  ],
  compute(values) {
    const S: Record<string, Record<string, number>> = {
      critical: { yes: 30, sometimes: 16, no: 4 },
      env: { field: 30, mixed: 18, urban: 8 },
      fresh: { realtime: 2, hourly: 12, daily: 24 },
      conflict: { high: 4, medium: 14, low: 26 },
      category: { fieldops: 26, productivity: 22, media: 20, marketplace: 10, social: 8, fintech: 6 },
      budget: { high: 14, mid: 8, low: 2 },
    };
    const raw =
      (S.critical[values.critical ?? 'yes'] ?? 0) +
      (S.env[values.env ?? 'mixed'] ?? 0) +
      (S.fresh[values.fresh ?? 'hourly'] ?? 0) +
      (S.conflict[values.conflict ?? 'medium'] ?? 0) +
      (S.category[values.category ?? 'productivity'] ?? 0) +
      (S.budget[values.budget ?? 'mid'] ?? 0);
    const score = clamp(Math.round((raw / 150) * 100), 0, 100);

    const rec = score >= 65 ? 'Build offline first' : score >= 40 ? 'Cache essentials' : 'Stay online-first';
    const adder = score >= 65 ? '≈ +25–35%' : score >= 40 ? '≈ +10–20%' : '≈ +0–5%';
    const stack = score >= 65 ? 'SQLite + sync engine' : score >= 40 ? 'SQLite cache + write queue' : 'HTTP cache + retry queue';

    const tips: string[] = [];
    if (values.critical === 'yes') tips.push('cache user-created records first — drafts, forms, photos, sign-offs; losing those is unforgivable');
    if (values.env === 'field') tips.push('prefetch the day’s job lists, site addresses and route data on morning sync');
    if (values.fresh === 'realtime') tips.push('cache only read-only reference data with aggressive expiry (<60s TTL) — never stale transactional state');
    if (values.fresh === 'daily') tips.push('daily-fresh data suits a nightly prefetch + delta sync');
    if (values.conflict === 'high') tips.push('add per-field merge with a server-wins policy and log conflicts for review');
    if (values.conflict === 'low') tips.push('last-write-wins is fine here — don’t over-engineer merge logic');
    if (values.category === 'media') tips.push('cache media with LRU eviction (cap ~200MB) and resumable downloads');
    if (values.category === 'fintech') tips.push('never cache balances or transaction state — cache only the navigation shell and reference content');

    return {
      stats: [
        { label: 'Offline score', value: `${score}/100`, tone: score >= 65 ? 'good' : score >= 40 ? 'warn' : 'default' },
        { label: 'Recommendation', value: rec, tone: score >= 65 ? 'good' : score >= 40 ? 'warn' : 'good' },
        { label: 'Dev-time adder', value: adder, hint: 'vs an online-only build' },
        { label: 'Suggested stack', value: stack },
      ],
      verdict:
        score >= 65
          ? { tone: 'good', title: 'Build offline first', message: 'The core loop must work in airplane mode; sync is a background concern, not a feature. Budget the +25–35% engineering honestly — half of it is testing migrations and conflict paths, not writing sync code.' }
          : score >= 40
            ? { tone: 'warn', title: 'Cache essentials only', message: 'Keep read paths alive with last-known data and skeleton UIs, queue writes locally, and show sync status honestly. Don’t model a full offline database — the score says the payoff isn’t there yet.' }
            : { tone: 'good', title: 'Stay online-first', message: 'A friendly retry state and a cached last screen beat months of sync engineering here. Ship the online version, watch real connectivity data, and revisit if field complaints appear.' },
      note: `Offline-first typically adds 20–30% dev time; local-first stacks (SQLite + WatermelonDB, PowerSync, ElectricSQL) absorb most of the plumbing but none of the testing. Cache priority for your answers: ${tips.length ? tips.join('; ') : 'start with the last screen the user saw, plus whatever they just typed — a draft lost to a tunnel ride is how offline requests start.'} Rule of thumb: never block the UI on the network.`,
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   6. APP MAINTENANCE COST
   ═══════════════════════════════════════════════════════════════ */

const AppMaintenanceCost = makeCalc({
  fields: [
    { id: 'build', label: 'Initial build cost', type: 'number', suffix: 'USD', default: '40000', min: 0, step: 1000 },
    {
      id: 'platforms', label: 'Platforms', type: 'select', default: 'both',
      options: [
        { value: 'ios', label: 'iOS only' },
        { value: 'android', label: 'Android only' },
        { value: 'both', label: 'Both iOS + Android' },
      ],
    },
    {
      id: 'complexity', label: 'Feature complexity', type: 'select', default: 'medium',
      options: [
        { value: 'simple', label: 'Simple — static content, basic forms' },
        { value: 'medium', label: 'Medium — accounts, payments, feeds' },
        { value: 'complex', label: 'Complex — maps, ML, real-time, integrations' },
      ],
    },
    {
      id: 'sla', label: 'Monitoring + support SLA?', type: 'select', default: 'no', full: true,
      options: [
        { value: 'no', label: 'No — crash reports + uptime tooling only' },
        { value: 'yes', label: 'Yes — APM, uptime alerts, on-call support' },
      ],
    },
  ],
  compute(values) {
    const build = num(values.build);
    const cx = values.complexity === 'simple' ? 0.75 : values.complexity === 'complex' ? 1.4 : 1;
    const plat = values.platforms === 'ios' ? 0.9 : values.platforms === 'android' ? 1 : 1.5;

    const updates = build * 0.08 * cx; // feature updates + new-OS feature parity
    const os = build * 0.04 * plat; // SDK churn, OS compatibility waves
    const bugs = build * 0.05 * cx; // bug-fix buffer
    const monitoring = values.sla === 'yes' ? 3600 : 600;
    const storeFees = 124; // Apple $99/yr + Google $25 (≈$3/yr amortized)
    const total = updates + os + bugs + monitoring + storeFees;
    const share = build > 0 ? (total / build) * 100 : 0;

    return {
      stats: [
        { label: 'Yearly maintenance', value: money(total), tone: 'good' },
        { label: 'Monthly equivalent', value: money(total / 12) },
        { label: '% of build cost', value: pct(share, 1), hint: 'industry band: 15–20%' },
        { label: '3-year total', value: money(total * 3), hint: 'store fees + tooling included' },
      ],
      breakdown: [
        { label: 'Feature updates & OS-version parity', value: money(updates) },
        { label: 'OS/SDK compatibility work', value: money(os) },
        { label: 'Bug-fix buffer', value: money(bugs) },
        { label: values.sla === 'yes' ? 'Monitoring, APM & on-call support' : 'Crash reporting & uptime tooling', value: money(monitoring) },
        { label: 'Store fees (Apple $99 + Google $25)', value: money(storeFees) },
        { label: 'Yearly total', value: money(total) },
      ],
      verdict:
        build <= 0
          ? { tone: 'warn', title: 'Enter a build cost', message: 'The percentage band is computed against your initial build — enter it to see how this estimate compares to the 15–20% industry rule.' }
          : share > 25
            ? { tone: 'warn', title: 'Above the benchmark band', message: `${pct(share, 0)}/yr of build cost is past the 15–20% norm — usually a sign of tech debt or an over-scoped roadmap, not extra value. Audit what “updates” actually delivered last year.` }
            : share < 10
              ? { tone: 'warn', title: 'Underbudgeted', message: 'Below 10% is optimistic: iOS and Android each ship a major OS wave every fall, and SDK/deprecation churn alone eats 5–8% of build cost. Budget now or the app rots quietly.' }
              : { tone: 'good', title: 'Right in the industry band', message: `${pct(share, 1)}/yr matches the standard 15–20%-of-build rule agencies and CTOs budget by. Treat it as a floor if the roadmap keeps adding features.` },
      note: 'Benchmarks: 15–20% of original build cost per year is the most-cited rule (Clutch and IBM surveys converge there); complex apps with maps/ML/payments run 20–30%. Fixed costs you can’t skip: Apple Developer Program $99/yr, Google Play $25 one-time, crash reporting free–$26/mo (Crashlytics, Sentry), APM + uptime $15–300/mo (Datadog, Better Stack). Both platforms ship major OS releases every fall — that’s two compatibility waves a year, minimum.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   7. TIKTOK ENGAGEMENT
   ═══════════════════════════════════════════════════════════════ */

const TiktokEngagement = makeCalc({
  fields: [
    { id: 'followers', label: 'Followers', type: 'number', suffix: 'users', default: '10000', min: 0, step: 100 },
    { id: 'likes', label: 'Avg likes per post', type: 'number', suffix: 'likes', default: '800', min: 0, step: 10 },
    { id: 'comments', label: 'Avg comments per post', type: 'number', suffix: 'comments', default: '40', min: 0, step: 5 },
    { id: 'shares', label: 'Avg shares per post', type: 'number', suffix: 'shares', default: '25', min: 0, step: 5 },
    { id: 'posts', label: 'Posts per week', type: 'number', suffix: '/wk', default: '3', min: 0, step: 1, help: 'Optional — powers the monthly projection.' },
  ],
  compute(values) {
    const followers = num(values.followers);
    const likes = num(values.likes);
    const comments = num(values.comments);
    const shares = num(values.shares);
    const posts = num(values.posts);
    const interactions = likes + comments + shares;
    const rateByFollowers = followers > 0 ? (interactions / followers) * 100 : 0;
    const views = followers * 0.35; // typical follower→view ratio when posting consistently
    const rateByViews = views > 0 ? (interactions / views) * 100 : 0;
    const tier = followers < 10000 ? 'Micro' : followers <= 100000 ? 'Mid' : 'Macro';
    const bench = followers < 10000 ? 8 : followers <= 100000 ? 6 : 4;
    const monthly = interactions * posts * 4.33;
    const tone = rateByFollowers >= bench ? 'good' : rateByFollowers >= bench * 0.6 ? 'warn' : 'bad';

    return {
      stats: [
        { label: 'Engagement rate', value: pct(rateByFollowers, 2), tone, hint: 'by followers' },
        { label: 'By views (est.)', value: pct(rateByViews, 1), hint: 'views ≈ followers × 0.35' },
        { label: 'Monthly engagement', value: fmt(monthly), hint: `${fmt(posts)} posts/wk × ${fmt(interactions)} interactions` },
        { label: 'Your tier', value: tier, hint: `benchmark ≥ ${bench}%` },
      ],
      breakdown: [
        { label: 'Likes', value: `${fmt(likes)} · ${interactions > 0 ? pct((likes / interactions) * 100, 0) : '0%'} of interactions` },
        { label: 'Comments', value: `${fmt(comments)} · ${interactions > 0 ? pct((comments / interactions) * 100, 0) : '0%'} of interactions` },
        { label: 'Shares (weighted heaviest by the FYP)', value: `${fmt(shares)} · ${interactions > 0 ? pct((shares / interactions) * 100, 0) : '0%'} of interactions` },
        { label: 'Total interactions per post', value: fmt(interactions) },
        { label: 'Est. views per post', value: fmt(views) },
      ],
      verdict:
        rateByFollowers >= bench
          ? { tone: 'good', title: `Strong for ${tier.toLowerCase()} — top quartile`, message: `${pct(rateByFollowers, 1)} clears the ${bench}% benchmark for your size. Accounts holding this rate ride FYP pushes regularly: keep the cadence tight and reply to comments in the first hour to compound the signal.` }
          : rateByFollowers >= bench * 0.6
            ? { tone: 'warn', title: 'Mid-pack — one lever from benchmark', message: `${pct(rateByFollowers, 1)} vs the ${bench}% benchmark for ${tier.toLowerCase()} accounts. Comments and shares are the cheapest lifts: end videos on a specific question, and make content people send to one friend (“tag the person who…”).` }
            : { tone: 'bad', title: 'Below benchmark', message: `${pct(rateByFollowers, 1)} against a ${bench}% bar. TikTok weighs completion rate and shares heaviest — cut length toward 15–25s, land the hook in 1.5s, and post 1–3×/day consistently for two weeks before judging.` },
      note: 'TikTok’s native analytics report engagement by views, not followers — brands buying placements increasingly ask for view-based rates. Socialinsider’s 2024 study: average engagement by followers ≈ 4.9% under 10k accounts, ~3.5% for 10k–100k, ~2.6% above 100k. Follower→view conversion averages 30–40% when posting 3–7×/week; viral spikes make it briefly meaningless.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   8. FACEBOOK AD COST
   ═══════════════════════════════════════════════════════════════ */

const FacebookAdCost = makeCalc({
  fields: [
    { id: 'budget', label: 'Monthly ad budget', type: 'number', suffix: 'USD', default: '1000', min: 0, step: 100 },
    { id: 'cpm', label: 'CPM (per 1,000 impressions)', type: 'number', suffix: 'USD', default: '12', min: 0, step: 0.5, help: '$8–20 is typical for US feeds; $1–4 in India/SEA.' },
    { id: 'ctr', label: 'Click-through rate', type: 'number', suffix: '%', default: '1.2', min: 0, step: 0.1, help: 'Meta all-industry average ≈ 0.90–1.2%.' },
    { id: 'cvr', label: 'Landing conversion rate', type: 'number', suffix: '%', default: '2.5', min: 0, step: 0.1, help: '2–3% is typical for cold traffic; instant forms run higher.' },
  ],
  compute(values) {
    const budget = num(values.budget);
    const cpm = num(values.cpm);
    const ctr = num(values.ctr);
    const cvr = num(values.cvr);
    const impressions = cpm > 0 ? (budget / cpm) * 1000 : 0;
    const clicks = impressions * (ctr / 100);
    const conversions = clicks * (cvr / 100);
    const cpc = clicks > 0 ? budget / clicks : 0;
    const cpa = conversions > 0 ? budget / conversions : 0;

    return {
      stats: [
        { label: 'Impressions', value: fmt(impressions), hint: `at ${money(cpm)} CPM` },
        { label: 'Clicks', value: fmt(clicks), hint: `${pct(ctr, 2)} CTR` },
        { label: 'Conversions', value: fmt(conversions, 1), hint: `${pct(cvr, 2)} CVR` },
        { label: 'Cost per acquisition', value: conversions > 0 ? money(cpa) : '—', hint: conversions > 0 ? `${money(cpc)} per click` : 'no conversions at these rates' },
      ],
      breakdown: [
        { label: 'Impressions bought', value: fmt(impressions) },
        { label: 'Clicks delivered', value: fmt(clicks) },
        { label: 'Conversions projected', value: fmt(conversions, 1) },
        { label: 'Effective CPC', value: money(cpc) },
        { label: 'Effective CPA', value: money(cpa) },
        { label: 'CPM you entered', value: money(cpm) },
      ],
      verdict:
        ctr >= 1.2
          ? { tone: 'good', title: 'CTR above benchmark', message: `${pct(ctr, 2)} beats the ~0.90–1.2% Meta all-industry range — creative is pulling its weight. Watch CPA against customer value: at ${pct(cvr, 1)} CVR you’re paying ${money(cpa)} per conversion, which is cheap for a $400-LTV customer and impossible for a $15 product.` }
          : ctr >= 0.65
            ? { tone: 'warn', title: 'CTR in the mediocre middle', message: `${pct(ctr, 2)} sits below the 1%+ healthy bar. Test the first 3 seconds of creative and the primary text hook — CTR is the metric creative fixes fastest, and better CTR mechanically lowers your ${money(cpc)} CPC.` }
            : { tone: 'bad', title: 'CTR is burning the budget', message: `${pct(ctr, 2)} CTR means the audience is scrolling past. Refresh creative (new hook + first-frame), tighten the audience, or check placement mix — Audience Network traffic famously converts at a fraction of feed.` },
      note: 'CPM reality check: US feed CPMs run $8–20 and spike 30–60% in Q4; Reels/Stories placements often price below feed; India/SEA $1–4. Frequency above ~3 in a 7-day window inflates CPM ~20% — that’s creative fatigue, so rotate ads. Budget guardrail: give each test $10–20/day per ad set for 7 days before judging; the learning phase needs ~50 conversion events to stabilize.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   9. GOOGLE ADS BUDGET
   ═══════════════════════════════════════════════════════════════ */

const GoogleAdsBudget = makeCalc({
  fields: [
    {
      id: 'mode', label: 'Direction', type: 'select', default: 'budget',
      options: [
        { value: 'budget', label: 'I have a budget → how many clicks?' },
        { value: 'clicks', label: 'I need X clicks → what budget?' },
      ],
    },
    { id: 'budget', label: 'Monthly budget', type: 'number', suffix: 'USD', default: '1000', min: 0, step: 100, help: 'Used in “budget → clicks” mode.' },
    { id: 'clicks', label: 'Target clicks', type: 'number', suffix: 'clicks', default: '500', min: 0, step: 50, help: 'Used in “clicks → budget” mode.' },
    { id: 'cpc', label: 'Avg cost per click', type: 'number', suffix: 'USD', default: '2.5', min: 0, step: 0.1, help: 'All-industry search average ≈ $4.66 (WordStream 2024).' },
    { id: 'cvr', label: 'Conversion rate', type: 'number', suffix: '%', default: '3', min: 0, step: 0.25, help: 'Search average ≈ 6.4%; 2–3% is common on cold landing pages.' },
  ],
  compute(values) {
    const mode = values.mode ?? 'budget';
    const cpc = num(values.cpc);
    const cvr = num(values.cvr);
    let budget: number;
    let clicks: number;
    if (mode === 'clicks') {
      clicks = num(values.clicks);
      budget = clicks * cpc;
    } else {
      budget = num(values.budget);
      clicks = cpc > 0 ? budget / cpc : 0;
    }
    const conversions = clicks * (cvr / 100);
    const cpa = conversions > 0 ? budget / conversions : 0;
    const daily = budget / 30.4;

    return {
      stats: [
        { label: mode === 'clicks' ? 'Required monthly budget' : 'Projected clicks', value: mode === 'clicks' ? money(budget) : fmt(clicks), tone: 'good' },
        { label: mode === 'clicks' ? 'Clicks delivered' : 'Budget needed', value: mode === 'clicks' ? fmt(clicks) : money(budget) },
        { label: 'Conversions', value: fmt(conversions, 1), hint: `${pct(cvr, 2)} CVR` },
        { label: 'Cost per acquisition', value: conversions > 0 ? money(cpa) : '—' },
      ],
      breakdown: [
        { label: 'Monthly budget', value: money(budget) },
        { label: `Clicks @ ${money(cpc)} CPC`, value: fmt(clicks) },
        { label: `Conversions @ ${pct(cvr, 2)}`, value: fmt(conversions, 1) },
        { label: 'Effective CPA', value: money(cpa) },
        { label: 'Daily spend pace', value: `${money(daily)}/day` },
        { label: 'Weekly pace', value: `${money(daily * 7)}/wk` },
      ],
      verdict:
        cvr >= 5
          ? { tone: 'good', title: 'Conversion rate is competitive', message: `${pct(cvr, 1)} beats most verticals (search average ≈ 6.4%; many landing pages sit at 2–3%). Your ${money(cpc)} CPC vs the $4.66 all-industry average means ${money(cpa)} CPA — sanity-check it against customer value and you’re clear to scale.` }
          : cvr >= 2.5
            ? { tone: 'warn', title: 'Landing page leaves conversions on the table', message: `${pct(cvr, 1)} is survivable but the search average is ~6.4%. Fixing the LP (speed, message match, one CTA) often doubles conversions at zero media cost — a better lever than raising the ${money(budget)} budget.` }
            : { tone: 'bad', title: 'CVR too low for this plan', message: `${pct(cvr, 1)} makes ${money(cpa)} CPA hard to defend. Pause scaling: fix the landing page or move budget to brand/exact-match terms where CVR typically runs 2–3× higher.` },
      note: 'Benchmarks (WordStream 2024): search avg CPC $4.66 (legal/insurance $7–9; e-commerce $1.5–3), avg CVR 6.42%. Smart Bidding needs ≥15–30 conversions/month per campaign to exit learning — if this plan yields fewer, consolidate campaigns or raise budget. Hold back 10–15% for brand-defense terms: they’re the cheapest conversions you’ll ever buy.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   10. VIDEO LENGTH OPTIMIZER
   ═══════════════════════════════════════════════════════════════ */

type VideoGoal = 'reach' | 'engagement' | 'conversion' | 'education';

const VIDEO_DB: Record<string, {
  name: string; max: string; hook: string; cta: string; ratio: string;
  ideal: Record<VideoGoal, [number, number]>;
}> = {
  tiktok: {
    name: 'TikTok', max: '10 min upload cap (sweet spot ≤ 60s)', hook: 'First 1.5s — visual + on-screen text', cta: 'Last 3s + pinned comment', ratio: '9:16',
    ideal: { reach: [7, 15], engagement: [15, 25], conversion: [21, 34], education: [45, 90] },
  },
  reels: {
    name: 'Instagram Reels', max: '3 min cap (retention sweet spot ≤ 30s)', hook: 'First 2s — before the scroll settles', cta: 'Last 15% + caption link', ratio: '9:16',
    ideal: { reach: [7, 15], engagement: [15, 30], conversion: [20, 40], education: [30, 60] },
  },
  shorts: {
    name: 'YouTube Shorts', max: '3 min cap (best retention under 60s)', hook: 'First 3s — the swipe-decision window', cta: 'Final 10s + loop into related video', ratio: '9:16',
    ideal: { reach: [20, 35], engagement: [25, 45], conversion: [30, 60], education: [45, 60] },
  },
  ytlong: {
    name: 'YouTube long-form', max: 'Uncapped (mid-rolls unlock at 8:00)', hook: 'First 30s — state the payoff explicitly', cta: 'Verbal CTA at ~70% + end screen last 20s', ratio: '16:9',
    ideal: { reach: [480, 660], engagement: [600, 960], conversion: [360, 600], education: [720, 1200] },
  },
  linkedin: {
    name: 'LinkedIn', max: '10 min cap (sweet spot ≤ 2 min)', hook: 'First 3s — captions on, 85% watch muted', cta: 'Last 15% + link in first comment', ratio: '1:1 or 4:5',
    ideal: { reach: [15, 45], engagement: [45, 90], conversion: [60, 120], education: [90, 180] },
  },
  x: {
    name: 'X (Twitter)', max: '2:20 on free accounts (140s)', hook: 'First 2s — autoplay is silent', cta: 'Last 10% + thread the takeaways', ratio: '16:9 or 1:1',
    ideal: { reach: [10, 30], engagement: [30, 60], conversion: [45, 90], education: [60, 120] },
  },
};

const VideoLengthOptimizer = makeCalc({
  fields: [
    {
      id: 'platform', label: 'Platform', type: 'select', default: 'tiktok',
      options: [
        { value: 'tiktok', label: 'TikTok' },
        { value: 'reels', label: 'Instagram Reels' },
        { value: 'shorts', label: 'YouTube Shorts' },
        { value: 'ytlong', label: 'YouTube long-form' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'x', label: 'X (Twitter)' },
      ],
    },
    {
      id: 'goal', label: 'Primary goal', type: 'select', default: 'reach',
      options: [
        { value: 'reach', label: 'Maximum reach' },
        { value: 'engagement', label: 'Engagement (saves, shares, comments)' },
        { value: 'conversion', label: 'Conversions / clicks' },
        { value: 'education', label: 'Education / teaching' },
      ],
    },
  ],
  compute(values) {
    const platform = values.platform ?? 'tiktok';
    const goal = (values.goal ?? 'reach') as VideoGoal;
    const db = VIDEO_DB[platform] ?? VIDEO_DB.tiktok;
    const [lo, hi] = db.ideal[goal] ?? db.ideal.reach;

    const goalAdvice: Record<VideoGoal, { tone: 'good' | 'warn'; title: string; message: string }> = {
      reach: { tone: 'good', title: 'Optimize for completion', message: `A tight ${fmtLen(lo)}–${fmtLen(hi)} cut watched 100% outranks a longer video watched 50% on every ranking system. Front-load the payoff — no logo intros, no “hey guys”.` },
      engagement: { tone: 'good', title: 'Give them something to save', message: `At ${fmtLen(lo)}–${fmtLen(hi)}, place the “wait for it” moment around 60% depth and ask one specific question in the caption. Saves and shares are the strongest engagement signals — lists, templates and hot takes earn them.` },
      conversion: { tone: 'good', title: 'One CTA, placed twice', message: `Keep ${fmtLen(lo)}–${fmtLen(hi)}: say the CTA verbally at ~70% and repeat it on-screen at the end (${db.cta.toLowerCase()}). In-feed viewers won’t hunt for links — point to bio/first comment explicitly.` },
      education: { tone: 'good', title: 'Structure beats length', message: `${fmtLen(lo)}–${fmtLen(hi)} works if retention holds: chapter it (promise → steps → recap) and add a visual re-hook every 20–30s. The retention cliff hits around 40% depth on most platforms.` },
    };
    const advice = goalAdvice[goal] ?? goalAdvice.reach;
    const shortFormEdu = goal === 'education' && (platform === 'tiktok' || platform === 'reels');

    return {
      stats: [
        { label: 'Ideal length', value: `${fmtLen(lo)} – ${fmtLen(hi)}`, tone: 'good', hint: `for ${goal} on ${db.name}` },
        { label: 'Platform ceiling', value: db.max.split('(')[0].trim(), hint: db.max.includes('(') ? db.max.slice(db.max.indexOf('(') + 1, -1) : undefined },
        { label: 'Hook window', value: db.hook.split('—')[0].trim(), hint: db.hook.split('—')[1]?.trim() },
        { label: 'Aspect ratio', value: db.ratio },
      ],
      breakdown: [
        { label: 'Hook', value: db.hook },
        { label: 'Re-hook / pattern interrupt', value: `visual change at 30–40% of runtime (B-roll, cut, text)` },
        { label: 'Payoff midpoint', value: 'core value visible by ~50% depth' },
        { label: 'CTA placement', value: db.cta },
        { label: 'Aspect ratio', value: db.ratio },
      ],
      verdict: shortFormEdu
        ? { tone: 'warn', title: 'Education on a short-form feed', message: `Teaching content runs long, but ${db.name} retention falls off a cliff past 60s. Split the lesson into a series (part 1 today, part 2 pinned) — series completion beats one long video on both reach and follows.` }
        : advice,
      note: 'Wistia’s 2024 engagement report: videos under 60s keep the highest average engagement, decaying roughly linearly after. TikTok’s own creator guidance pegs 21–34s as the engagement sweet spot, and completion rate is its top ranking signal. YouTube mid-roll ads unlock at 8:00 — the reason serious long-form lives at 8–15 minutes. Cut per-platform; one render cross-posted everywhere wastes at least two feeds.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   11. SOCIAL MEDIA ROI
   ═══════════════════════════════════════════════════════════════ */

const SocialMediaRoi = makeCalc({
  fields: [
    { id: 'spend', label: 'Total monthly spend', type: 'number', suffix: 'USD', default: '2500', min: 0, step: 100, help: 'Ads + tools + freelancers + your hours at a rate.' },
    { id: 'revenue', label: 'Revenue attributed to social', type: 'number', suffix: 'USD', default: '9000', min: 0, step: 100 },
    { id: 'customers', label: 'Customers acquired', type: 'number', suffix: 'cust.', default: '40', min: 0, step: 1 },
    { id: 'margin', label: 'Gross profit margin', type: 'number', suffix: '%', default: '55', min: 0, max: 100, step: 1, help: 'Revenue minus COGS. This is where ROAS flattery ends.' },
  ],
  compute(values) {
    const spend = num(values.spend);
    const revenue = num(values.revenue);
    const customers = num(values.customers);
    const margin = clamp(num(values.margin), 0, 100);
    const gross = revenue * (margin / 100);
    const net = gross - spend;
    const roi = spend > 0 ? (net / spend) * 100 : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    const perCustomer = customers > 0 ? net / customers : 0;
    const annual = net * 12;
    const breakEvenRoas = margin > 0 ? 100 / margin : 0;

    return {
      stats: [
        { label: 'Net ROI', value: pct(roi, 0), tone: roi > 0 ? 'good' : 'bad', hint: 'margin-adjusted profit vs spend' },
        { label: 'ROAS', value: `${roas.toFixed(2)}×`, tone: roas >= 3 ? 'good' : roas >= breakEvenRoas ? 'warn' : 'bad', hint: `revenue ÷ spend` },
        { label: 'Net monthly profit', value: money(net), tone: net > 0 ? 'good' : 'bad' },
        { label: 'Profit per customer', value: customers > 0 ? money(perCustomer) : '—' },
      ],
      breakdown: [
        { label: 'Attributed revenue', value: money(revenue) },
        { label: `Gross profit @ ${pct(margin, 0)} margin`, value: money(gross) },
        { label: 'Total spend', value: money(spend) },
        { label: 'Net profit', value: money(net) },
        { label: 'Break-even ROAS for this margin', value: `${breakEvenRoas.toFixed(2)}×` },
        { label: 'Annualized run-rate (net × 12)', value: money(annual) },
      ],
      verdict:
        roas >= 3
          ? { tone: 'good', title: 'Above the 3× ROAS bar', message: `${roas.toFixed(2)}× ROAS and ${pct(roi, 0)} net ROI after margin — healthy. The next lever is scale: raise budget ~20% while CPA holds, and re-check attribution honestly (platform-reported conversions typically overstate 15–30%).` }
          : roas >= breakEvenRoas
            ? { tone: 'warn', title: 'Profitable, but under the 3× bar', message: `You clear break-even for a ${pct(margin, 0)} margin (needs ${breakEvenRoas.toFixed(2)}×) but miss the 3× benchmark. Cheapest fixes: raise AOV with bundles, cut CPA with better creative, or reprice — margin moves the whole equation.` }
            : { tone: 'bad', title: 'Under water after margin', message: `At ${pct(margin, 0)} margin you need ${breakEvenRoas.toFixed(2)}× ROAS just to break even — you’re at ${roas.toFixed(2)}×. Cutting spend isn’t strategy: fix margin, AOV or targeting before this becomes a monthly leak.` },
      note: 'ROAS flatters; ROI tells the truth: 3× on a 30%-margin product is roughly break-even (break-even ROAS = 1 ÷ 0.30 ≈ 3.3×). Count everything in spend — creative production, scheduling tools, agency retainers and your own time. Post-iOS 14.5, platform-reported conversions overstate reality by ~15–30% versus holdout tests; triangulate with UTMs, discount codes and a post-purchase “how did you hear about us?” survey.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   12. HOURLY RATE
   ═══════════════════════════════════════════════════════════════ */

const HourlyRate = makeCalc({
  fields: [
    { id: 'expenses', label: 'Annual business + living expenses', type: 'number', suffix: 'USD', default: '36000', min: 0, step: 500 },
    { id: 'income', label: 'Desired take-home income', type: 'number', suffix: 'USD', default: '60000', min: 0, step: 500, help: 'Pre-tax profit you want to pocket.' },
    { id: 'billable', label: 'Billable hours per week', type: 'number', suffix: 'hrs', default: '25', min: 0, max: 60, step: 1, help: 'Be honest: solo consultants sustain 20–28, not 40.' },
    { id: 'off', label: 'Weeks off per year', type: 'number', suffix: 'wks', default: '4', min: 0, max: 30, step: 1 },
    { id: 'tax', label: 'Effective tax rate', type: 'number', suffix: '%', default: '28', min: 0, max: 60, step: 1 },
  ],
  compute(values) {
    const expenses = num(values.expenses);
    const income = num(values.income);
    const billable = num(values.billable);
    const off = num(values.off);
    const tax = clamp(num(values.tax), 0, 90);

    const workWeeks = clamp(52 - off, 0, 52);
    const hours = billable * workWeeks;
    const grossNeeded = tax < 100 ? (expenses + income) / (1 - tax / 100) : 0;
    const rate = hours > 0 ? grossNeeded / hours : 0;
    const taxReserve = grossNeeded - expenses - income;
    const utilization = (billable / 40) * 100;

    return {
      stats: [
        { label: 'Required hourly rate', value: money(rate), tone: 'good', hint: `${fmt(hours)} billable hrs/yr` },
        { label: 'Monthly revenue target', value: money(grossNeeded / 12) },
        { label: 'Billable hours / year', value: fmt(hours), hint: `${fmt(billable)} hrs × ${fmt(workWeeks)} wks` },
        { label: 'Tax reserve / year', value: money(taxReserve), hint: `set aside ${pct(tax, 0)} of gross` },
      ],
      breakdown: [
        { label: 'Business + living expenses', value: money(expenses) },
        { label: 'Target take-home income', value: money(income) },
        { label: `Taxes to reserve @ ${pct(tax, 0)}`, value: money(taxReserve) },
        { label: 'Gross revenue needed', value: money(grossNeeded) },
        { label: 'Working weeks', value: `${fmt(workWeeks)} of 52` },
        { label: 'Rate floor (round up in practice)', value: `${money(rate)}/hr` },
      ],
      verdict:
        billable > 30
          ? { tone: 'warn', title: 'This plan needs too many billable hours', message: `${fmt(billable)} billable hrs/wk leaves under 10 hours for sales, admin and learning — and sales is what books next quarter. Raise the rate or trim the income target instead of betting on 30+ hour weeks indefinitely.` }
          : { tone: 'good', title: 'Sustainable, sellable rate', message: `${fmt(billable)} billable hrs/wk ≈ ${pct(utilization, 0)} utilization — a realistic solo load. Charge at or above ${money(Math.ceil(rate))}/hr: it covers expenses, target income and taxes with the non-billable reality priced in. Revisit yearly with inflation (~3%).` },
      note: 'Freelancer utilization averages 60–70% — pricing against 40 billable hours/wk undercharges by ~40%. Non-billable work (sales, admin, learning, invoicing) quietly consumes 12–15 hrs/wk. Use this rate as your cost floor, then price fixed-scope work at value: the hourly number exists so value pricing never dips below break-even. Industry surveys place experienced US specialist rates at $50–80/hr; this tool tells you if yours must be higher.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   13. PROFIT MARGIN
   ═══════════════════════════════════════════════════════════════ */

const ProfitMargin = makeCalc({
  fields: [
    { id: 'cost', label: 'Cost per unit', type: 'number', suffix: 'USD', default: '12', min: 0, step: 0.5, help: 'Product + shipping + payment fees.' },
    { id: 'price', label: 'Selling price', type: 'number', suffix: 'USD', default: '29', min: 0, step: 0.5 },
    { id: 'units', label: 'Units per month', type: 'number', suffix: 'units', default: '300', min: 0, step: 10 },
  ],
  compute(values) {
    const cost = num(values.cost);
    const price = num(values.price);
    const units = num(values.units);
    const profitUnit = price - cost;
    const margin = price > 0 ? (profitUnit / price) * 100 : 0;
    const markup = cost > 0 ? (profitUnit / cost) * 100 : 0;
    const revenue = price * units;
    const cogs = cost * units;
    const grossProfit = profitUnit * units;
    const price40 = cost / 0.6;
    const price60 = cost / 0.4;

    return {
      stats: [
        { label: 'Gross margin', value: pct(margin, 1), tone: margin >= 40 ? 'good' : margin >= 20 ? 'warn' : 'bad', hint: 'profit ÷ price' },
        { label: 'Markup', value: pct(markup, 1), hint: 'profit ÷ cost' },
        { label: 'Profit per unit', value: money(profitUnit), tone: profitUnit > 0 ? 'good' : 'bad' },
        { label: 'Monthly gross profit', value: money(grossProfit), hint: `${fmt(units)} units` },
      ],
      breakdown: [
        { label: 'Monthly revenue', value: money(revenue) },
        { label: 'Cost of goods sold', value: money(cogs) },
        { label: 'Gross profit', value: money(grossProfit) },
        { label: 'Margin check (profit ÷ price)', value: pct(margin, 2) },
        { label: 'Markup check (profit ÷ cost)', value: pct(markup, 2) },
        { label: 'Price for a 40% margin', value: money(price40) },
        { label: 'Price for a 60% margin', value: money(price60) },
      ],
      verdict:
        price <= 0
          ? { tone: 'bad', title: 'Enter a selling price', message: 'Margin is computed against price — type a price above $0 to see the full picture.' }
          : cost >= price
            ? { tone: 'bad', title: 'Selling at or below cost', message: 'Every unit loses money before overhead even starts. Reprice or re-source before scaling volume — volume multiplies the loss, not the fix.' }
            : margin >= 40
              ? { tone: 'good', title: 'Healthy margin', message: `${pct(margin, 1)} gross margin is solid — retail targets 40–55% (keystone ≈ 100% markup), SaaS runs 70–90%. Keep ${pct(markup, 1)} markup consistent across the catalog so no SKU quietly subsidizes another.` }
              : margin >= 20
                ? { tone: 'warn', title: 'Workable but thin', message: `${pct(margin, 1)} margin means discounts and returns live inside a small buffer — a 10% promo consumes half your profit. Price for a 40% margin is ${money(price40)}; a modest increase beats volume chasing.` }
                : { tone: 'bad', title: 'Margin leaves no room', message: `${pct(margin, 1)} can’t absorb payment fees (~3%), returns or a single promo. You need ${money(price40)} for a 40% margin — or a cheaper unit cost. Below ~20% gross margin, scale becomes a trap.` },
      note: 'Margin vs markup, once and for all: markup is on cost, margin is on price. A $10 item at $15 has 50% markup but only 33.3% margin — teams that price by “50% margin” while computing 50% markup underprice every unit by a third. Conversion: margin = markup ÷ (1 + markup). Benchmarks: keystone retail = 50% margin; restaurants 60–70% on food (then die on labor); grocery 1–3% net; SaaS 70–90% gross.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   14. BREAK-EVEN
   ═══════════════════════════════════════════════════════════════ */

const BreakEven = makeCalc({
  fields: [
    { id: 'fixed', label: 'Fixed costs per month', type: 'number', suffix: 'USD', default: '5000', min: 0, step: 100, help: 'Rent, salaries, tools — the bills that ignore volume. Include your own salary.' },
    { id: 'variable', label: 'Variable cost per unit', type: 'number', suffix: 'USD', default: '8', min: 0, step: 0.5 },
    { id: 'price', label: 'Price per unit', type: 'number', suffix: 'USD', default: '24', min: 0, step: 0.5 },
    { id: 'expected', label: 'Expected units per month', type: 'number', suffix: 'units', default: '', placeholder: 'e.g. 400', help: 'Optional — unlocks the safety-margin readout.' },
  ],
  compute(values) {
    const fixed = num(values.fixed);
    const variable = num(values.variable);
    const price = num(values.price);
    const expected = num(values.expected);
    const cm = price - variable;
    const cmRatio = price > 0 ? (cm / price) * 100 : 0;
    const beUnits = cm > 0 ? Math.ceil(fixed / cm) : 0;
    const beRevenue = beUnits * price;
    const hasExpected = expected > 0 && cm > 0;
    const safety = hasExpected ? ((expected - beUnits) / expected) * 100 : 0;

    return {
      stats: [
        { label: 'Break-even units', value: cm > 0 ? `${fmt(beUnits)}/mo` : '—', tone: cm > 0 ? 'good' : 'bad', hint: cm > 0 ? `${money(beRevenue)} in revenue` : 'price below variable cost' },
        { label: 'Break-even revenue', value: cm > 0 ? money(beRevenue) : '—' },
        { label: 'Contribution margin / unit', value: money(cm), tone: cm > 0 ? 'good' : 'bad', hint: `${pct(cmRatio, 1)} of price` },
        hasExpected
          ? { label: 'Margin of safety', value: pct(safety, 0), tone: safety >= 25 ? 'good' : safety >= 10 ? 'warn' : 'bad', hint: `${fmt(Math.max(0, expected - beUnits))} units above break-even` }
          : { label: 'CM ratio', value: pct(cmRatio, 1), hint: 'add expected units for safety margin' },
      ],
      breakdown: [
        { label: 'Fixed costs / mo', value: money(fixed) },
        { label: 'Variable cost / unit', value: money(variable) },
        { label: 'Price / unit', value: money(price) },
        { label: 'Contribution margin / unit', value: money(cm) },
        { label: 'Break-even units / mo', value: cm > 0 ? fmt(beUnits) : 'never (cm ≤ 0)' },
        { label: 'Break-even revenue / mo', value: money(beRevenue) },
        { label: 'Units to first $1k profit', value: cm > 0 ? fmt(Math.ceil((fixed + 1000) / cm)) : '—' },
      ],
      verdict:
        price <= 0 || (variable === 0 && price === 0)
          ? { tone: 'bad', title: 'Enter price and costs', message: 'Break-even needs a price above $0 and your per-unit cost to compute the contribution margin.' }
          : cm <= 0
            ? { tone: 'bad', title: 'Every unit loses money', message: `Price must exceed variable cost: you’re ${money(Math.abs(cm))} under per unit. Raise price above ${money(variable)} or cut unit cost before volume can possibly help.` }
            : hasExpected && safety >= 25
              ? { tone: 'good', title: 'Comfortable cushion', message: `Demand can fall ${pct(safety, 0)} before you touch the red line — that’s the resilience that survives a soft month. Protect it: fixed-cost creep is what erodes safety margins silently.` }
              : hasExpected && safety >= 10
                ? { tone: 'warn', title: 'Thin cushion', message: `Only ${pct(safety, 0)} between your forecast and break-even (${fmt(beUnits)} units). One soft month or a 10% variable-cost creep puts you under. Raise price or trim fixed costs before scaling spend.` }
                : hasExpected
                  ? { tone: 'bad', title: 'Fragile model', message: `Forecast is ${expected < beUnits ? 'below' : 'barely above'} break-even (${fmt(beUnits)} units). Cut fixed costs, reprice, or validate demand harder before committing — the model doesn’t survive contact with a bad month.` }
                  : cmRatio >= 30
                    ? { tone: 'good', title: 'Strong contribution economics', message: `Each sale contributes ${money(cm)} (${pct(cmRatio, 1)} of price) toward fixed costs — healthy unit economics. Add expected monthly units above to see your margin of safety.` }
                    : { tone: 'warn', title: 'Weak contribution margin', message: `Only ${pct(cmRatio, 1)} of each sale fights fixed costs — volume must be enormous before profit appears. A price increase flows straight to this ratio; test one before chasing more units.` },
      note: 'Contribution margin = price − variable cost; break-even units = fixed ÷ contribution. Cafés run 60–70% variable costs (break-even near 75%+ of capacity); SaaS sits at 80–90% gross margin where break-even is really about CAC payback. Include your own salary in fixed costs — founders who leave it out “discover” profit that’s actually underpaid labor. Recheck quarterly: fixed costs only ever creep up.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   15. ROI
   ═══════════════════════════════════════════════════════════════ */

const Roi = makeCalc({
  fields: [
    { id: 'invested', label: 'Amount invested', type: 'number', suffix: 'USD', default: '5000', min: 0, step: 100, help: 'Media + creative + tools + your time at a defensible rate.' },
    { id: 'returned', label: 'Amount returned', type: 'number', suffix: 'USD', default: '7500', min: 0, step: 100 },
    { id: 'months', label: 'Duration', type: 'number', suffix: 'months', default: '12', min: 0, step: 1 },
  ],
  compute(values) {
    const invested = num(values.invested);
    const returned = num(values.returned);
    const months = Math.max(0, num(values.months));
    const net = returned - invested;
    const roi = invested > 0 ? (net / invested) * 100 : 0;
    const monthlyRoi = months > 0 ? roi / months : 0;
    const annualized = months > 0 ? roi * (12 / months) : 0;

    return {
      stats: [
        { label: 'Net profit', value: money(net), tone: net > 0 ? 'good' : 'bad' },
        { label: 'ROI', value: pct(roi, 1), tone: roi > 0 ? 'good' : 'bad', hint: 'net ÷ invested' },
        { label: 'Monthly ROI', value: pct(monthlyRoi, 2), hint: months > 0 ? `over ${fmt(months)} months` : undefined },
        { label: 'Annualized (simple)', value: pct(annualized, 1), tone: annualized >= 10 ? 'good' : annualized >= 0 ? 'warn' : 'bad', hint: 'vs S&P 500 ≈ 10%/yr' },
      ],
      breakdown: [
        { label: 'Invested', value: money(invested) },
        { label: 'Returned', value: money(returned) },
        { label: 'Net profit', value: money(net) },
        { label: 'ROI over period', value: pct(roi, 2) },
        { label: 'Simple annualized', value: pct(annualized, 2) },
        { label: 'Multiple on capital', value: invested > 0 ? `${(returned / invested).toFixed(2)}×` : '—' },
      ],
      verdict:
        invested <= 0
          ? { tone: 'warn', title: 'Enter an investment amount', message: 'ROI is computed against what you put in — enter the invested amount to anchor the percentages.' }
          : annualized >= 20
            ? { tone: 'good', title: 'Clears the passive alternative by 2×+', message: `${pct(annualized, 0)} simple annualized doubles the S&P 500’s ~10%/yr long-run average — and you did it actively. Just confirm the returned figure is honest (cash collected, not pipeline) before scaling.` }
            : annualized >= 10
              ? { tone: 'good', title: 'Beats the market average', message: `${pct(annualized, 1)} annualized edges past the S&P 500’s ~10%/yr historical average. For an active project that’s a floor, not a victory — look for the constraint (creative, offer, audience) that’s capping the multiple.` }
              : annualized >= 0
                ? { tone: 'warn', title: 'Positive, but your capital can do better', message: `${pct(annualized, 1)} annualized trails the ~10%/yr passive benchmark. An active project should pay a premium for your effort — fix the funnel or reallocate the ${money(invested)} until it does.` }
                : { tone: 'bad', title: 'Net loss', message: `${money(Math.abs(net))} went in and didn’t come back. Before re-investing, name the failed assumption: wrong audience, weak offer, or attribution wishful thinking — one of the three is always the culprit.` },
      note: 'Simple annualization (ROI × 12 ÷ months) ignores compounding — fine for campaigns under a year and matches how marketers talk. For multi-year investments use CAGR: a 50% return over 3 years is 16.7%/yr simple but only 14.5% CAGR. Context anchor: the S&P 500 has averaged ~10%/yr nominal (≈7% real) over the last century — every active investment should explain why it beats the boring alternative.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   16. EMI / LOAN
   ═══════════════════════════════════════════════════════════════ */

const EmiLoan = makeCalc({
  fields: [
    { id: 'amount', label: 'Loan amount', type: 'number', suffix: 'USD', default: '250000', min: 0, step: 1000 },
    { id: 'rate', label: 'Annual interest rate', type: 'number', suffix: '%', default: '9.5', min: 0, max: 100, step: 0.1, help: 'Reducing-balance APR — the standard for home/business loans.' },
    { id: 'years', label: 'Tenure', type: 'number', suffix: 'years', default: '5', min: 0, max: 40, step: 1 },
  ],
  compute(values) {
    const amount = num(values.amount);
    const rate = num(values.rate);
    const years = num(values.years);
    const n = Math.max(1, Math.round(years * 12));
    const r = rate / 1200;
    const pow = Math.pow(1 + r, n);
    const emi = r === 0 ? amount / n : (amount * r * pow) / (pow - 1);
    const total = emi * n;
    const interest = total - amount;
    const share = total > 0 ? (interest / total) * 100 : 0;

    return {
      stats: [
        { label: 'Monthly EMI', value: money(emi), tone: 'good', hint: `${fmt(n)} payments` },
        { label: 'Total interest', value: money(interest), tone: share > 50 ? 'bad' : share > 35 ? 'warn' : 'good' },
        { label: 'Total payment', value: money(total) },
        { label: 'Interest share', value: pct(share, 1), tone: share > 50 ? 'bad' : share > 35 ? 'warn' : 'good', hint: 'of every payment' },
      ],
      breakdown: [
        { label: 'Principal borrowed', value: money(amount) },
        { label: 'Interest cost', value: money(interest) },
        { label: 'Principal share of payments', value: pct(100 - share, 1) },
        { label: 'Interest share of payments', value: pct(share, 1) },
        { label: 'Interest per $100 borrowed', value: amount > 0 ? money((interest / amount) * 100) : '—' },
        { label: 'Payments (n)', value: fmt(n) },
      ],
      verdict:
        amount <= 0
          ? { tone: 'warn', title: 'Enter a loan amount', message: 'The amortization math needs the principal — enter loan amount, rate and tenure to see the full schedule math.' }
          : share > 50
            ? { tone: 'warn', title: 'Interest is more than half of what you pay', message: `${pct(share, 0)} of every payment is interest. Shortening tenure bites least: raising the EMI ~10% typically cuts total interest 20–25% on a mid-length loan. Test a shorter tenure above.` }
            : share > 35
              ? { tone: 'good', title: 'Typical amortization profile', message: `${pct(share, 1)} interest share is normal for this tenure. Early payments are interest-heavy — principal barely moves the first years. One extra EMI per year shaves real years off long tenures.` }
              : { tone: 'good', title: 'Interest-efficient structure', message: `Only ${pct(share, 1)} of your total payment is interest — short tenure and/or low rate working in your favor. Keep prepayment options in the loan agreement anyway.` },
      note: 'Formula: EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), with r = monthly rate. Lenders quoting “flat rate” charge interest on the original principal all term — a 5% flat rate equates to roughly a 9–10% reducing APR. Always compare offers on total repayment (or APR), include processing fees (0.5–2%), and check prepayment penalties; on a 20-year loan, 8 years in you’ve repaid barely 20% of principal.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   17. GST / VAT
   ═══════════════════════════════════════════════════════════════ */

const GstVat = makeCalc({
  fields: [
    { id: 'amount', label: 'Amount', type: 'number', suffix: 'USD', default: '1000', min: 0, step: 10, help: 'Net amount (to add tax) or gross price (to extract tax).' },
    {
      id: 'preset', label: 'Tax rate', type: 'select', default: '18',
      options: [
        { value: '5', label: '5% — GST lower slab, Canada GST' },
        { value: '10', label: '10% — Japan CT, Australia GST, GST mid-slab' },
        { value: '12', label: '12% — GST slab' },
        { value: '18', label: '18% — GST standard slab' },
        { value: '20', label: '20% — UK / Germany / France VAT' },
        { value: '23', label: '23% — Ireland / Poland VAT' },
        { value: 'custom', label: 'Custom rate…' },
      ],
    },
    { id: 'custom', label: 'Custom rate', type: 'number', suffix: '%', default: '0', min: 0, max: 100, step: 0.1, help: 'Used when the preset is set to Custom.' },
    {
      id: 'mode', label: 'Mode', type: 'select', default: 'add', full: true,
      options: [
        { value: 'add', label: 'Add tax — amount is net (exclusive)' },
        { value: 'remove', label: 'Remove tax — amount is gross (inclusive)' },
      ],
    },
  ],
  compute(values) {
    const preset = values.preset ?? '18';
    const rate = preset === 'custom' ? num(values.custom) : num(preset);
    const amount = num(values.amount);
    const add = (values.mode ?? 'add') === 'add';

    const net = add ? amount : rate > -100 ? amount / (1 + rate / 100) : amount;
    const tax = add ? amount * (rate / 100) : amount - net;
    const gross = add ? amount + tax : amount;

    return {
      stats: [
        { label: add ? 'Net (tax-exclusive)' : 'Net (excluding tax)', value: money(net), tone: 'good' },
        { label: `Tax @ ${pct(rate, 2)}`, value: money(tax) },
        { label: add ? 'Gross (invoice total)' : 'Gross (tax-inclusive)', value: money(gross) },
        { label: 'Tax share of gross', value: gross > 0 ? pct((tax / gross) * 100, 2) : '0%' },
      ],
      breakdown: [
        { label: 'Amount entered', value: money(amount) },
        { label: 'Rate applied', value: pct(rate, 2) },
        { label: 'Net', value: money(net) },
        { label: 'Tax', value: money(tax) },
        { label: 'Gross', value: money(gross) },
        { label: 'Formula used', value: add ? 'tax = amount × rate ÷ 100' : 'tax = amount × rate ÷ (100 + rate)' },
      ],
      verdict:
        rate <= 0
          ? { tone: 'bad', title: 'Pick a valid rate', message: 'Choose a preset or enter a custom rate above 0% — otherwise there’s no tax to compute.' }
          : add
            ? { tone: 'good', title: 'Tax added cleanly', message: `${money(tax)} on top of ${money(net)} makes ${money(gross)} invoiceable at ${pct(rate, 2)}. Quote net + tax separately on invoices — inclusive pricing hides your margin from nobody and confuses accountants.` }
            : { tone: 'good', title: 'Tax extracted correctly', message: `${money(tax)} of the ${money(gross)} gross is tax — your real net is ${money(net)}. Note it’s less than subtracting ${pct(rate, 2)} from the gross: the tax lives inside the price, so you divide by (100 + rate).` },
      note: 'Reverse-charge / margin math: extracting tax from a gross price is tax = gross × rate ÷ (100 + rate) — on a $1,180 gross sale at 18% GST, tax is $180, not $212.40. Subtracting the rate from the gross double-counts tax that’s already inside it. Common slabs: India GST 0/5/12/18/28%; UK VAT 20%; Germany 19%; France 20%; Ireland 23%; Australia 10%; Japan 10%; Canada 5%. Reduced rates and exemptions vary by category — confirm with the local authority.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   18. SALARY TO HOURLY
   ═══════════════════════════════════════════════════════════════ */

const SalaryToHourly = makeCalc({
  fields: [
    { id: 'salary', label: 'Annual salary', type: 'number', suffix: 'USD', default: '65000', min: 0, step: 500 },
    { id: 'hours', label: 'Hours per week', type: 'number', suffix: 'hrs', default: '40', min: 0, max: 100, step: 1, help: '40 nominal — many salaried roles run 45–50 real.' },
    { id: 'weeks', label: 'Weeks per year', type: 'number', suffix: 'wks', default: '52', min: 0, max: 52, step: 1 },
    {
      id: 'unpaid', label: 'Unpaid days off', type: 'select', default: '0',
      options: [
        { value: '0', label: 'None — fully paid leave' },
        { value: '5', label: '5 days (1 week) unpaid' },
        { value: '10', label: '10 days (2 weeks) unpaid' },
        { value: '15', label: '15 days (3 weeks) unpaid' },
        { value: '20', label: '20 days (4 weeks) unpaid' },
      ],
    },
  ],
  compute(values) {
    const salary = num(values.salary);
    const hours = num(values.hours);
    const weeks = num(values.weeks);
    const unpaid = num(values.unpaid);
    const paidWeeks = Math.max(0, weeks - unpaid / 5);
    const totalHours = hours * paidWeeks;
    const hourly = totalHours > 0 ? salary / totalHours : 0;
    const daily = hourly * 8;
    const weekly = weeks > 0 ? salary / weeks : 0;
    const trueAt50 = totalHours > 0 ? salary / (50 * paidWeeks) : 0;

    return {
      stats: [
        { label: 'Hourly rate', value: money(hourly), tone: 'good', hint: `${fmt(totalHours)} paid hrs/yr` },
        { label: 'Daily (8h)', value: money(daily) },
        { label: 'Weekly', value: money(weekly) },
        { label: 'Monthly', value: money(salary / 12) },
      ],
      breakdown: [
        { label: 'Annual salary', value: money(salary) },
        { label: `Paid hours/year (${fmt(hours)} hrs × ${fmt(paidWeeks, 1)} wks)`, value: fmt(totalHours) },
        { label: unpaid > 0 ? `Unpaid days adjustment (−${fmt(unpaid)} days)` : 'Unpaid days adjustment', value: unpaid > 0 ? `${fmt(paidWeeks, 1)} paid weeks` : 'none' },
        { label: 'Effective hourly', value: `${money(hourly)}/hr` },
        { label: 'Effective daily (8h)', value: money(daily) },
        { label: 'Effective monthly', value: money(salary / 12) },
      ],
      verdict:
        hours > 45
          ? { tone: 'warn', title: 'Real hours are eating the rate', message: `At ${fmt(hours)} hrs/wk this salary is worth ${money(hourly)}/hr. Most salaried roles drift to 45–50 real hours — every extra hour is an unpriced pay cut, since the salary never changes.` }
          : { tone: 'good', title: 'Clean conversion', message: `${money(salary)} ÷ ${fmt(totalHours)} paid hours = ${money(hourly)}/hr. If overtime creeps to 50 hrs/wk, the true rate drops to ${money(trueAt50)}/hr — the number to remember in any “same pay, more hours” conversation.` },
      note: 'The quick math: salary ÷ 2,080 (40 × 52). Refinements move it 10–20%: unpaid days, part-year schedules and real overtime. BLS 2024: US median full-time wage ≈ $1,165/week ≈ $29/hr. Salaried exempt roles log 8–10 unpaid OT hours/week on average — which is why contractors quoting $60–80/hr aren’t as expensive as they look: they bill their own downtime, taxes, tools and risk.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   19. EMPLOYEE COST
   ═══════════════════════════════════════════════════════════════ */

const EmployeeCost = makeCalc({
  fields: [
    { id: 'salary', label: 'Base salary', type: 'number', suffix: 'USD', default: '85000', min: 0, step: 1000 },
    { id: 'benefits', label: 'Benefits load', type: 'number', suffix: '%', default: '22', min: 0, max: 100, step: 1, help: 'Health, retirement, insurance — 20–30% is typical.' },
    { id: 'payrollTax', label: 'Payroll taxes', type: 'number', suffix: '%', default: '12', min: 0, max: 40, step: 0.5, help: 'Employer side: FICA 7.65% + FUTA/SUTA in the US.' },
    { id: 'equipment', label: 'Equipment (one-off)', type: 'number', suffix: 'USD', default: '2500', min: 0, step: 100 },
    { id: 'overhead', label: 'Monthly overhead per person', type: 'number', suffix: 'USD', default: '350', min: 0, step: 50, help: 'Desk, software licences, perks, share of rent.' },
    {
      id: 'recruiting', label: 'Recruiting fee?', type: 'select', default: 'no',
      options: [
        { value: 'no', label: 'No — hired directly' },
        { value: 'yes', label: 'Yes — agency fee ≈ 20% of salary' },
      ],
    },
  ],
  compute(values) {
    const salary = num(values.salary);
    const benefits = salary * (num(values.benefits) / 100);
    const payrollTax = salary * (num(values.payrollTax) / 100);
    const equipment = num(values.equipment);
    const overheadY = num(values.overhead) * 12;
    const recruiting = values.recruiting === 'yes' ? salary * 0.2 : 0;
    const total = salary + benefits + payrollTax + equipment + overheadY + recruiting;
    const mult = salary > 0 ? total / salary : 0;

    return {
      stats: [
        { label: 'Year-1 total cost', value: money(total), tone: 'good' },
        { label: 'Monthly cost', value: money(total / 12), hint: 'use this in runway math' },
        { label: 'Cost multiplier', value: `${mult.toFixed(2)}×`, tone: mult >= 1.15 && mult <= 1.55 ? 'good' : 'warn', hint: 'typical: 1.25–1.4×' },
        { label: 'Overhead above salary', value: money(total - salary) },
      ],
      breakdown: [
        { label: 'Base salary', value: money(salary) },
        { label: `Benefits @ ${pct(num(values.benefits), 0)}`, value: money(benefits) },
        { label: `Payroll taxes @ ${pct(num(values.payrollTax), 1)}`, value: money(payrollTax) },
        { label: 'Equipment (one-off)', value: money(equipment) },
        { label: 'Workspace & overhead (12 mo)', value: money(overheadY) },
        { label: recruiting > 0 ? 'Recruiting fee (20% of salary)' : 'Recruiting fee', value: recruiting > 0 ? money(recruiting) : '—' },
        { label: 'Year-1 total', value: money(total) },
      ],
      verdict:
        salary <= 0
          ? { tone: 'warn', title: 'Enter a base salary', message: 'Every load percentage multiplies the base — enter salary to see the fully-loaded picture.' }
          : mult < 1.15
            ? { tone: 'warn', title: 'Suspiciously lean', message: `Under 1.15× salary usually means something is missing — health premiums, employer taxes or the manager’s onboarding time. Budgets built this way blow up in month 4.` }
            : mult > 1.55
              ? { tone: 'warn', title: 'Heavy first-year load', message: `${mult.toFixed(2)}× is inflated by one-offs (equipment, recruiting fee). Amortize them over 3 years and the steady-state multiplier is ≈${((total - equipment - recruiting) / 3 / salary * 3 / salary).toFixed(2)}× — use that for ongoing runway, the full figure for cash planning.` }
              : { tone: 'good', title: 'Matches the fully-loaded rule', message: `${mult.toFixed(2)}× salary sits in the classic 1.25–1.4× band (tech hubs and senior roles run higher). Plan cash on the monthly figure, not the salary — the gap is where hiring budgets die.` },
      note: 'Benchmarks: BLS ECEC puts benefits at ≈31% of total compensation cost — employer health premiums alone average ~$8–9k/yr. Employer payroll taxes: 7.65% FICA + 1–5% FUTA/SUTA (US). Recruiting: agency fees run 15–25% of salary, job boards + screening time add $1–2k. The quiet cost: ramp-up — a new hire outputs at partial capacity for 1–3 months while consuming a manager’s attention.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   20. MEETING COST
   ═══════════════════════════════════════════════════════════════ */

const MeetingCost = makeCalc({
  fields: [
    { id: 'attendees', label: 'Attendees', type: 'number', suffix: 'people', default: '6', min: 0, step: 1 },
    { id: 'rate', label: 'Avg hourly cost per person', type: 'number', suffix: 'USD/hr', default: '55', min: 0, step: 5, help: 'Fully-loaded: salary × 1.3 ÷ 2,080.' },
    { id: 'duration', label: 'Duration', type: 'number', suffix: 'min', default: '45', min: 0, step: 5, help: 'Include the “while we’re here” tail.' },
    { id: 'perWeek', label: 'Meetings per week', type: 'number', suffix: '×/wk', default: '5', min: 0, step: 1 },
  ],
  compute(values) {
    const attendees = num(values.attendees);
    const rate = num(values.rate);
    const duration = num(values.duration);
    const perWeek = num(values.perWeek);
    const perMeeting = attendees * (rate / 60) * duration;
    const weekly = perMeeting * perWeek;
    const monthly = perMeeting * perWeek * 4.33;
    const yearly = perMeeting * perWeek * 52;
    const personHours = attendees * (duration / 60) * perWeek * 52;
    const salaryPct = rate > 0 ? (yearly / (rate * 2080)) * 100 : 0;

    return {
      stats: [
        { label: 'Cost per meeting', value: money(perMeeting), hint: `${fmt(attendees)} people × ${fmt(duration)} min` },
        { label: 'Monthly cost', value: money(monthly), hint: '4.33 weeks/mo' },
        { label: 'Yearly cost', value: money(yearly), tone: yearly >= 100000 ? 'bad' : yearly >= 40000 ? 'warn' : 'good' },
        { label: 'Person-hours / year', value: fmt(personHours), hint: 'attendee-hours consumed' },
      ],
      breakdown: [
        { label: 'Per meeting', value: money(perMeeting) },
        { label: 'Per week', value: money(weekly) },
        { label: 'Per month (4.33 wks)', value: money(monthly) },
        { label: 'Per year (52 wks)', value: money(yearly) },
        { label: 'Person-hours consumed / yr', value: fmt(personHours) },
        { label: 'Half-length saves / yr', value: money(yearly / 2) },
      ],
      verdict:
        yearly >= 100000
          ? { tone: 'bad', title: 'That’s a full salary burned yearly', message: `${money(yearly)}/yr on this one recurring meeting — ${pct(salaryPct, 0)} of a full-time salary at this rate, ${fmt(personHours)} person-hours. Cut it to 25 minutes with a required agenda or cancel every other occurrence: that alone reclaims ${money(yearly / 2)}.` }
          : yearly >= 40000
            ? { tone: 'warn', title: 'Real money for a habit', message: `${money(yearly)}/yr — ${pct(salaryPct, 0)} of a salary — for one recurring meeting. Default to 25/50-minute slots and a no-agenda-no-meeting rule; most of the value survives at half the cost.` }
            : { tone: 'good', title: 'Cheap… but only “only” relatively', message: `${money(yearly)}/yr is ${pct(salaryPct, 0)} of a fully-loaded salary for ONE recurring meeting. If it ends with clear decisions and owners, it earns its keep — if it’s status updates, an async doc is free.` },
      note: 'Use fully-loaded rates (salary × ~1.3 for benefits/taxes, ÷ 2,080 hours) — base salary understates cost 25–30%. HBR survey: 71% of senior managers say meetings are unproductive and inefficient. The proven levers: agendas required (no agenda, no meeting), 25/50-minute defaults, dissent roles, and Shopify-style calendar purges — their 2023 sweep cancelled ~12,000 recurring meetings (≈322,000 hours) with no output drop.',
    };
  },
});

/* ═══════════════════════════════════════════════════════════════
   BATCH EXPORT — slug + component + unique per-tool page copy
   ═══════════════════════════════════════════════════════════════ */

export const batch: BatchTool[] = [
  {
    slug: 'hosting-cost-comparison-tool',
    Component: HostingCostComparison,
    doc: {
      longDescription:
        'Hosting pricing pages are engineered to upsell you. Enter your real traffic, storage and app type, and this calculator prices shared, VPS and managed cloud tiers side by side — including the overage math most providers reveal only on the invoice.',
      howTo: [
        'Enter last month’s visits and how much disk you actually use — not what a sales page assumes.',
        'Pick what the site is: a blog and a Node web app have completely different runtime needs.',
        'Say whether traffic spikes (launches, seasonality, campaigns) — that flips the recommendation.',
        'Read the recommended plan, the honest monthly band, and the when-to-choose notes for all three tiers.',
      ],
      faqs: [
        {
          q: 'When does shared hosting actually break?',
          a: 'Around 25k visits/month, or the moment you need a runtime like Node, background jobs or a dedicated database. It fails as slow TTFB spikes during peak hours before it fails as downtime — watch the host’s CPU/entry-process graphs, not the uptime badge.',
        },
        {
          q: 'VPS or managed WordPress hosting — which wins?',
          a: 'A $12–20 VPS is cheaper if you (or your agency) handle updates, backups and security — budget 1–2 hours/month. Managed hosting ($30+) buys that time back and usually bundles staging plus CDN. For client work billed at $50+/hour, managed wins on straight math.',
        },
      ],
    },
  },
  {
    slug: 'app-localization-cost-calculator',
    Component: AppLocalizationCost,
    doc: {
      longDescription:
        'Translating an app is more than word count × rate — QA passes, store listings and re-integration testing quietly add 30–40%. This calculator builds a realistic localization budget from languages, screen count and the quality tier you actually need.',
      howTo: [
        'Count the new languages you’re launching, excluding your source language.',
        'Enter how many screens hold user-facing strings and your average words per screen (40 is typical).',
        'Choose the quality tier — UI strings, marketing copy and legal text need different levels of human work.',
        'Toggle store assets on if screenshots, keywords and descriptions get localized too.',
      ],
      faqs: [
        {
          q: 'What do professional app localization rates actually look like?',
          a: 'Human translation runs $0.06–0.10/word for basic UI strings, $0.15–0.20 for pro quality with review, and $0.25–0.30+ for premium transcreation or legal work. Rates apply to source words; translation memory typically discounts repeat strings 20–30% on later versions.',
        },
        {
          q: 'Which languages should I localize first?',
          a: 'By App Store revenue impact, Japanese, German, French, Korean and Simplified Chinese consistently rank highest after English. Spanish covers 20+ countries with one localization. Brazilian Portuguese and Russian add volume at lower ARPU — good second-wave picks.',
        },
      ],
    },
  },
  {
    slug: 'in-app-purchase-price-converter',
    Component: InAppPurchasePriceConverter,
    doc: {
      longDescription:
        'Charging the same $4.99 in Lagos and London leaves money on both tables. Enter your US price and get tier-snapped suggestions for 16 storefronts, matched to App Store and Google Play price-point conventions, with USD-equivalents for instant sanity checks.',
      howTo: [
        'Enter your base US price — the anchor every other market keys off.',
        'Pick the purchase type: consumable, subscription or one-time premium.',
        'Scan the ladder-snapped suggestions and the ≈USD column to spot under- and over-priced markets.',
        'Set final prices per store in App Store Connect / Play Console — regional taxes and store ladders get the last word.',
      ],
      faqs: [
        {
          q: 'Why not just convert currency at the exchange rate?',
          a: 'Stores snap prices to fixed ladders ($0.99, £0.79, ¥480…), local willingness-to-pay diverges from PPP, and taxes differ per storefront — EU prices are VAT-inclusive while US prices are not. Parity tables like this mirror what Apple’s and Google’s own auto-conversion produce.',
        },
        {
          q: 'Why are India and Nigeria prices so far below parity?',
          a: 'Both stores deliberately price local tiers far below USD equivalence to match purchasing power — Apple’s India ladder runs roughly ₹80 per US dollar. Lower price drives dramatically higher conversion and volume; that asymmetry is the entire point of regional pricing.',
        },
      ],
    },
  },
  {
    slug: 'battery-usage-estimator',
    Component: BatteryUsageEstimator,
    doc: {
      longDescription:
        'Battery complaints sink app ratings faster than crashes. This estimator converts your feature mix — GPS, camera, background sync, push, animation and audio — into hourly drain on a 4,500mAh reference phone, so you know exactly which feature burns the megawatts.',
      howTo: [
        'Set an intensity (off / low / medium / heavy) for each battery-hungry capability your app uses.',
        'Enter how many minutes a typical user spends on-screen with your app daily.',
        'Check the drain-per-hour figure against the healthy envelope in the verdict.',
        'Open the breakdown — the top row is the feature to optimize first.',
      ],
      faqs: [
        {
          q: 'What drain per hour is acceptable for an app?',
          a: 'Full active use at 15–20%/hour on a modern 4,500mAh phone is normal — that’s the whole device, not just your app. If your feature mix pushes past ~25%/hour, expect users to post battery-settings screenshots in reviews. That’s the classic 1-star pattern.',
        },
        {
          q: 'How do I measure real battery impact?',
          a: 'Android: Battery Historian or adb shell dumpsys batterystats. iOS: Xcode’s Energy Impact gauge in Instruments — anything averaging High CPU or networking shows up in Organizer energy reports. Always test on cellular: radios multiply drain versus Wi-Fi.',
        },
      ],
    },
  },
  {
    slug: 'offline-mode-decision-tool',
    Component: OfflineModeDecision,
    doc: {
      longDescription:
        'Offline mode can double an app’s engineering cost — or be the reason field teams actually use it. Answer six questions about data criticality, environment and conflict risk, and get a scored verdict on how offline your app truly needs to be.',
      howTo: [
        'Answer the six questions honestly — especially where users physically are when coverage drops.',
        'Read your 0–100 score and the verdict: build offline first, cache essentials, or stay online-first.',
        'Check the dev-time adder so the sync work makes it into the estimate you give stakeholders.',
        'Use the cache-priority list in the note as your first offline sprint backlog.',
      ],
      faqs: [
        {
          q: 'How much extra development does offline mode really cost?',
          a: 'Full offline-first — local database, sync engine, conflict resolution, migrations — typically adds 25–35% to build time. A read-cache with queued writes runs 10–20%. Tools like WatermelonDB, PowerSync or Realm absorb much of the plumbing, but none of the testing.',
        },
        {
          q: 'What should I cache first?',
          a: 'Whatever the user creates offline — drafts, forms, photos — because losing that is unforgivable. Then the reference data they navigate by: job lists, addresses, price tables. Never cache anything you can’t define an expiry or merge rule for.',
        },
      ],
    },
  },
  {
    slug: 'app-maintenance-cost-calculator',
    Component: AppMaintenanceCost,
    doc: {
      longDescription:
        'The build invoice is the down payment; maintenance is the mortgage. This calculator applies the industry’s 15–20%-of-build rule to your app and splits it into updates, OS compatibility, monitoring, a bug buffer and store fees — so the yearly number has no surprises.',
      howTo: [
        'Enter the original or contracted build cost.',
        'Set platform footprint and feature complexity — both drive OS-compatibility churn.',
        'Say whether you pay for monitoring/SLA support or run crash reports yourself.',
        'Take the breakdown to your budget meeting as ready-made line items.',
      ],
      faqs: [
        {
          q: 'Is 15–20% of build cost per year really the standard?',
          a: 'It’s the most-cited industry rule of thumb — Clutch, IBM and agency surveys converge there. Simple apps land at 10–15%; complex apps with maps, ML or payments run 20–30%. What varies is the mix: more features means more update cost, more platforms means more OS-compat cost.',
        },
        {
          q: 'Which maintenance costs are fixed and unavoidable?',
          a: 'Apple Developer Program is $99/year and Google Play $25 one-time. Crash reporting (Crashlytics, Sentry) is free to ~$26/month; APM and uptime tooling $15–300/month. And two OS waves ship every fall — iOS and Android both release majors annually, ready or not.',
        },
      ],
    },
  },
  {
    slug: 'tiktok-engagement-calculator',
    Component: TiktokEngagement,
    doc: {
      longDescription:
        'Engagement rate is the metric brands pay for — but TikTok measures it by views while most creators track it by followers. This calculator computes both, benchmarks you against your account-size tier, and projects monthly engagement volume from your posting cadence.',
      howTo: [
        'Enter your follower count and average likes, comments and shares per post.',
        'Add posts per week to power the monthly engagement projection.',
        'Compare your rate against the benchmark for your tier — micro, mid or macro.',
        'Open the breakdown to see whether comments or shares are dragging the average down.',
      ],
      faqs: [
        {
          q: 'What’s a good TikTok engagement rate?',
          a: 'By followers: ≥8% is strong under 10k followers, ≥6% for 10k–100k, and ≥4% above 100k — big accounts naturally dilute. By views (TikTok’s native metric), 4–6% is typical; holding 10%+ by views means the algorithm trusts your content enough to test it widely.',
        },
        {
          q: 'Why do my videos get views but few followers?',
          a: 'TikTok distributes to non-followers first, so follower count lags view count. Use the by-views rate for content decisions and the by-followers rate for brand-deal pricing. Convert viewers with pinned-comment CTAs and series hooks — “part 2 tomorrow” turns a view into a follow.',
        },
      ],
    },
  },
  {
    slug: 'facebook-ad-cost-estimator',
    Component: FacebookAdCost,
    doc: {
      longDescription:
        'Before you boost anything, know what the math says you’re buying. Feed in budget, CPM and CTR assumptions and this estimator projects impressions, clicks and conversions — then prices each click and conversion against current Meta benchmarks.',
      howTo: [
        'Set your monthly ad budget.',
        'Enter or keep realistic defaults: $12 CPM (typical US feed) and 1%+ CTR (healthy).',
        'Estimate landing-page conversion — 2–3% is standard for cold traffic.',
        'Check the projected CPA against what a customer is actually worth to you.',
      ],
      faqs: [
        {
          q: 'What’s a realistic CPM on Facebook and Instagram?',
          a: 'US feed CPMs generally run $8–20, spiking 30–60% in Q4; India and SEA can be $1–4. Reels and Stories often price below feed. If CPM creeps up over weeks, that’s audience fatigue — frequency above ~3 per week inflates costs about 20%.',
        },
        {
          q: 'What CTR and CPA should I aim for?',
          a: 'Cross-industry Meta benchmarks put average CTR around 0.90–1.2% and landing-page conversion anywhere from 2.5–9% by vertical (instant forms convert higher than cold landing pages). Judge CPA against customer value: $40 is cheap for LTV of $400 and impossible for a $15 product.',
        },
      ],
    },
  },
  {
    slug: 'google-ads-budget-calculator',
    Component: GoogleAdsBudget,
    doc: {
      longDescription:
        'Google Ads budgets fail in two directions: too small for Smart Bidding to learn, or spread so thin nothing gets data. This calculator converts between budget and click goals in either direction, and shows the conversions and CPA your plan actually implies.',
      howTo: [
        'Pick a direction: you have a budget and want clicks, or you need X clicks and want the budget.',
        'Enter your average CPC — Keyword Planner shows real numbers for your terms.',
        'Enter an honest conversion rate for your landing page.',
        'Check daily pacing, and confirm conversion volume clears Smart Bidding’s learning threshold.',
      ],
      faqs: [
        {
          q: 'What does the average Google Ads click cost?',
          a: 'WordStream’s 2024 benchmarks: $4.66 average search CPC across industries — legal and insurance run $7–9, e-commerce $1.5–3. Actual CPC depends on match types and Quality Score; exact-match long-tail terms routinely halve the average.',
        },
        {
          q: 'How small is too small a budget?',
          a: 'If the plan produces fewer than ~15–30 conversions per month per campaign, Smart Bidding can’t learn and CPA turns erratic. Consolidate campaigns, raise the budget, or accept manual bidding with tighter keyword lists — but don’t expect algorithms to work with no data.',
        },
      ],
    },
  },
  {
    slug: 'video-length-optimizer',
    Component: VideoLengthOptimizer,
    doc: {
      longDescription:
        'Every platform rewards a different runtime, and the penalty for guessing wrong is a dead retention graph. Pick platform and goal, then get the ideal length window, the platform ceiling, plus hook, re-hook and CTA timing tuned to that specific feed.',
      howTo: [
        'Choose the platform you’re cutting for.',
        'Choose the goal — reach, engagement, conversion or education; each shifts the ideal window.',
        'Plan your script against the hook and CTA timing in the breakdown.',
        'Cut platform-specific versions rather than cross-posting a single render.',
      ],
      faqs: [
        {
          q: 'Does ideal length really differ that much between platforms?',
          a: 'Yes: TikTok reach content peaks at 7–15 seconds while YouTube long-form needs 8+ minutes for mid-roll monetization and serious watch time. LinkedIn tolerates 1–2 minutes thanks to professional intent; X falls off a cliff past 60 seconds. One length for all four wastes at least two of them.',
        },
        {
          q: 'What matters more than length?',
          a: 'Completion rate and early retention. A 15-second video watched fully outranks a 60-second video watched 40% on every short-form platform. Front-load payoff, cut dead frames, and force a visual change every 2–4 seconds.',
        },
      ],
    },
  },
  {
    slug: 'social-media-roi-calculator',
    Component: SocialMediaRoi,
    doc: {
      longDescription:
        'ROAS flatters you; ROI tells the truth. Add total spend, attributed revenue, customers acquired and your gross margin, and see the return after costs — plus the break-even ROAS your specific margin actually demands.',
      howTo: [
        'Enter everything social costs monthly: ads, tools, creators, and your own hours at a rate.',
        'Enter revenue you can honestly attribute — UTMs, codes, or platform-reported minus known overstatement.',
        'Add customers acquired and your gross margin.',
        'Compare your ROAS to the break-even line computed from that margin.',
      ],
      faqs: [
        {
          q: 'What ROAS is considered good?',
          a: '3× is the common e-commerce target, but the honest floor is your break-even ROAS = 1 ÷ gross margin. At 40% margin you need 2.5× just to break even; at 30% you need 3.3×. A 3× campaign on thin margin is a slow, tidy loss.',
        },
        {
          q: 'How do I attribute revenue fairly?',
          a: 'Since iOS 14.5, platform-reported conversions overstate reality by roughly 15–30% versus holdout tests. Triangulate: UTMs, discount codes, and a post-purchase “how did you hear about us?” survey — then compare blended CAC against paid CAC monthly as the sanity check.',
        },
      ],
    },
  },
  {
    slug: 'hourly-rate-calculator',
    Component: HourlyRate,
    doc: {
      longDescription:
        'Most freelancers price against a fantasy: 40 billable hours every week. This calculator starts from what life actually costs — expenses, income goal, taxes and realistic billable time — and works backwards to an hourly rate that sustains itself.',
      howTo: [
        'Enter annual business plus living expenses, and your target take-home income.',
        'Be honest about billable hours per week — 25, not 40; sales and admin eat the rest.',
        'Set weeks off per year and your effective tax rate.',
        'Charge the resulting rate as a floor, rounded up to a number clients won’t negotiate against.',
      ],
      faqs: [
        {
          q: 'How many billable hours should I plan for?',
          a: 'Experienced solo consultants sustain 20–28 billable hours/week. Beyond 30, there’s too little time left for the sales and admin work that keeps next quarter booked. If your rate only works at 35+ hours, the rate doesn’t work.',
        },
        {
          q: 'Should I charge hourly or value-based?',
          a: 'Use the computed rate as your cost floor, then price fixed-scope projects at value: if 10 hours of work saves a client $50k, $3k is cheap. Hourly caps your upside — the hourly number exists so value pricing never dips below break-even.',
        },
      ],
    },
  },
  {
    slug: 'profit-margin-calculator',
    Component: ProfitMargin,
    doc: {
      longDescription:
        'Margin and markup get mixed up constantly, and the confusion silently eats profit. Enter cost, price and volume to see both percentages, profit per unit and monthly gross profit — with the conversion between the two spelled out once and for all.',
      howTo: [
        'Enter what one unit truly costs: product, shipping and payment fees.',
        'Enter your selling price.',
        'Enter monthly unit volume for the profit totals.',
        'Read margin (profit ÷ price) and markup (profit ÷ cost) — and never quote them interchangeably again.',
      ],
      faqs: [
        {
          q: 'What’s the difference between margin and markup?',
          a: 'Markup is on cost; margin is on price. A $10 item sold at $15 carries 50% markup but only 33.3% margin. Teams that price by “50% margin” while computing 50% markup underprice every unit by a third. Conversion: margin = markup ÷ (1 + markup).',
        },
        {
          q: 'What margin is considered healthy?',
          a: 'Retail targets 40–55% gross margin (keystone = 100% markup), restaurants run 60–70% on food and die on labor, SaaS gross margins run 70–90%. Below 20% gross margin, volume becomes a trap — one returns wave or promo erases the year.',
        },
      ],
    },
  },
  {
    slug: 'break-even-calculator',
    Component: BreakEven,
    doc: {
      longDescription:
        'Every sale before break-even is a donation to your fixed costs; every sale after is profit. Enter fixed costs, variable cost and price to find the exact unit count and revenue where the lights flip green — plus your margin of safety if you have a forecast.',
      howTo: [
        'Enter monthly fixed costs — rent, salaries, tools — and include your own salary.',
        'Enter variable cost per unit and selling price.',
        'Optionally add expected monthly units to unlock the safety-margin readout.',
        'Stress-test: raise variable cost 10% and watch how far break-even moves.',
      ],
      faqs: [
        {
          q: 'Should break-even include my own salary?',
          a: 'Yes — owner salary is a fixed cost, not profit. Founders who leave it out later discover their “profitable” business pays less than the job they quit. If realistic volume can’t cover market-rate salary for your role, fix the model before launch.',
        },
        {
          q: 'What margin of safety is comfortable?',
          a: '25%+ is healthy — demand can dip and you still cover costs. Below 10%, one bad month (a price war, a platform change) puts you in the red. Improve it in this order of pain: cut fixed costs, raise price, reduce variable cost.',
        },
      ],
    },
  },
  {
    slug: 'roi-calculator',
    Component: Roi,
    doc: {
      longDescription:
        'A campaign “made money” means nothing until time enters the equation. Enter what you invested, what came back and how long it ran, and see net profit, ROI, and the simple annualized rate you can compare against any other use of that cash.',
      howTo: [
        'Enter the full investment: media, creative, tooling, plus your time at a defensible rate.',
        'Enter everything it returned over the period.',
        'Set the duration in months.',
        'Compare the annualized figure to alternatives — starting with the S&P 500’s ~10% historical average.',
      ],
      faqs: [
        {
          q: 'Simple annualized vs CAGR — which should I use?',
          a: 'Simple annualization (ROI × 12 ÷ months) is fine for campaigns under a year and matches how marketers talk. For multi-year investments use CAGR, which compounds: a 50% return over 3 years is 16.7%/yr simple but only 14.5% CAGR.',
        },
        {
          q: 'What ROI should marketing deliver?',
          a: 'Well-run paid campaigns target 200–400% ROI per cycle; content and SEO compound and can exceed that across 12+ months. Anything annualizing under the S&P’s ~10% deserves a hard “why” — your capital and effort should beat the passive alternative.',
        },
      ],
    },
  },
  {
    slug: 'emi-loan-calculator',
    Component: EmiLoan,
    doc: {
      longDescription:
        'The monthly EMI quote hides what you actually pay: interest. Enter loan amount, rate and tenure to run the standard amortization math — monthly payment, total interest, and what share of every payment goes to the bank.',
      howTo: [
        'Enter loan amount, annual interest rate and tenure in years.',
        'Check the interest share of total payment — the number lenders never headline.',
        'Try a shorter tenure: total interest falls faster than the EMI rises.',
        'Compare any “flat rate” offer with care — see the note below before signing.',
      ],
      faqs: [
        {
          q: 'How is the EMI calculated?',
          a: 'Standard reducing-balance amortization: EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where r is the monthly rate and n the number of months. Early payments are mostly interest — on a 20-year loan you’ve repaid barely 20% of principal after 8 years.',
        },
        {
          q: 'Flat rate vs reducing rate — where’s the trap?',
          a: 'A “5% flat rate” charges interest on the original principal for the whole term, which equates to roughly a 9–10% reducing-balance APR. Always convert offers to APR or total repayment before comparing. This calculator uses reducing balance, the standard for home and business loans.',
        },
      ],
    },
  },
  {
    slug: 'gst-vat-calculator',
    Component: GstVat,
    doc: {
      longDescription:
        'One price field, two jobs: adding tax to a net quote, or extracting the tax a gross price already contains. Built for GST/VAT work — including the reverse-charge formula that divides by (100 + rate) instead of multiplying.',
      howTo: [
        'Enter the amount you’re starting from.',
        'Pick the rate — common GST/VAT slabs as presets, or custom.',
        'Choose add tax (your amount is net) or remove tax (your amount is gross).',
        'Copy the three figures straight into the invoice or reconciliation sheet.',
      ],
      faqs: [
        {
          q: 'How do I remove tax from a tax-inclusive price?',
          a: 'Divide, don’t subtract: tax = gross × rate ÷ (100 + rate). On a $1,180 gross sale at 18% GST, the tax is $180 — not $212.40. Subtracting the rate from the gross double-counts tax that’s already inside the price.',
        },
        {
          q: 'What are the common GST/VAT slabs worldwide?',
          a: 'India GST: 0/5/12/18/28%. UK VAT: 20% (5% reduced). Germany 19%, France 20%, Ireland 23%. Australia GST 10%, Japan consumption tax 10%, Canada GST 5%. Reduced rates and category exemptions apply everywhere — confirm with the local authority before invoicing.',
        },
      ],
    },
  },
  {
    slug: 'salary-to-hourly-converter',
    Component: SalaryToHourly,
    doc: {
      longDescription:
        'A salary number is a poor proxy for what an hour is worth — especially with unpaid overtime and days off in the picture. Convert any annual salary into true hourly, daily and weekly equivalents, adjusted for the hours actually worked.',
      howTo: [
        'Enter the annual salary.',
        'Set real weekly hours — 40 nominal often means 45–50 actual.',
        'Set weeks per year and any unpaid days off.',
        'Use the effective hourly for contractor comparisons, overtime negotiations, or the “should I freelance” math.',
      ],
      faqs: [
        {
          q: 'What’s the standard hours-per-year baseline?',
          a: '2,080 — that’s 40 hours × 52 weeks. Divide any salary by 2,080 for the quick hourly figure. The refinement matters: unpaid days, part-year schedules and real overtime routinely move the true hourly 10–20% away from the quick number.',
        },
        {
          q: 'How does unpaid overtime change the math?',
          a: 'A $65k salary at 40 hours is $31.25/hour; at the 48–50 hours many salaried roles actually run, it’s $26–27. That gap is why “same pay, more hours” is a real pay cut — and why contractors billing $60–80/hour aren’t as expensive as they look.',
        },
      ],
    },
  },
  {
    slug: 'employee-cost-calculator',
    Component: EmployeeCost,
    doc: {
      longDescription:
        'An $85k hire does not cost $85k. Stack benefits, payroll taxes, equipment, overhead and recruiting on top, and see the true year-one cost — plus the cost-to-salary multiplier that makes runway and unit-economics math honest.',
      howTo: [
        'Enter base salary.',
        'Set your benefits load and payroll tax rate — defaults reflect common US mid-market figures.',
        'Add one-off equipment and the monthly overhead you allocate per person.',
        'Toggle the recruiting fee if an agency or headhunter is involved.',
      ],
      faqs: [
        {
          q: 'What multiple of salary should I budget for a hire?',
          a: '1.25–1.4× base salary is the standard fully-loaded rule for year one; tech hubs and senior roles with heavy benefits run to 1.5×+. Recruiter fees of 15–25% of salary push the first-year multiplier higher — amortize them if the hire stays 3+ years.',
        },
        {
          q: 'What are the biggest hidden hiring costs?',
          a: 'Employer payroll taxes (7.65% FICA plus state unemployment in the US), health premiums averaging $8–9k/year employer share, and the manager’s time — onboarding consumes 10–20% of a manager’s week for the first quarter. Equipment is visible; the 1–3 month productivity ramp is the quiet one.',
        },
      ],
    },
  },
  {
    slug: 'meeting-cost-calculator',
    Component: MeetingCost,
    doc: {
      longDescription:
        'Six people in a room for an hour isn’t an hour — it’s six. This calculator prices any recurring meeting in dollars and person-hours, per meeting and per year, using fully-loaded hourly rates so the number stings appropriately.',
      howTo: [
        'Count attendees and enter each person’s approximate hourly cost (salary × 1.3 ÷ 2,080).',
        'Enter the real duration — including the “while we’re here” tail.',
        'Set how often it repeats per week.',
        'Read the yearly figure, then ask whether an agenda and a 25-minute cap could reclaim half of it.',
      ],
      faqs: [
        {
          q: 'What hourly rate should I use for attendees?',
          a: 'Fully-loaded cost: (salary × ~1.3 for benefits and taxes) ÷ 2,080 hours. A $100k-salaried manager costs ≈ $62/hour — so a weekly hour-long meeting with six people of that mix burns $18–20k/year before anyone opens a laptop.',
        },
        {
          q: 'What actually reduces meeting cost?',
          a: 'Default to 25/50-minute slots, require an agenda (no agenda, no meeting), and assign a rotating dissent role to keep decisions honest. Shopify’s 2023 calendar purge cancelled ~12,000 recurring meetings — about 322,000 hours — with no drop in output.',
        },
      ],
    },
  },
];
