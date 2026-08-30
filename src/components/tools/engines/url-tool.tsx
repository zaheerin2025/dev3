'use client';

import * as React from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   URL ENGINE — enter URL → live report via /api/tools/fetch
   Used by uptime, headers, redirects, OG preview, link checker.
   ═══════════════════════════════════════════════════════════════ */

export interface UrlToolConfig<T = unknown> {
  mode: 'uptime' | 'headers' | 'redirects' | 'og' | 'links';
  ctaLabel: string;
  placeholder?: string;
  /** Normalize what the user typed into a fetchable URL. */
  buildUrl?: (raw: string) => string;
  /** Render the API payload as a report. */
  render: (data: T) => React.ReactNode;
}

export function UrlTool<T>({ config }: { config: UrlToolConfig<T> }) {
  const [raw, setRaw] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = (config.buildUrl ?? defaultBuildUrl)(raw);
    if (!target) {
      setState('error');
      setError('Please enter a valid URL, e.g. example.com');
      return;
    }
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/tools/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, mode: config.mode }),
      });
      const payload = (await res.json()) as { ok: boolean; data?: T; error?: string };
      if (!res.ok || !payload.ok || payload.data === undefined) {
        throw new Error(payload.error ?? 'The request failed. Try again in a moment.');
      }
      setData(payload.data);
      setState('done');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={config.placeholder ?? 'example.com'}
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Website URL"
            className="h-13 rounded-full border-2 border-gray-200 bg-white pl-11 pr-4 text-[15px] text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-gray-500 focus-visible:ring-gray-500"
          />
        </div>
        <button type="submit" disabled={state === 'loading'} className="btn-primary-pill sm:!px-8">
          {state === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Checking…
            </>
          ) : (
            config.ctaLabel
          )}
        </button>
      </form>

      {state === 'error' ? (
        <div className="rounded-2xl border-2 border-gray-200 bg-gray-100 p-4 text-sm font-medium text-gray-800" role="alert">
          {error}
        </div>
      ) : null}

      {state === 'done' && data !== null ? (
        <div className="flex flex-col gap-4" aria-live="polite">
          {config.render(data)}
        </div>
      ) : null}
    </div>
  );
}

export function defaultBuildUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProtocol);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return u.toString();
  } catch {
    return '';
  }
}

/** Shared status pill used inside URL reports. */
export function StatusPill({ ok, children, className }: { ok: boolean | null; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
        ok === true ? 'bg-gray-100 text-gray-800' : ok === false ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {children}
    </span>
  );
}
