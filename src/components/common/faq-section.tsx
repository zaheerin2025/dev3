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
}

/** Accessible FAQ accordion with FAQPage schema emitted automatically. */
export function FAQSection({ faqs, title = 'Frequently Asked Questions', description, dark, className }: FAQSectionProps) {
  const [openItem, setOpenItem] = React.useState<string | undefined>(undefined);

  return (
    <div className={cn('w-full', className)}>
      <JsonLd data={buildFaqPageSchema(faqs)} />
      {title ? (
        <Reveal className="mb-8 text-center">
          <h2 className={cn('text-2xl font-bold sm:text-3xl', dark ? 'text-white' : 'text-foreground')}>{title}</h2>
          {description ? (
            <p className={cn('mt-3 text-muted-foreground', dark && 'text-emerald-100/70')}>{description}</p>
          ) : null}
        </Reveal>
      ) : null}
      <Reveal className="mx-auto max-w-3xl">
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={(value) => {
            setOpenItem(value);
            if (value) trackEvent('faq_open', { question: faqs.find((f) => f.question === value)?.question ?? value });
          }}
        >
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={faq.question}>
              <AccordionTrigger className={cn('text-left text-base font-semibold', dark && 'text-emerald-50 hover:text-white hover:no-underline')}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className={cn('text-base leading-relaxed text-muted-foreground', dark && 'text-emerald-100/70')}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  );
}
