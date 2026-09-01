'use client';

// ─────────────────────────────────────────────────────────────
// Developers3 — Clean, Light Admin Panel.
// Simple, usable, light design (no dark mode / heavy glow).
// Auth token: localStorage 'd3_admin_token'.
// ─────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  Bold,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Inbox,
  Italic,
  LayoutDashboard,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Plus,
  Quote,
  Save,
  Search,
  Settings,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/views/blog-post-view';
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
import { LeadsPanel, OverviewPanel, PortfoliosPanel, SubscribersPanel } from '@/components/admin/panels';
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
import { cn, slugify } from '@/lib/utils';

const TOKEN_KEY = 'd3_admin_token';
const POST_CATEGORIES = Array.from(new Set(blogPosts.map((post) => post.category)));

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}

function calculateAutoReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface PostDraft {
  id?: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  authorName: string;
  authorRole: string;
  excerpt: string;
  content: string;
  readTime: number;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
}

const TEAM_AUTHORS = [
  { name: 'Alex Morgan', role: 'Lead Web Architect' },
  { name: 'Priya Sharma', role: 'Senior Full-Stack Engineer' },
  { name: 'Sofia Alvarez', role: 'Head of E-commerce' },
  { name: 'Developers3 Team', role: 'Contributor' },
];

const EMPTY_DRAFT: PostDraft = {
  slug: '',
  title: '',
  category: POST_CATEGORIES[0] ?? 'General',
  image: '',
  authorName: 'Developers3 Team',
  authorRole: 'Contributor',
  excerpt: '',
  content: '',
  readTime: 1,
  published: false,
  metaTitle: '',
  metaDescription: '',
};

type AdminTab = 'overview' | 'posts' | 'portfolios' | 'leads' | 'subscribers' | 'pricing' | 'content';

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'posts', label: 'Blog Posts', icon: FileText },
  { id: 'portfolios', label: 'Portfolio', icon: Briefcase },
  { id: 'leads', label: 'Leads Inbox', icon: Inbox },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'pricing', label: 'Pricing', icon: Tag },
  { id: 'content', label: 'Site Content', icon: Settings },
];

/* ─────────────────────────────────────────────────────────────
   CLEAN LIGHT LOGIN SCREEN
   ───────────────────────────────────────────────────────────── */

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
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF4D00]/10 text-[#FF4D00]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Admin Sign In</h1>
          <p className="text-xs text-slate-500">
            Enter your admin passcode to access the control panel
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-passcode" className="text-xs font-semibold text-slate-700">
              Passcode
            </Label>
            <Input
              id="admin-passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter admin passcode"
              autoComplete="current-password"
              autoFocus
              required
              className="h-10 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#FF4D00]"
            />
          </div>
          <Button
            type="submit"
            className="h-10 w-full bg-[#FF4D00] font-medium text-white hover:bg-[#e04400]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          Developers3 Content Management System
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POSTS TAB — Simple, useful Light Blog Editor & List
   ───────────────────────────────────────────────────────────── */

function PostsTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<DbPost[] | null>(null);
  const [draft, setDraft] = React.useState<PostDraft | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DbPost | null>(null);
  const [editorMode, setEditorMode] = React.useState<'write' | 'preview'>('write');

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  // Photo insert modal
  const [photoModalOpen, setPhotoModalOpen] = React.useState(false);
  const [photoUrl, setPhotoUrl] = React.useState('');
  const [photoCaption, setPhotoCaption] = React.useState('');

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
    setEditorMode('write');
    setDraft({ ...EMPTY_DRAFT });
  };

  const openEdit = (post: DbPost) => {
    setSlugTouched(true);
    setEditorMode('write');
    setDraft({
      id: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category,
      image: post.image ?? '',
      authorName: post.authorName ?? 'Developers3 Team',
      authorRole: post.authorRole ?? 'Contributor',
      excerpt: post.excerpt,
      content: post.content,
      readTime: post.readTime || calculateAutoReadTime(post.content),
      published: post.published,
      metaTitle: post.metaTitle ?? '',
      metaDescription: post.metaDescription ?? '',
    });
  };

  const updateDraft = (patch: Partial<PostDraft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));

  const updateTitle = (title: string) =>
    setDraft((current) =>
      current
        ? {
            ...current,
            title,
            slug: slugTouched ? current.slug : slugify(title),
            metaTitle: current.metaTitle ? current.metaTitle : title.slice(0, 60),
          }
        : current
    );

  const insertSnippet = (prefix: string, suffix: string = '') => {
    if (!draft) return;
    const textarea = document.getElementById('post-content') as HTMLTextAreaElement | null;
    if (!textarea) {
      updateDraft({ content: draft.content + `\n\n${prefix}sample text${suffix}` });
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draft.content.substring(start, end);
    const textToWrap = selected || 'your text here';
    const replacement = `${prefix}${textToWrap}${suffix}`;
    const nextContent = draft.content.substring(0, start) + replacement + draft.content.substring(end);
    updateDraft({ content: nextContent, readTime: calculateAutoReadTime(nextContent) });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + textToWrap.length);
    }, 0);
  };

  const confirmInsertPhoto = () => {
    if (!photoUrl.trim()) {
      toast({ title: 'Please provide a photo URL or upload an image', variant: 'destructive' });
      return;
    }
    const markdownImg = `\n\n![${photoCaption.trim() || 'Photo'}](${photoUrl.trim()})\n\n`;
    const nextContent = (draft?.content ?? '') + markdownImg;
    updateDraft({ content: nextContent, readTime: calculateAutoReadTime(nextContent) });
    setPhotoModalOpen(false);
    setPhotoUrl('');
    setPhotoCaption('');
    toast({ title: 'Photo inserted into content' });
  };

  const onPickCoverFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast({ title: 'Cover image too large', description: 'Max 2 MB allowed.', variant: 'destructive' });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      updateDraft({ image: dataUrl });
      toast({ title: 'Cover image uploaded' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
  };

  const onPickPhotoFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast({ title: 'Image too large', description: 'Max 2 MB allowed.', variant: 'destructive' });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setPhotoUrl(dataUrl);
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
  };

  const savePost = async (publishState: boolean) => {
    if (!draft || saving) return;
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.content.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Title, excerpt and article content are required.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    const computedReadTime = calculateAutoReadTime(draft.content);
    try {
      const body = JSON.stringify({
        id: draft.id,
        slug: draft.slug.trim() || slugify(draft.title),
        title: draft.title.trim(),
        category: draft.category,
        image: draft.image.trim() || null,
        authorName: draft.authorName,
        authorRole: draft.authorRole,
        excerpt: draft.excerpt.trim(),
        content: draft.content,
        readTime: computedReadTime,
        published: publishState,
        metaTitle: draft.metaTitle.trim() || null,
        metaDescription: draft.metaDescription.trim() || null,
      });
      if (draft.id) {
        await adminFetch('/api/admin/posts', token, { method: 'PUT', body });
        toast({
          title: publishState ? 'Post Published' : 'Draft Saved',
          description: `"${draft.title.trim()}" saved to database.`,
        });
      } else {
        await adminFetch('/api/admin/posts', token, { method: 'POST', body });
        toast({
          title: publishState ? 'Post Published' : 'Draft Created',
          description: `"${draft.title.trim()}" created in database.`,
        });
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

  const togglePostPublished = async (post: DbPost) => {
    try {
      await adminFetch('/api/admin/posts', token, {
        method: 'PUT',
        body: JSON.stringify({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          published: !post.published,
        }),
      });
      toast({
        title: post.published ? 'Moved to Drafts' : 'Published Live',
        description: `"${post.title}" is now ${post.published ? 'a draft' : 'published'}.`,
      });
      await loadPosts();
    } catch {
      toast({ title: 'Status change failed', variant: 'destructive' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminFetch(`/api/admin/posts?id=${encodeURIComponent(deleteTarget.id)}`, token, {
        method: 'DELETE',
      });
      toast({ title: 'Post deleted', description: `"${deleteTarget.title}" was removed.` });
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

  const filteredPosts = React.useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'published' ? p.published : !p.published;
      const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [posts, searchQuery, statusFilter, categoryFilter]);

  const publishedCount = posts?.filter((p) => p.published).length ?? 0;
  const draftCount = posts?.filter((p) => !p.published).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Blog Posts</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {posts
              ? `${posts.length} total posts (${publishedCount} published, ${draftCount} drafts)`
              : 'Loading posts…'}
          </p>
        </div>
        <Button
          onClick={openNew}
          className="h-9 gap-1.5 bg-[#FF4D00] font-medium text-white hover:bg-[#e04400]"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {/* Editor Form Card */}
      {draft ? (
        <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-900">
                {draft.id ? 'Edit Article' : 'New Article'}
              </h3>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                <Switch
                  id="editor-published"
                  checked={draft.published}
                  onCheckedChange={(checked) => updateDraft({ published: checked })}
                />
                <Label htmlFor="editor-published" className="cursor-pointer select-none text-xs font-semibold">
                  {draft.published ? (
                    <span className="text-emerald-700">Published Live</span>
                  ) : (
                    <span className="text-amber-700">Draft (Hidden)</span>
                  )}
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={editorMode === 'write' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('write')}
                className="h-8 gap-1 text-xs"
              >
                <Code2 className="h-3.5 w-3.5" />
                Write
              </Button>
              <Button
                variant={editorMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('preview')}
                className="h-8 gap-1 text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraft(null)}
                className="h-8 text-xs text-slate-500"
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {/* Title */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="post-title" className="text-xs font-semibold text-slate-700">
                Title *
              </Label>
              <Input
                id="post-title"
                value={draft.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="How Much Does a Website Cost in 2025?"
                className="h-11 border-slate-300 text-base font-semibold text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-slug" className="text-xs font-semibold text-slate-700">
                URL Slug
              </Label>
              <Input
                id="post-slug"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateDraft({ slug: e.target.value });
                }}
                placeholder="how-much-does-a-website-cost"
                className="border-slate-300 text-sm text-slate-900"
              />
              <p className="text-[11px] text-slate-500">
                URL: /blog/<span className="font-semibold text-slate-700">{draft.slug || '...'}</span>
              </p>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-category" className="text-xs font-semibold text-slate-700">
                Category
              </Label>
              <Select value={draft.category} onValueChange={(v) => updateDraft({ category: v })}>
                <SelectTrigger id="post-category" className="border-slate-300 text-sm text-slate-900">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {(POST_CATEGORIES.includes(draft.category)
                    ? POST_CATEGORIES
                    : [draft.category, ...POST_CATEGORIES]
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">Author</Label>
              <Select
                value={draft.authorName}
                onValueChange={(name) => {
                  const found = TEAM_AUTHORS.find((a) => a.name === name);
                  updateDraft({ authorName: name, authorRole: found?.role ?? draft.authorRole });
                }}
              >
                <SelectTrigger className="border-slate-300 text-sm text-slate-900">
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_AUTHORS.map((a) => (
                    <SelectItem key={a.name} value={a.name}>
                      {a.name} ({a.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author Role */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-author-role" className="text-xs font-semibold text-slate-700">
                Author Role
              </Label>
              <Input
                id="post-author-role"
                value={draft.authorRole}
                onChange={(e) => updateDraft({ authorRole: e.target.value })}
                placeholder="Lead Web Architect"
                className="border-slate-300 text-sm text-slate-900"
              />
            </div>

            {/* Cover Image */}
            <div className="flex flex-col gap-2.5 sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  Main Cover Image
                </Label>
                {draft.image ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-red-600 hover:text-red-700"
                    onClick={() => updateDraft({ image: '' })}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove Cover
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cover-file" className="text-xs text-slate-500">Upload file</Label>
                  <Input
                    id="cover-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => void onPickCoverFile(e.target.files?.[0])}
                    className="border-slate-300 bg-white text-xs text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cover-url" className="text-xs text-slate-500">Or paste URL</Label>
                  <Input
                    id="cover-url"
                    value={draft.image.startsWith('data:') ? '' : draft.image}
                    onChange={(e) => updateDraft({ image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="border-slate-300 bg-white text-xs text-slate-900"
                  />
                </div>
              </div>
              {draft.image ? (
                <div className="relative mt-1 overflow-hidden rounded-md border border-slate-200">
                  <img src={draft.image} alt="Cover preview" className="max-h-40 w-full object-cover" />
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">No cover image selected. A default gradient will be displayed.</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="post-excerpt" className="text-xs font-semibold text-slate-700">
                  Excerpt / Summary *
                </Label>
                <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  <Clock className="h-3 w-3" />
                  {calculateAutoReadTime(draft.content)} min read (auto-calculated)
                </span>
              </div>
              <Textarea
                id="post-excerpt"
                rows={2}
                value={draft.excerpt}
                onChange={(e) => updateDraft({ excerpt: e.target.value })}
                placeholder="A concise summary of the article..."
                className="border-slate-300 text-sm text-slate-900"
              />
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="post-content" className="text-xs font-semibold text-slate-700">
                  Article Body *
                </Label>
                {editorMode === 'write' ? (
                  <div className="flex flex-wrap items-center gap-1 rounded border border-slate-200 bg-slate-50 p-1">
                    {[
                      { icon: Bold, action: () => insertSnippet('**', '**'), title: 'Bold' },
                      { icon: Italic, action: () => insertSnippet('*', '*'), title: 'Italic' },
                      { icon: Heading2, action: () => insertSnippet('## '), title: 'Heading 2' },
                      { icon: Heading3, action: () => insertSnippet('### '), title: 'Heading 3' },
                      { icon: List, action: () => insertSnippet('- '), title: 'Bullet List' },
                      { icon: ListOrdered, action: () => insertSnippet('1. '), title: 'Numbered List' },
                      { icon: Quote, action: () => insertSnippet('> '), title: 'Quote' },
                      { icon: Link2, action: () => insertSnippet('[', '](https://example.com)'), title: 'Link' },
                    ].map(({ icon: Icon, action, title }) => (
                      <Button
                        key={title}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        onClick={action}
                        title={title}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                    <div className="h-4 w-px bg-slate-300" />
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs bg-[#FF4D00] text-white hover:bg-[#e04400]"
                      onClick={() => setPhotoModalOpen(true)}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Add Photo
                    </Button>
                  </div>
                ) : null}
              </div>

              {editorMode === 'write' ? (
                <>
                  <Textarea
                    id="post-content"
                    rows={16}
                    value={draft.content}
                    onChange={(e) => {
                      const next = e.target.value;
                      updateDraft({ content: next, readTime: calculateAutoReadTime(next) });
                    }}
                    className="font-mono text-sm border-slate-300 text-slate-900 leading-relaxed"
                    placeholder={"Write content using Markdown...\n\n## Heading\n\nParagraph text...\n\n![Image](url)"}
                  />
                  <p className="text-[11px] text-slate-500">
                    Supports standard Markdown: ## Headings, **bold**, *italic*, - lists, &gt; quotes, ![images](url).
                  </p>
                </>
              ) : (
                <div className="min-h-[300px] rounded-lg border border-slate-300 bg-white p-6">
                  <ReactMarkdown components={markdownComponents}>
                    {draft.content || '*No content written yet.*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* SEO Suite */}
            <div className="flex flex-col gap-3 sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Globe className="h-3.5 w-3.5 text-[#FF4D00]" />
                SEO Options
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <Label htmlFor="meta-title" className="text-xs text-slate-600">Meta Title</Label>
                    <span className="text-[10px] text-slate-400">{draft.metaTitle.length}/60</span>
                  </div>
                  <Input
                    id="meta-title"
                    value={draft.metaTitle}
                    onChange={(e) => updateDraft({ metaTitle: e.target.value })}
                    placeholder={draft.title || 'SEO Title'}
                    className="border-slate-300 bg-white text-xs text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <div className="flex justify-between">
                    <Label htmlFor="meta-desc" className="text-xs text-slate-600">Meta Description</Label>
                    <span className="text-[10px] text-slate-400">{draft.metaDescription.length}/160</span>
                  </div>
                  <Textarea
                    id="meta-desc"
                    rows={2}
                    value={draft.metaDescription}
                    onChange={(e) => updateDraft({ metaDescription: e.target.value })}
                    placeholder={draft.excerpt || 'SEO Description'}
                    className="border-slate-300 bg-white text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 border-t border-slate-200 pt-4">
              <Button variant="ghost" onClick={() => setDraft(null)} className="h-9 text-slate-600">
                Cancel
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void savePost(false)}
                  disabled={saving}
                  className="h-9 border-amber-300 bg-amber-50 font-semibold text-amber-900 hover:bg-amber-100"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => void savePost(true)}
                  disabled={saving}
                  className="h-9 bg-[#FF4D00] font-semibold text-white hover:bg-[#e04400]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                  {draft.id ? 'Update & Publish' : 'Publish Live'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Insert Photo Modal */}
      <AlertDialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Insert Photo into Body</AlertDialogTitle>
            <AlertDialogDescription>
              Upload an image file or paste an image URL to insert into article text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="photo-file" className="text-xs">Upload image file</Label>
              <Input
                id="photo-file"
                type="file"
                accept="image/*"
                onChange={(e) => void onPickPhotoFile(e.target.files?.[0])}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="photo-url" className="text-xs">Or Image URL</Label>
              <Input
                id="photo-url"
                value={photoUrl.startsWith('data:') ? '' : photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            {photoUrl ? (
              <div className="flex justify-center rounded border p-2 bg-slate-50">
                <img src={photoUrl} alt="Preview" className="max-h-32 rounded object-cover" />
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <Label htmlFor="photo-caption" className="text-xs">Caption / Alt text</Label>
              <Input
                id="photo-caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPhotoModalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmInsertPhoto} className="bg-[#FF4D00] text-white hover:bg-[#e04400]">
              Insert Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: 'all' | 'published' | 'draft') => setStatusFilter(v)}>
            <SelectTrigger className="h-9 w-[130px] border-slate-300 text-xs text-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-[140px] border-slate-300 text-xs text-slate-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {POST_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Post Table / List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {!posts ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            Loading posts from database…
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {searchQuery || statusFilter !== 'all' ? 'No posts matching filters.' : 'No blog posts created yet.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <div key={post.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {post.image ? (
                    <img src={post.image} alt="" className="h-12 w-20 shrink-0 rounded border border-slate-200 object-cover" />
                  ) : (
                    <div className="h-12 w-20 shrink-0 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      NO COVER
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                      <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200">
                        {post.category}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      /blog/{post.slug} · {post.readTime} min read · {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={post.published}
                      onCheckedChange={() => void togglePostPublished(post)}
                      aria-label="Toggle publish"
                    />
                    <span className={cn('text-xs font-semibold', post.published ? 'text-emerald-700' : 'text-slate-500')}>
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                      onClick={() => openEdit(post)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-slate-300 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteTarget(post)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRICING TAB
   ───────────────────────────────────────────────────────────── */

function PricingTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [tiers, setTiers] = React.useState<PricingTier[]>(websiteTiers);
  const [blocks, setBlocks] = React.useState<PricingBlock[]>(servicePricingBlocks);
  const [saving, setSaving] = React.useState(false);

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
        // Static fallbacks
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const updateTier = (index: number, patch: Partial<PricingTier>) =>
    setTiers((current) => current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));

  const updateTierFeatures = (index: number, raw: string) =>
    updateTier(index, { features: raw.split('\n').filter((line) => line.trim() !== '') });

  const updateBlock = (index: number, patch: Partial<PricingBlock>) =>
    setBlocks((current) => current.map((block, i) => (i === index ? { ...block, ...patch } : block)));

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
      toast({ title: 'Pricing saved', description: 'Updated on /pricing page.' });
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pricing Settings</h2>
          <p className="mt-0.5 text-xs text-slate-500">Edit website packages and service pricing blocks.</p>
        </div>
        <Button onClick={save} disabled={saving} className="h-9 gap-1.5 bg-[#FF4D00] text-white hover:bg-[#e04400]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Pricing
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Website Packages</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <div key={`${tier.name}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="grid gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`tier-name-${index}`} className="text-xs text-slate-600">Tier Name</Label>
                  <Input
                    id={`tier-name-${index}`}
                    value={tier.name}
                    onChange={(e) => updateTier(index, { name: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`tier-price-${index}`} className="text-xs text-slate-600">Price</Label>
                    <Input
                      id={`tier-price-${index}`}
                      value={tier.price}
                      onChange={(e) => updateTier(index, { price: e.target.value })}
                      className="border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`tier-period-${index}`} className="text-xs text-slate-600">Period</Label>
                    <Input
                      id={`tier-period-${index}`}
                      value={tier.period}
                      onChange={(e) => updateTier(index, { period: e.target.value })}
                      className="border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`tier-best-${index}`} className="text-xs text-slate-600">Best For</Label>
                  <Input
                    id={`tier-best-${index}`}
                    value={tier.bestFor}
                    onChange={(e) => updateTier(index, { bestFor: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`tier-blurb-${index}`} className="text-xs text-slate-600">Blurb</Label>
                  <Textarea
                    id={`tier-blurb-${index}`}
                    rows={2}
                    value={tier.blurb}
                    onChange={(e) => updateTier(index, { blurb: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`tier-features-${index}`} className="text-xs text-slate-600">Features (one per line)</Label>
                  <Textarea
                    id={`tier-features-${index}`}
                    rows={6}
                    value={tier.features.join('\n')}
                    onChange={(e) => updateTierFeatures(index, e.target.value)}
                    className="font-mono text-xs border-slate-300 bg-white text-slate-900"
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

/* ─────────────────────────────────────────────────────────────
   SITE CONTENT TAB
   ───────────────────────────────────────────────────────────── */

const SITE_CONTENT_FIELDS: { key: string; label: string; defaultValue: string; hint?: string }[] = [
  {
    key: 'hero.headline',
    label: 'Hero Headline',
    defaultValue: 'Web, App & Software Development Company',
    hint: 'Homepage main title.',
  },
  {
    key: 'hero.subheadline',
    label: 'Hero Subheadline',
    defaultValue:
      'We design, build, and grow custom websites, e-commerce stores, and digital products that turn visitors into customers.',
  },
  { key: 'contact.email', label: 'Contact Email', defaultValue: site.email },
  { key: 'contact.phoneDisplay', label: 'Phone Number', defaultValue: site.phoneDisplay },
  {
    key: 'contact.whatsappNumber',
    label: 'WhatsApp Number',
    defaultValue: site.whatsappNumber,
    hint: 'Digits only with country code, e.g. 923110671019.',
  },
  {
    key: 'contact.businessEmail',
    label: 'Business Email',
    defaultValue: '',
    hint: 'Optional business/promotions email.',
  },
  {
    key: 'video.title',
    label: 'YouTube Title',
    defaultValue: 'Fresh From Our YouTube Channel',
  },
  {
    key: 'video.latestUrl',
    label: 'Latest YouTube URL',
    defaultValue: '',
    hint: 'Paste YouTube video URL.',
  },
];

function SiteContentTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const { toast } = useToast();
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(SITE_CONTENT_FIELDS.map((field) => [field.key, '']))
  );
  const [saving, setSaving] = React.useState(false);

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
        // Defaults stay in place
      }
    })();
    return () => { cancelled = true; };
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
      toast({ title: 'Content saved', description: 'Updated across website.' });
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Site Content Overrides</h2>
          <p className="mt-0.5 text-xs text-slate-500">Customize homepage text, contact details, and links.</p>
        </div>
        <Button onClick={save} disabled={saving} className="h-9 gap-1.5 bg-[#FF4D00] text-white hover:bg-[#e04400]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Content
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {SITE_CONTENT_FIELDS.map((field) => (
            <div
              key={field.key}
              className={cn(
                'flex flex-col gap-1',
                (field.key === 'hero.headline' || field.key === 'hero.subheadline') && 'sm:col-span-2'
              )}
            >
              <Label htmlFor={`setting-${field.key}`} className="text-xs font-semibold text-slate-700">
                {field.label}
              </Label>
              <Input
                id={`setting-${field.key}`}
                value={values[field.key] ?? ''}
                onChange={(e) => setValues((c) => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.defaultValue}
                className="border-slate-300 text-sm text-slate-900"
              />
              {field.hint ? <p className="text-[11px] text-slate-500">{field.hint}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN ADMIN VIEW — Clean Light Layout
   ───────────────────────────────────────────────────────────── */

export function AdminView() {
  const { toast } = useToast();
  const [token, setToken] = React.useState<string | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    return () => { cancelled = true; };
  }, []);

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    toast({ title: 'Signed out', description: 'Admin session cleared.' });
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#FF4D00]" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onAuthenticated={setToken} />;
  }

  const renderNavItem = (item: typeof NAV_ITEMS[number], mobile = false) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          if (mobile) setMobileMenuOpen(false);
        }}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[#FF4D00]/10 text-[#FF4D00]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isActive ? 'text-[#FF4D00]' : 'text-slate-400 group-hover:text-slate-600'
          )}
        />
        {(sidebarOpen || mobile) && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex',
          sidebarOpen ? 'w-[220px]' : 'w-[64px]'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF4D00] text-white font-bold text-xs">
              D3
            </div>
            {sidebarOpen && (
              <span className="truncate text-sm font-bold text-slate-900">
                Developers3
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {NAV_ITEMS.map((item) => renderNavItem(item))}
        </nav>

        <div className="border-t border-slate-200 p-2">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FF4D00] text-white font-bold text-xs">
            D3
          </div>
          <span className="text-sm font-bold text-slate-900">Developers3 Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <nav className="absolute left-0 top-14 bottom-0 w-[240px] border-r border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => renderNavItem(item, true))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
          <h1 className="text-sm font-bold text-slate-900">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? 'Dashboard'}
          </h1>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1.5 border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="h-3 w-3" />
              View Website
            </Link>
          </Button>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === 'overview' && <OverviewPanel onUnauthorized={onUnauthorized} />}
          {activeTab === 'posts' && <PostsTab token={token} onUnauthorized={onUnauthorized} />}
          {activeTab === 'portfolios' && <PortfoliosPanel onUnauthorized={onUnauthorized} />}
          {activeTab === 'leads' && <LeadsPanel onUnauthorized={onUnauthorized} />}
          {activeTab === 'subscribers' && <SubscribersPanel onUnauthorized={onUnauthorized} />}
          {activeTab === 'pricing' && <PricingTab token={token} onUnauthorized={onUnauthorized} />}
          {activeTab === 'content' && <SiteContentTab token={token} onUnauthorized={onUnauthorized} />}
        </div>
      </main>
    </div>
  );
}
