// Seeds the five live client builds into the Portfolio table.
// Idempotent: matches on URL, so re-running updates instead of duplicating.
// Run: bun scripts/seed-portfolios.ts

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const ITEMS = [
  {
    title: "Kamylla's Fresh Clean",
    url: 'https://kamylla-cleaning.netlify.app/',
    description:
      'House-cleaning company site serving Ridgefield, CT and Pound Ridge, NY — service pages, service-area sections, review highlights and an estimate-request funnel that feeds straight into phone calls.',
    category: 'Home Services',
    imageUrl: '/portfolio/kamylla-cleaning.webp',
    order: 1,
  },
  {
    title: 'VA Home Cleaners',
    url: 'https://zaheerin2025.github.io/vahomes/',
    description:
      'Residential and commercial cleaning company website with service breakdowns, trust signals and quote-request paths built to convert visitors into booked jobs.',
    category: 'Home Services',
    imageUrl: '/portfolio/va-homes.webp',
    order: 2,
  },
  {
    title: 'Real Estate 24/7',
    url: 'https://realestate247.netlify.app/',
    description:
      'Off-market property deal-sourcing site with a VIP buyer-list funnel, market coverage sections and deal-teaser cards — built for investor lead capture across DC, MD and VA.',
    category: 'Real Estate',
    imageUrl: '/portfolio/realestate-247.webp',
    order: 3,
  },
  {
    title: 'Chartwell Cleaning & Facilities',
    url: 'https://zaheerahmed2025.github.io/chartwell/',
    description:
      'Premium London cleaning and facilities-management company site — corporate service pages, compliance and coverage details, and a polished enquiry flow for commercial clients.',
    category: 'Home Services',
    imageUrl: '/portfolio/chartwell.webp',
    order: 4,
  },
  {
    title: 'Blackhawk Security Services',
    url: 'https://zaheerin2025.github.io/blackhawk/',
    description:
      'Security services and systems provider website covering manned guarding, installations and monitoring — structured service pages with quote requests for commercial and residential clients.',
    category: 'Security',
    imageUrl: '/portfolio/blackhawk.webp',
    order: 5,
  },
] as const;

async function main() {
  for (const item of ITEMS) {
    const existing = await db.portfolio.findFirst({ where: { url: item.url } });
    if (existing) {
      await db.portfolio.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          description: item.description,
          category: item.category,
          imageUrl: item.imageUrl,
          order: item.order,
          published: true,
        },
      });
      console.log(`updated: ${item.title}`);
    } else {
      await db.portfolio.create({ data: { ...item, published: true } });
      console.log(`created: ${item.title}`);
    }
  }
  const total = await db.portfolio.count();
  console.log(`Portfolio rows: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
