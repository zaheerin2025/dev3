import { NextResponse } from 'next/server';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { rateLimitOr429 } from '@/lib/api-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-side URL analysis for the tools portal.
 * POST { url, mode: 'uptime' | 'headers' | 'redirects' | 'og' | 'links' }
 *
 * Everything is fetched live with hard timeouts and strict size caps so the
 * endpoint stays cheap and safe. Only http/https targets are allowed, and
 * private/loopback/link-local addresses are blocked at every hop (SSRF guard).
 */

const UA = 'Mozilla/5.0 (compatible; Developers3ToolsBot/1.0; +https://developers3.com)';
const MAX_HTML_BYTES = 600_000;
const MAX_CONTENT_LENGTH = 5_000_000; // refuse to read bodies declared > 5 MB
const GENERIC_ERROR = 'Could not reach the site. It may be down, or the address may be wrong.';

/** True for loopback / private / link-local / metadata IPs (SSRF guard). */
function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (isIP(ip) === 6) {
    const low = ip.toLowerCase();
    if (low === '::' || low === '::1') return true;
    if (/^f[cd]/.test(low)) return true; // unique local fc00::/7
    if (/^fe[89ab]/.test(low)) return true; // link-local fe80::/10
    if (low.startsWith('::ffff:')) return isPrivateIp(low.slice(7)); // IPv4-mapped
    return false;
  }
  return false;
}

/**
 * Resolve the hostname and require EVERY address to be public. Runs before
 * each fetch and after each redirect hop, so a public URL cannot bounce us
 * at an internal one.
 */
async function assertPublicHost(hostname: string): Promise<void> {
  if (isIP(hostname) !== 0) {
    if (isPrivateIp(hostname)) throw new Error('blocked-host');
    return;
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error('dns-fail');
  }
  if (addrs.length === 0) throw new Error('dns-fail');
  for (const { address } of addrs) {
    if (isPrivateIp(address)) throw new Error('blocked-host');
  }
}

/** Fetch with host validation + timeout. Always `redirect: 'manual'`. */
async function fetchGuarded(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  await assertPublicHost(new URL(url).hostname);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'manual' });
  } finally {
    clearTimeout(timer);
  }
}

function errorFor(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError') return 'The site took too long to respond (timeout).';
    if (err.message === 'blocked-host') return 'That address is not reachable from this tool.';
    if (err.message === 'dns-fail') return 'That domain could not be found.';
    if (err.message === 'too-large') return 'That page is too large to analyse.';
  }
  return GENERIC_ERROR;
}

/** Stream-read at most `cap` bytes of an HTML/text body. */
async function readBodyCapped(res: Response, cap = MAX_HTML_BYTES): Promise<string> {
  const declared = Number(res.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > MAX_CONTENT_LENGTH) {
    throw new Error('too-large');
  }
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (size < cap) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }
  const merged = new Uint8Array(Math.min(size, cap));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= merged.length) break;
    merged.set(chunk.subarray(0, merged.length - offset), offset);
    offset += chunk.length;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}

interface FetchOutcome {
  finalUrl: string;
  status: number;
  statusText: string;
  ms: number;
  headers: Record<string, string>;
  body?: string;
  error?: string;
}

/** GET a page, following up to 6 redirects — every hop host-validated. */
async function fetchPage(url: string, timeoutMs = 8000): Promise<FetchOutcome> {
  const started = Date.now();
  let current = url;
  try {
    let res: Response | null = null;
    for (let hop = 0; hop < 6; hop++) {
      res = await fetchGuarded(current, {
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      }, timeoutMs);
      const location = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && location) {
        try {
          await res.body?.cancel();
        } catch {
          /* nothing to cancel */
        }
        const nextUrl = new URL(location, current);
        if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') throw new Error('blocked-host');
        current = nextUrl.toString();
        continue;
      }
      break;
    }
    if (!res) throw new Error('too-many-hops');

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    let body: string | undefined;
    if (headers['content-type']?.includes('html') || headers['content-type']?.startsWith('text/')) {
      body = await readBodyCapped(res);
    }
    return {
      finalUrl: res.url || current,
      status: res.status,
      statusText: res.statusText,
      ms: Date.now() - started,
      headers,
      body,
    };
  } catch (err) {
    return {
      finalUrl: url,
      status: 0,
      statusText: 'Unreachable',
      ms: Date.now() - started,
      headers: {},
      error: errorFor(err),
    };
  }
}

/** Follow a redirect chain hop by hop, validating every target host. */
async function fetchRedirectChain(url: string, maxHops = 8) {
  const hops: { url: string; status: number; location: string; ms: number }[] = [];
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const started = Date.now();
    try {
      const res = await fetchGuarded(current, { headers: { 'user-agent': UA } }, 7000);
      const location = res.headers.get('location') ?? '';
      const ms = Date.now() - started;
      try {
        await res.body?.cancel();
      } catch {
        /* nothing to cancel */
      }
      hops.push({
        url: current,
        status: res.status,
        location: location ? new URL(location, current).toString() : '',
        ms,
      });
      if (!location || res.status < 300 || res.status >= 400) break;
      const nextUrl = new URL(location, current);
      if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') break;
      current = nextUrl.toString();
    } catch {
      hops.push({ url: current, status: 0, location: '', ms: Date.now() - started });
      break;
    }
  }
  return hops;
}

function metaTag(html: string, keys: string[]): string {
  for (const key of keys) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return decodeEntities(m[1].trim());
    }
  }
  return '';
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractLinks(html: string, baseUrl: string) {
  const base = new URL(baseUrl);
  const found = new Map<string, 'internal' | 'external'>();
  const re = /<a\s[^>]*href=["']([^"'#\s]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && found.size < 300) {
    const raw = m[1].trim();
    if (!raw || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    try {
      const u = new URL(raw, base);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') continue;
      u.hash = '';
      const kind: 'internal' | 'external' = u.hostname === base.hostname ? 'internal' : 'external';
      if (!found.has(u.toString())) found.set(u.toString(), kind);
    } catch {
      /* skip malformed */
    }
  }
  return [...found.entries()].map(([url, kind]) => ({ url, kind }));
}

/** HEAD a link (host-validated, up to 3 redirect hops) for broken-link checks. */
async function checkLink(url: string): Promise<{ url: string; status: number }> {
  let current = url;
  try {
    for (let hop = 0; hop < 3; hop++) {
      const res = await fetchGuarded(current, { method: 'HEAD', headers: { 'user-agent': UA } }, 5000);
      const location = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && location) {
        try {
          await res.body?.cancel();
        } catch {
          /* nothing to cancel */
        }
        const nextUrl = new URL(location, current);
        if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') return { url, status: 0 };
        current = nextUrl.toString();
        continue;
      }
      // Some servers reject HEAD — retry with GET, discarding the body.
      if (res.status === 405 || res.status === 501) {
        const res2 = await fetchGuarded(current, { headers: { 'user-agent': UA } }, 5000);
        try {
          await res2.body?.cancel();
        } catch {
          /* nothing to cancel */
        }
        return { url, status: res2.status };
      }
      return { url, status: res.status };
    }
    return { url, status: 0 }; // too many hops
  } catch {
    return { url, status: 0 };
  }
}

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

const SECURITY_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
] as const;

export async function POST(request: Request) {
  const limit = rateLimitOr429(request, 'tools-fetch', 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many checks in a row. Give it a minute.' },
      { status: 429 }
    );
  }

  let payload: { url?: string; mode?: string };
  try {
    payload = (await request.json()) as { url?: string; mode?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const raw = (payload.url ?? '').trim();
  const mode = payload.mode ?? '';
  if (!raw) return NextResponse.json({ ok: false, error: 'Please provide a URL.' }, { status: 400 });

  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ ok: false, error: 'That does not look like a valid URL.' }, { status: 400 });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ ok: false, error: 'Only http and https URLs are supported.' }, { status: 400 });
  }

  switch (mode) {
    case 'uptime': {
      const outcome = await fetchPage(target.toString());
      return NextResponse.json({
        ok: true,
        data: {
          reachable: !outcome.error && outcome.status > 0,
          status: outcome.status,
          statusText: outcome.statusText,
          ms: outcome.ms,
          finalUrl: outcome.finalUrl,
          error: outcome.error,
        },
      });
    }

    case 'headers': {
      const outcome = await fetchPage(target.toString());
      const present = SECURITY_HEADERS.filter((h) => outcome.headers[h]);
      const missing = SECURITY_HEADERS.filter((h) => !outcome.headers[h]);
      const interesting = [
        'server', 'content-type', 'cache-control', 'content-encoding', 'x-powered-by',
        ...SECURITY_HEADERS,
      ];
      const headerList = interesting
        .filter((h) => outcome.headers[h])
        .map((h) => ({ name: h, value: outcome.headers[h].slice(0, 300) }));
      return NextResponse.json({
        ok: true,
        data: {
          url: outcome.finalUrl,
          status: outcome.status,
          ms: outcome.ms,
          https: outcome.finalUrl.startsWith('https://'),
          present,
          missing,
          headerList,
          error: outcome.error,
        },
      });
    }

    case 'redirects': {
      const hops = await fetchRedirectChain(target.toString());
      const last = hops[hops.length - 1];
      return NextResponse.json({
        ok: true,
        data: {
          hops,
          totalHops: hops.filter((h) => h.status >= 300 && h.status < 400 && h.location).length,
          finalStatus: last?.status ?? 0,
          finalUrl: last?.location || last?.url || target.toString(),
          wastedMs: hops.reduce((sum, h) => sum + h.ms, 0),
        },
      });
    }

    case 'og': {
      const outcome = await fetchPage(target.toString());
      if (outcome.error) {
        return NextResponse.json({ ok: true, data: { reachable: false, error: outcome.error } });
      }
      const body = outcome.body ?? '';
      const titleTag = body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
      const imgRaw = metaTag(body, ['og:image', 'twitter:image', 'twitter:image:src']);
      let image = '';
      try {
        image = imgRaw ? new URL(imgRaw, outcome.finalUrl).toString() : '';
      } catch {
        image = imgRaw;
      }
      return NextResponse.json({
        ok: true,
        data: {
          reachable: true,
          url: outcome.finalUrl,
          ogTitle: metaTag(body, ['og:title']),
          ogDescription: metaTag(body, ['og:description', 'description']),
          ogImage: image,
          ogSiteName: metaTag(body, ['og:site_name']),
          twitterCard: metaTag(body, ['twitter:card']),
          titleTag: decodeEntities(titleTag),
          metaDescription: metaTag(body, ['description']),
          hasOgTags: /property=["']og:/i.test(body),
        },
      });
    }

    case 'links': {
      const outcome = await fetchPage(target.toString());
      if (outcome.error || !outcome.body) {
        return NextResponse.json({ ok: false, error: outcome.error ?? 'Could not read the page HTML.' }, { status: 200 });
      }
      const links = extractLinks(outcome.body, outcome.finalUrl);
      const toCheck = links.slice(0, 40);
      const checked = await mapLimit(toCheck, 8, (l) => checkLink(l.url));
      const broken = checked.filter((c) => c.status === 0 || c.status >= 400);
      return NextResponse.json({
        ok: true,
        data: {
          pageUrl: outcome.finalUrl,
          totalLinks: links.length,
          internal: links.filter((l) => l.kind === 'internal').length,
          external: links.filter((l) => l.kind === 'external').length,
          checkedCount: checked.length,
          broken: broken.slice(0, 20),
          healthy: checked.length - broken.length,
        },
      });
    }

    default:
      return NextResponse.json({ ok: false, error: 'Unknown analysis mode.' }, { status: 400 });
  }
}
