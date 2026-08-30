'use client';

import * as React from 'react';
import { SearchX, Sparkle } from 'lucide-react';
import { Link } from '@/components/common/link';
import { JsonLd } from '@/components/common/json-ld';
import { ToolShell } from '@/components/tools/tool-shell';
import { getToolDefinition, getDefinitionsByMeta } from '@/components/tools/tool-renderer';
import { getRelatedTools } from '@/data/tools/registry';
import { getCategory } from '@/data/tools/types';
import { site } from '@/lib/site';

/** /#/tools/<slug> — one tool page: interactive tool + unique SEO copy. */
export function ToolView({ slug }: { slug: string }) {
  const tool = getToolDefinition(slug);

  const jsonLd = React.useMemo(() => {
    if (!tool) return null;
    const category = getCategory(tool.meta.category);
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: tool.meta.name,
        url: `${site.url}/tools/${tool.meta.slug}`,
        description: tool.meta.seoDescription,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any (web browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${site.url}/#organization` },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: `${site.url}/tools` },
          { '@type': 'ListItem', position: 3, name: category.label, item: `${site.url}/tools?category=${category.id}` },
          { '@type': 'ListItem', position: 4, name: tool.meta.name, item: `${site.url}/tools/${tool.meta.slug}` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.doc.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ];
  }, [tool]);

  if (!tool) {
    return (
      <section className="section-cream flex min-h-[60vh] items-center py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-500 text-white shadow-lg">
            <SearchX className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold text-[#0a0a0a]">Tool not found</h1>
          <p className="mt-3 text-[#4b5563]">
            That tool does not exist (yet). Browse the library — there are 100 more to pick from.
          </p>
          <Link href="/tools" className="btn-primary-pill mt-7">
            <Sparkle className="size-4" />
            Browse all tools
          </Link>
        </div>
      </section>
    );
  }

  const related = getDefinitionsByMeta(getRelatedTools(tool.meta.slug, 4));

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ToolShell tool={tool} related={related} />
    </>
  );
}
