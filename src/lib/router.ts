// Tiny hash-based router. The sandbox only exposes the `/` route, so the whole
// multi-page site lives under it with deep-linkable `#/path` URLs.
// Supports optional query strings: #/tools?category=software →
//   { path: '/tools', query: 'category=software' }
// Splitting into real Next.js routes later only requires moving views to pages/.

'use client';

import { create } from 'zustand';

interface RouterState {
  path: string;
  query: string;
  setRoute: (path: string, query: string) => void;
  /** Back-compat helper used by callers that only care about the path. */
  setPath: (path: string) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  path: '/',
  query: '',
  setRoute: (path, query) => set({ path, query }),
  setPath: (path) => set({ path }),
}));

/** Normalize a path: ensure leading slash, strip trailing slashes. */
export function normalizePath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** Split a target into its path and query-string parts. */
export function splitTarget(target: string): { path: string; query: string } {
  const qIndex = target.indexOf('?');
  if (qIndex === -1) return { path: normalizePath(target), query: '' };
  return { path: normalizePath(target.slice(0, qIndex)), query: target.slice(qIndex + 1) };
}

/** Current path + query from the URL hash (client only). */
export function routeFromLocation(): { path: string; query: string } {
  if (typeof window === 'undefined') return { path: '/', query: '' };
  const hash = window.location.hash.replace(/^#/, '');
  return splitTarget(hash || '/');
}

/** Back-compat: current path only. */
export function pathFromLocation(): string {
  return routeFromLocation().path;
}

/** Navigate to an internal path (optionally with a query string). Safe from event handlers. */
export function navigate(to: string): void {
  if (typeof window === 'undefined') return;
  const target = splitTarget(to);
  const current = routeFromLocation();
  if (target.path === current.path && target.query === current.query) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = target.query ? `${target.path}?${target.query}` : target.path;
}
