'use client';

import * as React from 'react';
import { ArrowRight, CalendarDays, Clock, Newspaper, Quote } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Section } from '@/components/common/section';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { PageHero } from '@/components/common/page-hero';
import { CTABand } from '@/components/common/cta-band';
import { blogPosts, getTeamMember } from '@/data';
import {
  dbPostToListItem,
  fetchPublicDbPosts,
  staticPostToListItem,
  type BlogListItem,
  type DbPost,
} from '@/lib/blog-db';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/** Author chip that works for both team-authored (static) and DB posts. */
function AuthorLine({ item, className }: { item: BlogListItem; className?: string }) {
  const member = item.authorId ? getTeamMember(item.authorId) : undefined;
  const name = item.authorName ?? member?.name ?? 'Developers3 Team';
  const initials = (
    member?.initials ??
    name
      .split(/\s+/)
      .map((word) => word[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase()
  ) || 'D3';
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Avatar className="h-8 w-8 ring-2 ring-gray-100">
        <AvatarFallback className="bg-gray-100 text-sm font-bold text-gray-800">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-foreground/80">{name}</span>
    </span>
  );
}

function BlogNewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Subscription failed.');
      }
      setSubscribed(true);
      toast({ title: 'Subscribed!', description: 'You have been added to our newsletter list.' });
    } catch (err) {
      toast({
        title: 'Could not subscribe',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="rounded-2xl border border-[#FF4D00]/30 bg-white/10 p-6 text-center text-white">
        <p className="font-bold text-lg">Thank you for subscribing!</p>
        <p className="mt-1 text-sm text-white/80">You will receive our monthly web &amp; software digest.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="h-12 flex-1 rounded-full bg-white px-5 text-gray-900 placeholder:text-gray-500"
        required
      />
      <Button type="submit" disabled={loading} className="h-12 rounded-full bg-[#161613] px-8 text-base font-bold text-white hover:bg-black">
        {loading ? 'Subscribing…' : 'Subscribe'}
      </Button>
    </form>
  );
}

/** /blog — article hub with category filter and featured post. */
export function BlogView() {
  const [category, setCategory] = React.useState<string>('all');
  // DB posts (admin-created) replace the static list when present.
  const [dbPosts, setDbPosts] = React.useState<DbPost[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetchPublicDbPosts().then((posts) => {
      if (!cancelled) setDbPosts(posts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const listItems = React.useMemo<BlogListItem[]>(
    () => (dbPosts && dbPosts.length > 0 ? dbPosts.map(dbPostToListItem) : blogPosts.map(staticPostToListItem)),
    [dbPosts]
  );

  const categories = React.useMemo(
    () => Array.from(new Set(listItems.map((post) => post.category))),
    [listItems]
  );
  const filtered = React.useMemo(
    () => (category === 'all' ? listItems : listItems.filter((post) => post.category === category)),
    [category, listItems]
  );
  const featured = category === 'all' ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;

  const selectCategory = (next: string) => {
    setCategory(next);
    trackEvent('portfolio_filter', { category: next });
  };

  return (
    <>
      {/* Hero — same left-aligned pattern as every page */}
      <PageHero
        eyebrow="Insights & guides"
        title="The Developers3 **Blog**"
        description="Practical guides on website costs, platforms, SEO, and app development — written by the people who build and ship for a living."
        crumbs={[{ label: 'Blog' }]}
      />

      {/* Category filter + posts */}
      <Section>
        {categories.length > 0 ? (
          <Reveal className="mb-10 flex flex-wrap gap-2" >
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by category">
              <button
                type="button"
                onClick={() => selectCategory('all')}
                aria-pressed={category === 'all'}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full px-5 text-base font-medium transition-all',
                  category === 'all'
                    ? 'bg-[#161613] text-white'
                    : 'bg-white text-foreground ring-1 ring-inset ring-gray-900/10 hover:bg-gray-100 hover:ring-gray-500/30'
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  aria-pressed={category === cat}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full px-5 text-base font-medium capitalize transition-all',
                    category === cat
                      ? 'bg-gradient-to-r from-gray-800 to-gray-500 text-white shadow-[0_8px_20px_-8px_rgb(0_0_0/0.65)]'
                      : 'bg-white text-foreground ring-1 ring-inset ring-gray-900/10 hover:bg-gray-100 hover:ring-gray-500/30'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        ) : null}

        {listItems.length === 0 ? (
          <p className="text-center text-muted-foreground">New articles are on the way — check back soon.</p>
        ) : null}

        {/* Featured post */}
        {featured ? (
          <Reveal className="mb-10">
            <div className="card-surface group overflow-hidden rounded-[1.5rem] lg:grid lg:grid-cols-2">
              <Link
                href={`/blog/${featured.slug}`}
                aria-label={`Read article: ${featured.title}`}
                className="relative block aspect-[16/10] overflow-hidden lg:aspect-auto"
              >
                {featured.image ? (
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105',
                      featured.coverGradient
                    )}
                  >
                    <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden="true" />
                    <span className="flex h-full items-center justify-center">
                      <Quote className="h-16 w-16 text-white/40" aria-hidden="true" />
                    </span>
                  </div>
                )}
                <span className="absolute left-4 top-4 z-10 rounded-md bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-800 shadow-sm">
                  {featured.category}
                </span>
              </Link>
              <div className="flex flex-col gap-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a0a0a]">
                    Featured
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800 ring-1 ring-inset ring-gray-800/15">
                    {featured.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-gray-900/10">
                    <Clock className="h-3.5 w-3.5 text-gray-800" aria-hidden="true" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-balance sm:text-4xl">
                  <Link href={`/blog/${featured.slug}`} className="transition-colors hover:text-gray-900">
                    {featured.title}
                  </Link>
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <AuthorLine item={featured} />
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {format(new Date(featured.date || Date.now()), 'MMMM d, yyyy')}
                  </span>
                </div>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group/link mt-auto inline-flex min-h-11 w-fit items-center gap-2.5 text-base font-semibold text-gray-800 transition-colors hover:text-gray-900"
                >
                  Read article
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-800 transition-colors group-hover/link:bg-gray-800 group-hover/link:text-white">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
        ) : null}

        {/* Post grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, index) => (
            <Reveal key={post.slug} delay={index * 60} className="h-full">
              <div className="card-surface card-hover group flex h-full flex-col overflow-hidden rounded-[1.25rem]">
                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={`Read article: ${post.title}`}
                  className="block"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105',
                          post.coverGradient
                        )}
                      >
                        <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden="true" />
                        <span className="flex h-full items-center justify-center">
                          <Newspaper className="h-10 w-10 text-white/40" aria-hidden="true" />
                        </span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-800 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(post.date || Date.now()), 'MMM d, yyyy')} · {post.readTime}
                  </p>
                  <h3 className="line-clamp-2 font-semibold leading-snug">
                    <Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-gray-900">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-2 text-base text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    <AuthorLine item={post} />
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`Read more: ${post.title}`}
                      className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-gray-800 transition-colors hover:text-gray-900"
                    >
                      Read more
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Newsletter / CTA */}
      <section className="relative w-full px-4 pb-16 pt-4 sm:px-6 md:pb-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#FF4D00] px-6 py-12 text-center sm:px-12 md:py-16">
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                One Useful Email a Month
              </h2>
              <p className="max-w-xl text-lg text-white/90">
                Web, SEO, and growth tips from real client projects. No spam, unsubscribe anytime.
              </p>
              <div className="w-full mt-2">
                <BlogNewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
