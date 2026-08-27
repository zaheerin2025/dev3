'use client';

import Image from 'next/image';
import { ArrowRight, CalendarDays, Check, Clock, ListChecks, Newspaper } from 'lucide-react';
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
import { JsonLd } from '@/components/common/json-ld';
import { blogPosts, getBlogPost, getService, getTeamMember } from '@/data';
import { buildArticleSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';

/** Deterministic heading → element id helper for the in-page table of contents. */
function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface BlogPostViewProps {
  slug: string;
}

/** /blog/[slug] — full article with TOC, author box, and related service CTA. */
export function BlogPostView({ slug }: BlogPostViewProps) {
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <Section className="py-24 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Post not found</h1>
        <p className="mt-4 text-muted-foreground">
          The article you are looking for doesn&rsquo;t exist or has moved.
        </p>
        <Button asChild size="lg" className="mt-8 h-11">
          <Link href="/blog">Back to the Blog</Link>
        </Button>
      </Section>
    );
  }

  const author = getTeamMember(post.authorId);
  const relatedService = getService(post.relatedServiceSlug);
  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={buildArticleSchema(post, author)} />

      {/* Hero */}
      <Section tinted>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
          <Badge className="mt-6 bg-emerald-100 text-emerald-800">{post.category}</Badge>
          <h1 className="mt-4 text-3xl font-bold text-balance sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-100 text-xs font-bold text-emerald-700">
                  {author?.initials ?? 'D3'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                <span className="block font-semibold">{author?.name ?? 'Developers3 Team'}</span>
                {author ? <span className="block text-xs text-muted-foreground">{author.role}</span> : null}
              </span>
            </span>
            <span className="text-muted-foreground" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {format(new Date(post.date), 'MMMM d, yyyy')}
            </span>
            <span className="text-muted-foreground" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.readTime}
            </span>
          </div>
        </div>
      </Section>

      {/* Gradient cover band */}
      <Section noPad className="pb-0">
        <Reveal>
          <div
            className={cn(
              'relative mx-auto h-40 max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-br md:h-56',
              post.coverGradient
            )}
          >
            <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden="true" />
            <Newspaper
              className="absolute bottom-4 right-4 h-14 w-14 text-white/30"
              aria-hidden="true"
            />
          </div>
        </Reveal>
      </Section>

      {/* Body */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-8">
            {post.sections.map((section, index) => (
              <Reveal key={section.heading} delay={Math.min(index * 60, 180)}>
                <section id={slugify(section.heading)} aria-labelledby={`${slugify(section.heading)}-title`}>
                  <h2
                    id={`${slugify(section.heading)}-title`}
                    className="text-2xl font-bold text-balance"
                  >
                    {section.heading}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-base/relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {section.bullets.map((bullet, bIndex) => (
                        <li key={bIndex} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                          <span className="text-sm leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              </Reveal>
            ))}
          </div>

          {/* Sticky sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <Card className="rounded-2xl p-5">
              <CardContent className="p-0">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  On this page
                </h2>
                <nav aria-label="Article table of contents" className="mt-3 flex flex-col gap-0.5">
                  {post.sections.map((section) => (
                    <button
                      key={section.heading}
                      type="button"
                      onClick={() =>
                        document.getElementById(slugify(section.heading))?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="w-full rounded px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      {section.heading}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-600/10">
              <CardContent className="p-0">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-800">
                  <ListChecks className="h-4 w-4" aria-hidden="true" />
                  Key takeaways
                </h2>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {post.keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span className="text-sm leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Author box */}
        <Reveal className="mt-14">
          <Card className="rounded-2xl p-6">
            <CardContent className="flex items-start gap-4 p-0">
              {author ? (
                <Image
                  src={author.photo}
                  alt={`Portrait of ${author.name}`}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-emerald-100 font-bold text-emerald-700">D3</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="text-base font-semibold">
                  Written by {author?.name ?? 'the Developers3 Team'}
                </h2>
                {author ? (
                  <>
                    <p className="text-sm text-emerald-700">{author.role}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Related service CTA */}
        <Reveal className="mt-6">
          <Card className="grid items-center gap-6 rounded-2xl border-0 bg-emerald-600 p-6 text-white sm:grid-cols-[1fr_auto] lg:p-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                Related service
              </span>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                {relatedService ? `${relatedService.name} — done for you` : 'Need this built for you?'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
                The team that wrote this guide builds these every week. Get a free quote.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-11 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <Link href={`/${post.relatedServiceSlug}`}>
                {relatedService ? `Explore ${relatedService.shortName}` : 'Get Free Quote'}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Card>
        </Reveal>

        {/* Related posts */}
        {relatedPosts.length > 0 ? (
          <div className="mt-16">
            <SectionHeading title="Keep Reading" align="left" className="mb-8" />
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related, index) => (
                <Reveal key={related.slug} delay={index * 70} className="h-full">
                  <Card className="group h-full overflow-hidden rounded-2xl">
                    <Link
                      href={`/blog/${related.slug}`}
                      aria-label={`Read article: ${related.title}`}
                      className="block"
                    >
                      <div
                        className={cn(
                          'flex h-24 items-center justify-center bg-gradient-to-br',
                          related.coverGradient
                        )}
                      >
                        <Newspaper className="h-8 w-8 text-white/40" aria-hidden="true" />
                      </div>
                    </Link>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <h3 className="font-semibold leading-snug">
                        <Link href={`/blog/${related.slug}`} className="group-hover:text-emerald-700">
                          {related.title}
                        </Link>
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(related.date), 'MMM d, yyyy')} · {related.readTime}
                      </span>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      <CTABand
        title="Prefer to Just Talk?"
        description="Book a free strategy call and get straight answers about your project."
        primaryLabel="Get Free Quote"
      />
    </>
  );
}
