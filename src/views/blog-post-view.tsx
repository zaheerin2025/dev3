'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Check, Clock, ListChecks, Loader2, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { Reveal } from '@/components/common/reveal';
import { Link } from '@/components/common/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CTABand } from '@/components/common/cta-band';
import { JsonLd } from '@/components/common/json-ld';
import { blogPosts, getBlogPost, getService, getTeamMember } from '@/data';
import {
  DB_POST_GRADIENT,
  fetchPublicDbPosts,
  getAuthorIdFromName,
  parseDbSections,
  type DbPost,
} from '@/lib/blog-db';
import { buildArticleSchema } from '@/lib/schema';
import { cn, slugify } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export const markdownComponents = {
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
    const text = String(children ?? '');
    const id = slugify(text);
    return (
      <h2 id={id} className="scroll-mt-28 mt-10 mb-4 text-3xl font-bold text-balance tracking-tight text-foreground" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
    const text = String(children ?? '');
    const id = slugify(text);
    return (
      <h3 id={id} className="scroll-mt-28 mt-8 mb-3 text-2xl font-semibold text-foreground" {...props}>
        {children}
      </h3>
    );
  },
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p className="my-4 text-base sm:text-lg leading-8 text-foreground/85" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className="my-5 list-disc space-y-2.5 pl-6 text-foreground/85 marker:text-gray-800" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className="my-5 list-decimal space-y-2.5 pl-6 text-foreground/85 marker:font-bold marker:text-gray-800" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className="leading-7 text-foreground/85" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="my-6 border-l-4 border-[#FF4D00] bg-gray-100/60 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-r-2xl italic text-foreground/90 font-medium" {...props}>
      {children}
    </blockquote>
  ),
  img: ({ src, alt, ...props }: React.ComponentPropsWithoutRef<'img'>) => (
    <figure className="my-8">
      <img src={src} alt={alt || ''} className="w-full max-h-[520px] rounded-2xl border border-gray-900/10 object-cover shadow-lg" {...props} />
      {alt ? <figcaption className="mt-2.5 text-center text-xs text-muted-foreground">{alt}</figcaption> : null}
    </figure>
  ),
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a href={href} className="font-semibold text-gray-900 underline decoration-[#FF4D00] decoration-2 underline-offset-2 transition-colors hover:text-[#FF4D00]" target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-bold text-foreground" {...props}>
      {children}
    </strong>
  ),
  code: ({ children, ...props }: React.ComponentPropsWithoutRef<'code'>) => (
    <code className="rounded-md bg-gray-100 dark:bg-zinc-800 px-2 py-1 font-mono text-sm font-semibold text-gray-900 dark:text-zinc-100" {...props}>
      {children}
    </code>
  ),
};


interface BlogPostViewProps {
  slug: string;
}

/** /blog/[slug] — full article with TOC, author box, and related service CTA. */
export function BlogPostView({ slug }: BlogPostViewProps) {
  const staticPost = getBlogPost(slug);
  // Admin-created posts live in the DB (they may override a static slug):
  // undefined = fetch in flight, null = no DB post for this slug.
  const [dbPost, setDbPost] = React.useState<DbPost | null | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    setDbPost(undefined);
    fetchPublicDbPosts(slug).then((posts) => {
      if (!cancelled) setDbPost(posts?.[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (dbPost) {
    return <DbPostArticle post={dbPost} />;
  }

  if (!staticPost) {
    // Unknown slug: wait for the DB lookup before showing the not-found state.
    if (dbPost === undefined) {
      return (
        <Section className="py-24 text-center">
          <Loader2
            className="mx-auto h-6 w-6 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </Section>
      );
    }
    return (
      <Section className="py-24 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Post not found</h1>
        <p className="mt-4 text-muted-foreground">
          The article you are looking for doesn&rsquo;t exist or has moved.
        </p>
        <Button asChild size="lg" className="mt-8 h-11">
          <Link href="/blog">Back to the Blog</Link>
        </Button>
      </Section>
    );
  }

  const post = staticPost;

  const author = getTeamMember(post.authorId);
  const relatedService = getService(post.relatedServiceSlug);
  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={buildArticleSchema(post, author)} />

      {/* Hero */}
      <Section tinted>
        <div className="relative mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-800 ring-1 ring-inset ring-gray-800/20">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500" aria-hidden="true" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-gray-900/10">
              <Clock className="h-3.5 w-3.5 text-gray-800" aria-hidden="true" />
              {post.readTime}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-2.5">
              <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                <AvatarFallback className="bg-gray-100 text-sm font-bold text-gray-800">
                  {author?.initials ?? 'D3'}
                </AvatarFallback>
              </Avatar>
              <span className="text-base">
                <span className="block font-semibold">{author?.name ?? 'Developers3 Team'}</span>
                {author ? <span className="block text-sm text-muted-foreground">{author.role}</span> : null}
              </span>
            </span>
            <span className="text-muted-foreground" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-base text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {format(new Date(post.date), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>
      </Section>

      {/* Cover band: image when set, gradient otherwise */}
      <Section noPad className="pb-0">
        <Reveal>
          <div className="gradient-frame mx-auto max-w-7xl shadow-[0_32px_64px_-32px_rgb(4_16_11/0.35)]">
            {post.image ? (
              <img
                src={post.image}
                alt=""
                className="relative h-44 w-full rounded-[1.45rem] object-cover md:h-60"
              />
            ) : (
              <div
                className={cn(
                  'relative h-44 overflow-hidden rounded-[1.45rem] bg-gradient-to-br md:h-60',
                  post.coverGradient
                )}
              >
                <span
                  className="glow-orb -right-10 -top-14 h-56 w-56 bg-white/25"
                  aria-hidden="true"
                />
                <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden="true" />
                <Newspaper
                  className="absolute bottom-4 right-4 h-14 w-14 text-white/30"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </Reveal>
      </Section>

      {/* Body */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px]">
          <article className="card-surface rounded-[1.5rem] p-6 sm:p-10">
            <div className="flex flex-col gap-10">
              {post.sections.map((section, index) => (
                <Reveal key={section.heading} delay={Math.min(index * 60, 180)}>
                  <section
                    id={slugify(section.heading)}
                    aria-labelledby={`${slugify(section.heading)}-title`}
                    className="scroll-mt-28"
                  >
                    <h2
                      id={`${slugify(section.heading)}-title`}
                      className="scroll-mt-28 text-3xl font-bold text-balance"
                    >
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-5">
                      {section.paragraphs.map((paragraph, pIndex) => (
                        <p key={pIndex} className="leading-8 text-foreground/85">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="mt-5 list-disc space-y-2 pl-5 marker:text-gray-500">
                        {section.bullets.map((bullet, bIndex) => (
                          <li key={bIndex} className="leading-7 text-foreground/80">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                </Reveal>
              ))}
            </div>
          </article>

          {/* Sticky sidebar */}
          <aside className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex">
            <div className="card-surface rounded-2xl p-5">
              <h2 className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                On this page
              </h2>
              <hr className="divider-gradient mt-3" />
              <nav aria-label="Article table of contents" className="mt-3 flex flex-col gap-0.5">
                {post.sections.map((section, index) => (
                  <button
                    key={section.heading}
                    type="button"
                    onClick={() =>
                      document.getElementById(slugify(section.heading))?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base text-muted-foreground transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-800 ring-1 ring-inset ring-gray-800/15 transition-colors group-hover:bg-gray-800 group-hover:text-white">
                      {index + 1}
                    </span>
                    <span className="leading-snug">{section.heading}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-gray-800/10 bg-gray-100 p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold uppercase tracking-widest text-gray-900">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Key takeaways
              </h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {post.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gray-800" aria-hidden="true" />
                    <span className="text-base leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Author box */}
        <Reveal className="mt-14">
          <div className="card-surface flex items-start gap-4 rounded-2xl p-6 sm:items-center">
            {author ? (
              <Image
                src={author.photo}
                alt={`Portrait of ${author.name}`}
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <Avatar className="h-16 w-16 ring-2 ring-gray-100">
                <AvatarFallback className="bg-gray-100 font-bold text-gray-800">D3</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                Written by {author?.name ?? 'the Developers3 Team'}
              </h2>
              {author ? (
                <>
                  <p className="text-base font-medium text-gray-800">{author.role}</p>
                  <p className="mt-1 text-base leading-relaxed text-muted-foreground">{author.bio}</p>
                </>
              ) : null}
            </div>
          </div>
        </Reveal>

        {/* Related service CTA */}
        <Reveal className="mt-6">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-gray-800 to-[#0a0a0a] p-8 text-white shadow-[0_28px_56px_-28px_rgb(4_16_11/0.55)] sm:p-10">
            {/* Ambient glows + texture */}
            <span
              className="glow-orb -right-12 -top-16 h-64 w-64 bg-gray-400/30"
              aria-hidden="true"
            />
            <span
              className="glow-orb -bottom-20 -left-10 h-56 w-56 bg-gray-400/20"
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.08) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
              aria-hidden="true"
            />
            <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gray-100 ring-1 ring-inset ring-white/20">
                  Related service
                </span>
                <h2 className="mt-3 text-2xl font-bold text-balance sm:text-3xl">
                  {relatedService ? `${relatedService.name} — done for you` : 'Need this built for you?'}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-gray-100/85">
                  The team that wrote this guide builds these every week. Get a free quote.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-12 w-full bg-white text-gray-900 hover:bg-gray-100 sm:w-auto"
              >
                <Link href={`/${post.relatedServiceSlug}`}>
                  {relatedService ? `Explore ${relatedService.shortName}` : 'Get Free Quote'}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Related posts */}
        {relatedPosts.length > 0 ? (
          <div className="mt-16">
            <SectionHeading title="Keep Reading" align="left" className="mb-8" />
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related, index) => (
                <Reveal key={related.slug} delay={index * 70} className="h-full">
                  <div className="card-surface card-hover group flex h-full flex-col overflow-hidden rounded-[1.25rem]">
                    <Link
                      href={`/blog/${related.slug}`}
                      aria-label={`Read article: ${related.title}`}
                      className="block"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <div
                          className={cn(
                            'absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105',
                            related.coverGradient
                          )}
                        >
                          <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden="true" />
                          <Newspaper
                            className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white/40"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-semibold leading-snug">
                        <Link href={`/blog/${related.slug}`} className="transition-colors group-hover:text-gray-900">
                          {related.title}
                        </Link>
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(related.date), 'MMM d, yyyy')} · {related.readTime}
                      </span>
                    </div>
                  </div>
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

/* ─────────────── DB-backed article (admin panel content) ─────────────── */

/**
 * Article renderer for posts created in the admin panel. Content is a plain
 * string: blank lines separate blocks, lines starting with "## " open a
 * section heading, everything else is a paragraph (parseDbSections).
 */
function DbPostArticle({ post }: { post: DbPost }) {
  const sections = React.useMemo(() => parseDbSections(post.content), [post.content]);
  const headingSections = React.useMemo(
    () => sections.filter((section) => section.heading),
    [sections]
  );
  const authorId = getAuthorIdFromName(post.authorName);
  const author = authorId ? getTeamMember(authorId) : undefined;
  const name = author?.name ?? post.authorName;
  const role = author?.role ?? post.authorRole;
  const initials =
    author?.initials ??
    (name
      .split(/\s+/)
      .map((word) => word[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'D3');

  return (
    <>
      {/* Hero */}
      <Section tinted>
        <div className="relative mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-800 ring-1 ring-inset ring-gray-800/20">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500" aria-hidden="true" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-gray-900/10">
              <Clock className="h-3.5 w-3.5 text-gray-800" aria-hidden="true" />
              {post.readTime} min read
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-2.5">
              {author?.photo ? (
                <Image
                  src={author.photo}
                  alt={`Portrait of ${name}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                  <AvatarFallback className="bg-gray-100 text-sm font-bold text-gray-800">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-base">
                <span className="block font-semibold">{name}</span>
                <span className="block text-sm text-muted-foreground">{role}</span>
              </span>
            </span>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <span className="flex items-center gap-1.5 text-base text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {format(
                (() => {
                  const d = new Date(post.createdAt);
                  return !isNaN(d.getTime()) && d.getFullYear() >= 2026 ? d : new Date();
                })(),
                'MMMM d, yyyy'
              )}
            </span>
          </div>
        </div>
      </Section>

      {/* Cover: admin-provided image when set, brand gradient otherwise */}
      <Section noPad className="pb-0">
        <Reveal>
          <div className="gradient-frame mx-auto max-w-7xl shadow-[0_32px_64px_-32px_rgb(4_16_11/0.35)]">
            {post.image ? (
              <img
                src={post.image}
                alt=""
                className="relative h-44 w-full rounded-[1.45rem] object-cover md:h-60"
              />
            ) : (
              <div
                className={cn(
                  'relative h-44 overflow-hidden rounded-[1.45rem] bg-gradient-to-br md:h-60',
                  DB_POST_GRADIENT
                )}
              >
                <span
                  className="glow-orb -right-10 -top-14 h-56 w-56 bg-white/25"
                  aria-hidden="true"
                />
                <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden="true" />
                <Newspaper
                  className="absolute bottom-4 right-4 h-14 w-14 text-white/30"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </Reveal>
      </Section>

      {/* Body */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px]">
          <article className="card-surface rounded-[1.5rem] p-6 sm:p-10">
            <ReactMarkdown components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Sticky TOC (only when the post has "## " headings) */}
          {headingSections.length > 0 ? (
            <aside className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex">
              <div className="card-surface rounded-2xl p-5">
                <h2 className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                  On this page
                </h2>
                <hr className="divider-gradient mt-3" />
                <nav aria-label="Article table of contents" className="mt-3 flex flex-col gap-0.5">
                  {headingSections.map((section, index) => {
                    const id = slugify(section.heading);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(id)
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base text-muted-foreground transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-800 ring-1 ring-inset ring-gray-800/15 transition-colors group-hover:bg-gray-800 group-hover:text-white">
                          {index + 1}
                        </span>
                        <span className="leading-snug">{section.heading}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
          ) : null}
        </div>

        {/* Author box */}
        <Reveal className="mt-14">
          <div className="card-surface flex items-start gap-4 rounded-2xl p-6 sm:items-center">
            {author?.photo ? (
              <Image
                src={author.photo}
                alt={`Portrait of ${name}`}
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <Avatar className="h-16 w-16 ring-2 ring-gray-100">
                <AvatarFallback className="bg-gray-100 font-bold text-gray-800">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold">Written by {name}</h2>
              <p className="text-base font-medium text-gray-800">{role}</p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                {author?.bio ?? 'Part of the Developers3 team, sharing practical notes from real client projects.'}
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <CTABand
        title="Prefer to Just Talk?"
        description="Book a free strategy call and get straight answers about your project."
        primaryLabel="Get Free Quote"
      />
    </>
  );
}
