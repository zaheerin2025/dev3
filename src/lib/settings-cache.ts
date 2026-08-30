// Shared in-memory cache for the public site-settings endpoint.
// The visual editor and admin panel bust it right after a save so
// saved content shows up instantly instead of up to 30s later.

export interface SettingsCache {
  at: number;
  settings: Record<string, string>;
}

let cache: SettingsCache | null = null;
const CACHE_MS = 30_000;

/** Fresh copy of the cache when it is still warm, otherwise null. */
export function getSettingsCache(): SettingsCache | null {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache;
  return null;
}

export function setSettingsCache(settings: Record<string, string>): void {
  cache = { at: Date.now(), settings };
}

/** Called by admin write endpoints so the next public read hits the DB. */
export function bustSettingsCache(): void {
  cache = null;
}
