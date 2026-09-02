import { db } from '@/lib/db';
import { blogPosts } from '@/data/blog-posts';

/** Format a static BlogPost object's sections into plain text markdown content for Post.content */
function formatPostContent(post: typeof blogPosts[number]): string {
  const parts: string[] = [];
  for (const section of post.sections) {
    if (section.heading) {
      parts.push(`## ${section.heading}`);
    }
    for (const paragraph of section.paragraphs) {
      parts.push(paragraph);
    }
    if (section.bullets && section.bullets.length > 0) {
      parts.push(section.bullets.map((b) => `- ${b}`).join('\n'));
    }
  }
  return parts.join('\n\n');
}

const DEFAULT_PORTFOLIO_ITEMS = [
  {
    title: 'Lumina Boutique — E-Commerce Platform',
    url: 'https://developers3.com/portfolio/lumina-boutique',
    description: 'High-converting Shopify e-commerce store with automated email flows, instant search, and localized checkout.',
    category: 'E-Commerce',
    imageUrl: '/images/portfolio/lumina-boutique.png',
    order: 1,
    published: true,
  },
  {
    title: 'Meridian Dental — Patient Portal & Booking',
    url: 'https://developers3.com/portfolio/meridian-dental',
    description: 'Custom Next.js clinic website with online booking, SMS appointment reminders, and patient intake forms.',
    category: 'Website',
    imageUrl: '/images/portfolio/meridian-dental.png',
    order: 2,
    published: true,
  },
  {
    title: 'PulseFit — Health & Fitness Tracker App',
    url: 'https://developers3.com/portfolio/pulsefit',
    description: 'Cross-platform Flutter mobile app featuring workout tracking, real-time metrics, and Apple Health / Google Fit sync.',
    category: 'Mobile App',
    imageUrl: '/images/portfolio/pulsefit.png',
    order: 3,
    published: true,
  },
  {
    title: 'Vantage Realty — Interactive Property Search',
    url: 'https://developers3.com/portfolio/vantage-realty',
    description: 'Real estate portal with map-based property search, virtual tours, and automated lead routing.',
    category: 'Website',
    imageUrl: '/images/portfolio/vantage-realty.png',
    order: 4,
    published: true,
  },
];

/**
 * Auto-seed initial blog posts and portfolio items into the database.
 * Uses upsert so it never fails on duplicate constraints.
 * Set `force: true` to seed missing items even if table is non-empty.
 */
export async function seedDefaultData(force = false): Promise<{ postsSeeded: number; portfoliosSeeded: number }> {
  let postsSeeded = 0;
  let portfoliosSeeded = 0;
  try {
    const postCount = await db.post.count().catch(() => 0);
    if (force || postCount === 0) {
      console.log('[seed] Seeding default blog posts into DB...');
      for (const p of blogPosts) {
        const authorName =
          p.authorId === 'alex-morgan'
            ? 'Alex Morgan'
            : p.authorId === 'priya-sharma'
            ? 'Priya Sharma'
            : 'Sofia Alvarez';
        const authorRole =
          p.authorId === 'alex-morgan'
            ? 'Lead Web Architect'
            : p.authorId === 'priya-sharma'
            ? 'Senior Full-Stack Engineer'
            : 'Head of E-commerce';

        const postData = {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          image: null,
          authorName,
          authorRole,
          content: formatPostContent(p),
          readTime: parseInt(p.readTime) || 5,
          published: true,
          createdAt: new Date(p.date),
        };

        await db.post.upsert({
          where: { slug: p.slug },
          update: {},
          create: postData,
        });
        postsSeeded += 1;
      }
      console.log('[seed] Blog posts seeded successfully.');
    }

    const portfolioCount = await db.portfolio.count().catch(() => 0);
    if (force || portfolioCount === 0) {
      console.log('[seed] Seeding default portfolio items into DB...');
      for (const item of DEFAULT_PORTFOLIO_ITEMS) {
        const existing = await db.portfolio.findFirst({ where: { url: item.url } }).catch(() => null);
        if (!existing) {
          await db.portfolio.create({ data: item });
          portfoliosSeeded += 1;
        }
      }
      console.log('[seed] Portfolio items seeded successfully.');
    }
  } catch (error) {
    console.error('[seed] Failed to seed default data:', error);
  }
  return { postsSeeded, portfoliosSeeded };
}
