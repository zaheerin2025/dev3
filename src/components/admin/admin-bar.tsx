'use client';

import * as React from 'react';
import {
  Check,
  Loader2,
  Pencil,
  RotateCcw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { navigate, useRouterStore } from '@/lib/router';
import { useSiteSettings } from '@/lib/use-site-settings';
import { useVisualEditor, syncVeActiveAttribute } from '@/lib/visual-editor';
import {
  effectiveValue,
  groupedFields,
  type ContentField,
} from '@/lib/content-schema';
import { cn } from '@/lib/utils';

/** JS-readable hint cookie set at login — see /api/admin/auth. */
const HINT_COOKIE = 'd3_admin_hint';

function hasHintCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${HINT_COOKIE}=`);
}

function clearHintCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${HINT_COOKIE}=; Max-Age=0; path=/; sameSite=strict`;
}

/**
 * Floating admin bar — appears on every public page once an admin session
 * exists. Toggle the visual editor, jump to the admin panel, or sign out.
 * The Elementor-style editor panel renders next to it while editing.
 */
export function AdminBar() {
  const { toast } = useToast();
  const path = useRouterStore((s) => s.path);
  const [authed, setAuthed] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const enabled = useVisualEditor((s) => s.enabled);

  // Only visitors carrying the login hint cookie bother the session check.
  const checkSession = React.useCallback(async () => {
    if (!hasHintCookie()) {
      setAuthed(false);
      setChecking(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/auth');
      const payload = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (payload?.ok) {
        setAuthed(true);
      } else {
        setAuthed(false);
        clearHintCookie();
      }
    } catch {
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  }, []);

  React.useEffect(() => {
    void checkSession();
  }, [checkSession, path]);

  // Reflect editor state on <html> for the CSS outlines.
  React.useEffect(() => {
    syncVeActiveAttribute(enabled);
    return () => syncVeActiveAttribute(false);
  }, [enabled]);

  const signOut = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      /* clear local state regardless */
    }
    if (enabled) useVisualEditor.getState().setEnabled(false);
    clearHintCookie();
    setAuthed(false);
    toast({ title: 'Signed out', description: 'The admin session was cleared.' });
  };

  if (checking || !authed || path === '/admin') return null;

  return (
    <>
      <div
        className="fixed bottom-4 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#0a0a0a] py-1.5 pr-1.5 pl-2 text-white shadow-[0_12px_40px_-8px_rgb(10_10_10/0.55)] ring-1 ring-white/15"
        role="toolbar"
        aria-label="Admin toolbar"
      >
        <span className="mr-1 hidden items-center gap-1.5 pl-1 text-xs font-semibold tracking-wide text-gray-300 sm:flex">
          <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
          Admin
        </span>
        <button
          type="button"
          onClick={() => useVisualEditor.getState().toggle()}
          className={cn(
            'flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors',
            enabled
              ? 'bg-purple-600 text-white hover:bg-purple-500'
              : 'text-gray-200 hover:bg-white/10 hover:text-white'
          )}
          aria-pressed={enabled}
        >
          <Pencil className="size-4" aria-hidden="true" />
          {enabled ? 'Editing content' : 'Visual editor'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
          className="flex size-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      {enabled ? <EditorPanel onUnauthorized={() => setAuthed(false)} /> : null}
    </>
  );
}

/* ─────────────────────────── Editor panel ─────────────────────────── */

const PAGE_BY_PATH: Record<string, string> = {
  '/': 'home',
  '/about': 'about',
  '/contact': 'contact',
};

function EditorPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { toast } = useToast();
  const path = useRouterStore((s) => s.path);
  const settings = useSiteSettings((s) => s.settings);
  const dirty = useVisualEditor((s) => s.dirty);
  const selectedKey = useVisualEditor((s) => s.selectedKey);
  const [saving, setSaving] = React.useState(false);
  const dirtyCount = Object.keys(dirty).length;

  const page = PAGE_BY_PATH[path] ?? 'home';
  const groups = React.useMemo(() => sortGroupsForPage(groupedFields(), page), [page]);

  // Bring the clicked block's field into view + focus it.
  React.useEffect(() => {
    if (!selectedKey) return;
    const node = document.getElementById(`ve-field-${selectedKey}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = node.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
      window.setTimeout(() => input?.focus(), 250);
    }
  }, [selectedKey]);

  const save = async () => {
    if (saving || dirtyCount === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: Object.entries(dirty).map(([key, value]) => ({ key, value })),
        }),
      });
      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.status === 401) {
        onUnauthorized();
        throw new Error('Session expired — sign in again from the dashboard.');
      }
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error ?? 'Save failed.');
      }
      await useSiteSettings.getState().reload();
      useVisualEditor.getState().clearDirty();
      toast({
        title: 'Content saved — live on site',
        description: 'Your changes are already visible to every visitor.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="fixed top-0 right-0 z-[70] flex h-full w-[400px] max-w-[94vw] flex-col border-l-2 border-gray-200 bg-white shadow-[-24px_0_60px_-30px_rgb(10_10_10/0.35)]"
      aria-label="Visual content editor"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#0a0a0a]">Edit content</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            Click any outlined block on the page, or edit right here.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => useVisualEditor.getState().setEnabled(false)}
          aria-label="Close editor"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-3">
          {groups.map(({ group, fields }) => {
            const activeInGroup = fields.some((f) => f.key === selectedKey);
            return (
              <details
                key={group}
                open={activeInGroup || groupIsActive(group, page)}
                className="rounded-xl border border-gray-200 bg-gray-50/60 open:bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0a0a0a] select-none">
                  {group}
                  <span className="text-xs font-normal text-gray-400">
                    {fields.length} field{fields.length === 1 ? '' : 's'}
                  </span>
                </summary>
                <div className="flex flex-col gap-4 px-3.5 pt-1 pb-4">
                  {fields.map((field) => (
                    <FieldEditor key={field.key} field={field} onUnauthorized={onUnauthorized} />
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-3.5">
        <p className="text-xs text-gray-500">
          {dirtyCount === 0 ? (
            'No unsaved changes.'
          ) : (
            <>
              <span className="font-semibold text-purple-700">{dirtyCount}</span> unsaved change
              {dirtyCount === 1 ? '' : 's'}.
            </>
          )}
        </p>
        <Button onClick={save} disabled={saving || dirtyCount === 0} className="h-9">
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          Save changes
        </Button>
      </div>
    </aside>
  );
}

function groupIsActive(group: string, page: string): boolean {
  const map: Record<string, string[]> = {
    home: ['Hero', 'Stats band', 'Closing CTA'],
    about: ['About page'],
    contact: ['Contact details'],
    footer: ['Footer'],
  };
  return map[page]?.includes(group) ?? false;
}

function sortGroupsForPage(
  groups: { group: string; fields: ContentField[] }[],
  page: string
): { group: string; fields: ContentField[] }[] {
  return [...groups].sort((a, b) => {
    const aActive = groupIsActive(a.group, page) ? 0 : 1;
    const bActive = groupIsActive(b.group, page) ? 0 : 1;
    return aActive - bActive;
  });
}

/** One editable field inside the panel. */
function FieldEditor({ field }: { field: ContentField; onUnauthorized: () => void }) {
  const settings = useSiteSettings((s) => s.settings);
  const dirty = useVisualEditor((s) => s.dirty);
  const selectedKey = useVisualEditor((s) => s.selectedKey);
  const setDraft = useVisualEditor((s) => s.setDraft);

  const saved = settings[field.key];
  const value = dirty[field.key] ?? (typeof saved === 'string' ? saved : '');
  const isOverridden = typeof saved === 'string' && saved.length > 0;
  const selected = selectedKey === field.key;
  const live = effectiveValue(settings, field.key);

  return (
    <div
      id={`ve-field-${field.key}`}
      className={cn(
        'flex flex-col gap-1.5 rounded-lg border p-3 transition-colors',
        selected ? 'border-purple-400 bg-purple-50/50 ring-2 ring-purple-200' : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`ve-input-${field.key}`} className="text-xs font-semibold">
          {field.label}
        </Label>
        {isOverridden ? (
          <button
            type="button"
            onClick={() => setDraft(field.key, '')}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 transition-colors hover:text-gray-700"
            title="Clear the override and fall back to the default text"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Reset
          </button>
        ) : null}
      </div>
      {field.type === 'textarea' ? (
        <Textarea
          id={`ve-input-${field.key}`}
          rows={3}
          value={value}
          onChange={(event) => setDraft(field.key, event.target.value)}
          placeholder={field.defaultValue}
        />
      ) : (
        <Input
          id={`ve-input-${field.key}`}
          value={value}
          onChange={(event) => setDraft(field.key, event.target.value)}
          placeholder={field.defaultValue}
        />
      )}
      {field.hint ? <p className="text-[11px] leading-snug text-gray-400">{field.hint}</p> : null}
      {!field.hint && !isOverridden ? (
        <p className="text-[11px] leading-snug text-gray-400">
          Showing default: “{truncate(live, 64)}”
        </p>
      ) : null}
    </div>
  );
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
