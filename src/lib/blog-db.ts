// ─────────────────────────────────────────────────────────────
// Developers3 — DB-backed blog post helpers (Task 19-e).
// The admin panel stores posts in the Prisma `Post` model with plain-string
// content ("## Heading" lines become section headings, blank lines separate
// paragraphs). These helpers adapt DB rows to the shapes the public blog
// views render, so /blog and /blog/[slug] work with either static or DB posts.
// ─────────────────────────────────────────────────────────────

import type { BlogPost, BlogSection } from '@/lib/types';

/** JSON-serialized Prisma Post row as served by /api/public/posts. */
export interface DbPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string | null;
  authorName: string;
  authorRole: string;
  content: string;
  readTime: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Card/list shape used by the blog hub — covers static AND DB posts. */
export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  date: string;
  readTime: string;
  coverGradient: string;
  image?: string | null;
}

export function staticPostToListItem(post: BlogPost): BlogListItem {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    authorId: post.authorId,
    date: post.date,
    readTime: post.readTime,
    coverGradient: post.coverGradient,
  };
}

export function dbPostToListItem(post: DbPost): BlogListItem {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    authorName: post.authorName,
    authorRole: post.authorRole,
    date: post.createdAt,
    readTime: `${post.readTime} min read`,
    coverGradient: 'from-gray-500 to-gray-800',
    image: post.image,
  };
}

/** Default cover gradient for DB posts (brand blue → cyan). */
export const DB_POST_GRADIENT = 'from-gray-500 to-gray-800';

/**
 * Parse plain-string post content into sections for the blog-post TOC.
 * Blocks are split on blank lines; lines starting with "## " open a new
 * section heading, everything else becomes a paragraph of that section.
 */
export function parseDbSections(content: string): BlogSection[] {
  const sections: BlogSection[] = [];
  let current: BlogSection | null = null;

  for (const rawBlock of content.split(/\n{2,}/)) {
    const block = rawBlock.trim();
    if (!block) continue;
    if (block.startsWith('## ')) {
      current = { heading: block.slice(3).trim(), paragraphs: [] };
      sections.push(current);
    } else {
      if (!current) {
        current = { heading: '', paragraphs: [] };
        sections.push(current);
      }
      current.paragraphs.push(block);
    }
  }

  return sections.filter((section) => section.heading || section.paragraphs.length > 0);
}

/** Fetch published posts from the public API (null when unavailable/empty). */
export async function fetchPublicDbPosts(slug?: string): Promise<DbPost[] | null> {
  try {
    const query = slug ? `?slug=${encodeURIComponent(slug)}` : '';
    const response = await fetch(`/api/public/posts${query}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { ok?: boolean; posts?: DbPost[] };
    if (!payload?.ok || !Array.isArray(payload.posts)) return null;
    return payload.posts;
  } catch {
    return null;
  }
}
