// Tiny hash-based router. The sandbox only exposes the `/` route, so the whole
// multi-page site lives under it with deep-linkable `#/path` URLs.
// Splitting into real Next.js routes later only requires moving views to pages/.

'use client';

import { create } from 'zustand';

interface RouterState {
  path: string;
  setPath: (path: string) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  path: '/',
  setPath: (path) => set({ path }),
}));

/** Normalize a path: ensure leading slash, strip trailing slashes. */
export function normalizePath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** Current path from the URL hash (client only). */
export function pathFromLocation(): string {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.replace(/^#/, '');
  return normalizePath(hash || '/');
}

/** Navigate to an internal path. Safe to call from event handlers. */
export function navigate(to: string): void {
  if (typeof window === 'undefined') return;
  const target = normalizePath(to);
  const current = pathFromLocation();
  if (target === current) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = target;
}
