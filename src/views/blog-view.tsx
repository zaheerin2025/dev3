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
    () => (dbPosts ? dbPosts.map(dbPostToListItem) : blogPosts.map(staticPostToListItem)),
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
                    {format(new Date(featured.date), 'MMMM d, yyyy')}
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
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-800 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(post.date), 'MMM d, yyyy')} · {post.readTime}
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
      <CTABand
        title="One Useful Email a Month"
        description="Web, SEO, and growth tips from real projects. No spam, unsubscribe anytime."
        primaryHref="/contact"
        primaryLabel="Work With Us"
        secondaryHref=""
        secondaryLabel=""
        showWhatsapp={false}
      />
    </>
  );
}
