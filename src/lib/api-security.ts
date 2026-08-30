// Shared API security helpers: per-IP rate limiting and JSON-LD escaping.
// The rate limiter is a simple in-memory sliding window — plenty for a
// single-process deployment, no external cache needed.

/** Best-effort client IP (the gateway sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

/** Sweep old buckets so the map cannot grow forever. */
function sweep(now: number, windowMs: number): void {
  if (buckets.size < 5_000) return;
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

/**
 * Sliding-window rate limit.
 * @returns true when the action is allowed under `max` events per `windowMs`.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now, windowMs);
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= max) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}

/** One-line helper for route handlers: limit per-IP or return a 429 response shape. */
export function rateLimitOr429(
  request: Request,
  scope: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; status: number; retryAfterSec: number } {
  const allowed = rateLimit(`${scope}:${clientIp(request)}`, max, windowMs);
  if (allowed) return { ok: true };
  return { ok: false, status: 429, retryAfterSec: Math.ceil(windowMs / 1000) };
}

/**
 * JSON.stringify that escapes `<` so embedded `</script>` sequences can never
 * break out of an inline <script type="application/ld+json"> block.
 */
export function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
