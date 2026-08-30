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
          'mb-3 rounded-2xl border px-6 transition-colors',
          dark
            ? 'border-white/10 bg-white/[0.03] data-[state=open]:border-[#FFB020]'
            : 'border-[#e6e5de] bg-white data-[state=open]:border-[#FF4D00]'
        )}
      >
        <AccordionTrigger
          className={cn(
            'py-5 text-left font-display text-xl font-semibold tracking-tight hover:no-underline md:text-2xl',
            '[&[data-state=open]>svg]:text-[#FF4D00]',
            dark ? 'text-white hover:text-white' : 'text-[#161613] hover:text-[#161613]'
          )}
        >
          {faq.question}
        </AccordionTrigger>
        <AccordionContent
          className={cn(
            'text-base leading-relaxed md:text-lg',
            dark ? 'text-white/60' : 'text-[#6f6e66]'
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
          <h2 className={cn('font-display text-4xl font-bold tracking-[-0.025em] sm:text-5xl', dark ? 'text-white' : 'text-[#161613]')}>{title}</h2>
          {description ? (
            <p className={cn('mt-4 text-lg text-[#6f6e66]', dark && 'text-white/60')}>{description}</p>
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
