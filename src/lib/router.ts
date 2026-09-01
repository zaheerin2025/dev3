// Clean path-based router.
// Uses HTML5 History API (pathname + search) for clean, 100% SEO-friendly URLs:
//   /services, /portfolio, /pricing, /about, /contact, /blog, /admin, etc.
// Automatically converts legacy `/#/path` hash URLs to clean `/path` URLs.

'use client';

import { create } from 'zustand';

interface RouterState {
  path: string;
  query: string;
  setRoute: (path: string, query: string) => void;
  setPath: (path: string) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  path: typeof window !== 'undefined' ? routeFromLocation().path : '/',
  query: typeof window !== 'undefined' ? routeFromLocation().query : '',
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

/** Current path + query from window.location (clean pathname + query). */
export function routeFromLocation(): { path: string; query: string } {
  if (typeof window === 'undefined') return { path: '/', query: '' };

  // Handle legacy hash URLs (e.g. /#/services → /services)
  if (window.location.hash.startsWith('#/')) {
    const hashTarget = window.location.hash.replace(/^#/, '');
    const clean = splitTarget(hashTarget);
    // Replace state with clean pathname
    const newUrl = clean.query ? `${clean.path}?${clean.query}` : clean.path;
    window.history.replaceState({}, '', newUrl);
    return clean;
  }

  const path = normalizePath(window.location.pathname);
  const query = window.location.search.replace(/^\?/, '');
  return { path, query };
}

/** Current path only. */
export function pathFromLocation(): string {
  return routeFromLocation().path;
}

/** Navigate to an internal path cleanly using HTML5 pushState. */
export function navigate(to: string): void {
  if (typeof window === 'undefined') return;
  const target = splitTarget(to);
  const current = routeFromLocation();
  if (target.path === current.path && target.query === current.query) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const url = target.query ? `${target.path}?${target.query}` : target.path;
  window.history.pushState({}, '', url);
  useRouterStore.getState().setRoute(target.path, target.query);
  window.dispatchEvent(new Event('popstate'));
}
