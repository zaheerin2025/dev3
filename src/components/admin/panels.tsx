'use client';

// ─────────────────────────────────────────────────────────────
// Admin panels: Overview (dashboard) + Leads inbox + Portfolio + Subscribers.
// Clean light styling for the administrative dashboard.
// ─────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Globe,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Check,
  Users,
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
  if (response.status === 401 || payload?.error === 'Unauthorized.') {
    const err = new Error('Unauthorized.');
    (err as unknown as { status?: number }).status = 401;
    throw err;
  }
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
    <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <summary className="cursor-pointer text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900">
        Quote configuration ({rows.length} fields)
      </summary>
      <dl className="mt-2 flex flex-col gap-1.5 text-sm">
        {rows.map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
              {QUOTE_CONFIG_LABELS[key] ?? key}
            </dt>
            <dd className="min-w-0 text-right font-medium text-slate-800">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

interface LeadsPayload {
  leads: AdminLead[];
}

/* ─────────────────────────────────────────────────────────────
   OVERVIEW / DASHBOARD
   ───────────────────────────────────────────────────────────── */

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
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {loading || value === null ? (
          <Loader2 className="mt-1 size-4 animate-spin text-slate-400" aria-hidden="true" />
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        )}
      </div>
    </div>
  );
}

export function OverviewPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = React.useState<LeadsPayload | null>(null);
  const [postCount, setPostCount] = React.useState<number | null>(null);
  const [portfolioCount, setPortfolioCount] = React.useState<number | null>(null);
  const [subscriberCount, setSubscriberCount] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [leads, posts, portfolios, subscribers] = await Promise.all([
          adminFetch<LeadsPayload>('/api/admin/leads').catch(() => ({ leads: [] })),
          adminFetch<{ posts: { id: string; published: boolean }[] }>('/api/admin/posts').catch(() => ({ posts: [] })),
          adminFetch<{ portfolios: { id: string }[] }>('/api/admin/portfolios').catch(() => ({ portfolios: [] })),
          adminFetch<{ subscribers: { id: string }[] }>('/api/admin/subscribers').catch(() => ({ subscribers: [] })),
        ]);
        if (cancelled) return;
        setData(leads);
        setPostCount(posts.posts.filter((p) => p.published).length);
        setPortfolioCount(portfolios.portfolios.length);
        setSubscriberCount(subscribers.subscribers.length);
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [onUnauthorized]);

  const unread = data ? data.leads.filter((lead) => !lead.read).length : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Summary metrics pulled directly from database.
        </p>
      </div>

      {failed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
          Could not load dashboard data. Please refresh.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Inbox} label="Unread Leads" value={unread} loading={!data} />
          <StatCard icon={Mail} label="Total Leads" value={data ? data.leads.length : null} loading={!data} />
          <StatCard icon={FileText} label="Published Posts" value={postCount} loading={postCount === null} />
          <StatCard icon={Globe} label="Portfolio Items" value={portfolioCount} loading={portfolioCount === null} />
          <StatCard icon={Users} label="Subscribers" value={subscriberCount} loading={subscriberCount === null} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => {
                useVisualEditor.getState().setEnabled(true);
                navigate('/');
              }}
            >
              <Pencil className="size-4 mr-2" aria-hidden="true" />
              Edit website visually
            </Button>
            <Button
              variant="outline"
              className="justify-start border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => navigate('/admin?tab=leads')}
            >
              <Inbox className="size-4 mr-2" aria-hidden="true" />
              Open leads inbox
            </Button>
            <Button
              variant="outline"
              className="justify-start border-slate-300 text-slate-700 hover:bg-slate-50"
              asChild
            >
              <Link href="/">
                <ExternalLink className="size-4 mr-2" aria-hidden="true" />
                View live site
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Site Status Checklist</h3>
          <ul className="mt-4 flex flex-col gap-2 text-xs text-slate-600">
            <li>1. Set a secure <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-800">ADMIN_PASSCODE</code> in <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-800">.env</code>.</li>
            <li>2. Replace stats and intro copy with real company metrics.</li>
            <li>3. Configure business email, phone, and WhatsApp numbers in Site Content tab.</li>
            <li>4. Test all forms locally before pushing live.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEADS INBOX
   ───────────────────────────────────────────────────────────── */

export function LeadsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [data, setData] = React.useState<LeadsPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; type: 'lead'; label: string } | null>(null);

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
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      await adminFetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      await load();
      toast({ title: 'Lead deleted' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-slate-400" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Leads Inbox</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Inquiries submitted via contact and service forms.
        </p>
      </div>

      {data.leads.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No leads received yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.leads.map((lead) => (
            <article
              key={lead.id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition-colors ${
                lead.read ? 'border-slate-200' : 'border-l-4 border-l-[#FF4D00] border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                    {!lead.read ? (
                      <Badge className="bg-[#FF4D00] text-white">New</Badge>
                    ) : null}
                    <Badge variant="outline" className="border-slate-200 font-mono text-[10px] text-slate-500">
                      {lead.source}
                    </Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-slate-900">
                      <Mail className="size-3.5" aria-hidden="true" />
                      {lead.email}
                    </a>
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone.replace(/[^+\d]/g, '')}`}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        <Phone className="size-3.5" aria-hidden="true" />
                        {lead.phone}
                      </a>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {format(new Date(lead.createdAt), 'MMM d, yyyy · h:mm a')}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-slate-500 hover:text-slate-900"
                    onClick={() => toggleRead(lead)}
                    aria-label={lead.read ? 'Mark unread' : 'Mark read'}
                    title={lead.read ? 'Mark unread' : 'Mark read'}
                  >
                    {lead.read ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-red-600 hover:bg-red-50"
                    onClick={() =>
                      setDeleteTarget({ id: lead.id, type: 'lead', label: `the lead from ${lead.name}` })
                    }
                    aria-label="Delete lead"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {lead.service ? (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                    Service: {lead.service}
                  </Badge>
                ) : null}
                {lead.estimate ? (
                  <Badge className="bg-[#FF4D00]/10 text-[#FF4D00] hover:bg-[#FF4D00]/10 font-normal">
                    Estimate: {lead.estimate}
                  </Badge>
                ) : null}
                {lead.budget ? (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                    Budget: {lead.budget}
                  </Badge>
                ) : null}
                {lead.timeline ? (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                    Timeline: {lead.timeline}
                  </Badge>
                ) : null}
              </div>

              <QuoteConfigDetails json={lead.quoteConfig} />

              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200">
                {lead.message}
              </p>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it from the database.
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

/* ─────────────────────────────────────────────────────────────
   PORTFOLIO PANEL
   ───────────────────────────────────────────────────────────── */

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read file.'));
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
        title: 'Could not load portfolios',
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
        description: 'Title, URL and description are required.',
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
        title: editingId ? 'Portfolio updated' : 'Portfolio added',
        description: 'Changes are live on /portfolio.',
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
      toast({ title: 'Portfolio deleted' });
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
        description: 'Max ~1 MB allowed.',
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
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Portfolio Items</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Projects displayed on the public /portfolio page.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {editingId ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </h3>
          {editingId ? (
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs text-slate-500">
              Cancel edit
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-title" className="text-xs text-slate-600">Title *</Label>
            <Input
              id="pf-title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Client Project Title"
              className="border-slate-300 bg-white text-slate-900 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-url" className="text-xs text-slate-600">URL *</Label>
            <Input
              id="pf-url"
              type="url"
              value={draft.url}
              onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
              placeholder="https://example.com"
              className="border-slate-300 bg-white text-slate-900 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="pf-desc" className="text-xs text-slate-600">Description *</Label>
            <Textarea
              id="pf-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Project summary..."
              className="border-slate-300 bg-white text-slate-900 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-category" className="text-xs text-slate-600">Category</Label>
            <Input
              id="pf-category"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              placeholder="Website"
              className="border-slate-300 bg-white text-slate-900 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-order" className="text-xs text-slate-600">Order</Label>
            <Input
              id="pf-order"
              type="number"
              value={draft.order}
              onChange={(e) => setDraft((d) => ({ ...d, order: e.target.value }))}
              className="border-slate-300 bg-white text-slate-900 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-image" className="text-xs text-slate-600">Screenshot</Label>
            <Input
              id="pf-image"
              type="file"
              accept="image/*"
              onChange={(e) => void onPickImage(e.target.files?.[0])}
              className="border-slate-300 bg-white text-xs"
            />
            <Input
              value={draft.imageUrl.startsWith('data:') ? '' : draft.imageUrl}
              onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
              placeholder="...or paste image URL"
              className="border-slate-300 bg-white text-xs mt-1 text-slate-900"
            />
          </div>
          <div className="flex items-end gap-3">
            {draft.imageUrl ? (
              <img
                src={draft.imageUrl}
                alt="Preview"
                className="h-14 w-24 rounded border border-slate-200 object-cover"
              />
            ) : null}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
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
          <Button onClick={save} disabled={saving} className="h-9 gap-1 bg-[#FF4D00] text-white hover:bg-[#e04400]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editingId ? 'Save Item' : 'Add Item'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Loading portfolio items...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No portfolio items created yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-12 w-20 shrink-0 rounded border border-slate-200 object-cover" />
              ) : (
                <div className="h-12 w-20 shrink-0 rounded border border-slate-200 bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="truncate text-xs text-slate-500">{item.category} · order {item.order} · {item.url}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button variant="outline" size="sm" onClick={() => startEdit(item)} className="h-8 border-slate-300 text-xs">
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteTarget(item)} className="h-8 border-slate-300 text-xs text-red-600 hover:bg-red-50">
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
            <AlertDialogTitle>Delete portfolio item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be removed from the portfolio page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) void remove(deleteTarget); setDeleteTarget(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUBSCRIBERS PANEL
   ───────────────────────────────────────────────────────────── */

interface AdminSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export function SubscribersPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = React.useState<AdminSubscriber[] | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminSubscriber | null>(null);

  const load = React.useCallback(async () => {
    try {
      const payload = await adminFetch<{ subscribers: AdminSubscriber[] }>('/api/admin/subscribers');
      setSubscribers(payload.subscribers);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({
        title: 'Could not load subscribers',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [onUnauthorized, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminFetch(`/api/admin/subscribers?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      toast({ title: 'Subscriber removed' });
      setDeleteTarget(null);
      await load();
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({ title: 'Delete failed', variant: 'destructive' });
      setDeleteTarget(null);
    }
  };

  if (!subscribers) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-slate-400" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Newsletter Subscribers</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Emails captured from website footer and blog forms.
        </p>
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No newsletter subscribers recorded.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {subscribers.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{sub.email}</p>
                  <p className="text-[11px] text-slate-400">
                    Subscribed {format(new Date(sub.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-300 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(sub)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.email}&rdquo; will be deleted from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
