'use client';

import * as React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  HelpCircle,
  Loader2,
  MessageCircle,
  Pencil,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/components/common/link';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { services } from '@/data';
import { whatsappLink } from '@/lib/site';
import {
  NOT_SURE_SLUG,
  GENERIC_BUDGETS,
  GENERIC_TIMELINES,
  getQuoteConfig,
} from '@/data/quote-config';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

export interface QuoteBuilderProps {
  /** Lead source stored with the submission, e.g. "service:seo-services". */
  source?: string;
  /** Service (slug) preselected on load — service pages pass their slug
   *  and the wizard then STARTS AT STEP 2 (the service is already known). */
  defaultService?: string;
  /**
   * Kept for backward compatibility with existing pages — both variants
   * render the same 3-step wizard; "full" just adds the outer card chrome.
   */
  variant?: 'full' | 'inline';
  className?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', notes: '' };

type StepId = 1 | 2 | 3;

const STEP_META: Record<StepId, string> = {
  1: 'What you need',
  2: 'Quick details',
  3: 'Your details',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOTES_MAX = 800;

type Errors = { name?: string; email?: string };

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

/** Big tappable service card — step 1. Black when selected. */
function ServiceCard({
  selected,
  label,
  tagline,
  icon,
  dashed,
  onSelect,
}: {
  selected: boolean;
  label: string;
  tagline?: string;
  icon?: React.ReactNode;
  dashed?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group flex min-h-[44px] flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2',
        selected
          ? 'border-[#161613] bg-[#161613] text-white'
          : dashed
            ? 'border-dashed border-[#c9c8bd] bg-transparent text-[#161613] hover:border-[#161613]'
            : 'border-[#e6e5de] bg-white text-[#161613] hover:border-[#b3b2a8]'
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-lg',
            selected ? 'bg-white/15 text-white' : 'bg-[#f1f0ea] text-[#161613]'
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        {selected ? <Check className="size-4 shrink-0 text-[#FFD84D]" aria-hidden="true" /> : null}
      </span>
      <span className="font-display text-[15px] font-bold leading-tight">{label}</span>
      {tagline ? (
        <span className={cn('text-[13px] leading-snug', selected ? 'text-white/70' : 'text-[#6f6e66]')}>
          {tagline}
        </span>
      ) : null}
    </button>
  );
}

/** Round choice chip — one answer, one tap. */
function Chip({ selected, label, onSelect }: { selected: boolean; label: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2',
        selected
          ? 'border-[#161613] bg-[#161613] text-white'
          : 'border-[#e6e5de] bg-white text-[#161613] hover:border-[#b3b2a8]'
      )}
    >
      {label}
      {selected ? <Check className="size-3.5 text-[#FFD84D]" aria-hidden="true" /> : null}
    </button>
  );
}

/** One question = one chip group (fieldset + radio chips). */
function ChipGroup({
  legend,
  hint,
  optional,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  optional?: boolean;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 flex flex-wrap items-center gap-2 font-display text-[15px] font-bold text-[#161613]">
        {legend}
        {optional ? (
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#6f6e66]">
            Optional
          </span>
        ) : null}
      </legend>
      {hint ? <p className="mb-3 text-sm leading-snug text-[#6f6e66]">{hint}</p> : <div className="mb-3" />}
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
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

/** Per-step question heading — focused automatically on step change. */
const StepHeading = React.forwardRef<HTMLHeadingElement, { title: string; hint: string }>(
  function StepHeading({ title, hint }, ref) {
    return (
      <div className="flex flex-col gap-1">
        <h3
          ref={ref}
          tabIndex={-1}
          className="font-display text-xl font-bold tracking-[-0.01em] text-[#161613] outline-none sm:text-2xl"
        >
          {title}
        </h3>
        <p className="text-[15px] leading-relaxed text-[#6f6e66]">{hint}</p>
      </div>
    );
  }
);

function SuccessPanel({ leadId, onReset }: { leadId: string | null; onReset: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-12"
      role="status"
      aria-live="polite"
    >
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
/*  QuoteBuilder — guided 3-step wizard                                */
/* ------------------------------------------------------------------ */

/**
 * The global quote-request flow — deliberately SIMPLE and DYNAMIC:
 *   Step 1  "What do you need?"      → one tap on a service card (auto-advances)
 *   Step 2  "A few quick details"    → chips ADAPT to the chosen service
 *                                      (type & scope from the per-service config,
 *                                      budget & timeline optional)
 *   Step 3  "Where should we send it?" → review picks, name + email, done.
 * One question per screen, big tap targets, ~60 seconds end to end.
 * No estimate math, no price badges — a fixed quote comes back by email.
 */
export function QuoteBuilder({
  source = 'contact',
  defaultService,
  variant = 'full',
  className,
}: QuoteBuilderProps) {
  const { toast } = useToast();
  const idPrefix = `qb-${source.replace(/[^a-z0-9]+/gi, '-')}`;

  const [step, setStep] = React.useState<StepId>(defaultService ? 2 : 1);
  const [serviceSlug, setServiceSlug] = React.useState(defaultService ?? NOT_SURE_SLUG);
  const [typeValue, setTypeValue] = React.useState('');
  const [sizeValue, setSizeValue] = React.useState('');
  const [budget, setBudget] = React.useState('');
  const [timeline, setTimeline] = React.useState('');
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [honeypot, setHoneypot] = React.useState('');
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [leadId, setLeadId] = React.useState<string | null>(null);

  const config = getQuoteConfig(serviceSlug);
  const selectedService = services.find((service) => service.slug === serviceSlug);
  const typeLabel = config?.types.find((type) => type.value === typeValue)?.label;
  const sizeLabel = config?.sizes.find((size) => size.value === sizeValue)?.label;

  /* ------------------------- interactions ------------------------- */

  // Auto-advance timer — cleared if the wizard unmounts mid-flight.
  const advanceTimer = React.useRef<number | null>(null);
  React.useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    []
  );

  // Move focus to the step question whenever the step changes (a11y),
  // skipping the very first paint so page load never steals focus.
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const pickService = (slug: string) => {
    setServiceSlug(slug);
    const nextConfig = getQuoteConfig(slug);
    setTypeValue(nextConfig?.types[0]?.value ?? '');
    setSizeValue(nextConfig?.sizes[0]?.value ?? '');
    // A short beat so the selected state is visible, then slide on.
    advanceTimer.current = window.setTimeout(() => setStep(2), 300);
  };

  const goBack = () => setStep(step === 3 ? 2 : 1);

  const setFormValue = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    const errorKey = key === 'name' ? 'name' : key === 'email' ? 'email' : null;
    if (errorKey) {
      setErrors((prev) => (prev[errorKey] ? { ...prev, [errorKey]: undefined } : prev));
    }
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const serviceName = selectedService?.name ?? 'Not sure yet / something else';
      const summary = [
        typeLabel,
        sizeLabel,
        budget ? `Budget: ${budget}` : '',
        timeline ? `Start: ${timeline}` : '',
      ]
        .filter(Boolean)
        .join(' · ');
      const message = [`${serviceName}${summary ? ` — ${summary}` : ''}`, form.notes.trim()]
        .filter(Boolean)
        .join('\n\n');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: serviceSlug === NOT_SURE_SLUG ? 'not-sure' : serviceSlug,
          budget,
          timeline,
          message,
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
    setServiceSlug(NOT_SURE_SLUG);
    setTypeValue('');
    setSizeValue('');
    setBudget('');
    setTimeline('');
    setStep(1);
  };

  /* --------------------------- styles ----------------------------- */

  const inputClass =
    'h-11 rounded-xl border-[#e6e5de] bg-white text-[#161613] placeholder:text-[#b3b2a8] focus-visible:border-[#FF4D00] focus-visible:ring-[#FF4D00]';

  /* ------------------------ progress header ----------------------- */

  const progressHeader = (
    <div className="mb-6 flex items-center gap-3">
      {step > 1 ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back one step"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e6e5de] bg-white text-[#161613] transition-colors hover:border-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold text-[#161613]">
            Step {step} of 3
            <span className="font-medium text-[#6f6e66]"> · {STEP_META[step]}</span>
          </p>
          <p className="hidden text-xs text-[#6f6e66] sm:block">Takes about a minute</p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efeee7]"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={step}
          aria-label="Quote form progress"
        >
          <div
            className="h-full rounded-full bg-[#FF4D00] transition-[width] duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  /* --------------------------- step 1 ----------------------------- */

  const stepOne = (
    <div key="s1" className="quote-step-in flex flex-col gap-5">
      <StepHeading
        ref={headingRef}
        title="What do you need?"
        hint="Pick one — we scope the rest together on a free call."
      />
      <div
        role="radiogroup"
        aria-label="Service needed"
        className={cn('grid gap-2.5 sm:grid-cols-2', variant === 'inline' && 'lg:grid-cols-3')}
      >
        {services.map((service) => (
          <ServiceCard
            key={service.slug}
            selected={serviceSlug === service.slug}
            onSelect={() => pickService(service.slug)}
            label={service.shortName}
            tagline={service.tagline}
            icon={<ServiceIconGlyph icon={service.icon} className="size-4" />}
          />
        ))}
        <ServiceCard
          dashed
          selected={serviceSlug === NOT_SURE_SLUG}
          onSelect={() => pickService(NOT_SURE_SLUG)}
          label="Not sure yet"
          tagline="Pick this and we'll scope it together."
          icon={<HelpCircle className="size-4" aria-hidden="true" />}
        />
      </div>
    </div>
  );

  /* --------------------------- step 2 ----------------------------- */

  const stepTwo = (
    <div key="s2" className="quote-step-in flex flex-col gap-6">
      <StepHeading
        ref={headingRef}
        title="A few quick details"
        hint={
          config
            ? 'Rough sizes are perfect — we confirm everything before quoting.'
            : 'No problem — answer what you can, we scope it together.'
        }
      />

      {/* Selected service + change shortcut */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#6f6e66]">For:</span>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#161613] px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2"
        >
          {selectedService?.shortName ?? 'Not sure yet'}
          <Pencil className="size-3" aria-hidden="true" />
          <span className="sr-only"> — change service</span>
        </button>
      </div>

      {config ? (
        <ChipGroup
          legend="Project type"
          options={config.types}
          value={typeValue}
          onChange={setTypeValue}
        />
      ) : null}
      {config ? (
        <ChipGroup
          legend="Project size"
          options={config.sizes}
          value={sizeValue}
          onChange={setSizeValue}
        />
      ) : null}
      <ChipGroup
        legend="Budget range"
        optional
        hint="A rough idea is enough — the quote stays fixed either way."
        options={GENERIC_BUDGETS.map((range) => ({ value: range, label: range }))}
        value={budget}
        onChange={setBudget}
      />
      <ChipGroup
        legend="Start timeline"
        optional
        options={GENERIC_TIMELINES.map((option) => ({ value: option, label: option }))}
        value={timeline}
        onChange={setTimeline}
      />

      <button
        type="button"
        onClick={() => setStep(3)}
        className="btn-primary-pill w-full sm:w-auto sm:self-start"
      >
        Continue
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  /* --------------------------- step 3 ----------------------------- */

  const reviewChips: { label: string; target: StepId }[] = [
    { label: selectedService?.shortName ?? 'Not sure yet', target: 1 },
    ...(typeLabel ? [{ label: typeLabel, target: 2 as StepId }] : []),
    ...(sizeLabel ? [{ label: sizeLabel, target: 2 as StepId }] : []),
    ...(budget ? [{ label: budget, target: 2 as StepId }] : []),
    ...(timeline ? [{ label: timeline, target: 2 as StepId }] : []),
  ];

  const stepThree = (
    <form
      key="s3"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Quote request form"
      className="quote-step-in flex flex-col gap-6"
    >
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

      <StepHeading
        ref={headingRef}
        title="Where should we send it?"
        hint="One business day, one fixed quote — no spam, ever."
      />

      {/* Review picks — tap any chip to jump back and edit */}
      <div className="rounded-2xl border border-[#e6e5de] bg-[#faf9f4] p-4">
        <p className="eyebrow">Your picks</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {reviewChips.map((chip, index) => (
            <button
              key={`${chip.label}-${index}`}
              type="button"
              onClick={() => setStep(chip.target)}
              aria-label={`Edit ${chip.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e5de] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#161613] transition-colors hover:border-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2"
            >
              {chip.label}
              <Pencil className="size-3 text-[#6f6e66]" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${idPrefix}-name`} label="Your name" required error={errors.name}>
          <Input
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) => setFormValue('name')(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
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

      <Field id={`${idPrefix}-notes`} label="Anything else?" optional>
        <Textarea
          id={`${idPrefix}-notes`}
          value={form.notes}
          onChange={(e) => setFormValue('notes')(e.target.value)}
          placeholder="Goals, links, deadlines, references — anything that helps us quote accurately…"
          rows={3}
          maxLength={NOTES_MAX}
          aria-describedby={`${idPrefix}-notes-hint`}
          className={cn(inputClass, 'h-auto min-h-[92px] py-3')}
        />
        <div id={`${idPrefix}-notes-hint`} className="flex items-center justify-between text-xs text-[#6f6e66]">
          <span>Optional — but details help us quote accurately.</span>
          <span
            className={cn('tabular-nums', form.notes.length >= NOTES_MAX - 40 && 'text-destructive')}
            aria-live="polite"
          >
            {form.notes.length}/{NOTES_MAX}
          </span>
        </div>
      </Field>

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

  /* --------------------------- render ----------------------------- */

  // `inner` swaps to the SuccessPanel when submitted — the wizard body
  // below only renders while the flow is active.
  const body = (
    <div className="flex flex-col">
      {progressHeader}
      {step === 1 ? stepOne : step === 2 ? stepTwo : stepThree}
    </div>
  );

  // Both variants share the same wizard. "full" adds the outer card
  // chrome; "inline" lets the parent supply it (contact page wraps this).
  const inner = (
    <div className="relative overflow-hidden rounded-[20px] bg-white" data-slot="quote-builder">
      {submitted ? (
        <SuccessPanel leadId={leadId} onReset={resetToForm} />
      ) : (
        <div className={cn('flex flex-col', variant === 'full' ? 'p-6 sm:p-8 lg:p-10' : 'p-6 sm:p-7')}>
          {/* Compact wizard intro */}
          <div className="mb-6 flex flex-col gap-1.5">
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FF4D00]" aria-hidden="true" />
              Free Quote
            </p>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[#161613] sm:text-[1.7rem]">
              Get a fixed quote in 3 quick steps
            </h2>
            <p className="text-[15px] leading-relaxed text-[#6f6e66]">
              One question at a time — the number we agree on is the number you pay.
            </p>
          </div>
          {body}
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
