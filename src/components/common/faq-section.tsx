'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { FAQ } from '@/lib/types';
import { JsonLd } from './json-ld';
import { buildFaqPageSchema } from '@/lib/schema';
import { trackEvent } from '@/lib/analytics';
import { Reveal } from './reveal';

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  description?: string;
  dark?: boolean;
  className?: string;
  /** Optional two-column desktop layout (collapses to one column below lg). */
  columns?: 1 | 2;
}

/** Accessible FAQ accordion (card-style items) with FAQPage schema emitted automatically. */
export function FAQSection({ faqs, title = 'Frequently Asked Questions', description, dark, className, columns = 1 }: FAQSectionProps) {
  const [openItem, setOpenItem] = React.useState<string | undefined>(undefined);

  const handleValueChange = (value: string) => {
    setOpenItem(value);
    if (value) trackEvent('faq_open', { question: faqs.find((f) => f.question === value)?.question ?? value });
  };

  const renderItems = (items: FAQ[]) =>
    items.map((faq, index) => (
      <AccordionItem
        key={index}
        value={faq.question}
        className={cn(
          'mb-3 rounded-2xl border px-5 transition-colors',
          dark
            ? 'border-purple-400/15 bg-white/[0.04] data-[state=open]:border-purple-400/30'
            : 'border-purple-900/10 bg-white shadow-[0_1px_2px_rgb(5_19_14/0.04)] data-[state=open]:border-purple-500/35 data-[state=open]:shadow-[0_8px_24px_-14px_rgb(5_150_105/0.4)]'
        )}
      >
        <AccordionTrigger
          className={cn(
            'text-left text-base font-semibold hover:no-underline',
            dark ? 'text-purple-50 hover:text-white' : 'text-foreground hover:text-purple-800'
          )}
        >
          {faq.question}
        </AccordionTrigger>
        <AccordionContent
          className={cn(
            'text-[15px] leading-relaxed',
            dark ? 'text-purple-100/70' : 'text-muted-foreground'
          )}
        >
          {faq.answer}
        </AccordionContent>
      </AccordionItem>
    ));

  const groups =
    columns === 2 && faqs.length > 1
      ? [faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))]
      : null;

  return (
    <div className={cn('w-full', className)}>
      <JsonLd data={buildFaqPageSchema(faqs)} />
      {title ? (
        <Reveal className="mb-10 text-center">
          <h2 className={cn('text-2xl font-bold sm:text-3xl', dark ? 'text-white' : 'text-foreground')}>{title}</h2>
          {description ? (
            <p className={cn('mt-3 text-muted-foreground', dark && 'text-purple-100/70')}>{description}</p>
          ) : null}
        </Reveal>
      ) : null}
      <Reveal className={cn('mx-auto', groups ? 'max-w-5xl' : 'max-w-3xl')}>
        {groups ? (
          <div className="grid items-start gap-x-6 lg:grid-cols-2">
            {groups.map((group, groupIndex) => (
              <Accordion
                key={groupIndex}
                type="single"
                collapsible
                value={openItem}
                onValueChange={handleValueChange}
              >
                {renderItems(group)}
              </Accordion>
            ))}
          </div>
        ) : (
          <Accordion type="single" collapsible value={openItem} onValueChange={handleValueChange}>
            {renderItems(faqs)}
          </Accordion>
        )}
      </Reveal>
    </div>
  );
}
