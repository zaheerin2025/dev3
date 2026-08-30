'use client';

// ─────────────────────────────────────────────────────────────
// Developers3 admin panel (/#/admin).
// Passcode login → Posts | Pricing | Site Content tabs.
// Auth token: localStorage 'd3_admin_token' (value of ADMIN_PASSCODE env on
// the server, default 'developers3-admin' — see src/lib/admin-auth.ts).
// ─────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  ExternalLink,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsPanel, OverviewPanel, PortfoliosPanel } from '@/components/admin/panels';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@/components/common/link';
import { blogPosts, servicePricingBlocks, websiteTiers } from '@/data';
import { site } from '@/lib/site';
import type { PricingBlock, PricingTier } from '@/lib/types';
import type { DbPost } from '@/lib/blog-db';
import { useSiteSettings } from '@/lib/use-site-settings';
import { cn } from '@/lib/utils';

const TOKEN_KEY = 'd3_admin_token';

const POST_CATEGORIES = Array.from(new Set(blogPosts.map((post) => post.category)));

/** URL-safe slug: lowercase, alphanumerics and single dashes. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Authorized fetch helper — throws on non-OK, parses `{ ok, … }` JSON. */
async function adminFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
  });
  const payload = (await response.json().catch(() => null)) as
    | ({ ok?: boolean; error?: string } & T)
    | null;
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error ?? 'Request failed.');
  }
  return payload;
}

interface PostDraft {
  id?: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  readTime: number;
  published: boolean;
}

const EMPTY_DRAFT: PostDraft = {
  slug: '',
  title: '',
  category: POST_CATEGORIES[0] ?? 'General',
  image: '',
  excerpt: '',
  content: '',
  readTime: 5,
  published: true,
};

/* ─────────────────────────── Login gate ─────────────────────────── */

function AdminLogin({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const { toast } = useToast();
  const [passcode, setPasscode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passcode.trim() || loading) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        token?: string;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok || !payload.token) {
        throw new Error(payload?.error ?? 'Invalid passcode.');
      }
      localStorage.setItem(TOKEN_KEY, payload.token);
      onAuthenticated(payload.token);
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="card-surface w-full max-w-sm rounded-3xl p-8 shadow-[0_24px_48px_-24px_rgb(4_16_11/0.25)]">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <img src="/logo.svg" alt="Developers3 logo" className="h-10 w-10" />
          <h1 className="mt-2 text-xl font-bold tracking-tight">Admin panel</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage posts, pricing, and site content.
          </p>
        </div>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-passcode">Passcode</Label>
            <Input
              id="admin-passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="Enter the admin passcode"
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────── Posts tab ─────────────────────────── */

function PostsTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<DbPost[] | null>(null);
  const [draft, setDraft] = React.useState<PostDraft | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DbPost | null>(null);

  const loadPosts = React.useCallback(async () => {
    try {
      const payload = await adminFetch<{ posts: DbPost[] }>('/api/admin/posts', token);
      setPosts(payload.posts);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({
        title: 'Could not load posts',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [token, onUnauthorized, toast]);

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const openNew = () => {
    setSlugTouched(false);
    setDraft({ ...EMPTY_DRAFT });
  };

  const openEdit = (post: DbPost) => {
    setSlugTouched(true); // existing post — keep its slug unless manually changed
    setDraft({
      id: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category,
      image: post.image ?? '',
      excerpt: post.excerpt,
      content: post.content,
      readTime: post.readTime,
      published: post.published,
    });
  };

  const updateDraft = (patch: Partial<PostDraft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));

  const updateTitle = (title: string) =>
    setDraft((current) =>
      current
        ? { ...current, title, slug: slugTouched ? current.slug : slugify(title) }
        : current
    );

  const save = async () => {
    if (!draft || saving) return;
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title, excerpt and content are required.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({
        id: draft.id,
        slug: draft.slug.trim() || slugify(draft.title),
        title: draft.title.trim(),
        category: draft.category,
        image: draft.image.trim(),
        excerpt: draft.excerpt.trim(),
        content: draft.content,
        readTime: draft.readTime,
        published: draft.published,
      });
      if (draft.id) {
        await adminFetch('/api/admin/posts', token, { method: 'PUT', body });
        toast({ title: 'Post updated', description: `“${draft.title.trim()}” is saved.` });
      } else {
        await adminFetch('/api/admin/posts', token, { method: 'POST', body });
        toast({ title: 'Post created', description: `“${draft.title.trim()}” is live.` });
      }
      setDraft(null);
      await loadPosts();
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminFetch(`/api/admin/posts?id=${encodeURIComponent(deleteTarget.id)}`, token, {
        method: 'DELETE',
      });
      toast({ title: 'Post deleted', description: `“${deleteTarget.title}” was removed.` });
      setDeleteTarget(null);
      await loadPosts();
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Blog posts</h2>
          <p className="text-sm text-muted-foreground">
            {posts ? `${posts.length} post${posts.length === 1 ? '' : 's'} in the database` : 'Loading…'}
          </p>
        </div>
        <Button onClick={openNew} className="h-10">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Button>
      </div>

      {/* Editor card */}
      {draft ? (
        <div className="card-surface rounded-2xl p-6 ring-1 ring-blue-600/15">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">
              {draft.id ? 'Edit post' : 'New post'}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={draft.title}
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="How much does a website cost?"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="post-slug">Slug</Label>
              <Input
                id="post-slug"
                value={draft.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateDraft({ slug: event.target.value });
                }}
                placeholder="auto-generated-from-title"
              />
              <p className="text-xs text-muted-foreground">
                Live at /blog/{draft.slug || '…'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="post-category">Category</Label>
              <Select
                value={draft.category}
                onValueChange={(value) => updateDraft({ category: value })}
              >
                <SelectTrigger id="post-category" className="w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {(POST_CATEGORIES.includes(draft.category)
                    ? POST_CATEGORIES
                    : [draft.category, ...POST_CATEGORIES]
                  ).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="post-image">Cover image URL</Label>
              <Input
                id="post-image"
                value={draft.image}
                onChange={(event) => updateDraft({ image: event.target.value })}
                placeholder="https://…/cover.png (optional)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              {draft.image.trim() ? (
                <img
                  src={draft.image}
                  alt="Cover preview"
                  className="h-14 w-24 rounded-lg object-cover ring-1 ring-blue-900/10"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = '';
                  }}
                />
              ) : (
                <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-dashed border-blue-900/15 text-[11px] text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea
                id="post-excerpt"
                rows={2}
                value={draft.excerpt}
                onChange={(event) => updateDraft({ excerpt: event.target.value })}
                placeholder="One or two sentences shown on cards and in search results."
                required
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="post-content">Content</Label>
              <Textarea
                id="post-content"
                rows={12}
                value={draft.content}
                onChange={(event) => updateDraft({ content: event.target.value })}
                className="font-mono text-sm"
                placeholder={"Intro paragraph.\n\n## Section heading\n\nMore text…"}
                required
              />
              <p className="text-xs text-muted-foreground">
                Blank line = new paragraph. Lines starting with &lsquo;## &rsquo; become section
                headings.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="post-readtime">Read time (minutes)</Label>
              <Input
                id="post-readtime"
                type="number"
                min={1}
                max={120}
                value={draft.readTime}
                onChange={(event) => updateDraft({ readTime: Number(event.target.value) || 5 })}
              />
            </div>
            <div className="flex items-end justify-end gap-3 sm:col-span-2">
              <div className="mr-auto flex items-center gap-2.5">
                <Switch
                  id="post-published"
                  checked={draft.published}
                  onCheckedChange={(checked) => updateDraft({ published: checked })}
                />
                <Label htmlFor="post-published" className="text-sm font-normal">
                  {draft.published ? 'Published' : 'Draft'}
                </Label>
              </div>
              <Button variant="outline" onClick={() => setDraft(null)} className="h-10">
                Cancel
              </Button>
              <Button onClick={save} disabled={saving} className="h-10">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                {draft.id ? 'Save changes' : 'Create post'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Post list */}
      <div className="card-surface max-h-[520px] overflow-y-auto rounded-2xl custom-scrollbar">
        {!posts ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No posts yet — create your first one with “New post”.
          </p>
        ) : (
          <ul className="divide-y divide-blue-900/5">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{post.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    /blog/{post.slug} · updated{' '}
                    {format(new Date(post.updatedAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-blue-600/15 bg-blue-50 text-blue-700"
                >
                  {post.category}
                </Badge>
                <Badge
                  className={cn(
                    post.published
                      ? 'border-transparent bg-green-100 text-green-700'
                      : 'border-transparent bg-muted text-muted-foreground'
                  )}
                >
                  {post.published ? 'Published' : 'Draft'}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-9" onClick={() => openEdit(post)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteTarget(post)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be permanently removed from the blog. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────────────────── Pricing tab ─────────────────────────── */

function PricingTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [tiers, setTiers] = React.useState<PricingTier[]>(websiteTiers);
  const [blocks, setBlocks] = React.useState<PricingBlock[]>(servicePricingBlocks);
  const [saving, setSaving] = React.useState(false);

  // Prefill from saved settings; fall back to the static data imports.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await adminFetch<{ settings: Record<string, string> }>(
          '/api/admin/settings',
          token
        );
        if (cancelled) return;
        const savedTiers = payload.settings['pricing.websiteTiers'];
        const savedBlocks = payload.settings['pricing.servicePricingBlocks'];
        if (savedTiers) {
          const parsed = JSON.parse(savedTiers) as PricingTier[];
          if (Array.isArray(parsed) && parsed.length > 0) setTiers(parsed);
        }
        if (savedBlocks) {
          const parsed = JSON.parse(savedBlocks) as PricingBlock[];
          if (Array.isArray(parsed) && parsed.length > 0) setBlocks(parsed);
        }
      } catch {
        // Static data stays in place when nothing is saved / fetch fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const updateTier = (index: number, patch: Partial<PricingTier>) =>
    setTiers((current) =>
      current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier))
    );

  const updateTierFeatures = (index: number, raw: string) =>
    updateTier(index, {
      features: raw.split('\n').filter((line) => line.trim() !== ''),
    });

  const updateBlock = (index: number, patch: Partial<PricingBlock>) =>
    setBlocks((current) =>
      current.map((block, i) => (i === index ? { ...block, ...patch } : block))
    );

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', token, {
        method: 'PUT',
        body: JSON.stringify({
          entries: [
            { key: 'pricing.websiteTiers', value: JSON.stringify(tiers) },
            { key: 'pricing.servicePricingBlocks', value: JSON.stringify(blocks) },
          ],
        }),
      });
      await useSiteSettings.getState().reload();
      toast({
        title: 'Pricing updated — live on site',
        description: 'The /pricing page now shows the saved tiers and service blocks.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Edit website tiers and service pricing blocks shown on /pricing.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="h-10">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Save pricing
        </Button>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <h3 className="text-base font-semibold">Website tiers</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <div key={`${tier.name}-${index}`} className="rounded-xl border border-blue-900/10 p-4">
              <div className="grid gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`tier-name-${index}`}>Name</Label>
                  <Input
                    id={`tier-name-${index}`}
                    value={tier.name}
                    onChange={(event) => updateTier(index, { name: event.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`tier-price-${index}`}>Price</Label>
                    <Input
                      id={`tier-price-${index}`}
                      value={tier.price}
                      onChange={(event) => updateTier(index, { price: event.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`tier-period-${index}`}>Period</Label>
                    <Input
                      id={`tier-period-${index}`}
                      value={tier.period}
                      onChange={(event) => updateTier(index, { period: event.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`tier-best-${index}`}>Best for</Label>
                  <Input
                    id={`tier-best-${index}`}
                    value={tier.bestFor}
                    onChange={(event) => updateTier(index, { bestFor: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`tier-blurb-${index}`}>Blurb</Label>
                  <Textarea
                    id={`tier-blurb-${index}`}
                    rows={2}
                    value={tier.blurb}
                    onChange={(event) => updateTier(index, { blurb: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`tier-features-${index}`}>Features (one per line)</Label>
                  <Textarea
                    id={`tier-features-${index}`}
                    rows={6}
                    value={tier.features.join('\n')}
                    onChange={(event) => updateTierFeatures(index, event.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <h3 className="text-base font-semibold">Service pricing blocks</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {blocks.map((block, index) => (
            <div key={`${block.serviceSlug}-${index}`} className="rounded-xl border border-blue-900/10 p-4">
              <div className="grid gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`block-name-${index}`}>Name</Label>
                  <Input
                    id={`block-name-${index}`}
                    value={block.name}
                    onChange={(event) => updateBlock(index, { name: event.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`block-start-${index}`}>Starting at</Label>
                    <Input
                      id={`block-start-${index}`}
                      value={block.startingAt}
                      onChange={(event) => updateBlock(index, { startingAt: event.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`block-unit-${index}`}>Unit</Label>
                    <Input
                      id={`block-unit-${index}`}
                      value={block.unit}
                      onChange={(event) => updateBlock(index, { unit: event.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`block-blurb-${index}`}>Blurb</Label>
                  <Textarea
                    id={`block-blurb-${index}`}
                    rows={2}
                    value={block.blurb}
                    onChange={(event) => updateBlock(index, { blurb: event.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Site content tab ─────────────────────── */

const SITE_CONTENT_FIELDS: { key: string; label: string; defaultValue: string; hint?: string }[] = [
  {
    key: 'hero.headline',
    label: 'Hero headline',
    defaultValue: 'Web, App & Software Development Company',
    hint: 'Shown as the home page H1 (overrides the default headline).',
  },
  {
    key: 'hero.subheadline',
    label: 'Hero subheadline',
    defaultValue:
      'We design, build, and grow custom websites, e-commerce stores, and digital products that turn visitors into customers — on time, on budget, with senior people on every project.',
  },
  { key: 'contact.email', label: 'Contact email', defaultValue: site.email },
  { key: 'contact.phoneDisplay', label: 'Phone (display)', defaultValue: site.phoneDisplay },
  {
    key: 'contact.whatsappNumber',
    label: 'WhatsApp number',
    defaultValue: site.whatsappNumber,
    hint: 'Digits only, with country code — e.g. 15550134567.',
  },
  { key: 'stats.projects', label: 'Projects delivered', defaultValue: site.stats.projects },
  { key: 'stats.clients', label: 'Happy clients', defaultValue: site.stats.clients },
  { key: 'stats.years', label: 'Years in business', defaultValue: site.stats.years },
  {
    key: 'stats.satisfaction',
    label: 'Client satisfaction',
    defaultValue: site.stats.satisfaction,
  },
  {
    key: 'contact.businessEmail',
    label: 'Business / promotions email',
    defaultValue: '',
    hint: 'Shown where business & promotion queries should go. Empty = hidden.',
  },
  {
    key: 'video.title',
    label: 'YouTube section title',
    defaultValue: 'Fresh From Our YouTube Channel',
  },
  {
    key: 'video.latestUrl',
    label: 'Latest video URL',
    defaultValue: '',
    hint: 'Paste any YouTube watch/shorts/live URL — the home section stays hidden until this is set.',
  },
];

function SiteContentTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(SITE_CONTENT_FIELDS.map((field) => [field.key, '']))
  );
  const [saving, setSaving] = React.useState(false);

  // Prefill with saved overrides; empty input = default value from the site config.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await adminFetch<{ settings: Record<string, string> }>(
          '/api/admin/settings',
          token
        );
        if (cancelled) return;
        setValues((current) => {
          const next = { ...current };
          for (const field of SITE_CONTENT_FIELDS) {
            const saved = payload.settings[field.key];
            if (typeof saved === 'string') next[field.key] = saved;
          }
          return next;
        });
      } catch {
        // Defaults stay in place when fetch fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', token, {
        method: 'PUT',
        body: JSON.stringify({
          entries: SITE_CONTENT_FIELDS.map((field) => ({
            key: field.key,
            value: values[field.key] ?? '',
          })),
        }),
      });
      await useSiteSettings.getState().reload();
      toast({
        title: 'Site content updated — live on site',
        description: 'Home hero, contact details, and stats now use the saved values.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized.') return onUnauthorized();
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Site content</h2>
          <p className="text-sm text-muted-foreground">
            Overrides for the home hero, contact details, and stats. Leave a field empty to use the
            default.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="h-10">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Save content
        </Button>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {SITE_CONTENT_FIELDS.map((field) => (
            <div
              key={field.key}
              className={cn(
                'flex flex-col gap-1.5',
                (field.key === 'hero.headline' || field.key === 'hero.subheadline') &&
                  'sm:col-span-2'
              )}
            >
              <Label htmlFor={`setting-${field.key}`}>{field.label}</Label>
              <Input
                id={`setting-${field.key}`}
                value={values[field.key] ?? ''}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
                placeholder={field.defaultValue}
              />
              {field.hint ? (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Admin view ─────────────────────────── */

export function AdminView() {
  const { toast } = useToast();
  const [token, setToken] = React.useState<string | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  // Auto-login: verify a stored token by hitting an authed endpoint once.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        if (!cancelled) setAuthChecked(true);
        return;
      }
      try {
        await adminFetch('/api/admin/posts', stored);
        if (!cancelled) setToken(stored);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    toast({ title: 'Signed out', description: 'The admin session was cleared.' });
  };

  const onUnauthorized = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    toast({
      title: 'Session expired',
      description: 'Please sign in again.',
      variant: 'destructive',
    });
  }, [toast]);

  if (!authChecked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onAuthenticated={setToken} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Developers3 admin</h1>
            <p className="text-sm text-muted-foreground">
              Manage blog posts, pricing, and site content.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="h-10">
            <Link href="/">
              View site
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={signOut}
            className="h-10 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="portfolios">Portfolio</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="content">Site Content</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-5">
          <OverviewPanel onUnauthorized={onUnauthorized} />
        </TabsContent>
        <TabsContent value="posts" className="mt-5">
          <PostsTab token={token} onUnauthorized={onUnauthorized} />
        </TabsContent>
        <TabsContent value="portfolios" className="mt-5">
          <PortfoliosPanel onUnauthorized={onUnauthorized} />
        </TabsContent>
        <TabsContent value="leads" className="mt-5">
          <LeadsPanel onUnauthorized={onUnauthorized} />
        </TabsContent>
        <TabsContent value="pricing" className="mt-5">
          <PricingTab token={token} onUnauthorized={onUnauthorized} />
        </TabsContent>
        <TabsContent value="content" className="mt-5">
          <SiteContentTab token={token} onUnauthorized={onUnauthorized} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
