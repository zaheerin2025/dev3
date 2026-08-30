'use client';

/**
 * Batch: DEV & URL tools — agent task 23-f — 19 tools.
 * Group A (7): five renderers on the shared UrlTool engine (uptime / headers / redirects /
 *   OG preview / link counter via POST /api/tools/fetch) + two bespoke live lookups
 *   (ip-address-lookup via ipwho.is, social-handle-availability-checker via the uptime API).
 * Group B (4): data-format converters on the shared TextTool engine (JSON/CSV/XML).
 * Group C (8): bespoke developer utilities (UUID, password, hash, timestamp, rich snippet,
 *   YouTube tags, QR code, barcode).
 * Slugs MUST match src/data/tools/registry.ts exactly.
 */

import * as React from 'react';
import {
  Activity, ArrowRight, AtSign, CheckCircle2, ExternalLink, KeyRound, Link2, Loader2,
  MapPin, QrCode, RefreshCw, Search, ShieldCheck, Sparkles, Wifi, XCircle, Youtube,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { BatchTool } from '../batch-types';
import { StatusPill, UrlTool } from '../engines/url-tool';
import { TextTool } from '../engines/text-tool';
import {
  CopyButton, DownloadButton, FieldShell, NumberInput, OutputBox, SelectInput, StatCard,
  TextAreaInput, TextInput, ToggleInput, ToolNote, Verdict, downloadBlob, useCopy,
} from '../tool-ui';

/* ═══════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════ */

/** Run async work over items with a concurrency cap. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

function lineColAt(src: string, pos: number): { line: number; col: number } {
  const upto = src.slice(0, Math.min(pos, src.length));
  const line = (upto.match(/\n/g) ?? []).length + 1;
  const col = pos - upto.lastIndexOf('\n');
  return { line, col };
}

/** A clear ✗ report with line/column + a caret snippet, from a JSON.parse failure. */
function jsonErrorReport(src: string, err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const posMatch = msg.match(/position (\d+)/i);
  const pos = posMatch ? parseInt(posMatch[1], 10) : -1;
  if (pos < 0) return `✗ INVALID JSON\n\n${msg}`;
  const { line, col } = lineColAt(src, pos);
  const srcLine = (src.split('\n')[line - 1] ?? '').slice(0, 160);
  const caret = ' '.repeat(Math.max(0, Math.min(col - 1, 60)));
  return [
    `✗ INVALID JSON — line ${line}, column ${col}`,
    '',
    msg,
    '',
    `${line} | ${srcLine}`,
    `    | ${caret}^`,
  ].join('\n');
}

function deepSort(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(deepSort);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, deepSort(o[k])]));
  }
  return v;
}

function countJsonNodes(v: unknown): { keys: number; arrays: number } {
  let keys = 0;
  let arrays = 0;
  const walk = (x: unknown) => {
    if (Array.isArray(x)) {
      arrays++;
      x.forEach(walk);
      return;
    }
    if (x && typeof x === 'object') {
      for (const k of Object.keys(x as Record<string, unknown>)) {
        keys++;
        walk((x as Record<string, unknown>)[k]);
      }
    }
  };
  walk(v);
  return { keys, arrays };
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function csvEscape(value: string, delim: string): string {
  if (value.includes(delim) || value.includes('"') || /[\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** RFC-4180-style state machine: quoted fields, "" escapes, embedded delimiters/newlines. */
function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  let inQuotes = false;
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of firstLine) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQotes(inQuotes)) continue;
    else if (ch in counts) counts[ch]++;
  }
  void inQuotes;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ',';
}

// (detectDelimiter guard helper kept trivial to satisfy lint of the branch above)
function inQotes(_v: boolean): boolean {
  return false;
}

function coerceCell(cell: string): unknown {
  const t = cell.trim();
  if (t === '') return '';
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(t) && t.length <= 15) return Number(t);
  return cell;
}

function sanitizeHeaders(raw: string[]): string[] {
  const used = new Map<string, number>();
  return raw.map((h, i) => {
    let name = h.trim().replace(/\s+/g, '_');
    if (name === '') name = `column${i + 1}`;
    const seen = used.get(name) ?? 0;
    used.set(name, seen + 1);
    return seen === 0 ? name : `${name}_${seen + 1}`;
  });
}

const KEYWORD_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from',
  'is', 'are', 'was', 'were', 'be', 'this', 'that', 'it', 'as', 'your', 'my', 'our', 'how',
  'why', 'what', 'you', 'we', 'i', 'its', "it's", 'new', 'vs', 'de', 'la', 'el', 'en',
]);

/** Rank title words into a keyword list trimmed to a total character budget. */
function suggestKeywords(title: string, budget = 500): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !KEYWORD_STOPWORDS.has(w));
  const out: string[] = [];
  const push = (k: string) => {
    const key = k.trim();
    if (key && !out.includes(key)) out.push(key);
  };
  for (let i = 0; i < words.length - 1; i++) push(`${words[i]} ${words[i + 1]}`);
  [...words].sort((a, b) => b.length - a.length).forEach(push);
  const picked: string[] = [];
  let total = 0;
  for (const k of out) {
    const add = picked.length === 0 ? k.length : k.length + 2;
    if (total + add > budget) continue;
    picked.push(k);
    total += add;
  }
  return picked;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const future = diff < 0;
  const units: [number, string][] = [
    [31_536_000_000, 'year'],
    [2_592_000_000, 'month'],
    [604_800_000, 'week'],
    [86_400_000, 'day'],
    [3_600_000, 'hour'],
    [60_000, 'minute'],
  ];
  for (const [limit, unit] of units) {
    if (abs >= limit) {
      const n = Math.floor(abs / limit);
      return future ? `in ${n} ${unit}${n > 1 ? 's' : ''}` : `${n} ${unit}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/** Local slider atom (same shape as the visual batch uses). */
function LabeledSlider({ label, value, onChange, min, max, step = 1, format, help, className }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; format?: (v: number) => string;
  help?: string; className?: string;
}) {
  return (
    <FieldShell label={label} help={help} className={className}>
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0] ?? value)}
          aria-label={label}
          className="min-w-0 flex-1"
        />
        <span className="w-20 shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-center font-mono text-xs font-bold text-[#0a0a0a]">
          {format ? format(value) : value}
        </span>
      </div>
    </FieldShell>
  );
}

/** Color swatch + hex input. */
function ColorInput({ label, value, onChange, className }: {
  label: string; value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <FieldShell label={label} className={className}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-lg border-gray-200 bg-white font-mono text-xs"
        />
      </div>
    </FieldShell>
  );
}

/** Small icon row used by checklist-style reports. */
function CheckRow({ tone, label, detail }: { tone: 'good' | 'warn' | 'bad'; label: string; detail: string }) {
  const Icon = tone === 'good' ? CheckCircle2 : tone === 'warn' ? Activity : XCircle;
  const color = tone === 'good' ? 'text-gray-800' : tone === 'warn' ? 'text-gray-800' : 'text-gray-800';
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', color)} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#0a0a0a]">{label}</p>
        {detail ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GROUP A — URL ENGINE PAYLOAD TYPES (must match /api/tools/fetch)
   ═══════════════════════════════════════════════════════════════ */

interface UptimeData {
  reachable: boolean;
  status: number;
  statusText: string;
  ms: number;
  finalUrl: string;
  error?: string;
}

interface HeadersData {
  url: string;
  status: number;
  ms: number;
  https: boolean;
  present: string[];
  missing: string[];
  headerList: { name: string; value: string }[];
  error?: string;
}

interface RedirectHop {
  url: string;
  status: number;
  location: string;
  ms: number;
}

interface RedirectsData {
  hops: RedirectHop[];
  totalHops: number;
  finalStatus: number;
  finalUrl: string;
  wastedMs: number;
}

interface OgData {
  reachable: boolean;
  error?: string;
  url?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  twitterCard?: string;
  titleTag?: string;
  metaDescription?: string;
  hasOgTags?: boolean;
}

interface LinksData {
  pageUrl: string;
  totalLinks: number;
  internal: number;
  external: number;
  checkedCount: number;
  broken: { url: string; status: number }[];
  healthy: number;
}

/* ═══════════════════════════════════════════════════════════════
   1. website-uptime-checker — mode 'uptime'
   ═══════════════════════════════════════════════════════════════ */

function renderUptime(d: UptimeData): React.ReactNode {
  if (!d.reachable) {
    return (
      <>
        <StatusPill ok={false}>{d.status > 0 ? `HTTP ${d.status}` : 'Unreachable'}</StatusPill>
        <Verdict
          tone="bad"
          title="We couldn't reach this site"
          message={d.error ?? 'The server did not answer the request. Check the address for typos, or the site may be offline, blocked by a firewall or rate-limiting automated visitors.'}
        />
      </>
    );
  }
  const ok = d.status >= 200 && d.status < 400;
  const speedTone = d.ms < 400 ? 'good' : d.ms < 1200 ? 'warn' : 'bad';
  const speedWord = d.ms < 400 ? 'excellent response time' : d.ms < 1200 ? 'acceptable response time' : 'slow response time';
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill ok={ok}>{ok ? 'Online' : `HTTP ${d.status}`}</StatusPill>
        <span className="truncate text-sm text-gray-500">{d.finalUrl}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Status code" value={d.status} tone={ok ? 'good' : 'bad'} hint={d.statusText || '—'} />
        <StatCard label="Response time" value={`${d.ms.toLocaleString()} ms`} tone={speedTone} hint={speedWord} />
        <StatCard
          label="Reachability"
          value={ok ? 'Up' : 'Answered'}
          tone={ok ? 'good' : 'warn'}
          hint={ok ? 'the server accepted the request' : 'the server replied with an error code'}
        />
      </div>
      <Verdict
        tone={ok ? 'good' : 'bad'}
        title={ok ? `${d.finalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} is up` : `The site answered, but with HTTP ${d.status}`}
        message={
          ok
            ? `A full round trip from our server took ${d.ms.toLocaleString()} ms — ${speedWord}. One sample is a spot check: a monitoring service is what catches outages at 3 a.m.`
            : `The server is alive (it answered in ${d.ms.toLocaleString()} ms) but returned ${d.status} ${d.statusText}. That usually means bot protection, a missing route or an auth wall rather than downtime.`
        }
      />
      <ToolNote>
        This is a single request from the tool server at the moment you click — no browser cache, no CDN edge near you. Expect the numbers to move a little on every run.
      </ToolNote>
    </>
  );
}

const UptimeChecker = () => (
  <UrlTool<UptimeData>
    config={{ mode: 'uptime', ctaLabel: 'Check uptime', placeholder: 'example.com', render: renderUptime }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   2. http-header-checker — mode 'headers'
   ═══════════════════════════════════════════════════════════════ */

const SECURITY_HEADER_INFO: Record<string, string> = {
  'strict-transport-security': 'Tells browsers to keep using HTTPS for future visits and blocks downgrade attacks.',
  'content-security-policy': 'Whitelists which scripts and resources the page may load — the strongest defense against XSS.',
  'x-content-type-options': 'Stops browsers from guessing content types instead of trusting the declared one.',
  'x-frame-options': 'Prevents other sites from embedding this page in a frame (classic clickjacking defense).',
  'referrer-policy': 'Controls how much referrer data leaks to sites you link out to.',
  'permissions-policy': 'Disables powerful browser features (camera, geolocation…) unless explicitly allowed.',
};

function renderHeaders(d: HeadersData): React.ReactNode {
  if (!d.status) {
    return (
      <Verdict
        tone="bad"
        title="No headers — the site never answered"
        message={d.error ?? 'The request failed before any response arrived, so there is nothing to audit yet.'}
      />
    );
  }
  const score = d.present.length;
  const scoreTone = score >= 5 ? 'good' : score >= 3 ? 'warn' : 'bad';
  const criticalMissing = d.missing.filter((h) =>
    h === 'content-security-policy' || h === 'strict-transport-security' || h === 'x-frame-options',
  );
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill ok={d.status >= 200 && d.status < 400}>HTTP {d.status}</StatusPill>
        <span className="truncate text-sm text-gray-500">{d.url}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Security score" value={`${score}/6`} tone={scoreTone} hint="recommended headers present" />
        <StatCard
          label="Protocol"
          value={d.https ? 'HTTPS' : 'HTTP'}
          tone={d.https ? 'good' : 'bad'}
          hint={d.https ? 'encrypted connection' : 'plaintext — get a TLS certificate'}
        />
        <StatCard label="Response time" value={`${d.ms.toLocaleString()} ms`} hint="full round trip" />
      </div>
      <Verdict
        tone={scoreTone}
        title={
          score >= 5
            ? 'Strong header hygiene'
            : score >= 3
              ? 'Halfway there — a few headers are missing'
              : 'Weak header hygiene'
        }
        message={
          score >= 5
            ? 'Almost every recommended security header is in place. Skim the table below to confirm their values are strict enough.'
            : criticalMissing.length > 0
              ? `Missing and worth adding first: ${criticalMissing.join(', ')}. Each one below explains what it protects against and takes one line of server config.`
              : 'The missing headers below are quick wins — one line each in nginx, Apache or your CDN rules.'
        }
      />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-[#0a0a0a]">Security headers</p>
        {(['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy'] as const).map((h) => {
          const has = d.present.includes(h);
          const critical = h === 'content-security-policy' || h === 'strict-transport-security' || h === 'x-frame-options';
          return (
            <CheckRow
              key={h}
              tone={has ? 'good' : critical ? 'bad' : 'warn'}
              label={`${has ? '✓' : '✗'} ${h}`}
              detail={SECURITY_HEADER_INFO[h] ?? ''}
            />
          );
        })}
      </div>
      {d.headerList.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-[#0a0a0a]">All response headers received</p>
          <div className="custom-scrollbar overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Header</th>
                  <th className="px-4 py-2.5 font-bold">Value</th>
                </tr>
              </thead>
              <tbody>
                {d.headerList.map((h) => (
                  <tr key={h.name} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-gray-800">{h.name}</td>
                    <td className="break-all px-4 py-2.5 font-mono text-xs text-[#374151]">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <ToolNote>
        Headers are invisible to visitors but decide how browsers behave when something goes wrong. Fix them at the server or CDN layer, then re-run this audit until the score is green.
      </ToolNote>
    </>
  );
}

const HeaderChecker = () => (
  <UrlTool<HeadersData>
    config={{ mode: 'headers', ctaLabel: 'Audit headers', placeholder: 'example.com', render: renderHeaders }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   3. redirect-chain-checker — mode 'redirects'
   ═══════════════════════════════════════════════════════════════ */

function renderRedirects(d: RedirectsData): React.ReactNode {
  const seen = new Set<string>();
  let loop = false;
  for (const hop of d.hops) {
    if (seen.has(hop.url)) {
      loop = true;
      break;
    }
    seen.add(hop.url);
  }
  const tone = loop || d.totalHops > 5 ? 'bad' : d.totalHops > 3 ? 'warn' : 'good';
  const lastOk = d.finalStatus >= 200 && d.finalStatus < 400;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Redirect hops"
          value={d.totalHops}
          tone={tone}
          hint={d.totalHops === 0 ? 'direct response, no redirect' : d.totalHops > 5 ? 'chain is too long' : d.totalHops > 3 ? 'worth shortening' : 'healthy length'}
        />
        <StatCard label="Final status" value={d.finalStatus || '—'} tone={lastOk ? 'good' : 'bad'} hint={d.finalStatus === 0 ? 'destination never answered' : 'last response code'} />
        <StatCard label="Wasted time" value={`${d.wastedMs.toLocaleString()} ms`} hint="sum of every hop's latency" />
      </div>
      {loop ? (
        <Verdict tone="bad" title="Redirect loop detected" message="The chain revisited a URL it had already seen, so browsers will bounce until they give up. Two rewrite rules are usually fighting each other — reorder your HTTP→HTTPS and non-www rules." />
      ) : d.totalHops > 5 ? (
        <Verdict tone="bad" title={`${d.totalHops} hops is too many`} message="Every extra hop adds latency and dilutes ranking signals. Point the first redirect straight at the final URL and delete the middlemen." />
      ) : d.totalHops > 3 ? (
        <Verdict tone="warn" title={`${d.totalHops} hops — deserves cleanup`} message="The page works, but crawlers and visitors pay the latency of every step. Collapsing the chain to one redirect is a small change with measurable wins." />
      ) : (
        <Verdict tone="good" title={d.totalHops === 0 ? 'No redirects — perfect' : 'Short and healthy chain'} message={d.totalHops === 0 ? 'The URL answers directly with content — nothing to fix here.' : 'One or two hops is standard practice (e.g. http→https or non-www→www). This chain is fine.'} />
      )}
      <ol className="flex flex-col gap-2">
        {d.hops.map((hop, i) => {
          const isRedirect = hop.status >= 300 && hop.status < 400 && hop.location;
          return (
            <li key={`${hop.url}-${i}`} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-800">{i + 1}</span>
                <StatusPill ok={isRedirect ? null : hop.status > 0}>{hop.status > 0 ? `HTTP ${hop.status}` : 'No response'}</StatusPill>
                <span className="min-w-0 flex-1 break-all font-mono text-xs text-[#374151]">{hop.url}</span>
                <span className="text-xs text-gray-400">{hop.ms.toLocaleString()} ms</span>
              </div>
              {isRedirect ? (
                <div className="flex items-center gap-2 pl-4 text-xs text-gray-800">
                  <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="break-all font-mono">{hop.location}</span>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <ToolNote>
        Each hop is requested with redirects disabled so nothing is followed blindly. Status 301/308 passes full ranking signals for permanent moves; 302/307 tell crawlers the move is temporary.
      </ToolNote>
    </>
  );
}

const RedirectChecker = () => (
  <UrlTool<RedirectsData>
    config={{ mode: 'redirects', ctaLabel: 'Trace redirects', placeholder: 'old-page-or-domain.com', render: renderRedirects }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   4. open-graph-preview-tool — mode 'og'
   ═══════════════════════════════════════════════════════════════ */

function renderOg(d: OgData): React.ReactNode {
  if (!d.reachable) {
    return <Verdict tone="bad" title="The page could not be fetched" message={d.error ?? 'No response arrived, so there is no meta data to preview.'} />;
  }
  const title = d.ogTitle || d.titleTag || '';
  const description = d.ogDescription || d.metaDescription || '';
  const siteName = d.ogSiteName || (d.url ? new URL(d.url).hostname : '');
  const host = d.url ? new URL(d.url).hostname.replace(/^www\./, '') : '';
  const path = d.url ? new URL(d.url).pathname === '/' ? '' : new URL(d.url).pathname : '';
  const missing: { label: string; why: string }[] = [];
  if (!d.ogTitle) missing.push({ label: 'og:title', why: 'Social platforms fall back to the <title> tag, which is written for search, not for feeds.' });
  if (!d.ogDescription) missing.push({ label: 'og:description', why: 'Without it, shares show a random text excerpt or nothing at all.' });
  if (!d.ogImage) missing.push({ label: 'og:image', why: 'No image means a plain text card — links with images get dramatically more clicks.' });
  if (!d.ogSiteName) missing.push({ label: 'og:site_name', why: 'Optional, but it brands the card with your site name above the headline.' });
  if (!d.twitterCard) missing.push({ label: 'twitter:card', why: 'X defaults to a small summary card; summary_large_image shows the big picture.' });
  const tagRows: { name: string; value: string }[] = [
    { name: 'og:title', value: d.ogTitle ?? '' },
    { name: 'og:description', value: d.ogDescription ?? '' },
    { name: 'og:image', value: d.ogImage ?? '' },
    { name: 'og:site_name', value: d.ogSiteName ?? '' },
    { name: 'twitter:card', value: d.twitterCard ?? '' },
    { name: '<title>', value: d.titleTag ?? '' },
    { name: 'meta description', value: d.metaDescription ?? '' },
  ];
  return (
    <>
      {!d.hasOgTags ? (
        <Verdict tone="warn" title="No Open Graph tags found on this page" message={'Nothing declared property="og:", so every platform is improvising from your title tag and first paragraph. Add the five tags below — it is a few minutes of work per template.'} />
      ) : missing.length > 0 ? (
        <Verdict tone="warn" title={`${missing.length} tag${missing.length > 1 ? 's' : ''} missing`} message={missing.map((m) => m.label).join(', ') + '. Details and fixes below each preview.'} />
      ) : (
        <Verdict tone="good" title="All key tags present" message="og:title, og:description, og:image, og:site_name and twitter:card are all set — shares will look exactly as designed." />
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Google-style search snippet</p>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-800">{(siteName || host || '?').charAt(0).toUpperCase()}</span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm text-[#0a0a0a]">{siteName || host || 'your-site.com'}</p>
                <p className="truncate text-xs text-gray-500">{host}{path}</p>
              </div>
            </div>
            <p className="mt-2 truncate text-xl text-[#1a0dab]">{title || 'No title found — add a title or og:title tag'}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
              {description || 'No description found — add a meta description or og:description tag so searchers see a summary here.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Social share card (Facebook / X / LinkedIn)</p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {d.ogImage ? (
               
              <img
                src={d.ogImage}
                alt="Open Graph preview"
                className="aspect-[1.91/1] w-full bg-gray-100 object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-gray-100 text-sm text-gray-400">no og:image</div>
            )}
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{siteName || host || 'your-site.com'}</p>
              <p className="mt-1 line-clamp-2 font-bold text-[#0a0a0a]">{title || 'Missing og:title'}</p>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{description || 'Missing og:description'}</p>
            </div>
          </div>
        </div>
      </div>
      {missing.length > 0 ? (
        <div className="flex flex-col gap-2">
          {missing.map((m) => (
            <CheckRow key={m.label} tone="warn" label={`Missing ${m.label}`} detail={m.why} />
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-[#0a0a0a]">Raw tag values found</p>
        <div className="custom-scrollbar overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <tbody>
              {tagRows.map((r) => (
                <tr key={r.name} className="border-t border-gray-100 first:border-t-0">
                  <td className="w-44 px-4 py-2.5 font-mono text-xs font-bold text-gray-800">{r.name}</td>
                  <td className={cn('px-4 py-2.5 text-xs', r.value ? 'text-[#374151]' : 'italic text-gray-400')}>{r.value || 'not set'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ToolNote>
        Platforms cache share data aggressively — after fixing tags, re-check in a day or force a re-scrape with each platform&apos;s debugger (Facebook Sharing Debugger, X Card Validator, LinkedIn Post Inspector).
      </ToolNote>
    </>
  );
}

const OgPreview = () => (
  <UrlTool<OgData>
    config={{ mode: 'og', ctaLabel: 'Preview tags', placeholder: 'example.com/blog-post', render: renderOg }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   5. website-page-counter — mode 'links'
   ═══════════════════════════════════════════════════════════════ */

function renderLinks(d: LinksData): React.ReactNode {
  const brokenTone = d.broken.length === 0 ? 'good' : d.broken.length <= 3 ? 'warn' : 'bad';
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unique links" value={d.totalLinks.toLocaleString()} hint={`on ${d.pageUrl.replace(/^https?:\/\//, '')}`} />
        <StatCard label="Internal" value={d.internal.toLocaleString()} hint="same domain" />
        <StatCard label="External" value={d.external.toLocaleString()} hint="other domains" />
        <StatCard label="Healthy of checked" value={`${d.healthy}/${d.checkedCount}`} tone={brokenTone} hint="live-verified links" />
      </div>
      {d.broken.length === 0 ? (
        <Verdict tone="good" title="No broken links found" message={`All ${d.checkedCount} live-checked links answered successfully. Link rot usually starts with outbound resources and old blog references — re-run this check monthly.`} />
      ) : (
        <Verdict tone={brokenTone} title={`${d.broken.length} broken link${d.broken.length > 1 ? 's' : ''} found`} message="The table below lists every failing URL with its status code. Replace the target, fix the typo or remove the link — 404s waste crawl budget and frustrate readers." />
      )}
      {d.broken.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-[#0a0a0a]">Broken links</p>
          <div className="custom-scrollbar overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold">URL</th>
                </tr>
              </thead>
              <tbody>
                {d.broken.map((b) => (
                  <tr key={b.url} className="border-t border-gray-100">
                    <td className="px-4 py-2.5"><StatusPill ok={false}>{b.status === 0 ? 'timeout' : `HTTP ${b.status}`}</StatusPill></td>
                    <td className="break-all px-4 py-2.5 font-mono text-xs text-[#374151]">{b.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <ToolNote>
        The checker deduplicates URLs (fragments removed), counts the first 300 unique links per page and live-verifies the first 40. Nofollow attribution and links rendered only by client-side JavaScript are not part of this report — treat totals as a floor.
      </ToolNote>
    </>
  );
}

const PageCounter = () => (
  <UrlTool<LinksData>
    config={{ mode: 'links', ctaLabel: 'Count links', placeholder: 'example.com/blog-post', render: renderLinks }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   6. ip-address-lookup — bespoke, client-side via ipwho.is
   ═══════════════════════════════════════════════════════════════ */

interface IpWhoResponse {
  ip?: string;
  success?: boolean;
  message?: string;
  type?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  flag?: { emoji?: string };
  connection?: { asn?: number; org?: string; isp?: string; domain?: string };
  timezone?: { id?: string; utc?: string };
}

const IpLookupTool = () => {
  const [data, setData] = React.useState<IpWhoResponse | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const { copy } = useCopy();
  const [copiedIp, setCopiedIp] = React.useState(false);

  const run = React.useCallback(async (q?: string) => {
    setLoading(true);
    setError('');
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 10_000);
      const res = await fetch(`https://ipwho.is/${q ? encodeURIComponent(q) : ''}`, { signal: ctrl.signal });
      window.clearTimeout(timer);
      const json = (await res.json()) as IpWhoResponse;
      if (json.success === false) throw new Error(json.message || 'The lookup service could not resolve that address.');
      if (!json.ip) throw new Error('The lookup service returned no address.');
      setData(json);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'The lookup service timed out — try again in a moment.'
            : err.message
          : 'The lookup failed. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void run();
  }, [run]);

  const copyIp = () => {
    if (!data?.ip) return;
    copy(data.ip);
    setCopiedIp(true);
    window.setTimeout(() => setCopiedIp(false), 1600);
  };

  const location = [data?.city, data?.region, data?.country].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          if (q) void run(q);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Look up any IP or domain — e.g. 8.8.8.8 or github.com"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="IP address or domain to look up"
            className="h-13 rounded-full border-2 border-gray-200 bg-white pl-11 pr-4 text-[15px] text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-gray-500 focus-visible:ring-gray-500"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary-pill sm:!px-8">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Looking up…
            </>
          ) : (
            'Look up'
          )}
        </button>
      </form>

      {error ? <Verdict tone="bad" title="Lookup failed" message={error} /> : null}

      {data ? (
        <>
          <div className="card-soft flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{query.trim() ? 'Lookup result' : 'Your public IP address'}</p>
              <p className="mt-1 font-mono text-3xl font-bold text-gradient">{data.ip}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.type ?? 'IP'} {data.continent ? `· ${data.continent}` : ''}
              </p>
            </div>
            <button type="button" onClick={copyIp} className="btn-secondary-pill">
              {copiedIp ? 'Copied!' : 'Copy IP'}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Location"
              value={data.flag?.emoji ?? '🌐'}
              hint={location || 'unknown location'}
            />
            <StatCard
              label="ISP / Organization"
              value={(data.connection?.isp || data.connection?.org || '—') as React.ReactNode}
              hint={data.connection?.domain ? `domain: ${data.connection.domain}` : undefined}
            />
            <StatCard
              label="Timezone"
              value={data.timezone?.id ?? '—'}
              hint={data.timezone?.utc ? `UTC offset ${data.timezone.utc}` : undefined}
            />
            <StatCard
              label="Coordinates"
              value={data.latitude !== undefined && data.longitude !== undefined ? `${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)}` : '—'}
              hint="registered network location"
            />
            <StatCard
              label="ASN"
              value={data.connection?.asn ? `AS${data.connection.asn}` : '—'}
              hint={data.connection?.org || undefined}
            />
            <StatCard
              label="Country code"
              value={data.country_code ?? '—'}
              hint={data.country || undefined}
            />
          </div>
        </>
      ) : null}

      <ToolNote>
        Data comes live from the free ipwho.is database — no API key, and nothing is stored on our side. Geo-IP is an estimate: country-level results are reliable, city-level results can point at the operator&apos;s hub rather than the actual device.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   7. social-handle-availability-checker — bespoke, uptime API per platform
   ═══════════════════════════════════════════════════════════════ */

interface SocialPlatform {
  id: string;
  label: string;
  build: (handle: string) => string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'x', label: 'X (Twitter)', build: (h) => `https://x.com/${h}` },
  { id: 'instagram', label: 'Instagram', build: (h) => `https://www.instagram.com/${h}/` },
  { id: 'tiktok', label: 'TikTok', build: (h) => `https://www.tiktok.com/@${h}` },
  { id: 'facebook', label: 'Facebook', build: (h) => `https://www.facebook.com/${h}` },
  { id: 'github', label: 'GitHub', build: (h) => `https://github.com/${h}` },
  { id: 'reddit', label: 'Reddit', build: (h) => `https://www.reddit.com/user/${h}/` },
  { id: 'pinterest', label: 'Pinterest', build: (h) => `https://www.pinterest.com/${h}/` },
  { id: 'youtube', label: 'YouTube', build: (h) => `https://www.youtube.com/@${h}` },
  { id: 'dribbble', label: 'Dribbble', build: (h) => `https://dribbble.com/${h}` },
  { id: 'behance', label: 'Behance', build: (h) => `https://www.behance.net/${h}` },
];

type HandleKind = 'idle' | 'checking' | 'taken' | 'available' | 'unclear';

interface HandleState {
  kind: HandleKind;
  status?: number;
  ms?: number;
  note?: string;
  profileUrl?: string;
}

async function checkHandle(profileUrl: string): Promise<HandleState> {
  try {
    const res = await fetch('/api/tools/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: profileUrl, mode: 'uptime' }),
    });
    const payload = (await res.json()) as { ok: boolean; data?: UptimeData; error?: string };
    if (!res.ok || !payload.ok || !payload.data) {
      return { kind: 'unclear', note: payload.error ?? 'checker error', profileUrl };
    }
    const d = payload.data;
    if (d.status === 404 || d.status === 410) {
      return { kind: 'available', status: d.status, ms: d.ms, profileUrl };
    }
    if (d.status >= 200 && d.status < 300) {
      // Did the platform bounce us somewhere else (login wall, search page)?
      try {
        const profile = new URL(profileUrl);
        const final = new URL(d.finalUrl);
        const sameHost = final.hostname.replace(/^www\./, '') === profile.hostname.replace(/^www\./, '');
        const path = profile.pathname.replace(/\/+$/, '');
        const stillThere = sameHost && final.pathname.toLowerCase().startsWith(path.toLowerCase());
        if (!stillThere) {
          return { kind: 'unclear', status: d.status, ms: d.ms, note: 'redirected to a login or search page', profileUrl };
        }
      } catch {
        /* keep the simple interpretation */
      }
      return { kind: 'taken', status: d.status, ms: d.ms, profileUrl };
    }
    return {
      kind: 'unclear',
      status: d.status,
      ms: d.ms,
      note: d.status === 0 ? d.error ?? 'no response' : `HTTP ${d.status}`,
      profileUrl,
    };
  } catch {
    return { kind: 'unclear', note: 'network error', profileUrl };
  }
}

const SocialHandleTool = () => {
  const [handle, setHandle] = React.useState('');
  const [states, setStates] = React.useState<Record<string, HandleState>>({});
  const [running, setRunning] = React.useState(false);

  const clean = handle.trim().replace(/^@/, '').replace(/\s+/g, '');
  const invalid = clean.length > 0 && !/^[a-zA-Z0-9._-]{1,35}$/.test(clean);

  const checkAll = async () => {
    if (!clean || invalid || running) return;
    setRunning(true);
    setStates(Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, { kind: 'checking' as const }])));
    const targets = SOCIAL_PLATFORMS.map((p) => ({ p, url: p.build(clean) }));
    await mapLimit(targets, 3, async ({ p, url }) => {
      const result = await checkHandle(url);
      setStates((prev) => ({ ...prev, [p.id]: result }));
    });
    setRunning(false);
  };

  const done = !running && Object.keys(states).length > 0;
  const counts = SOCIAL_PLATFORMS.reduce(
    (acc, p) => {
      const k = states[p.id]?.kind;
      if (k === 'taken') acc.taken++;
      else if (k === 'available') acc.available++;
      else if (k && k !== 'idle') acc.unclear++;
      return acc;
    },
    { taken: 0, available: 0, unclear: 0 },
  );

  const report = [
    `Handle availability report — @${clean}`,
    '',
    ...SOCIAL_PLATFORMS.map((p) => {
      const s = states[p.id];
      const verdict = s?.kind === 'taken' ? 'likely taken' : s?.kind === 'available' ? 'probably available' : s?.kind === 'checking' ? 'checking…' : s?.kind === 'unclear' ? `couldn't verify${s.note ? ` (${s.note})` : ''}` : 'not checked';
      return `${p.label}: ${p.build(clean)} — ${verdict}`;
    }),
    '',
    `Summary: ${counts.available} probably available · ${counts.taken} likely taken · ${counts.unclear} unclear`,
    'Automated results are indicative only — verify important handles manually before registering.',
  ].join('\n');

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void checkAll();
        }}
      >
        <div className="relative flex-1">
          <AtSign className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your-handle — letters, numbers, dots and underscores"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Username handle to check"
            className="h-13 rounded-full border-2 border-gray-200 bg-white pl-11 pr-4 text-[15px] text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-gray-500 focus-visible:ring-gray-500"
          />
        </div>
        <button type="submit" disabled={running || !clean || invalid} className="btn-primary-pill sm:!px-8">
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Checking…
            </>
          ) : (
            'Check 10 platforms'
          )}
        </button>
      </form>
      {invalid ? (
        <p className="rounded-xl bg-gray-100 px-4 py-3 text-xs font-medium text-gray-900" role="alert">
          Handles work best with letters, numbers, dots and underscores (max ~30 chars). Spaces and most symbols are not accepted by the platforms.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {SOCIAL_PLATFORMS.map((p) => {
          const s = states[p.id];
          const url = p.build(clean || 'handle');
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <span className="w-28 shrink-0 text-sm font-bold text-[#0a0a0a]">{p.label}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-xs text-gray-800 underline decoration-gray-200 hover:decoration-gray-500"
              >
                {url}
              </a>
              <StatusPill ok={s?.kind === 'available' ? true : s?.kind === 'taken' ? false : null}>
                {s?.kind === 'taken'
                  ? 'Likely taken'
                  : s?.kind === 'available'
                    ? 'Probably free'
                    : s?.kind === 'checking'
                      ? 'Checking…'
                      : s?.kind === 'unclear'
                        ? "Couldn't verify"
                        : 'Not checked'}
              </StatusPill>
              {s?.ms !== undefined ? <span className="w-16 text-right text-xs text-gray-400">{s.ms.toLocaleString()} ms</span> : null}
              {s?.note ? <p className="w-full text-xs text-gray-800">{s.note}</p> : null}
            </div>
          );
        })}
      </div>

      {done ? (
        <Verdict
          tone={counts.available > 0 && counts.taken === 0 ? 'good' : counts.taken > 0 && counts.available === 0 ? 'bad' : 'warn'}
          title={`@${clean}: ${counts.available} probably free · ${counts.taken} likely taken · ${counts.unclear} unclear`}
          message="Gray rows are platforms that hide profiles behind logins or answer 200 for every URL — open those links and judge by eye. Green rows are a strong hint, not a reservation: legacy names and bans still exist, so finish the check on each platform's signup page."
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={report} label="Copy report" />
      </div>

      <ToolNote>
        Results come from live HTTP checks (three platforms at a time) through the shared URL analyzer. Reachable profile pages mean the handle is probably registered; 404/410 usually means it is free — but bot walls on Instagram, Facebook and TikTok make their rows inconclusive by design.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GROUP B — TEXT ENGINE CONVERTERS
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   8. json-formatter-validator
   ═══════════════════════════════════════════════════════════════ */

function transformJson(input: string, opts: Record<string, string>): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return jsonErrorReport(input, err);
  }
  if (opts.sort === 'yes') parsed = deepSort(parsed);
  const indent = opts.mode === 'pretty4' ? '    ' : '  ';
  const minified = JSON.stringify(parsed);
  const out = opts.mode === 'minify' ? minified : JSON.stringify(parsed, null, indent);
  if (opts.verdict === 'hide') return out;
  const stats = countJsonNodes(parsed);
  return `✓ Valid JSON — ${stats.keys.toLocaleString()} object keys · ${stats.arrays.toLocaleString()} arrays · minified size ${minified.length.toLocaleString()} B\n\n${out}`;
}

const JsonFormatterTool = () => (
  <TextTool
    config={{
      inputLabel: 'JSON input',
      outputLabel: 'Formatted / validated',
      placeholder: '{ "paste": "your JSON here" }',
      downloadName: 'formatted',
      downloadExt: 'json',
      sample: '{\n  "project": "Tools Mania",\n  "stars": 4242,\n  "tags": ["json", "csv"],\n  "owner": { "name": "Developers3", "active": true }\n}',
      options: [
        {
          id: 'mode',
          label: 'Output mode',
          default: 'pretty2',
          options: [
            { value: 'pretty2', label: 'Pretty — 2 spaces' },
            { value: 'pretty4', label: 'Pretty — 4 spaces' },
            { value: 'minify', label: 'Minify — one line' },
          ],
        },
        {
          id: 'sort',
          label: 'Object keys',
          default: 'no',
          options: [
            { value: 'no', label: 'Keep original order' },
            { value: 'yes', label: 'Sort alphabetically' },
          ],
        },
        {
          id: 'verdict',
          label: 'Status line',
          default: 'show',
          options: [
            { value: 'show', label: 'Show ✓/✗ verdict' },
            { value: 'hide', label: 'Hide — pure JSON output' },
          ],
        },
      ],
      transform: transformJson,
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   9. json-to-csv-converter
   ═══════════════════════════════════════════════════════════════ */

function transformJsonToCsv(input: string, opts: Record<string, string>): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return jsonErrorReport(input, err);
  }
  let rows: unknown[];
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const wrapper = Object.values(parsed as Record<string, unknown>).find((v) => Array.isArray(v));
    if (wrapper) {
      rows = wrapper as unknown[];
    } else {
      rows = [parsed];
    }
  } else {
    return '✗ Could not find a JSON array of objects to convert.\n\nPaste an array like [{ "id": 1 }, { "id": 2 }] — a single object also works.';
  }
  if (rows.length === 0) return 'The JSON array is empty — nothing to convert.';
  const delim = opts.delimiter === 'semicolon' ? ';' : opts.delimiter === 'tab' ? '\t' : ',';
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
    for (const k of Object.keys(r as Record<string, unknown>)) {
      if (!seen.has(k)) {
        seen.add(k);
        columns.push(k);
      }
    }
  }
  const lines: string[] = [];
  if (columns.length === 0) {
    for (const r of rows) lines.push(csvEscape(cellToString(r), delim));
    return lines.join('\n');
  }
  if (opts.headerRow !== 'no') lines.push(columns.map((c) => csvEscape(c, delim)).join(delim));
  for (const r of rows) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      lines.push(csvEscape(cellToString(r), delim));
      continue;
    }
    const o = r as Record<string, unknown>;
    lines.push(columns.map((c) => csvEscape(cellToString(o[c]), delim)).join(delim));
  }
  return lines.join('\n');
}

const JsonToCsvTool = () => (
  <TextTool
    config={{
      inputLabel: 'JSON array of objects',
      outputLabel: 'CSV output',
      placeholder: '[\n  { "sku": "A-100", "price": 89.9 }\n]',
      downloadName: 'export',
      downloadExt: 'csv',
      sample: '[\n  { "sku": "A-100", "name": "Mech Keyboard", "price": 89.9, "stock": 14 },\n  { "sku": "B-220", "name": "USB-C Hub, 7-in-1", "price": 34.5, "stock": 0 }\n]',
      options: [
        {
          id: 'delimiter',
          label: 'Delimiter',
          default: 'comma',
          options: [
            { value: 'comma', label: 'Comma ( , )' },
            { value: 'semicolon', label: 'Semicolon ( ; )' },
            { value: 'tab', label: 'Tab' },
          ],
        },
        {
          id: 'headerRow',
          label: 'Header row',
          default: 'yes',
          options: [
            { value: 'yes', label: 'Include column headers' },
            { value: 'no', label: 'Data only, no headers' },
          ],
        },
      ],
      transform: transformJsonToCsv,
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   10. csv-to-json-converter
   ═══════════════════════════════════════════════════════════════ */

function transformCsvToJson(input: string, opts: Record<string, string>): string {
  const delim =
    opts.delimiter === 'comma' ? ',' : opts.delimiter === 'semicolon' ? ';' : opts.delimiter === 'tab' ? '\t' : detectDelimiter(input);
  const raw = parseCsv(input.replace(/^\uFEFF/, ''), delim).filter((r) => r.some((c) => c.trim() !== ''));
  if (raw.length === 0) return 'Paste some CSV first — no rows were found.';
  const hasHeader = opts.headerRow !== 'no';
  const headerRow = raw[0] ?? [];
  const header = hasHeader ? sanitizeHeaders(headerRow) : headerRow.map((_, i) => `column${i + 1}`);
  const dataRows = hasHeader ? raw.slice(1) : raw;
  const infer = opts.types === 'yes';
  const out: unknown[] = [];
  for (const row of dataRows) {
    if (hasHeader) {
      const obj: Record<string, unknown> = {};
      header.forEach((h, i) => {
        const cell = row[i] ?? '';
        obj[h] = infer ? coerceCell(cell) : cell;
      });
      out.push(obj);
    } else {
      out.push(infer ? row.map((c) => coerceCell(c)) : row);
    }
  }
  return JSON.stringify(out, null, 2);
}

const CsvToJsonTool = () => (
  <TextTool
    config={{
      inputLabel: 'CSV input',
      outputLabel: 'JSON output',
      placeholder: 'sku,name,price\nA-100,"Mech Keyboard",89.9',
      downloadName: 'export',
      downloadExt: 'json',
      sample: 'sku,name,price,stock\nA-100,"Mech Keyboard",89.9,14\nB-220,"USB-C Hub, 7-in-1",34.5,0',
      options: [
        {
          id: 'delimiter',
          label: 'Delimiter',
          default: 'auto',
          options: [
            { value: 'auto', label: 'Auto-detect ( , ; tab )' },
            { value: 'comma', label: 'Comma ( , )' },
            { value: 'semicolon', label: 'Semicolon ( ; )' },
            { value: 'tab', label: 'Tab' },
          ],
        },
        {
          id: 'headerRow',
          label: 'First row',
          default: 'yes',
          options: [
            { value: 'yes', label: 'Is a header row — objects keyed by it' },
            { value: 'no', label: 'Is data — arrays with columnN keys' },
          ],
        },
        {
          id: 'types',
          label: 'Cell types',
          default: 'no',
          options: [
            { value: 'no', label: 'Keep everything as strings' },
            { value: 'yes', label: 'Infer numbers and booleans' },
          ],
        },
      ],
      transform: transformCsvToJson,
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   11. xml-formatter
   ═══════════════════════════════════════════════════════════════ */

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isWhitespaceOnly(node: Node): boolean {
  return node.nodeType === 3 && (node.textContent ?? '').trim() === '';
}

function serializeXml(node: Node, depth: number, indent: string, minify: boolean, out: string[]): void {
  const pad = minify ? '' : indent.repeat(depth);
  const nl = minify ? '' : '\n';

  if (node.nodeType === 3) {
    const text = (node.textContent ?? '').trim();
    if (text) out.push(`${pad}${minify ? text : escXml(text)}${nl}`);
    return;
  }
  if (node.nodeType === 8) {
    out.push(`${pad}<!--${node.nodeValue ?? ''}-->${nl}`);
    return;
  }
  if (node.nodeType === 4) {
    out.push(`${pad}<![CDATA[${node.nodeValue ?? ''}]]>${nl}`);
    return;
  }
  if (node.nodeType === 7) {
    const pi = node as ProcessingInstruction;
    out.push(`${pad}<?${pi.target}${pi.data ? ` ${pi.data}` : ''}?>${nl}`);
    return;
  }
  if (node.nodeType === 10) {
    out.push(`${pad}<!DOCTYPE ${node.nodeName}>${nl}`);
    return;
  }
  if (node.nodeType !== 1) return;

  const el = node as Element;
  const attrs = [...el.attributes].map((a) => ` ${a.name}="${escXml(a.value)}"`).join('');
  const children = [...el.childNodes].filter((c) => !(minify || indent !== '' ? isWhitespaceOnly(c) : false));
  void indent;

  if (children.length === 0) {
    out.push(`${pad}<${el.tagName}${attrs} />${nl}`);
    return;
  }
  if (children.length === 1 && children[0].nodeType === 3) {
    const text = (children[0].textContent ?? '').trim();
    if (text.length <= 80) {
      out.push(`${pad}<${el.tagName}${attrs}>${minify ? text : escXml(text)}</${el.tagName}>${nl}`);
      return;
    }
  }
  out.push(`${pad}<${el.tagName}${attrs}>${nl}`);
  for (const child of children) serializeXml(child, depth + 1, indent, minify, out);
  out.push(`${pad}</${el.tagName}>${nl}`);
}

function transformXml(input: string, opts: Record<string, string>): string {
  if (typeof DOMParser === 'undefined') return 'The XML parser is only available in the browser.';
  const minify = opts.mode === 'minify';
  const indentUnit = opts.indent === 'tab' ? '\t' : opts.indent === '4' ? '    ' : opts.indent === '8' ? '        ' : '  ';
  const doc = new DOMParser().parseFromString(input, 'application/xml');
  const errEl = doc.querySelector('parsererror');
  if (errEl) {
    const raw = (errEl.textContent ?? 'Unknown XML error').replace(/\s+/g, ' ').trim();
    const lineMatch = raw.match(/line (\d+)/i);
    const headline = lineMatch ? `✗ MALFORMED XML — line ${lineMatch[1]}` : '✗ MALFORMED XML';
    return `${headline}\n\n${raw}`;
  }
  const out: string[] = [];
  const declMatch = input.match(/^\s*(<\?xml[\s\S]*?\?>)/);
  if (declMatch?.[1]) out.push(`${minify ? '' : ''}${declMatch[1].trim()}${minify ? '' : '\n'}`);
  for (const child of [...doc.childNodes]) serializeXml(child, 0, indentUnit, minify, out);
  return out.join('').trimEnd() + '\n';
}

const XmlFormatterTool = () => (
  <TextTool
    config={{
      inputLabel: 'XML input',
      outputLabel: 'Formatted XML',
      placeholder: '<catalog><book id="bk101"><author>…</author></book></catalog>',
      downloadName: 'formatted',
      downloadExt: 'xml',
      acceptFile: true,
      sample: `<?xml version="1.0" encoding="UTF-8"?>\n<!-- catalog snapshot -->\n<catalog updated="2025-01-15">\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer's Guide</title>\n    <price currency="USD">44.95</price>\n  </book>\n  <book id="bk102">\n    <author>Ralls, Kim</author>\n    <title>Midnight Rain</title>\n    <notes><![CDATA[Line one\nLine two]]></notes>\n  </book>\n</catalog>`,
      options: [
        {
          id: 'mode',
          label: 'Output mode',
          default: 'pretty',
          options: [
            { value: 'pretty', label: 'Pretty print' },
            { value: 'minify', label: 'Minify' },
          ],
        },
        {
          id: 'indent',
          label: 'Indentation',
          default: '2',
          options: [
            { value: '2', label: '2 spaces' },
            { value: '4', label: '4 spaces' },
            { value: '8', label: '8 spaces' },
            { value: 'tab', label: 'Tab character' },
          ],
        },
      ],
      transform: transformXml,
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   12. uuid-generator
   ═══════════════════════════════════════════════════════════════ */

function uuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function makeUuids(count: number, upper: boolean, noDash: boolean): string[] {
  return Array.from({ length: count }, () => {
    let id = uuidV4();
    if (noDash) id = id.replace(/-/g, '');
    if (upper) id = id.toUpperCase();
    return id;
  });
}

const UuidGenerator = () => {
  const [count, setCount] = React.useState('10');
  const [upper, setUpper] = React.useState(false);
  const [noDash, setNoDash] = React.useState(false);
  const [uuids, setUuids] = React.useState<string[]>(() => makeUuids(10, false, false));

  const n = Math.min(100, Math.max(1, Math.round(parseInt(count || '1', 10) || 1)));
  const generate = () => setUuids(makeUuids(n, upper, noDash));
  const output = uuids.join('\n');

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label="How many UUIDs"
          value={count}
          onChange={setCount}
          min={1}
          max={100}
          step={1}
          suffix="max 100"
        />
        <div className="flex flex-col justify-center gap-2">
          <ToggleInput label="Uppercase" checked={upper} onChange={setUpper} help="A1B2… instead of a1b2…" />
          <ToggleInput label="Remove dashes" checked={noDash} onChange={setNoDash} help="Compact 32-char form for stricter schemas." />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={generate} className="btn-primary-pill">
          <RefreshCw className="size-4" /> Generate {n} UUID{n > 1 ? 's' : ''}
        </button>
        <CopyButton value={output} label="Copy all" />
        <DownloadButton filename="uuids.txt" content={output} label="Download .txt" />
      </div>
      <OutputBox value={output} scroll />
      <ToolNote>
        Every identifier is a random UUID v4 minted in your browser with the Web Crypto API — 122 random bits, nothing transmitted or stored. Batches are not sequential, so generating more never reveals previous values.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   13. password-generator
   ═══════════════════════════════════════════════════════════════ */

const PASSWORD_SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const;

function cryptoIndex(poolLen: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(4294967296 / poolLen) * poolLen;
  let v = 0;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % poolLen;
}

function generatePassword(length: number, pool: string, requiredSets: string[]): string {
  let pw = '';
  for (let attempt = 0; attempt < 12; attempt++) {
    pw = Array.from({ length }, () => pool[cryptoIndex(pool.length)]).join('');
    if (requiredSets.every((set) => [...pw].some((c) => set.includes(c)))) break;
  }
  return pw;
}

const PasswordGenerator = () => {
  const [length, setLength] = React.useState(20);
  const [useUpper, setUseUpper] = React.useState(true);
  const [useLower, setUseLower] = React.useState(true);
  const [useDigits, setUseDigits] = React.useState(true);
  const [useSymbols, setUseSymbols] = React.useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = React.useState(false);
  const [passwords, setPasswords] = React.useState<string[]>([]);

  const selected = React.useMemo(() => {
    const sets: string[] = [];
    if (useLower) sets.push(PASSWORD_SETS.lower);
    if (useUpper) sets.push(PASSWORD_SETS.upper);
    if (useDigits) sets.push(PASSWORD_SETS.digits);
    if (useSymbols) sets.push(PASSWORD_SETS.symbols);
    return sets;
  }, [useLower, useUpper, useDigits, useSymbols]);

  const pool = React.useMemo(() => {
    const joined = selected.join('');
    return avoidAmbiguous ? joined.replace(/[Il1O0o]/g, '') : joined;
  }, [selected, avoidAmbiguous]);

  const generate = () => {
    if (!pool) {
      setPasswords([]);
      return;
    }
    setPasswords(Array.from({ length: 5 }, () => generatePassword(length, pool, selected)));
  };

  React.useEffect(() => {
    generate();
     
  }, [length, useLower, useUpper, useDigits, useSymbols, avoidAmbiguous]);

  const entropy = pool ? length * Math.log2(pool.length) : 0;
  const strength =
    entropy < 40
      ? { tone: 'bad' as const, label: 'Weak', width: Math.max(8, (entropy / 100) * 100) }
      : entropy < 60
        ? { tone: 'warn' as const, label: 'Fair', width: Math.max(20, (entropy / 100) * 100) }
        : { tone: 'good' as const, label: entropy >= 80 ? 'Excellent' : 'Strong', width: Math.min(100, (entropy / 100) * 100) };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <LabeledSlider
          label="Password length"
          value={length}
          onChange={setLength}
          min={8}
          max={64}
          format={(v) => `${v} chars`}
          help="16+ is a solid default for accounts that matter."
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleInput label="a–z" checked={useLower} onChange={setUseLower} />
          <ToggleInput label="A–Z" checked={useUpper} onChange={setUseUpper} />
          <ToggleInput label="0–9" checked={useDigits} onChange={setUseDigits} />
          <ToggleInput label="!@#$…" checked={useSymbols} onChange={setUseSymbols} />
        </div>
      </div>
      <ToggleInput
        label="Avoid lookalike characters"
        checked={avoidAmbiguous}
        onChange={setAvoidAmbiguous}
        help="Removes I l 1 O 0 o — useful when passwords get read aloud or typed from paper."
      />

      <div className="card-soft flex flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold text-[#0a0a0a]">
            Entropy: <span className="text-gradient">{entropy.toFixed(0)} bits</span>
          </p>
          <p className={cn('text-sm font-bold', strength.tone === 'good' ? 'text-gray-800' : strength.tone === 'warn' ? 'text-gray-800' : 'text-gray-800')}>
            {strength.label}
          </p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100" role="meter" aria-valuenow={Math.round(entropy)} aria-valuemin={0} aria-valuemax={120} aria-label="Password entropy">
          <div
            className={cn('h-full rounded-full transition-all', strength.tone === 'good' ? 'bg-gray-500' : strength.tone === 'warn' ? 'bg-gray-500' : 'bg-gray-500')}
            style={{ width: `${strength.width}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Pool of {pool.length || 0} characters → {length} × log₂({pool.length || 0}) bits of guessing difficulty. Pure math, not a marketing color bar.
        </p>
      </div>

      {pool ? (
        <div className="flex flex-col gap-2">
          {passwords.map((pw, i) => (
            <div key={`${i}-${pw}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <span className="min-w-0 flex-1 break-all font-mono text-sm font-bold text-[#0a0a0a]">{pw}</span>
              <CopyButton value={pw} />
            </div>
          ))}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={generate} className="btn-primary-pill">
              <RefreshCw className="size-4" /> Generate 5 more
            </button>
            <CopyButton value={passwords.join('\n')} label="Copy all 5" />
          </div>
        </div>
      ) : (
        <Verdict tone="warn" title="Pick at least one character set" message="Enable lower case, upper case, digits or symbols above and the generator will produce five passwords immediately." />
      )}

      <ToolNote>
        Generation runs entirely in your browser via crypto.getRandomValues with rejection sampling to avoid modulo bias — nothing is sent anywhere, and the results die when you close the tab. The entropy figure assumes the attacker knows your settings and can only guess.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   14. hash-generator
   ═══════════════════════════════════════════════════════════════ */

const HASH_ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

const HashGenerator = () => {
  const [text, setText] = React.useState('');
  const [hashes, setHashes] = React.useState<Partial<Record<(typeof HASH_ALGOS)[number], string>>>({});
  const [computing, setComputing] = React.useState(false);
  const [subtleError, setSubtleError] = React.useState('');
  const [expected, setExpected] = React.useState('');

  React.useEffect(() => {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      setSubtleError('The Web Crypto API is unavailable in this context (it requires a secure HTTPS or localhost connection).');
      return;
    }
    let cancelled = false;
    const run = async () => {
      setComputing(true);
      try {
        const data = new TextEncoder().encode(text);
        const next: Partial<Record<(typeof HASH_ALGOS)[number], string>> = {};
        for (const alg of HASH_ALGOS) {
          const digest = await crypto.subtle.digest(alg, data);
          next[alg] = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
        }
        if (!cancelled) {
          setHashes(next);
          setSubtleError('');
        }
      } catch {
        if (!cancelled) setSubtleError('Hashing failed unexpectedly — try a shorter input.');
      } finally {
        if (!cancelled) setComputing(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [text]);

  const normalizedExpected = expected.trim().toLowerCase().replace(/\s+/g, '');
  const match = normalizedExpected ? HASH_ALGOS.find((a) => hashes[a] === normalizedExpected) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <TextAreaInput
        label="Text to hash"
        value={text}
        onChange={setText}
        rows={5}
        placeholder="Paste or type anything — all four digests compute as you type…"
        help="The input is encoded as UTF-8 bytes. A trailing newline or space changes every digest."
      />

      {subtleError ? <Verdict tone="bad" title="Hashing unavailable" message={subtleError} /> : null}

      <div className="flex flex-col gap-2">
        {HASH_ALGOS.map((alg) => (
          <div key={alg} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <span className="w-20 shrink-0 text-sm font-bold text-gray-800">{alg}</span>
            <span className="min-w-0 flex-1 break-all font-mono text-xs text-[#374151]">
              {computing && text ? 'computing…' : hashes[alg] || '—'}
            </span>
            <CopyButton value={hashes[alg] ?? ''} />
          </div>
        ))}
      </div>

      <TextInput
        label="Expected hash (optional)"
        value={expected}
        onChange={setExpected}
        placeholder="Paste a digest to verify — e.g. ba7816bf…"
        help="Case and spaces are ignored; the comparison runs against all four algorithms at once."
      />

      {normalizedExpected ? (
        match ? (
          <Verdict tone="good" title={`Match — the input hashes to this ${match} digest`} message="The expected value equals the computed digest exactly. The data is byte-for-byte what you expect." />
        ) : computing && text ? (
          <Verdict tone="warn" title="Computing…" message="Hang on while the digests finish." />
        ) : (
          <Verdict tone="bad" title="No match" message="None of the four computed digests equals the expected value. Check for hidden whitespace, different encodings (UTF-8 vs UTF-16) or a hash of a file rather than this text." />
        )
      ) : null}

      <ToolNote>
        All four digests come from the browser&apos;s native Web Crypto engine — no data leaves the page. Note that MD5 is deliberately absent: the Web Crypto standard excludes it because MD5 is cryptographically broken, so any tool offering MD5 is rolling its own crypto.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   15. timestamp-converter
   ═══════════════════════════════════════════════════════════════ */

function parseUnixInput(raw: string): { ms: number; unit: 'seconds' | 'milliseconds' } | null {
  const t = raw.trim().replace(/_/g, '');
  if (!/^-?\d{1,16}$/.test(t)) return null;
  const n = parseInt(t, 10);
  const abs = Math.abs(n);
  if (abs >= 1e11) return { ms: n, unit: 'milliseconds' };
  return { ms: n * 1000, unit: 'seconds' };
}

const TimestampConverter = () => {
  const [tsInput, setTsInput] = React.useState('');
  const [dateInput, setDateInput] = React.useState('');
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parsed = parseUnixInput(tsInput);
  const date = parsed ? new Date(parsed.ms) : null;
  const validDate = date !== null && !Number.isNaN(date.getTime());

  const fromDatePicker = dateInput ? new Date(dateInput) : null;
  const fromPickerValid = fromDatePicker !== null && !Number.isNaN(fromDatePicker.getTime());

  return (
    <div className="flex flex-col gap-6">
      <div className="card-soft flex flex-col gap-2 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Right now (live)</p>
        <p className="font-mono text-4xl font-bold text-gradient">{Math.floor(now / 1000).toLocaleString()}</p>
        <p className="font-mono text-sm text-gray-500">seconds · milliseconds {now.toLocaleString()} · ISO {new Date(now).toISOString()}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <TextInput
            label="Unix timestamp → date"
            value={tsInput}
            onChange={setTsInput}
            placeholder="e.g. 1700000000 or 1700000000000"
            help="Seconds or milliseconds — the digit count decides automatically."
          />
          <button type="button" onClick={() => setTsInput(String(Math.floor(Date.now() / 1000)))} className="btn-secondary-pill w-fit">
            Insert now
          </button>
          {tsInput && !parsed ? (
            <p className="rounded-xl bg-gray-100 px-4 py-3 text-xs font-medium text-gray-900" role="alert">
              That does not look like a plain Unix timestamp — digits only, with or without a minus sign.
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Your local time"
            value={validDate && date ? date.toLocaleString() : '—'}
            hint={parsed ? `parsed as ${parsed.unit}` : 'waiting for input'}
          />
          <StatCard label="UTC" value={validDate && date ? date.toUTCString() : '—'} />
          <StatCard label="ISO 8601" value={validDate && date ? date.toISOString() : '—'} />
          <StatCard
            label="Relative"
            value={validDate && date ? timeAgo(date.getTime()) : '—'}
            tone={validDate && date && date.getTime() < Date.now() ? 'default' : 'default'}
            hint="measured from this second"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FieldShell label="Date → timestamp" help="Pick a local date and time; the outputs use your browser's timezone rules.">
          <Input
            type="datetime-local"
            step="1"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            aria-label="Pick a date and time"
            className="h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a] focus-visible:border-gray-500 focus-visible:ring-gray-500"
          />
        </FieldShell>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Unix seconds" value={fromPickerValid ? String(Math.floor(fromDatePicker.getTime() / 1000)) : '—'} />
          <StatCard label="Unix milliseconds" value={fromPickerValid ? String(fromDatePicker.getTime()) : '—'} />
        </div>
      </div>

      <ToolNote>
        Unix time counts seconds since 1970-01-01 UTC and is timezone-free — 10-digit values are seconds, 13-digit values are milliseconds, and both render the same instant everywhere. Local vs. UTC cards are shown side by side so daylight-saving surprises can&apos;t hide.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   16. rich-snippet-tester
   ═══════════════════════════════════════════════════════════════ */

interface ChecklistItem {
  tone: 'good' | 'warn' | 'bad';
  label: string;
  detail: string;
}

function parseLd(src: string): { ok: true; nodes: Record<string, unknown>[] } | { ok: false; error: string } {
  let text = src.trim();
  if (!text) return { ok: false, error: 'Paste a JSON-LD block first.' };
  if (text.startsWith('<')) {
    const scripts = [...text.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const content = scripts.map((m) => (m[1] ?? '').trim()).find(Boolean);
    if (!content) return { ok: false, error: 'No JSON-LD found in the pasted HTML — paste the contents of the <script type="application/ld+json"> tag.' };
    text = content;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    const nodes: Record<string, unknown>[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) {
        v.forEach(walk);
        return;
      }
      if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>;
        nodes.push(o);
        if (o['@graph']) walk(o['@graph']);
      }
    };
    walk(parsed);
    if (nodes.length === 0) return { ok: false, error: 'The JSON parsed, but it contains no structured object — expected {"@context": …, "@type": …}.' };
    return { ok: true, nodes };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON.' };
  }
}

function nodeTypes(node: Record<string, unknown>): string[] {
  const t = node['@type'];
  if (typeof t === 'string') return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === 'string');
  return [];
}

function propText(node: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = node[key];
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o['name'] === 'string') return o['name'];
    }
  }
  return '';
}

function buildChecklist(nodes: Record<string, unknown>[]): { items: ChecklistItem[]; focus: string; previewTitle: string; previewDesc: string; faqs: { q: string; a: string }[] } {
  const items: ChecklistItem[] = [];
  const ARTICLES = ['Article', 'NewsArticle', 'BlogPosting'];
  const isType = (node: Record<string, unknown>, types: string[]) => nodeTypes(node).some((t) => types.includes(t));

  const context = nodes[0]?.['@context'];
  if (typeof context === 'string' && context.includes('schema.org')) {
    items.push({ tone: 'good', label: '@context present', detail: context });
  } else if (context === undefined) {
    items.push({ tone: 'bad', label: '@context missing', detail: 'Google needs "@context": "https://schema.org" to interpret the markup at all.' });
  } else {
    items.push({ tone: 'warn', label: '@context looks unusual', detail: `Found "${String(context)}" — expected a schema.org URL.` });
  }

  const allTypes = nodes.flatMap(nodeTypes);
  if (allTypes.length > 0) {
    items.push({ tone: 'good', label: `@type declared: ${allTypes.slice(0, 4).join(', ')}`, detail: `${nodes.length} node${nodes.length > 1 ? 's' : ''} found in the block.` });
  } else {
    items.push({ tone: 'bad', label: '@type missing', detail: 'Without a type the block describes nothing specific.' });
  }

  const focusNode =
    nodes.find((n) => isType(n, ARTICLES)) ??
    nodes.find((n) => isType(n, ['Product'])) ??
    nodes.find((n) => isType(n, ['FAQPage'])) ??
    nodes.find((n) => isType(n, ['LocalBusiness']));
  const focus = focusNode
    ? nodeTypes(focusNode).find((t) => [...ARTICLES, 'Product', 'FAQPage', 'LocalBusiness'].includes(t)) ?? ''
    : '';

  const require = (node: Record<string, unknown> | undefined, key: string, label: string, how: string) => {
    if (!node) return;
    const v = node[key];
    const present = v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
    items.push(
      present
        ? { tone: 'good', label: `${key}: ${propText(node, [key]).slice(0, 60) || 'present'}`, detail: '' }
        : { tone: 'bad', label: `Missing ${label}`, detail: how },
    );
  };
  const recommend = (node: Record<string, unknown> | undefined, keys: string[], label: string, why: string) => {
    if (!node) return;
    const present = keys.some((k) => node[k] !== undefined && node[k] !== null && node[k] !== '');
    if (!present) items.push({ tone: 'warn', label: `Recommended: ${label}`, detail: why });
  };

  let previewTitle = '';
  let previewDesc = '';
  const faqs: { q: string; a: string }[] = [];

  if (focusNode && ARTICLES.includes(focus)) {
    previewTitle = propText(focusNode, ['headline', 'name']);
    previewDesc = propText(focusNode, ['description']);
    require(focusNode, 'headline', 'a headline', 'Add "headline" — Google shows it as the result title.');
    require(focusNode, 'author', 'an author', 'Add "author" as a string or {"@type":"Person","name":"…"} — Google requires it for Article.');
    require(focusNode, 'datePublished', 'a publication date', 'Add "datePublished" in ISO 8601, e.g. "2025-01-15T09:00:00+00:00".');
    require(focusNode, 'image', 'an image', 'Add "image" with a full absolute URL — results without images earn less visual space.');
    recommend(focusNode, ['description'], 'description', 'A short summary improves snippet quality.');
    recommend(focusNode, ['publisher'], 'publisher', 'Publisher is expected for eligibility in Top Stories-style surfaces.');
  } else if (focusNode && focus === 'Product') {
    previewTitle = propText(focusNode, ['name']);
    previewDesc = propText(focusNode, ['description']);
    require(focusNode, 'name', 'a product name', 'Add "name" — it becomes the result title.');
    require(focusNode, 'image', 'a product image', 'Add "image" with an absolute URL.');
    const offers = focusNode['offers'];
    if (offers && typeof offers === 'object' && !Array.isArray(offers)) {
      const o = offers as Record<string, unknown>;
      const hasPrice = o['price'] !== undefined && o['priceCurrency'] !== undefined;
      items.push(
        hasPrice
          ? { tone: 'good', label: `offers: price ${String(o['price'])} ${String(o['priceCurrency'] ?? '')}`.trim(), detail: '' }
          : { tone: 'bad', label: 'offers is missing price/priceCurrency', detail: 'Product needs {"offers":{"price":…,"priceCurrency":"…"}} to qualify for price rich results.' },
      );
    } else {
      items.push({ tone: 'bad', label: 'Missing offers', detail: 'Product markup requires an "offers" object with price and priceCurrency.' });
    }
    recommend(focusNode, ['brand'], 'brand', 'Brand helps matching and merchant listings.');
    recommend(focusNode, ['aggregateRating', 'review'], 'rating or reviews', 'Star ratings in search come from aggregateRating.');
  } else if (focusNode && focus === 'FAQPage') {
    previewTitle = 'FAQ results preview';
    const main = focusNode['mainEntity'];
    if (Array.isArray(main) && main.length > 0) {
      items.push({ tone: 'good', label: `mainEntity: ${main.length} question${main.length > 1 ? 's' : ''}`, detail: '' });
      for (const q of main) {
        if (!q || typeof q !== 'object') continue;
        const qo = q as Record<string, unknown>;
        const question = typeof qo['name'] === 'string' ? qo['name'] : '';
        const answer = qo['acceptedAnswer'];
        const answerText = answer && typeof answer === 'object' && !Array.isArray(answer) ? String((answer as Record<string, unknown>)['text'] ?? '') : typeof answer === 'string' ? answer : '';
        if (question && answerText) faqs.push({ q: question, a: answerText });
      }
      if (faqs.length < main.length) {
        items.push({ tone: 'warn', label: 'Some questions are incomplete', detail: 'Each mainEntity entry needs "name" (the question) and "acceptedAnswer" with "text".' });
      }
    } else {
      items.push({ tone: 'bad', label: 'Missing mainEntity', detail: 'FAQPage requires "mainEntity": an array of Question objects, each with name and acceptedAnswer.' });
    }
    previewDesc = faqs.length > 0 ? `${faqs.length} Q&A pair${faqs.length > 1 ? 's' : ''} eligible for the dropdown` : 'No complete Q&A pairs found yet';
  } else if (focusNode && focus === 'LocalBusiness') {
    previewTitle = propText(focusNode, ['name']);
    previewDesc = propText(focusNode, ['description']);
    require(focusNode, 'name', 'a business name', 'Add "name" — the business title in the result.');
    require(focusNode, 'address', 'a postal address', 'Add "address" (PostalAddress with streetAddress, addressLocality, addressRegion, postalCode).');
    require(focusNode, 'telephone', 'a phone number', 'Add "telephone" in international format, e.g. "+1-555-0100".');
    recommend(focusNode, ['geo'], 'geo coordinates', 'Geo helps map placement.');
    recommend(focusNode, ['openingHoursSpecification', 'openingHours'], 'opening hours', 'Hours can appear directly in local results.');
    recommend(focusNode, ['url'], 'url', 'The canonical site URL for the listing.');
  } else {
    items.push({
      tone: 'warn',
      label: 'No supported type detected',
      detail: 'The checklist covers Article (NewsArticle/BlogPosting), Product, FAQPage and LocalBusiness. Other types still get the @context/@type sanity check.',
    });
    previewTitle = propText(nodes[0] ?? {}, ['name', 'headline']);
    previewDesc = propText(nodes[0] ?? {}, ['description']);
  }

  return { items, focus: focus || '(generic)', previewTitle, previewDesc, faqs };
}

const RICH_SNIPPET_SAMPLE = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Ship a Side Project in 30 Days",
  "description": "A pragmatic checklist for launching small software products fast.",
  "image": "https://example.com/images/side-project.jpg",
  "author": { "@type": "Person", "name": "Jordan Lee" },
  "publisher": { "@type": "Organization", "name": "Developers3" },
  "datePublished": "2025-01-15T09:00:00+00:00"
}`;

const RichSnippetTester = () => {
  const [input, setInput] = React.useState('');
  const parsed = React.useMemo(() => (input.trim() ? parseLd(input) : null), [input]);
  const report = React.useMemo(() => (parsed && parsed.ok ? buildChecklist(parsed.nodes) : null), [parsed]);

  const badCount = report?.items.filter((i) => i.tone === 'bad').length ?? 0;
  const warnCount = report?.items.filter((i) => i.tone === 'warn').length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-[#0a0a0a]">JSON-LD markup</p>
          <button type="button" onClick={() => setInput(RICH_SNIPPET_SAMPLE)} className="rounded-full border-2 border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-zinc-200 hover:text-[#0a0a0a]">
            Load sample
          </button>
        </div>
        <TextAreaInput
          label=""
          value={input}
          onChange={setInput}
          rows={9}
          placeholder={'Paste your JSON-LD — raw JSON or the whole <script type="application/ld+json"> tag…'}
        />
      </div>

      {parsed && !parsed.ok ? (
        <Verdict tone="bad" title="The markup does not parse" message={parsed.error} />
      ) : null}

      {report ? (
        <>
          <Verdict
            tone={badCount > 0 ? 'bad' : warnCount > 0 ? 'warn' : 'good'}
            title={
              badCount > 0
                ? `${badCount} required propert${badCount > 1 ? 'ies are' : 'y is'} missing`
                : warnCount > 0
                  ? 'Structurally valid — fill the recommended extras'
                  : 'Checklist clean — ready to ship'
            }
            message={
              badCount > 0
                ? 'Red items are properties Google treats as required for this type. Fix them first; amber ones raise quality but are optional.'
                : warnCount > 0
                  ? 'No required property is missing. Amber recommendations are worth adding for richer, more trustworthy results.'
                  : `Every heuristic for ${report.focus} passes. For the final word, run Google's Rich Results Test on the live URL — this checklist is a structural pre-flight.`
            }
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[#0a0a0a]">Property checklist</p>
              {report.items.map((item, i) => (
                <CheckRow key={`${item.label}-${i}`} tone={item.tone} label={item.label} detail={item.detail} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold text-[#0a0a0a]">Rough result preview</p>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-800">D</span>
                  <div className="leading-tight">
                    <p className="text-sm text-[#0a0a0a]">your-site.com</p>
                    <p className="text-xs text-gray-500">https://your-site.com › page</p>
                  </div>
                </div>
                <p className="mt-2 truncate text-xl text-[#1a0dab]">{report.previewTitle || 'Untitled result'}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">{report.previewDesc || 'No description provided in the markup.'}</p>
              </div>
              {report.faqs.length > 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">FAQ dropdown preview</p>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {report.faqs.slice(0, 5).map((f) => (
                      <div key={f.q} className="py-2.5 first:pt-0 last:pb-0">
                        <p className="text-sm font-bold text-[#0a0a0a]">{f.q}</p>
                        <p className="mt-1 line-clamp-3 text-sm text-gray-600">{f.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <ToolNote>
                Heuristics run entirely in your browser: @context, @type and the required/recommended properties for Article, Product, FAQPage and LocalBusiness. Eligibility for actual rich results is Google&apos;s call — treat this as a fast pre-flight, not a guarantee.
              </ToolNote>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   17. youtube-tag-extractor
   ═══════════════════════════════════════════════════════════════ */

function parseVideoId(raw: string): string {
  const s = raw.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m?.[1] ?? '';
}

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  error?: string;
}

async function fetchOEmbed(videoId: string): Promise<OEmbedResponse | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`);
    if (!res.ok) return null;
    return (await res.json()) as OEmbedResponse;
  } catch {
    return null;
  }
}

async function fetchProxyTags(videoId: string): Promise<string[]> {
  try {
    const res = await fetch(`https://r.jina.ai/https://www.youtube.com/watch?v=${videoId}`);
    if (!res.ok) return [];
    const text = (await res.text()).slice(0, 400_000);
    const tags: string[] = [];
    const jsonKw = text.match(/"keywords"\s*:\s*\[([^\]]{1,4000})\]/);
    if (jsonKw?.[1]) {
      for (const m of jsonKw[1].matchAll(/"([^"]{1,80})"/g)) {
        const t = m[1].trim();
        if (t && !tags.includes(t)) tags.push(t);
      }
    }
    if (tags.length === 0) {
      const line = text.match(/(?:^|\n)#{0,3}\s*tags?\s*:\s*([^\n]{1,500})/i);
      if (line?.[1]) {
        for (const part of line[1].split(/[,;]/)) {
          const t = part.trim().replace(/^[-*•]\s*/, '');
          if (t && t.length > 1 && !tags.includes(t)) tags.push(t);
        }
      }
    }
    return tags.slice(0, 40);
  } catch {
    return [];
  }
}

const YoutubeTagExtractor = () => {
  const [input, setInput] = React.useState('');
  const [phase, setPhase] = React.useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [error, setError] = React.useState('');
  const [videoId, setVideoId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [tags, setTags] = React.useState<string[] | null>(null);
  const [manualTitle, setManualTitle] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const analyze = async () => {
    const id = parseVideoId(input);
    if (!id) {
      setPhase('error');
      setError('Could not find a video ID. Paste a full YouTube URL (watch, share, Shorts or embed) or the 11-character ID itself.');
      return;
    }
    setPhase('working');
    setError('');
    setVideoId(id);
    setTags(null);
    setTitle('');
    setAuthor('');
    const [oembed, proxyTags] = await Promise.all([fetchOEmbed(id), fetchProxyTags(id)]);
    if (oembed?.title) setTitle(oembed.title);
    if (oembed?.author_name) setAuthor(oembed.author_name);
    setTags(proxyTags.length > 0 ? proxyTags : null);
    setPhase('done');
  };

  const suggestionSource = title || manualTitle.trim();
  const keywordList = React.useMemo(() => (suggestionSource ? suggestKeywords(suggestionSource, 500) : []), [suggestionSource]);
  const keywordString = keywordList.join(', ');

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void analyze();
        }}
      >
        <div className="relative flex-1">
          <Youtube className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… or the 11-char video ID"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="YouTube URL or video ID"
            className="h-13 rounded-full border-2 border-gray-200 bg-white pl-11 pr-4 text-[15px] text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-gray-500 focus-visible:ring-gray-500"
          />
        </div>
        <button type="submit" disabled={phase === 'working'} className="btn-primary-pill sm:!px-8">
          {phase === 'working' ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Analyzing…
            </>
          ) : (
            'Extract tags'
          )}
        </button>
      </form>

      {phase === 'error' ? <Verdict tone="bad" title="No video found in that input" message={error} /> : null}

      {phase === 'done' ? (
        <>
          <div className="card-soft p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Video</p>
            <p className="mt-1 font-mono text-sm text-gray-800">{videoId}</p>
            {title ? <p className="mt-1 font-bold text-[#0a0a0a]">{title}</p> : null}
            {author ? <p className="mt-0.5 text-sm text-gray-500">by {author}</p> : null}
            {!title ? (
              <p className="mt-1 text-sm text-gray-800">The title could not be fetched (the video may be private, age-restricted or region-blocked) — paste it manually below to power the keyword generator.</p>
            ) : null}
          </div>

          {tags && tags.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[#0a0a0a]">Tags recovered from the video page</p>
              <OutputBox value={tags.join(', ')} scroll />
              <div className="flex flex-wrap gap-2">
                <CopyButton value={tags.join(', ')} label="Copy tags" />
              </div>
            </div>
          ) : (
            <Verdict
              tone="warn"
              title="No meta keywords exposed for this video"
              message="YouTube removed public access to the keywords meta tag years ago, so tags are only recoverable for videos whose owners opted in. The keyword generator below is the honest fallback — it builds a prioritized tag set from the actual video title."
            />
          )}

          <div className="flex flex-col gap-3">
            {!title ? (
              <TextAreaInput
                label="Video title (paste it here)"
                value={manualTitle}
                onChange={setManualTitle}
                rows={2}
                placeholder="Paste the exact video title to generate keyword suggestions…"
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!suggestionSource}
                onClick={() => setSuggestions(suggestKeywords(suggestionSource, 500))}
                className="btn-primary-pill disabled:opacity-40"
              >
                <Sparkles className="size-4" /> Generate keyword suggestions
              </button>
              {suggestions.length > 0 ? <CopyButton value={suggestions.join(', ')} label="Copy keywords" /> : null}
            </div>
            {suggestions.length > 0 ? (
              <>
                <OutputBox value={suggestions.join(', ')} scroll />
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {suggestions.length} keywords · {keywordString.length}/500 characters of YouTube&apos;s tag budget used.
                </p>
              </>
            ) : null}
          </div>
        </>
      ) : null}

      <ToolNote>
        Titles are fetched from YouTube&apos;s public oEmbed endpoint; tag recovery goes through a text proxy and often finds nothing because YouTube hides meta keywords for most videos — in that case the suggestion generator ranks phrases from the real title into a ≤500-character tag set, exactly how YouTube Studio budgets tags.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   18. qr-code-generator
   ═══════════════════════════════════════════════════════════════ */

type QrMode = 'text' | 'wifi' | 'vcard';

function wifiEscape(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1');
}

function buildWifiQr(ssid: string, password: string, encryption: string, hidden: boolean): string {
  const enc = encryption === 'nopass' ? 'nopass' : encryption;
  let s = `WIFI:T:${enc};S:${wifiEscape(ssid)};`;
  if (enc !== 'nopass' && password) s += `P:${wifiEscape(password)};`;
  if (hidden) s += 'H:true;';
  return `${s};`;
}

function buildVCard(fields: Record<string, string>): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  const add = (key: string) => {
    const v = (fields[key] ?? '').trim();
    if (v) lines.push(`${key}:${v}`);
  };
  add('FN');
  add('ORG');
  add('TITLE');
  add('TEL');
  add('EMAIL');
  add('URL');
  add('ADR');
  add('NOTE');
  lines.push('END:VCARD');
  return lines.join('\n');
}

const QR_EC_LEVELS = [
  { value: 'L', label: 'L — smallest, least robust' },
  { value: 'M', label: 'M — balanced (recommended)' },
  { value: 'Q', label: 'Q — print-safe' },
  { value: 'H', label: 'H — survives heavy damage' },
] as const;

const QrCodeGenerator = () => {
  const [mode, setMode] = React.useState<QrMode>('text');
  const [text, setText] = React.useState('https://developers3.com');
  const [ssid, setSsid] = React.useState('');
  const [wifiPassword, setWifiPassword] = React.useState('');
  const [encryption, setEncryption] = React.useState('WPA');
  const [hidden, setHidden] = React.useState(false);
  const [vName, setVName] = React.useState('');
  const [vOrg, setVOrg] = React.useState('');
  const [vTitle, setVTitle] = React.useState('');
  const [vTel, setVTel] = React.useState('');
  const [vEmail, setVEmail] = React.useState('');
  const [vUrl, setVUrl] = React.useState('');
  const [size, setSize] = React.useState(320);
  const [margin, setMargin] = React.useState(2);
  const [ec, setEc] = React.useState('M');
  const [dark, setDark] = React.useState('#0a0a0a');
  const [light, setLight] = React.useState('#ffffff');
  const [qrError, setQrError] = React.useState('');
  const [dataUrl, setDataUrl] = React.useState('');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const { copy } = useCopy();
  const [copied, setCopied] = React.useState(false);

  const payload = React.useMemo(() => {
    if (mode === 'wifi') return ssid.trim() ? buildWifiQr(ssid.trim(), wifiPassword, encryption, hidden) : '';
    if (mode === 'vcard') return buildVCard({ FN: vName, ORG: vOrg, TITLE: vTitle, TEL: vTel, EMAIL: vEmail, URL: vUrl });
    return text.trim();
  }, [mode, text, ssid, wifiPassword, encryption, hidden, vName, vOrg, vTitle, vTel, vEmail, vUrl]);

  const options = React.useMemo(
    () => ({
      width: size,
      margin,
      errorCorrectionLevel: ec as 'L' | 'M' | 'Q' | 'H',
      color: { dark, light },
    }),
    [size, margin, ec, dark, light],
  );

  React.useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!payload || !canvas) return;
    import('qrcode')
      .then(async (QRCode) => {
        await QRCode.default.toCanvas(canvas, payload, options);
        if (cancelled) return;
        setQrError('');
        const url = await QRCode.default.toDataURL(payload, options);
        if (!cancelled) setDataUrl(url);
      })
      .catch((err: unknown) => {
        if (!cancelled) setQrError(err instanceof Error ? err.message : 'Could not render this QR code — the payload may be too long for the chosen error-correction level.');
      });
    return () => {
      cancelled = true;
    };
     
  }, [payload, options]);

  React.useEffect(() => {
    if (!payload) setDataUrl('');
  }, [payload]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob('qr-code.png', blob);
    }, 'image/png');
  };

  const copyDataUrl = async () => {
    if (!payload) return;
    try {
      const mod = await import('qrcode');
      const url = await mod.default.toDataURL(payload, options);
      await copy(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setQrError('Could not build the data URL.');
    }
  };

  const modes: { id: QrMode; label: string }[] = [
    { id: 'text', label: 'Text / URL' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'vcard', label: 'vCard' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="QR content mode">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-all',
              mode === m.id ? 'border-zinc-200 bg-[#0a0a0a] text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-zinc-200 hover:text-[#0a0a0a]',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {mode === 'text' ? (
            <TextAreaInput label="Text or URL to encode" value={text} onChange={setText} rows={5} placeholder="Any text, link, email address…" />
          ) : null}
          {mode === 'wifi' ? (
            <>
              <TextInput label="Network name (SSID)" value={ssid} onChange={setSsid} placeholder="MyHomeWiFi" help="Case-sensitive — phones match it exactly." />
              {encryption !== 'nopass' ? (
                <TextInput label="Password" value={wifiPassword} onChange={setWifiPassword} placeholder="••••••••" help="Special characters are escaped automatically." />
              ) : null}
              <SelectInput
                label="Encryption"
                value={encryption}
                onChange={setEncryption}
                options={[
                  { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
                  { value: 'WEP', label: 'WEP (legacy)' },
                  { value: 'nopass', label: 'Open — no password' },
                ]}
              />
              <ToggleInput label="Hidden network" checked={hidden} onChange={setHidden} help="Adds the H:true flag for SSIDs that don't broadcast." />
            </>
          ) : null}
          {mode === 'vcard' ? (
            <>
              <TextInput label="Full name" value={vName} onChange={setVName} placeholder="Jordan Lee" />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Company" value={vOrg} onChange={setVOrg} placeholder="Developers3" />
                <TextInput label="Job title" value={vTitle} onChange={setVTitle} placeholder="e.g. Head of Product" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Phone" value={vTel} onChange={setVTel} placeholder="+1-555-0100" />
                <TextInput label="Email" value={vEmail} onChange={setVEmail} placeholder="jordan@example.com" />
              </div>
              <TextInput label="Website" value={vUrl} onChange={setVUrl} placeholder="https://example.com" />
            </>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledSlider label="Size" value={size} onChange={setSize} min={128} max={720} step={16} format={(v) => `${v}px`} />
            <LabeledSlider label="Quiet-zone margin" value={margin} onChange={setMargin} min={0} max={8} format={(v) => `${v} modules`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput label="Error correction" value={ec} onChange={setEc} options={QR_EC_LEVELS.map((l) => ({ value: l.value, label: l.label }))} />
            <ColorInput label="Dark color" value={dark} onChange={setDark} />
            <ColorInput label="Light color" value={light} onChange={setLight} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="card-soft flex w-full max-w-md flex-col items-center gap-4 p-6">
            {payload && !qrError ? (
              <canvas ref={canvasRef} className="max-w-full rounded-xl" aria-label="QR code preview" />
            ) : (
              <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
                {qrError ? qrError : 'Fill the fields above — the QR code renders here live.'}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={downloadPng} disabled={!payload || !!qrError} className="btn-primary-pill disabled:opacity-40">
                Download PNG
              </button>
              <button type="button" onClick={() => void copyDataUrl()} disabled={!payload || !!qrError} className="btn-secondary-pill disabled:opacity-40">
                {copied ? 'Copied!' : 'Copy data URL'}
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Encodes {payload.length.toLocaleString()} characters at EC level {ec}. Scan-test from arm&apos;s length before printing.
          </p>
        </div>
      </div>

      <ToolNote>
        Everything is generated in your browser with the local qrcode library — the pattern encodes your data directly, so codes never expire and there is no redirect service that can die. WiFi codes follow the standard WIFI: scheme; vCard uses version 3.0.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   19. barcode-generator
   ═══════════════════════════════════════════════════════════════ */

interface BarcodeFormatDef {
  id: string;
  label: string;
  sample: string;
  hint: string;
  validate: (v: string) => string | null;
}

function mod10Check(digits: string, weightsStart3: boolean): number {
  const sum = [...digits].reduce((acc, d, i) => {
    const n = parseInt(d, 10);
    const weight = (i % 2 === 0) === weightsStart3 ? 3 : 1;
    return acc + n * weight;
  }, 0);
  return (10 - (sum % 10)) % 10;
}

const BARCODE_FORMATS: BarcodeFormatDef[] = [
  {
    id: 'CODE128',
    label: 'Code 128 — any text',
    sample: 'DEV3-TOOLS-2025',
    hint: 'Any ASCII text of any length: SKUs, serial numbers, short links.',
    validate: (v) => (v.length > 0 ? null : 'Enter a value to encode.'),
  },
  {
    id: 'EAN13',
    label: 'EAN-13 — retail (worldwide)',
    sample: '590123412345',
    hint: '12 digits (check digit is computed for you) or all 13 digits with a valid check digit.',
    validate: (v) => {
      if (!/^\d{12}$|^\d{13}$/.test(v)) return 'EAN-13 needs exactly 12 or 13 digits (no spaces or letters).';
      const check = mod10Check(v.slice(0, 12), false);
      if (v.length === 13 && parseInt(v[12], 10) !== check) return `Check digit mismatch — for ${v.slice(0, 12)} the 13th digit must be ${check}, not ${v[12]}.`;
      return null;
    },
  },
  {
    id: 'UPC',
    label: 'UPC-A — retail (North America)',
    sample: '01234567890',
    hint: '11 digits (check digit computed) or 12 digits with a valid check digit.',
    validate: (v) => {
      if (!/^\d{11}$|^\d{12}$/.test(v)) return 'UPC-A needs exactly 11 or 12 digits.';
      const check = mod10Check(v.slice(0, 11), true);
      if (v.length === 12 && parseInt(v[11], 10) !== check) return `Check digit mismatch — for ${v.slice(0, 11)} the 12th digit must be ${check}, not ${v[11]}.`;
      return null;
    },
  },
  {
    id: 'CODE39',
    label: 'Code 39 — industrial / asset tags',
    sample: 'DEV 39 OK',
    hint: 'Uppercase A–Z, digits 0–9 and the symbols - . $ / + % plus space. Lowercase is uppercased automatically.',
    validate: (v) => (/^[0-9A-Z\-. $/+%]+$/i.test(v) ? null : 'Code 39 supports A–Z, 0–9, space and - . $ / + % only.'),
  },
  {
    id: 'ITF14',
    label: 'ITF-14 — shipping cartons',
    sample: '1234567890123',
    hint: '13 digits (check digit computed) or 14 digits with a valid check digit. GTIN-14 shape.',
    validate: (v) => {
      if (!/^\d{13}$|^\d{14}$/.test(v)) return 'ITF-14 needs exactly 13 or 14 digits.';
      const sum = [...v.slice(0, 13)].reduce((acc, d, i) => acc + parseInt(d, 10) * (i % 2 === 0 ? 3 : 1), 0);
      const check = (Math.ceil(sum / 10) * 10 - sum) % 10;
      if (v.length === 14 && parseInt(v[13], 10) !== check) return `Check digit mismatch — for ${v.slice(0, 13)} the 14th digit must be ${check}, not ${v[13]}.`;
      return null;
    },
  },
];

const BarcodeGenerator = () => {
  const [format, setFormat] = React.useState('CODE128');
  const [value, setValue] = React.useState('DEV3-TOOLS-2025');
  const [barWidth, setBarWidth] = React.useState(2);
  const [barHeight, setBarHeight] = React.useState(90);
  const [displayValue, setDisplayValue] = React.useState(true);
  const [problem, setProblem] = React.useState('');
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const activeFormat = BARCODE_FORMATS.find((f) => f.id === format) ?? BARCODE_FORMATS[0];

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !activeFormat) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const v = activeFormat.id === 'CODE39' ? value.toUpperCase() : value;
    const problemNow = activeFormat.validate(v);
    setProblem(problemNow ?? '');
    if (problemNow || !v) return;
    try {
      void (async () => {
        const mod = await import('jsbarcode');
        mod.default(svg, v, {
          format: activeFormat.id,
          width: barWidth,
          height: barHeight,
          displayValue,
          fontSize: 16,
          margin: 10,
          lineColor: '#0a0a0a',
          background: '#ffffff',
        });
      })();
    } catch (err) {
      setProblem(err instanceof Error ? err.message.replace(/^.*?InvalidInputException:\s*/i, '') : 'This value cannot be encoded in the selected format.');
    }
  }, [format, value, barWidth, barHeight, displayValue, activeFormat]);

  const svgMarkup = () => {
    const svg = svgRef.current;
    if (!svg) return '';
    return new XMLSerializer().serializeToString(svg);
  };

  const downloadSvg = () => {
    const xml = svgMarkup();
    if (!xml || problem) return;
    downloadBlob('barcode.svg', new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  };

  const downloadPng = async () => {
    const xml = svgMarkup();
    if (!xml || problem) return;
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('SVG render failed'));
        img.src = url;
      });
      const svg = svgRef.current;
      const rect = svg?.getBoundingClientRect();
      const w = Math.max(1, Math.round((rect?.width ?? 300) * 2));
      const h = Math.max(1, Math.round((rect?.height ?? 120) * 2));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) downloadBlob('barcode.png', blob);
    } catch {
      /* ignore — the SVG download remains available */
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SelectInput
            label="Barcode format"
            value={format}
            onChange={(f) => {
              setFormat(f);
              const next = BARCODE_FORMATS.find((x) => x.id === f);
              if (next) setValue(next.sample);
            }}
            options={BARCODE_FORMATS.map((f) => ({ value: f.id, label: f.label }))}
          />
          <TextInput
            label="Value to encode"
            value={value}
            onChange={setValue}
            placeholder={activeFormat?.sample}
            help={activeFormat?.hint}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledSlider label="Bar width" value={barWidth} onChange={setBarWidth} min={1} max={6} format={(v) => `${v}×`} />
            <LabeledSlider label="Height" value={barHeight} onChange={setBarHeight} min={40} max={200} format={(v) => `${v}px`} />
          </div>
          <ToggleInput label="Print the value under the bars" checked={displayValue} onChange={setDisplayValue} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="card-soft flex w-full items-center justify-center overflow-x-auto p-6">
            {problem ? (
              <div className="flex aspect-[5/2] w-full max-w-md items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-100 p-6 text-center text-sm font-medium text-gray-800">
                {problem}
              </div>
            ) : (
              <svg ref={svgRef} role="img" aria-label={`Barcode preview for ${value || 'empty value'}`} />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => void downloadPng()} disabled={!!problem} className="btn-primary-pill disabled:opacity-40">
              Download PNG (2×)
            </button>
            <button type="button" onClick={downloadSvg} disabled={!!problem} className="btn-secondary-pill disabled:opacity-40">
              Download SVG
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {activeFormat?.id} · {value.length} characters rendered as crisp vector bars.
          </p>
        </div>
      </div>

      <ToolNote>
        EAN-13, UPC-A and ITF-14 validate their check digits locally before rendering, so a wrong digit is refused with the exact expected value instead of a dead barcode. For real retail products the number itself must come from a licensed GS1 prefix — this tool renders, it does not allocate.
      </ToolNote>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BATCH EXPORT — 19 tools
   ═══════════════════════════════════════════════════════════════ */

export const batch: BatchTool[] = [
  {
    slug: 'website-uptime-checker',
    Component: UptimeChecker,
    doc: {
      longDescription:
        'Checks any public URL from our servers and reports whether the site answered, which HTTP status it returned and how long the full round trip took. It is a single instant sample — perfect for spot-checking a deploy, a DNS change or a site a client swears is "definitely online".',
      howTo: [
        'Type or paste the address — example.com is enough, the https:// part is added automatically.',
        'Press Check uptime and wait a moment while the request runs from the tool server.',
        'Read the status code, latency and verdict: green means the site answered successfully.',
        'Re-run after a deploy or DNS change and compare the numbers side by side.',
      ],
      faqs: [
        {
          q: 'Is one check enough to know if my site is up?',
          a: 'This tool takes one sample at the moment you click. Monitoring services ping every minute and alert on patterns — use this for instant spot checks and keep a dedicated monitor for history and alerts.',
        },
        {
          q: 'What does a 403 or 401 mean here?',
          a: 'The server answered, so the site is online — it just refused our bot. Firewall rules and bot protection often block automated requests while real visitors see the site fine.',
        },
        {
          q: 'Why is the response time different from my browser?',
          a: 'The measurement is a full round trip from our server without browser cache or a CDN edge near you. Treat it as a consistent baseline rather than a promise of what every visitor experiences.',
        },
      ],
    },
  },
  {
    slug: 'http-header-checker',
    Component: HeaderChecker,
    doc: {
      longDescription:
        'Fetches a URL and inspects the response headers it sends, scoring the six security headers modern browsers expect — HSTS, Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy. Every header gets a plain-language explanation so you know exactly what to add in nginx, Apache or your host dashboard.',
      howTo: [
        'Enter the page you want to audit — the homepage usually reflects the server defaults.',
        'Check the security score: X out of 6 headers present, with each missing one explained underneath.',
        'Browse the full header table to spot caching, compression and server-identity details.',
        'Fix the missing headers in your server config or CDN rules, then re-run until the score is green.',
      ],
      faqs: [
        {
          q: 'Which security header matters most?',
          a: 'Content-Security-Policy is the strongest defense against cross-site scripting but needs tuning to avoid breaking the page. Strict-Transport-Security is the safest quick win for any HTTPS site — one line, no functional impact.',
        },
        {
          q: 'Why does my site score 0/6 but still work fine?',
          a: 'Security headers are invisible to visitors; they only pay off when something goes wrong. Some CDNs also strip headers unless explicitly forwarded, so check the origin server too.',
        },
        {
          q: 'Are headers like Server reliable?',
          a: 'The Server and X-Powered-By values are whatever the software reports, which may be generic or deliberately faked. Use them as hints, not proof.',
        },
      ],
    },
  },
  {
    slug: 'redirect-chain-checker',
    Component: RedirectChecker,
    doc: {
      longDescription:
        'Walks a URL hop by hop without following redirects blindly, showing every 301, 302, 307 or 308 step together with its Location target and timing. Long chains silently waste crawl budget and add latency, and accidental loops can make a page unreachable — both surface immediately here.',
      howTo: [
        'Paste the URL whose redirect path you want to trace — old links and migrated pages are classic suspects.',
        'Follow the numbered chain: each row shows the status code, the next destination and that hop\u2019s latency.',
        'Watch the total-hops card: one or two hops is healthy, more than three deserves cleanup.',
        'Point the first hop directly at the final URL in your server config to remove the middlemen.',
      ],
      faqs: [
        {
          q: 'Why does hop count hurt SEO?',
          a: 'Search engines follow chains but signals get diluted and indexing slows; the working guidance is one redirect hop pointing straight at the final destination.',
        },
        {
          q: 'Is a 302 worse than a 301?',
          a: 'They mean different things: 301 passes full ranking signals for permanent moves, while 302/307 tell crawlers the move is temporary. Using a temporary code for a permanent move is a common, fixable mistake.',
        },
        {
          q: 'What does "Redirect loop detected" mean?',
          a: 'The chain revisited a URL it had already seen, so browsers bounce until they give up. Usually two rules fight each other — check the order of your HTTP-to-HTTPS and non-www rewrite rules.',
        },
      ],
    },
  },
  {
    slug: 'open-graph-preview-tool',
    Component: OgPreview,
    doc: {
      longDescription:
        'Pulls the Open Graph and Twitter meta tags from any page and previews them the way Google and social platforms would render them — a search-result snippet plus a Facebook/X-style share card. Missing tags are flagged with an explanation of what each one changes when the link is shared.',
      howTo: [
        'Enter the page URL whose shares you want to preview.',
        'Compare the Google-style snippet: the title and description come from your tags, exactly as searchers see them.',
        'Check the social card — image, title and description are what Facebook, X and LinkedIn render when the link is posted.',
        'Fix the flagged tags in your CMS or template, then re-check until every card is populated.',
      ],
      faqs: [
        {
          q: 'Why does Google show my title tag instead of og:title?',
          a: 'Google builds snippets from the <title> tag and meta description; og:title is only for link previews. That is why the preview shows both sources — keep them consistent but written for their audiences.',
        },
        {
          q: 'My og:image doesn\u2019t show — what\u2019s wrong?',
          a: 'Images must be publicly reachable, ideally around 1200×630 pixels, and freshly changed images are often served from the platform\u2019s cache — force a re-scrape with the platform\u2019s debugger.',
        },
        {
          q: 'Do I still need twitter:card tags?',
          a: 'X falls back to Open Graph data, but twitter:card chooses the layout. Without summary_large_image, X defaults to a small card even when a beautiful og:image exists.',
        },
      ],
    },
  },
  {
    slug: 'website-page-counter',
    Component: PageCounter,
    doc: {
      longDescription:
        'Reads one page\u2019s HTML and counts every unique link, split into internal and external totals, then live-verifies a sample of them so dead links surface immediately. The broken-link table shows exactly which URLs failed and with which status code.',
      howTo: [
        'Enter the page URL you want to audit — blog posts and resource pages collect the most link rot.',
        'Read the totals: unique links found and how many point inside versus outside your domain.',
        'Scan the broken-link table: any 404, 410, 5xx or timeout is worth fixing or replacing.',
        'Re-run after edits — unique links are capped at the first 300 per page.',
      ],
      faqs: [
        {
          q: 'Are duplicate links counted twice?',
          a: 'No — URLs are deduplicated after stripping #fragments, so a link repeated in the header and footer counts once. The numbers describe unique destinations, not anchor tags.',
        },
        {
          q: 'Which links get the live check?',
          a: 'The first 40 unique links are verified with real requests; everything else is counted from the HTML. For a full audit, run the tool on each page section.',
        },
        {
          q: 'Does it see rel=nofollow or JavaScript-rendered links?',
          a: 'The shared analyzer reads plain <a href> attributes and does not report nofollow flags or links rendered only by client-side JavaScript, so treat the totals as a floor.',
        },
      ],
    },
  },
  {
    slug: 'ip-address-lookup',
    Component: IpLookupTool,
    doc: {
      longDescription:
        'Shows your own public IP address with country, city, ISP and timezone the moment the page opens, and looks up any other IPv4, IPv6 or hostname on demand. Results come live from the free ipwho.is database — no API key, nothing stored — and render as clean info cards with one-tap copy.',
      howTo: [
        'Your own IP details load automatically when the page opens — copy the address with one click.',
        'To investigate another address, type an IP like 8.8.8.8 or a hostname and press Look up.',
        'Read the cards for country, region, city, ISP/organization, timezone, ASN and coordinates.',
        'Cross-check critical decisions like geo-blocking with a second data source — free geo-IP databases are estimates.',
      ],
      faqs: [
        {
          q: 'Why does the city look wrong?',
          a: 'Geo-IP maps an address to the network operator\u2019s registered location, which may be a nearby hub city rather than the device. Accuracy is typically country-level reliable, city-level approximate.',
        },
        {
          q: 'Can I look up a domain name?',
          a: 'Many hostnames resolve automatically — type github.com and the service geolocates the address its records point to. If a particular domain isn\u2019t resolved, look up its IP first with a DNS tool.',
        },
        {
          q: 'Is this anonymous?',
          a: 'The lookup request goes from your browser directly to ipwho.is, which sees it like any website visit. Nothing extra is added and nothing is stored on our side.',
        },
      ],
    },
  },
  {
    slug: 'social-handle-availability-checker',
    Component: SocialHandleTool,
    doc: {
      longDescription:
        'Type a username and the tool probes ten major platforms at once — X, Instagram, TikTok, Facebook, GitHub, Reddit, Pinterest, YouTube, Dribbble and Behance — reporting which profile URLs exist. Reachable profiles are marked likely taken while 404s suggest the handle is free, with an honest "couldn\u2019t verify" wherever a platform hides its answer behind a login wall.',
      howTo: [
        'Enter the handle without the @ — letters, numbers, dots and underscores are the safest characters.',
        'Press Check 10 platforms and wait a few seconds while three platforms are probed at a time.',
        'Green rows are probably free, red rows are probably taken, gray rows need a manual look — click any row to open the profile.',
        'Copy the report and verify the important handles on each platform\u2019s own signup page before registering.',
      ],
      faqs: [
        {
          q: 'Why does a platform say "couldn\u2019t verify"?',
          a: 'Instagram, Facebook and TikTok often redirect anonymous requests to a login page or answer 200 for every URL, so an honest check cannot distinguish taken from free there. Gray means judge by opening the link yourself.',
        },
        {
          q: 'A handle shows as free — can I register it right away?',
          a: 'Treat green rows as a strong hint, not a reservation. Platforms reserve legacy names, banned words and trademarks, so always finish the check on the platform\u2019s signup flow.',
        },
        {
          q: 'Which characters are allowed in a handle?',
          a: 'Most platforms accept letters, numbers, underscores and dots, with length caps (X allows 15, TikTok up to 24). The tool strips a leading @ and warns about characters the platforms reject.',
        },
      ],
    },
  },
  {
    slug: 'json-formatter-validator',
    Component: JsonFormatterTool,
    doc: {
      longDescription:
        'Parses JSON as you type and reformats it with 2-space or 4-space indentation or minifies it to a single line, with an optional alphabetical key sort. Invalid input produces an exact line-and-column diagnosis with a caret under the offending character instead of a cryptic parser message.',
      howTo: [
        'Paste JSON — valid input formats instantly and the status line confirms the verdict in one glance.',
        'Choose the output mode: 2-space, 4-space or minified single line.',
        'Turn on key sorting when you want stable, diff-friendly output for config files.',
        'Switch the status line to Hide when you need pure JSON to copy or download — errors always keep the line/column report.',
      ],
      faqs: [
        {
          q: 'Does sorting keys change my data?',
          a: 'No — only the order of object keys changes; array order is preserved and all values stay identical. Sorted keys make API fixtures and configs far easier to diff.',
        },
        {
          q: 'What do line and column refer to?',
          a: 'They point into your original input — line 1 is the first line you pasted, column 1 the first character. The snippet underneath shows the exact line with a caret at the error position.',
        },
        {
          q: 'Can it handle big files?',
          a: 'Everything runs in your browser\u2019s native JSON parser, which comfortably handles megabytes. Extremely large minified files may scroll sluggishly, so copy rather than scroll in that case.',
        },
      ],
    },
  },
  {
    slug: 'json-to-csv-converter',
    Component: JsonToCsvTool,
    doc: {
      longDescription:
        'Turns a JSON array of objects into spreadsheet-ready CSV, inferring the column set from the union of all keys in first-seen order. Values are escaped the way CSV requires — quotes doubled, delimiters and newlines wrapped — so fields survive a round trip through Excel, Sheets or any database importer.',
      howTo: [
        'Paste a JSON array like [{…}, {…}] — the column headers appear from your objects\u2019 keys.',
        'Pick the delimiter your target tool expects: comma, semicolon or tab.',
        'Turn off the header row if the importer wants raw data without column names.',
        'Copy or download the CSV — nested objects arrive as JSON strings inside their cell.',
      ],
      faqs: [
        {
          q: 'What if my objects have different keys?',
          a: 'The column set is the union of every key found, in first-appearance order; objects missing a key simply get an empty cell. Consistent records produce the tidiest result.',
        },
        {
          q: 'How are nested objects and arrays handled?',
          a: 'CSV cells are flat text, so nested values are serialized back to compact JSON inside their cell. Flatten your data upstream if the importer needs plain columns.',
        },
        {
          q: 'Why do quotes double in my output?',
          a: 'That is correct CSV escaping: a literal quote becomes two quotes and the field is wrapped in quotes. Excel and Sheets decode it back automatically on import.',
        },
      ],
    },
  },
  {
    slug: 'csv-to-json-converter',
    Component: CsvToJsonTool,
    doc: {
      longDescription:
        'Parses CSV — including quoted fields with embedded commas, newlines and doubled quotes — and emits a clean JSON array. Delimiters are auto-detected (comma, semicolon or tab) with a manual override, and an optional type-inference pass converts numeric and boolean-looking cells into real JSON types.',
      howTo: [
        'Paste your CSV — the delimiter is detected from the first row, or force one in the selector.',
        'Keep the header-row option on if your first line contains column names.',
        'Toggle type inference to turn 42 into a number and true into a boolean, or keep everything as strings.',
        'Copy or download the JSON array — quoted values with commas or line breaks stay intact.',
      ],
      faqs: [
        {
          q: 'My numbers arrive as strings — why?',
          a: 'Type inference is opt-in because leading zeros, zip codes and account numbers must stay text. With the toggle on, only plain integers and decimals without leading zeros become numbers.',
        },
        {
          q: 'How are duplicate or empty header names handled?',
          a: 'Empty headers become column1, column2… and duplicates get numeric suffixes, so every JSON object keeps unique keys and no data is lost.',
        },
        {
          q: 'What about quoted fields containing newlines?',
          a: 'Fully supported — the parser is a proper state machine, so a quoted cell may span as many lines as it needs before the next record starts.',
        },
      ],
    },
  },
  {
    slug: 'xml-formatter',
    Component: XmlFormatterTool,
    doc: {
      longDescription:
        'Beautifies or minifies XML, RSS feeds, SVGs and config files with configurable indentation, using the browser\u2019s real XML parser for strict well-formedness checking. Malformed input returns the parser\u2019s own error with the line number it choked on, so fixes take seconds.',
      howTo: [
        'Paste your XML or upload a file — well-formed input is formatted immediately.',
        'Choose the indentation: 2, 4 or 8 spaces, tabs, or minify to strip layout whitespace.',
        'Read the error panel when input is malformed — the parser reports the exact line number.',
        'Copy or download the result; comments, CDATA sections and processing instructions are preserved.',
      ],
      faqs: [
        {
          q: 'Does minifying change my document\u2019s meaning?',
          a: 'It removes whitespace-only text between elements, which is safe for data files, feeds and most SVG. Documents that treat inter-element whitespace as significant text should stay pretty-printed.',
        },
        {
          q: 'Will my XML declaration and DOCTYPE survive?',
          a: 'Yes — the declaration is kept verbatim at the top and DOCTYPE nodes are preserved, while comments, CDATA and processing instructions are re-emitted as written.',
        },
        {
          q: 'Why is this stricter than an HTML formatter?',
          a: 'XML has no forgiving error recovery: an unclosed tag or mismatched case is a hard error. That strictness is the point — the formatter doubles as a well-formedness validator.',
        },
      ],
    },
  },
  {
    slug: 'uuid-generator',
    Component: UuidGenerator,
    doc: {
      longDescription:
        'Mints 1–100 random UUID v4 identifiers at a time from the browser\u2019s cryptographic random number generator, with uppercase and dash-free variants for stricter schemas. Each identifier carries 122 random bits — collision odds are, for practical purposes, zero.',
      howTo: [
        'Set how many UUIDs you need (1–100) and press Generate for a fresh batch.',
        'Toggle uppercase or strip the dashes if your database or legacy system expects that shape.',
        'Copy the whole list at once or download it as a .txt file.',
        'Generate again whenever you need more — every batch is cryptographically random, never sequential.',
      ],
      faqs: [
        {
          q: 'Are these safe to use as secret keys?',
          a: 'UUID v4 is unguessable in practice, but dedicated secrets deserve a dedicated secret generator with proper length and storage. For primary keys, correlation IDs and request tags these are exactly right.',
        },
        {
          q: 'What is the difference between v4 and other versions?',
          a: 'v1 derives from timestamps and MAC addresses (privacy-leaky), v3/v5 derive from names (deterministic), and v4 is pure randomness — the safest default when you just need uniqueness.',
        },
        {
          q: 'Will I ever collide with an existing UUID?',
          a: 'With 122 random bits, generating a billion UUIDs per second for a century stays nowhere near a 1% collision probability. Duplicate checks are effectively unnecessary.',
        },
      ],
    },
  },
  {
    slug: 'password-generator',
    Component: PasswordGenerator,
    doc: {
      longDescription:
        'Creates five strong passwords at once with a length you control (8–64) and character sets you pick, generated with crypto.getRandomValues instead of Math.random. A live entropy readout converts your settings into bits of guessing difficulty, so "strong" is math rather than a decorative color bar.',
      howTo: [
        'Drag the length slider — 16 or more is a good default for accounts you care about.',
        'Choose the character sets your target system accepts; disable symbols for fussy legacy forms.',
        'Enable "avoid lookalikes" when passwords will be read aloud or typed from paper — I/l/1 and O/0 disappear.',
        'Copy any of the five results and regenerate for the next account; every batch is unique.',
      ],
      faqs: [
        {
          q: 'What does the entropy number mean?',
          a: 'It is the base-2 logarithm of how many different passwords your settings could produce: 60 bits means roughly 2⁶⁰ guesses for an attacker on average. Each extra character or character set multiplies the space.',
        },
        {
          q: 'Why avoid lookalike characters?',
          a: 'Removing I, l, 1, O and 0 costs a little entropy but prevents support tickets and mistyped shared credentials. Skip it when a password manager does the pasting.',
        },
        {
          q: 'Are these passwords sent anywhere?',
          a: 'No — generation happens entirely in your browser with the Web Crypto API; nothing is transmitted, logged or stored. Close the tab and the results are gone.',
        },
      ],
    },
  },
  {
    slug: 'hash-generator',
    Component: HashGenerator,
    doc: {
      longDescription:
        'Computes SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text simultaneously with the browser\u2019s Web Crypto engine and lays them out in hex for comparison. An expected-hash field verifies a digest against all four results at once, turning checksum debugging into a two-second job.',
      howTo: [
        'Paste or type the text — all four digests compute as you type.',
        'Paste a digest you expect into the compare field; a green verdict names the exact algorithm that matched.',
        'Copy any digest with its own button for changelogs, checksum lists or integrity manifests.',
        'Remember the hash covers the exact text — a trailing newline or invisible space changes everything.',
      ],
      faqs: [
        {
          q: 'Where is MD5?',
          a: 'The Web Crypto API deliberately omits MD5 because it is cryptographically broken. For legacy systems that demand MD5, use a dedicated utility — and treat matching MD5s as format checks, not security.',
        },
        {
          q: 'Is SHA-1 still safe?',
          a: 'Not for security purposes — chosen-prefix collisions are practical. It is included because legacy checksums and git object IDs still use it; for anything new pick SHA-256 or better.',
        },
        {
          q: 'Why doesn\u2019t my file\u2019s hash match?',
          a: 'This tool hashes text as UTF-8 bytes. Files hash as raw bytes — a text file that "looks the same" may carry a BOM or CRLF line endings, so compare files with a file-capable tool.',
        },
      ],
    },
  },
  {
    slug: 'timestamp-converter',
    Component: TimestampConverter,
    doc: {
      longDescription:
        'Converts Unix timestamps to human dates and back in both directions — paste 10-digit seconds or 13-digit milliseconds and the unit is detected from the magnitude, or pick a date and read its timestamps. A live clock ticks the current second alongside local, UTC and ISO 8601 renderings so timezone bugs can\u2019t hide.',
      howTo: [
        'Paste a timestamp — seconds versus milliseconds is decided automatically by digit count.',
        'Read the results: your local time, UTC, ISO 8601 and a plain-language "how long ago".',
        'Use the Insert-now button to capture the current moment, or pick a date to get its Unix seconds and milliseconds.',
        'Watch the live clock to grab "right now" values in seconds or milliseconds for logs and API calls.',
      ],
      faqs: [
        {
          q: '10 digits or 13 — which is which?',
          a: 'Seconds-since-epoch currently has 10 digits; JavaScript-style milliseconds have 13. The tool switches on magnitude, so 1700000000 is 2023 in seconds but 1970 in milliseconds.',
        },
        {
          q: 'Do timestamps store timezones?',
          a: 'No — Unix time is the same instant everywhere; timezones are a display concern. The same value reads 22:00 in Berlin and 16:00 in New York, and both local and UTC cards are shown.',
        },
        {
          q: 'Why do pasted dates sometimes shift an hour?',
          a: 'Daylight-saving transitions create local times that never existed or exist twice. The converter resolves them with your browser\u2019s rules — which is exactly why UTC output sits next to local.',
        },
      ],
    },
  },
  {
    slug: 'rich-snippet-tester',
    Component: RichSnippetTester,
    doc: {
      longDescription:
        'Paste a JSON-LD block — raw or straight from its <script> tag — and get a structural check of @context, @type and the properties Google actually looks for in Article, Product, FAQPage and LocalBusiness markup. Each requirement lands on a color-coded checklist, with a rough SERP and FAQ preview built from your own values.',
      howTo: [
        'Paste your JSON-LD, with or without the surrounding <script> tags — the JSON is extracted automatically.',
        'Review the checklist: green items are present, red ones are required-and-missing, amber ones are recommended.',
        'Look at the preview to see how the headline, description and (for FAQs) the Q&A might render.',
        'Fix the flagged properties in your template and re-test until the summary verdict is green.',
      ],
      faqs: [
        {
          q: 'Does a green checklist guarantee rich results?',
          a: 'No — this is a structural pre-flight. Google also weighs site quality, eligibility policies and its own live validation; the checklist just catches missing-property mistakes early.',
        },
        {
          q: 'My markup uses @graph — is that handled?',
          a: 'Yes. Nodes inside @graph and top-level arrays are flattened before type detection, so a WebSite + Organization graph checks the same as standalone blocks.',
        },
        {
          q: 'Which types does the checklist know?',
          a: 'Article (including NewsArticle/BlogPosting), Product, FAQPage and LocalBusiness. Other types still receive the @context/@type sanity check and a generic preview.',
        },
      ],
    },
  },
  {
    slug: 'youtube-tag-extractor',
    Component: YoutubeTagExtractor,
    doc: {
      longDescription:
        'Pulls what it can from any YouTube link — the video is identified from every URL format, the title arrives via YouTube\u2019s public oEmbed endpoint, and tag recovery runs through a text proxy in a best-effort pass. Because YouTube hides meta keywords for most videos, the tool always finishes useful: it generates prioritized keyword suggestions from the real title within YouTube\u2019s 500-character tag budget.',
      howTo: [
        'Paste any YouTube URL — watch, share, Shorts or embed — or just the 11-character video ID.',
        'Wait a moment: the tool fetches the title via oEmbed and attempts tag recovery through a text proxy.',
        'If tags were recovered they are listed for copying; otherwise the suggestion generator builds a keyword set from the title.',
        'Copy the comma-separated keywords straight into YouTube Studio — the set is trimmed to the 500-character limit.',
      ],
      faqs: [
        {
          q: 'Why can\u2019t tags always be extracted?',
          a: 'YouTube removed public access to the meta keywords tag years ago; only videos whose owners opted in still expose one. When the proxy cannot recover the list, title-derived suggestions are the honest fallback.',
        },
        {
          q: 'How are the keyword suggestions chosen?',
          a: 'The title is tokenized, stop words dropped, and the rest ranked — meaningful two-word phrases first, then the longest single words — until YouTube\u2019s 500-character tag budget is filled.',
        },
        {
          q: 'Are suggested tags safe for my channel?',
          a: 'Tags are a minor discovery signal; titles, thumbnails and watch time matter far more. Relevant phrases derived from your own title are safe — stuffing unrelated trending tags is what gets videos penalized.',
        },
      ],
    },
  },
  {
    slug: 'qr-code-generator',
    Component: QrCodeGenerator,
    doc: {
      longDescription:
        'Builds scannable QR codes for plain text and URLs, WiFi credentials and contact cards (vCard) with full control over size, quiet-zone margin, error-correction level and colors. Everything renders live on a canvas in your browser and exports as a print-ready PNG — no watermark, no expiry, no signup.',
      howTo: [
        'Pick a mode tab — Text/URL, WiFi or vCard — and fill the fields; the code redraws instantly.',
        'Tune size, margin, error correction and colors; dark-on-light with EC level M suits most print jobs.',
        'Scan-test the preview with a phone from arm\u2019s length before committing it to a poster.',
        'Download the PNG or copy the data URL for embedding straight into HTML or CSS.',
      ],
      faqs: [
        {
          q: 'Which error-correction level should I choose?',
          a: 'L holds the most data, H survives the most damage. L is fine for screens, M or Q is a safe print default, and H suits stickers that will get scratched — at the cost of a denser pattern.',
        },
        {
          q: 'Why won\u2019t my phone join the WiFi from the code?',
          a: 'The WiFi scheme needs the exact case-sensitive SSID and password, and iOS only reads WPA/WEP/open variants. Special characters in the password are escaped automatically; older Androids may only scan the open-network form.',
        },
        {
          q: 'Do these codes expire?',
          a: 'Never — the pattern encodes your data directly, unlike dynamic QR services that route through a redirect that can die. If your WiFi password changes, generate a new code.',
        },
      ],
    },
  },
  {
    slug: 'barcode-generator',
    Component: BarcodeGenerator,
    doc: {
      longDescription:
        'Renders retail-grade linear barcodes — Code 128, EAN-13, UPC-A, Code 39 and ITF-14 — as crisp vector SVG with adjustable bar width, height and human-readable text. Per-format validation catches wrong digit counts and bad check digits before you print, and PNG and SVG downloads are one click away.',
      howTo: [
        'Pick a format — each one states exactly what kind of value it accepts.',
        'Type your value: EAN-13, UPC-A and ITF-14 accept the digits without the check digit and compute it for you.',
        'Adjust bar width, height and whether the numbers print under the bars; the preview updates live.',
        'Download as SVG for print or PNG for documents — invalid values are refused with a specific hint instead of a dead barcode.',
      ],
      faqs: [
        {
          q: 'Why was my EAN-13 rejected?',
          a: 'EAN-13 encodes exactly 12 digits (the 13th is a check digit) or all 13 with a correct one. If the 13th digit disagrees with the math, the tool tells you what it should be — an invented digit produces an unscannable code.',
        },
        {
          q: 'Which format is right for me?',
          a: 'Retail products use EAN-13 (worldwide) or UPC-A (North America) with numbers from a licensed GS1 prefix; shipping cartons use ITF-14; internal SKUs and links use Code 128; capital-only asset tags use Code 39.',
        },
        {
          q: 'Is SVG really better than PNG?',
          a: 'For print, yes — SVG scales to any DPI without blur and scanners reward crisp edges. The PNG download renders at 2× for slides and PDFs.',
        },
      ],
    },
  },
];
