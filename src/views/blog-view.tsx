'use client';

import * as React from 'react';
import { CalendarDays, Clock, Newspaper, Quote } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CTABand } from '@/components/common/cta-band';
import { blogPosts, getTeamMember } from '@/data';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

function AuthorLine({ authorId, className }: { authorId: string; className?: string }) {
  const member = getTeamMember(authorId);
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-emerald-100 text-xs font-bold text-emerald-700">
          {member?.initials ?? 'D3'}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-muted-foreground">
        {member?.name ?? 'Developers3 Team'}
      </span>
    </span>
  );
}

/** /blog — article hub with category filter and featured post. */
export function BlogView() {
  const [category, setCategory] = React.useState<string>('all');

  const categories = React.useMemo(
    () => Array.from(new Set(blogPosts.map((post) => post.category))),
    []
  );
  const filtered = React.useMemo(
    () => (category === 'all' ? blogPosts : blogPosts.filter((post) => post.category === category)),
    [category]
  );
  const featured = category === 'all' ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;

  const selectCategory = (next: string) => {
    setCategory(next);
    trackEvent('portfolio_filter', { category: next });
  };

  return (
    <>
      {/* Hero */}
      <Section tinted>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Blog' }]} />
          <h1 className="mt-6 text-3xl font-bold text-balance sm:text-5xl">The Developers3 Blog</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Practical guides on website costs, platforms, SEO, and app development — written by the
            people who build and ship for a living.
          </p>
        </div>
      </Section>

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
                  'inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium transition-colors',
                  category === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-foreground ring-1 ring-inset ring-emerald-600/15 hover:bg-emerald-50'
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
                    'inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium capitalize transition-colors',
                    category === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-foreground ring-1 ring-inset ring-emerald-600/15 hover:bg-emerald-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        ) : null}

        {blogPosts.length === 0 ? (
          <p className="text-center text-muted-foreground">New articles are on the way — check back soon.</p>
        ) : null}

        {/* Featured post */}
        {featured ? (
          <Reveal className="mb-10">
            <Card className="grid overflow-hidden rounded-2xl p-0 md:grid-cols-2">
              <div
                className={cn(
                  'relative flex h-48 items-center justify-center bg-gradient-to-br md:h-full md:min-h-56',
                  featured.coverGradient
                )}
              >
                <Badge className="absolute left-4 top-4 bg-white/90 text-emerald-800">
                  {featured.category}
                </Badge>
                <Quote className="h-16 w-16 text-white/40" aria-hidden="true" />
              </div>
              <CardContent className="flex flex-col gap-4 p-6 lg:p-8">
                <Badge className="w-fit bg-amber-400 text-emerald-950">Featured</Badge>
                <h2 className="text-2xl font-bold text-balance">
                  <Link href={`/blog/${featured.slug}`} className="hover:text-emerald-700">
                    {featured.title}
                  </Link>
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <AuthorLine authorId={featured.authorId} />
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {format(new Date(featured.date), 'MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.readTime}
                  </span>
                </div>
                <Button asChild variant="outline" size="lg" className="mt-auto h-11 w-fit">
                  <Link href={`/blog/${featured.slug}`}>Read article</Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        {/* Post grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, index) => (
            <Reveal key={post.slug} delay={index * 60} className="h-full">
              <Card className="group h-full overflow-hidden rounded-2xl">
                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={`Read article: ${post.title}`}
                  className="block"
                >
                  <div
                    className={cn(
                      'relative flex h-36 items-center justify-center bg-gradient-to-br transition-transform duration-300 group-hover:scale-[1.02]',
                      post.coverGradient
                    )}
                  >
                    <Badge className="absolute left-3 top-3 bg-white/90 text-emerald-800">
                      {post.category}
                    </Badge>
                    <Newspaper className="h-10 w-10 text-white/40" aria-hidden="true" />
                  </div>
                </Link>
                <CardContent className="flex h-[calc(100%-9rem)] flex-col gap-3 p-5">
                  <h3 className="font-semibold leading-snug">
                    <Link href={`/blog/${post.slug}`} className="group-hover:text-emerald-700">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-3">
                    <AuthorLine authorId={post.authorId} />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.date), 'MMM d, yyyy')} · {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
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
