'use client';

// Admin panels: Overview (dashboard) + Leads inbox + newsletter subscribers.
// Consumes /api/admin/leads and /api/admin/posts with the HttpOnly session
// cookie. Extracted from views/admin-view.tsx to keep the shell readable.

import * as React from 'react';
import {
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Users,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@/components/common/link';
import { navigate } from '@/lib/router';
import { useVisualEditor } from '@/lib/visual-editor';

/** Same contract as the adminFetch helper in views/admin-view.tsx. */
async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('d3_admin_token') ?? '' : '';
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | ({ ok?: boolean; error?: string } & T)
    | null;
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error ?? 'Request failed.');
  }
  return payload;
}

interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  estimate: string | null;
  quoteConfig: string | null;
  source: string;
  read: boolean;
  createdAt: string;
}

/** Human-readable labels for the serialized QuoteBuilder configuration. */
const QUOTE_CONFIG_LABELS: Record<string, string> = {
  service: 'Service',
  type: 'Project type',
  scope: 'Scope',
  addons: 'Add-ons',
  timeline: 'Timeline',
  estimateLow: 'Estimate (low)',
  estimateHigh: 'Estimate (high)',
  billing: 'Billing',
};

function QuoteConfigDetails({ json }: { json: string | null }) {
  if (!json) return null;
  let parsed: Record<string, unknown> | null = null;
  try {
    const value: unknown = JSON.parse(json);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      parsed = value as Record<string, unknown>;
    }
  } catch {
    parsed = null;
  }
  if (!parsed) return null;

  const rows = Object.entries(parsed).filter(([, value]) => value !== undefined && value !== '');
  if (rows.length === 0) return null;

  return (
    <details className="mt-3 rounded-xl border bg-muted/40 px-3 py-2">
      <summary className="cursor-pointer text-xs font-semibold text-muted-foreground transition-colors hover:text-gray-800">
        Quote configuration ({rows.length} fields)
      </summary>
      <dl className="mt-2 flex flex-col gap-1.5 text-sm">
        {rows.map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {QUOTE_CONFIG_LABELS[key] ?? key}
            </dt>
            <dd className="min-w-0 text-right font-medium">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

interface AdminSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface LeadsPayload {
  leads: AdminLead[];
  subscribers: AdminSubscriber[];
}

/* ─────────────────────────── Overview ─────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Inbox;
  label: string;
  value: number | null;
  loading: boolean;
}) {
  return (
    <div className="card-surface flex items-center gap-4 rounded-2xl p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-500 text-white">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {loading || value === null ? (
          <Loader2 className="mt-1 size-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <p className="font-display text-2xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );
}

export function OverviewPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = React.useState<LeadsPayload | null>(null);
  const [postCount, setPostCount] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [leads, posts] = await Promise.all([
          adminFetch<LeadsPayload>('/api/admin/leads'),
          adminFetch<{ posts: { id: string; published: boolean }[] }>('/api/admin/posts'),
        ]);
        if (cancelled) return;
        setData(leads);
        setPostCount(posts.posts.filter((p) => p.published).length);
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  const unread = data ? data.leads.filter((lead) => !lead.read).length : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Everything on the site at a glance — real numbers from your database.
        </p>
      </div>

      {failed ? (
        <div className="card-surface rounded-2xl p-5 text-sm text-destructive">
          Could not load the dashboard data. Refresh and try again.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Inbox} label="Unread leads" value={unread} loading={!data} />
          <StatCard
            icon={Mail}
            label="Total leads"
            value={data ? data.leads.length : null}
            loading={!data}
          />
          <StatCard
            icon={Users}
            label="Subscribers"
            value={data ? data.subscribers.length : null}
            loading={!data}
          />
          <StatCard icon={FileText} label="Published posts" value={postCount} loading={postCount === null} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface rounded-2xl p-5">
          <h3 className="text-base font-semibold">Quick actions</h3>
          <div className="mt-4 flex flex-col gap-2.5">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                useVisualEditor.getState().setEnabled(true);
                navigate('/');
              }}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit the homepage visually
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/admin?tab=leads')}>
              <Inbox className="size-4" aria-hidden="true" />
              Open the leads inbox
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/">
                <ExternalLink className="size-4" aria-hidden="true" />
                View the live site
              </Link>
            </Button>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <h3 className="text-base font-semibold">Going live checklist</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <li>
              1. Set a strong <code className="rounded bg-muted px-1 py-0.5 text-xs">ADMIN_PASSCODE</code>{' '}
              in <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> and keep it private.
            </li>
            <li>2. Replace the default stats and intro copy with your real numbers (Site Content tab or the visual editor).</li>
            <li>3. Save real contact details — phone, WhatsApp, address and socials stay hidden until you do.</li>
            <li>
              4. Deploy for free with the step-by-step guide in{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">DEPLOYMENT-GUIDE.md</code>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Leads inbox ─────────────────────────── */

export function LeadsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [data, setData] = React.useState<LeadsPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; type: 'lead' | 'subscriber'; label: string } | null>(null);

  const load = React.useCallback(async () => {
    try {
      const payload = await adminFetch<LeadsPayload>('/api/admin/leads');
      setData(payload);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({
        title: 'Could not load leads',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [onUnauthorized, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const toggleRead = async (lead: AdminLead) => {
    try {
      await adminFetch('/api/admin/leads', {
        method: 'PATCH',
        body: JSON.stringify({ id: lead.id, read: !lead.read }),
      });
      setData((current) =>
        current
          ? {
              ...current,
              leads: current.leads.map((l) => (l.id === lead.id ? { ...l, read: !l.read } : l)),
            }
          : current
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    setDeleteTarget(null);
    try {
      await adminFetch(`/api/admin/leads?id=${encodeURIComponent(id)}&type=${type}`, {
        method: 'DELETE',
      });
      await load();
      toast({ title: type === 'lead' ? 'Lead deleted' : 'Subscriber removed' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Leads inbox</h2>
        <p className="text-sm text-muted-foreground">
          Every project inquiry from the contact, service, and pricing forms. Newest first.
        </p>
      </div>

      {data.leads.length === 0 ? (
        <div className="card-surface rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No leads yet. Submissions from the site forms will appear here instantly.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.leads.map((lead) => (
            <article
              key={lead.id}
              className={`card-surface rounded-2xl p-5 ${lead.read ? '' : 'border-l-4 border-l-gray-800'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{lead.name}</h3>
                    {!lead.read ? (
                      <Badge className="bg-gray-800 text-white hover:bg-gray-800">New</Badge>
                    ) : null}
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {lead.source}
                    </Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-gray-800">
                      <Mail className="size-3.5" aria-hidden="true" />
                      {lead.email}
                    </a>
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone.replace(/[^+\d]/g, '')}`}
                        className="inline-flex items-center gap-1.5 hover:text-gray-800"
                      >
                        <Phone className="size-3.5" aria-hidden="true" />
                        {lead.phone}
                      </a>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(lead.createdAt), 'MMM d, yyyy · h:mm a')}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => toggleRead(lead)}
                    aria-label={lead.read ? 'Mark as unread' : 'Mark as read'}
                    title={lead.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {lead.read ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() =>
                      setDeleteTarget({ id: lead.id, type: 'lead', label: `the lead from ${lead.name}` })
                    }
                    aria-label="Delete lead"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {lead.service ? (
                  <Badge variant="secondary" className="font-normal">
                    Service: {lead.service}
                  </Badge>
                ) : null}
                {lead.estimate ? (
                  <Badge className="bg-gray-800 font-normal text-white hover:bg-gray-800">
                    Estimate: {lead.estimate}
                  </Badge>
                ) : null}
                {lead.budget ? (
                  <Badge variant="secondary" className="font-normal">
                    Budget: {lead.budget}
                  </Badge>
                ) : null}
                {lead.timeline ? (
                  <Badge variant="secondary" className="font-normal">
                    Timeline: {lead.timeline}
                  </Badge>
                ) : null}
              </div>

              <QuoteConfigDetails json={lead.quoteConfig} />

              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/60 p-3 text-sm leading-relaxed">
                {lead.message}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Newsletter subscribers */}
      <div>
        <h2 className="text-lg font-semibold">Newsletter subscribers</h2>
        <p className="text-sm text-muted-foreground">From the footer signup form.</p>
      </div>
      {data.subscribers.length === 0 ? (
        <div className="card-surface rounded-2xl p-6 text-center text-sm text-muted-foreground">
          No subscribers yet.
        </div>
      ) : (
        <div className="card-surface max-h-96 overflow-y-auto rounded-2xl p-2">
          <ul className="flex flex-col">
            {data.subscribers.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/60"
              >
                <span className="min-w-0 truncate text-sm font-medium">{subscriber.email}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(subscriber.createdAt), 'MMM d, yyyy')}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() =>
                      setDeleteTarget({
                        id: subscriber.id,
                        type: 'subscriber',
                        label: subscriber.email,
                      })
                    }
                    aria-label={`Remove ${subscriber.email}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it from the database. There is no undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PORTFOLIOS — CRUD for the /portfolio page items (DB-backed).
// ─────────────────────────────────────────────────────────────

interface AdminPortfolio {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  imageUrl: string | null;
  order: number;
  published: boolean;
}

const EMPTY_PORTFOLIO = {
  title: '',
  url: '',
  description: '',
  category: 'Website',
  imageUrl: '',
  order: '0',
  published: true,
};

/** Inline image upload → compressed data URL (keeps payloads small). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });
}

export function PortfoliosPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<AdminPortfolio[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({ ...EMPTY_PORTFOLIO });
  const [deleteTarget, setDeleteTarget] = React.useState<AdminPortfolio | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = await adminFetch<{ portfolios: AdminPortfolio[] }>('/api/admin/portfolios');
      setItems(payload.portfolios);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
        onUnauthorized();
        return;
      }
      toast({
        title: 'Could not load portfolio items',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (item: AdminPortfolio) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      url: item.url,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl ?? '',
      order: String(item.order),
      published: item.published,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setDraft({ ...EMPTY_PORTFOLIO });
  };

  const save = async () => {
    if (saving) return;
    if (!draft.title.trim() || !draft.url.trim() || !draft.description.trim()) {
      toast({
        title: 'Missing details',
        description: 'Title, website URL and description are required.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        title: draft.title,
        url: draft.url,
        description: draft.description,
        category: draft.category,
        imageUrl: draft.imageUrl,
        order: Number(draft.order) || 0,
        published: draft.published,
      };
      await adminFetch('/api/admin/portfolios', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      toast({
        title: editingId ? 'Portfolio item updated' : 'Portfolio item added',
        description: 'It is now live on the /portfolio page.',
      });
      resetForm();
      await load();
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
        onUnauthorized();
        return;
      }
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AdminPortfolio) => {
    try {
      await adminFetch(`/api/admin/portfolios?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      toast({ title: 'Portfolio item deleted' });
      if (editingId === item.id) resetForm();
      await load();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1_100_000) {
      toast({
        title: 'Image too large',
        description: 'Please use an image under ~1 MB (WebP/JPEG screenshots work best).',
        variant: 'destructive',
      });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft((current) => ({ ...current, imageUrl: dataUrl }));
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try another file.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Portfolio</h2>
        <p className="text-sm text-muted-foreground">
          Items shown on /portfolio. Add real client sites with a screenshot, reorder with the
          Order field, and unpublish anything you want to hide.
        </p>
      </div>

      {/* Editor / create form */}
      <div className="card-surface rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {editingId ? 'Edit portfolio item' : 'Add a portfolio item'}
          </h3>
          {editingId ? (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-title">Title *</Label>
            <Input
              id="pf-title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Kamylla Cleaning — Booking site"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-url">Website URL *</Label>
            <Input
              id="pf-url"
              type="url"
              value={draft.url}
              onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="pf-desc">Description *</Label>
            <Textarea
              id="pf-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="One or two sentences about the project and the result."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-category">Category</Label>
            <Input
              id="pf-category"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              placeholder="Website"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-order">Order</Label>
            <Input
              id="pf-order"
              type="number"
              value={draft.order}
              onChange={(e) => setDraft((d) => ({ ...d, order: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-image">Screenshot</Label>
            <Input
              id="pf-image"
              type="file"
              accept="image/*"
              onChange={(e) => void onPickImage(e.target.files?.[0])}
            />
            <Input
              value={draft.imageUrl.startsWith('data:') ? '' : draft.imageUrl}
              onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
              placeholder="…or paste an image URL"
            />
          </div>
          <div className="flex items-end gap-3">
            {draft.imageUrl ? (
               
              <img
                src={draft.imageUrl}
                alt="Portfolio screenshot preview"
                className="h-14 w-24 rounded-lg border object-cover"
              />
            ) : null}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
                className="size-4"
              />
              Published
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={saving} className="h-10">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {editingId ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card-surface rounded-2xl p-6 text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card-surface rounded-2xl p-6 text-sm text-muted-foreground">
          No portfolio items yet — add your first one above.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-surface flex items-center gap-4 rounded-2xl p-3"
            >
              {item.imageUrl ? (
                 
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-14 w-24 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <div className="h-14 w-24 shrink-0 rounded-lg border bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  {!item.published ? <Badge variant="secondary">Hidden</Badge> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.category} · order {item.order} · {item.url}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(item)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this portfolio item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be removed from the public portfolio page. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) void remove(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
