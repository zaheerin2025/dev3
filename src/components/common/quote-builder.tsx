'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/components/common/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { services } from '@/data';
import { whatsappLink } from '@/lib/site';
import { NOT_SURE_SLUG, GENERIC_BUDGETS, GENERIC_TIMELINES } from '@/data/quote-config';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

export interface QuoteBuilderProps {
  /** Lead source stored with the submission, e.g. "service:seo-services". */
  source?: string;
  /** Service (slug) preselected on load — service pages pass their slug. */
  defaultService?: string;
  /**
   * Kept for backward compatibility with existing pages — both variants
   * now render the same simple single-column form; "full" just adds the
   * outer card chrome.
   */
  variant?: 'full' | 'inline';
  className?: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
};

type Errors = Partial<Record<'name' | 'email' | 'notes', string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOTES_MAX = 800;
const NOTES_MIN = 10;

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

/** Round choice pill — black when selected, hairline when not. */
function ServicePill({
  selected,
  label,
  icon,
  onSelect,
  idPrefix,
  value,
}: {
  selected: boolean;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  idPrefix: string;
  value: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      id={`${idPrefix}-${value}`}
      onClick={onSelect}
      className={cn(
        'group flex min-h-[44px] w-full items-center gap-2.5 rounded-full border-2 px-4 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2',
        selected
          ? 'border-[#161613] bg-[#161613] text-white'
          : 'border-[#e6e5de] bg-white text-[#161613] hover:border-[#b3b2a8]'
      )}
    >
      {icon ? (
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-lg',
            selected ? 'bg-white/15 text-white' : 'bg-[#f1f0ea] text-[#161613]'
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 truncate text-sm font-semibold leading-snug">{label}</span>
      {selected ? (
        <CheckCircle2 className="ml-auto size-4 shrink-0 text-[#FFD84D]" aria-hidden="true" />
      ) : null}
    </button>
  );
}

/** Labeled form field with inline validation message. */
function Field({
  id,
  label,
  required,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[15px] font-bold text-[#161613]">
        {label}
        {required ? (
          <span className="ml-0.5 text-[#FF4D00]" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="ml-1 text-sm font-normal text-[#6f6e66]">(optional)</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Simple section heading inside the form. */
function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-[#161613]">{title}</h3>
        {hint ? <p className="text-sm leading-relaxed text-[#6f6e66]">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SuccessPanel({ leadId, onReset }: { leadId: string | null; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-12" role="status" aria-live="polite">
      <span className="flex rounded-full bg-[#E3F5EC] p-3" aria-hidden="true">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
          <CheckCircle2 className="h-14 w-14 text-[#0E8A59]" />
        </span>
      </span>
      <h3 className="font-display text-3xl font-bold text-[#161613]">Quote request received!</h3>
      <p className="max-w-md text-base leading-relaxed text-[#6f6e66] sm:text-lg">
        We&rsquo;ll review your project details and reply within one business day with a fixed,
        itemized quote — the number we agree on is the number you pay.
      </p>
      {leadId ? (
        <p className="text-sm text-[#6f6e66]">
          Reference: <span className="font-mono font-semibold text-[#161613]">{leadId}</span>
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {whatsappLink() ? (
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { location: 'quote_success' })}
            className="btn-secondary-pill-sm"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        ) : null}
        <Button variant="ghost" onClick={onReset}>
          Send another request
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QuoteBuilder — one simple, friendly, dynamic form                  */
/* ------------------------------------------------------------------ */

/**
 * The global quote-request form — deliberately SIMPLE:
 * 1. What do you need?  (service pills — the form adapts to the choice)
 * 2. Budget & timeline  (optional selects — a rough idea is enough)
 * 3. Your details       (name, email, phone and a short project note)
 * No estimate math, no price badges, no dark rails — just three easy
 * sections and a fixed quote back within one business day.
 */
export function QuoteBuilder({
  source = 'contact',
  defaultService,
  variant = 'full',
  className,
}: QuoteBuilderProps) {
  const { toast } = useToast();
  const idPrefix = `qb-${source.replace(/[^a-z0-9]+/gi, '-')}`;

  const [serviceSlug, setServiceSlug] = React.useState(defaultService ?? NOT_SURE_SLUG);
  const [budget, setBudget] = React.useState('');
  const [timeline, setTimeline] = React.useState('');
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [honeypot, setHoneypot] = React.useState('');
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [leadId, setLeadId] = React.useState<string | null>(null);

  const selectedService = services.find((service) => service.slug === serviceSlug);

  /* ------------------------- interactions ------------------------- */

  const pickService = (slug: string) => {
    setServiceSlug(slug);
    setErrors({});
  };

  const setFormValue = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    const errorKey = key === 'firstName' ? 'name' : key === 'notes' ? 'notes' : key === 'email' ? 'email' : null;
    if (errorKey) {
      setErrors((prev) => (prev[errorKey] ? { ...prev, [errorKey]: undefined } : prev));
    }
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.firstName.trim().length < 2) next.name = 'Please enter your first name.';
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.notes.trim().length < NOTES_MIN) {
      next.notes = 'Please add a few details about what you need (at least 10 characters).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ');
      const serviceName = selectedService?.name ?? 'Not sure yet / something else';
      const message = form.notes.trim();

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: serviceSlug === NOT_SURE_SLUG ? 'not-sure' : serviceSlug,
          budget,
          timeline,
          message: `${serviceName}\n\n${message}`,
          source,
          website: honeypot,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; id?: string; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Something went wrong.');
      }
      trackEvent('generate_lead', { source, service: serviceSlug });
      setLeadId(payload.id ?? null);
      setSubmitted(true);
      toast({
        title: 'Quote request received!',
        description: 'Thanks — your fixed, itemized quote arrives within one business day.',
      });
    } catch (error) {
      toast({
        title: 'Could not send your request',
        description: error instanceof Error ? error.message : 'Please try again or email us directly.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetToForm = () => {
    setSubmitted(false);
    setLeadId(null);
    setErrors({});
    setForm(EMPTY_FORM);
  };

  /* --------------------------- styles ----------------------------- */

  const inputClass =
    'h-11 rounded-xl border-[#e6e5de] bg-white text-[#161613] placeholder:text-[#b3b2a8] focus-visible:border-[#FF4D00] focus-visible:ring-[#FF4D00]';

  /* ---------------------------- render ---------------------------- */

  const formBody = submitted ? (
    <SuccessPanel leadId={leadId} onReset={resetToForm} />
  ) : (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8" aria-label="Quote request form">
      {/* Honeypot — invisible to humans, catnip for bots */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <FormSection
        title="What do you need?"
        hint={
          selectedService
            ? selectedService.tagline
            : 'Not sure yet? Pick this and we will scope it together on a free call.'
        }
      >
        <div role="radiogroup" aria-label="Service needed" className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <ServicePill
              key={service.slug}
              value={service.slug}
              idPrefix={`${idPrefix}-svc`}
              selected={serviceSlug === service.slug}
              onSelect={() => pickService(service.slug)}
              label={service.shortName}
              icon={<ServiceIconGlyph icon={service.icon} className="size-4" />}
            />
          ))}
          <ServicePill
            value={NOT_SURE_SLUG}
            idPrefix={`${idPrefix}-svc`}
            selected={serviceSlug === NOT_SURE_SLUG}
            onSelect={() => pickService(NOT_SURE_SLUG)}
            label="Not sure yet"
          />
        </div>
      </FormSection>

      <FormSection title="Budget & timeline" hint="A rough idea is enough — we scope the details together.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${idPrefix}-budget`} label="Budget" optional>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger id={`${idPrefix}-budget`} className={cn(inputClass, 'w-full')} aria-label="Budget range">
                <SelectValue placeholder="Select a range" />
              </SelectTrigger>
              <SelectContent>
                {GENERIC_BUDGETS.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id={`${idPrefix}-timeline`} label="Timeline" optional>
            <Select value={timeline} onValueChange={setTimeline}>
              <SelectTrigger id={`${idPrefix}-timeline`} className={cn(inputClass, 'w-full')} aria-label="Project timeline">
                <SelectValue placeholder="When do you want to start?" />
              </SelectTrigger>
              <SelectContent>
                {GENERIC_TIMELINES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Your details" hint="One business day, one fixed quote — no spam, ever.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${idPrefix}-first`} label="First name" required error={errors.name}>
            <Input
              id={`${idPrefix}-first`}
              value={form.firstName}
              onChange={(e) => setFormValue('firstName')(e.target.value)}
              placeholder="Jane"
              autoComplete="given-name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${idPrefix}-first-error` : undefined}
              className={inputClass}
            />
          </Field>
          <Field id={`${idPrefix}-last`} label="Last name" optional>
            <Input
              id={`${idPrefix}-last`}
              value={form.lastName}
              onChange={(e) => setFormValue('lastName')(e.target.value)}
              placeholder="Smith"
              autoComplete="family-name"
              className={inputClass}
            />
          </Field>
          <Field id={`${idPrefix}-email`} label="Email" required error={errors.email}>
            <Input
              id={`${idPrefix}-email`}
              type="email"
              value={form.email}
              onChange={(e) => setFormValue('email')(e.target.value)}
              placeholder="jane@company.com"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
              className={inputClass}
            />
          </Field>
          <Field id={`${idPrefix}-phone`} label="Phone / WhatsApp" optional>
            <Input
              id={`${idPrefix}-phone`}
              type="tel"
              value={form.phone}
              onChange={(e) => setFormValue('phone')(e.target.value)}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              className={inputClass}
            />
          </Field>
        </div>
        <Field id={`${idPrefix}-notes`} label="Tell us about your project" required error={errors.notes}>
          <Textarea
            id={`${idPrefix}-notes`}
            value={form.notes}
            onChange={(e) => setFormValue('notes')(e.target.value)}
            placeholder="Goals, links, deadlines, references — anything that helps us quote accurately…"
            rows={4}
            maxLength={NOTES_MAX}
            required
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? `${idPrefix}-notes-error` : `${idPrefix}-notes-hint`}
            className={cn(inputClass, 'h-auto min-h-[110px] py-3')}
          />
          <div id={`${idPrefix}-notes-hint`} className="flex items-center justify-between text-xs text-[#6f6e66]">
            <span>Goals, scope, links all help.</span>
            <span className={cn('tabular-nums', form.notes.length >= NOTES_MAX - 40 && 'text-destructive')} aria-live="polite">
              {form.notes.length}/{NOTES_MAX}
            </span>
          </div>
        </Field>
      </FormSection>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary-pill w-full disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Get My Free Quote
            </>
          )}
        </button>
        <p className="text-sm leading-relaxed text-[#6f6e66]">
          By submitting, you agree to our{' '}
          <Link
            href="/privacy-policy"
            className="font-medium text-[#161613] underline decoration-[#e6e5de] underline-offset-2 transition-colors hover:text-[#FF4D00]"
          >
            Privacy Policy
          </Link>
          . Your quote is fixed and itemized before any work starts.
        </p>
      </div>
    </form>
  );

  /* --------------------------- variants --------------------------- */

  // Both variants share the same simple single-column form. "full" adds
  // the outer card chrome; "inline" lets the parent supply it (contact
  // page wraps this in its own card).
  const inner = (
    <div className="relative overflow-hidden rounded-[20px] bg-white" data-slot="quote-builder">
      {submitted ? (
        <SuccessPanel leadId={leadId} onReset={resetToForm} />
      ) : (
        <div className={cn('flex flex-col', variant === 'full' ? 'p-6 sm:p-8 lg:p-10' : 'p-6 sm:p-7')}>
          {/* Compact form intro */}
          <div className="mb-7 flex flex-col gap-1.5">
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
              Free Quote
            </p>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[#161613] sm:text-[1.7rem]">
              Tell us what you need
            </h2>
            <p className="text-[15px] leading-relaxed text-[#6f6e66]">
              Three quick sections — we reply with a fixed, itemized quote within one business day.
            </p>
          </div>
          {formBody}
        </div>
      )}
    </div>
  );

  if (variant === 'inline') {
    return <div className={className}>{inner}</div>;
  }

  return (
    <div className={cn('card-soft rounded-[24px]', className)} data-slot="quote-builder-wrap">
      {inner}
    </div>
  );
}
