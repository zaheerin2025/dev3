'use client';

import * as React from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Plus,
  Send,
  Sparkles,
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
import {
  computeEstimate,
  describeSelection,
  estimateRangeLabel,
  GENERIC_BUDGETS,
  GENERIC_TIMELINES,
  getQuoteConfig,
  getPaceOptions,
  NOT_SURE_SLUG,
  serializeSelection,
  type QuoteAddon,
  type QuoteChoice,
  type ServiceQuoteConfig,
} from '@/data/quote-config';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

export interface QuoteBuilderProps {
  /** Lead source stored with the submission, e.g. "service:seo-services". */
  source?: string;
  /** Service (slug) preselected on load — service pages pass their slug. */
  defaultService?: string;
  /**
   * full  — split card with a sticky dark estimate rail (service/pricing pages).
   * inline— single-column card with a compact estimate banner (contact page).
   */
  variant?: 'full' | 'inline';
  className?: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  notes: '',
};

type Errors = Partial<Record<'name' | 'email' | 'budget' | 'notes', string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOTES_MAX = 800;
const NOTES_MIN_WHEN_REQUIRED = 10;

/** Selection defaults derived from a config (first option of each group). */
function defaultsFor(config: ServiceQuoteConfig | null) {
  const paceOptions = getPaceOptions(config);
  return {
    type: config?.types[0]?.value ?? '',
    size: config?.sizes[0]?.value ?? '',
    pace: paceOptions[0]?.value ?? 'standard',
  };
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function PillChoice({
  selected,
  label,
  hint,
  badge,
  icon,
  onSelect,
  idPrefix,
  value,
  name,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  badge?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  idPrefix: string;
  value: string;
  name: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      name={name}
      id={`${idPrefix}-${value}`}
      onClick={onSelect}
      className={cn(
        'group relative flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border-2 px-4 py-2 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2',
        selected
          ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-[0_8px_20px_-10px_rgb(10_10_10/0.6)]'
          : 'border-gray-200 bg-white text-[#0a0a0a] hover:-translate-y-0.5 hover:border-pink-400'
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors',
              selected ? 'bg-white/15 text-white' : 'bg-pink-50 text-pink-600'
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold leading-snug">{label}</span>
          {hint ? (
            <span
              className={cn(
                'block text-[11px] font-medium leading-tight',
                selected ? 'text-white/60' : 'text-muted-foreground'
              )}
            >
              {hint}
            </span>
          ) : null}
        </span>
      </span>
      {badge ? (
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
            selected ? 'bg-white/15 text-white' : 'bg-pink-50 text-pink-700'
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function ChoiceGroup({
  step,
  icon: Icon,
  title,
  hint,
  children,
}: {
  step: string;
  icon: typeof Layers;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-pink-500 text-white shadow-[0_8px_18px_-8px_rgb(236_72_153/0.5)]" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-[#0a0a0a]">
            <span className="mr-2 text-xs font-bold uppercase tracking-[0.18em] text-pink-600" aria-hidden="true">
              {step}
            </span>
            {title}
          </h3>
          {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function AddonChip({
  addon,
  selected,
  onToggle,
  idPrefix,
}: {
  addon: QuoteAddon;
  selected: boolean;
  onToggle: () => void;
  idPrefix: string;
}) {
  const priceLabel = `+$${addon.price.toLocaleString('en-US')}${addon.monthly ? '/mo' : ''}`;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      id={`${idPrefix}-${addon.value}`}
      onClick={onToggle}
      className={cn(
        'flex min-h-[44px] items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2',
        selected
          ? 'border-pink-600 bg-pink-600 text-white shadow-[0_8px_20px_-10px_rgb(236_72_153/0.7)]'
          : 'border-gray-200 bg-white text-[#0a0a0a] hover:-translate-y-0.5 hover:border-pink-400'
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-white bg-white text-pink-600' : 'border-gray-300 text-transparent'
        )}
        aria-hidden="true"
      >
        <CheckCircle2 className="size-3" strokeWidth={3} />
      </span>
      <span className="min-w-0 truncate">{addon.label}</span>
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
          selected ? 'bg-white/20 text-white' : 'bg-pink-50 text-pink-700'
        )}
      >
        {priceLabel}
      </span>
    </button>
  );
}

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
      <Label htmlFor={id} className="text-sm font-bold text-[#0a0a0a]">
        {label}
        {required ? (
          <span className="ml-0.5 text-pink-600" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SuccessPanel({ leadId, onReset }: { leadId: string | null; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-12" role="status" aria-live="polite">
      <span className="gradient-frame flex rounded-full p-3" aria-hidden="true">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
          <CheckCircle2 className="h-14 w-14 text-pink-600" />
        </span>
      </span>
      <h3 className="font-display text-2xl font-bold text-[#0a0a0a]">Quote request received!</h3>
      <p className="max-w-md text-sm leading-relaxed text-[#4b5563] sm:text-base">
        We&rsquo;ll review your configuration and reply within one business day with a fixed,
        itemized quote — the number we agree on is the number you pay.
      </p>
      {leadId ? (
        <p className="text-xs text-muted-foreground">
          Reference: <span className="font-mono font-semibold text-pink-700">{leadId}</span>
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
          Build another quote
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Estimate rail (full variant) & banner (inline variant)             */
/* ------------------------------------------------------------------ */

function EstimateContent({ estimate, compact }: { estimate: { low: number; high: number; suffix: string; caption: string; lines: { label: string; value: string; tone: string }[] } | null; compact?: boolean }) {
  if (!estimate) {
    return (
      <div className={cn('flex flex-col gap-2', compact && 'gap-1')}>
        <p className={cn('font-display font-extrabold tracking-tight', compact ? 'text-2xl text-white' : 'text-3xl text-white')}>
          Custom quote
        </p>
        <p className={cn('leading-relaxed', compact ? 'text-xs text-white/60' : 'text-sm text-white/60')}>
          Pick a service to see a live estimate — or tell us what you need and we&rsquo;ll scope it
          with you on a free call.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className={cn('text-gradient font-display font-extrabold tracking-tight', compact ? 'text-2xl sm:text-3xl' : 'text-4xl')}>
        ${estimate.low.toLocaleString('en-US')} – ${estimate.high.toLocaleString('en-US')}
        <span className="text-lg font-bold">{estimate.suffix}</span>
      </p>
      <p className={cn('font-semibold uppercase tracking-[0.14em]', compact ? 'text-[10px] text-white/50' : 'text-xs text-white/50')}>
        {estimate.caption} · guidance range
      </p>
      {!compact ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {estimate.lines.map((line) => (
            <li key={line.label} className="flex items-center justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate text-white/60">{line.label}</span>
              <span
                className={cn(
                  'shrink-0 font-mono font-semibold tabular-nums',
                  line.tone === 'base' && 'text-white',
                  line.tone === 'up' && 'text-emerald-300',
                  line.tone === 'down' && 'text-pink-300',
                  line.tone === 'neutral' && 'text-white/80'
                )}
              >
                {line.value}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QuoteBuilder                                                       */
/* ------------------------------------------------------------------ */

/**
 * The global instant-quote experience.
 * - DYNAMIC: every service drives its own project types, scope sizes and
 *   add-ons from src/data/quote-config.ts — the form reshapes per service.
 * - AUTOMATED: a live estimate range recalculates on every selection.
 * - COHESIVE: one component renders the quote section on every service page,
 *   the pricing page, and the contact page (inline variant).
 */
export function QuoteBuilder({
  source = 'contact',
  defaultService,
  variant = 'full',
  className,
}: QuoteBuilderProps) {
  const { toast } = useToast();
  const inline = variant === 'inline';
  const idPrefix = `qb-${source.replace(/[^a-z0-9]+/gi, '-')}`;

  const [serviceSlug, setServiceSlug] = React.useState(defaultService ?? NOT_SURE_SLUG);
  const [selection, setSelection] = React.useState(() => defaultsFor(getQuoteConfig(defaultService ?? NOT_SURE_SLUG)));
  const [pickedAddons, setPickedAddons] = React.useState<string[]>([]);
  const [genericBudget, setGenericBudget] = React.useState('');
  const [genericTimeline, setGenericTimeline] = React.useState('');
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [honeypot, setHoneypot] = React.useState('');
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [leadId, setLeadId] = React.useState<string | null>(null);

  const config = getQuoteConfig(serviceSlug);
  const paceOptions = getPaceOptions(config);
  const selectedService = services.find((service) => service.slug === serviceSlug);
  const serviceName = selectedService?.name ?? 'Not sure yet / something else';
  const estimate = config
    ? computeEstimate(config, { ...selection, addons: pickedAddons })
    : null;

  /* ------------------------- interactions ------------------------- */

  const pickService = (slug: string) => {
    setServiceSlug(slug);
    setSelection(defaultsFor(getQuoteConfig(slug)));
    setPickedAddons([]);
    setGenericBudget('');
    setGenericTimeline('');
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
    if (!config && !genericBudget) next.budget = 'Please pick a budget range.';
    if ((!config || !estimate) && form.notes.trim().length < NOTES_MIN_WHEN_REQUIRED) {
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

      const summaryLines = describeSelection(serviceName, config, { ...selection, addons: pickedAddons }, estimate);
      const message = [
        form.company.trim() ? `Company: ${form.company.trim()}` : null,
        '',
        '— Quote configuration —',
        ...summaryLines,
        '',
        form.notes.trim() ? `Notes: ${form.notes.trim()}` : 'Notes: (none added)',
      ]
        .filter((line) => line !== null)
        .join('\n');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: form.email,
          phone: form.phone,
          service: serviceSlug === NOT_SURE_SLUG ? 'not-sure' : serviceSlug,
          budget: estimate ? estimateRangeLabel(estimate) : genericBudget,
          timeline: config ? paceOptions.find((p) => p.value === selection.pace)?.label ?? '' : genericTimeline,
          message,
          estimate: estimate ? `${estimateRangeLabel(estimate)} ${estimate.caption}` : '',
          quoteConfig: serializeSelection(serviceName, config, { ...selection, addons: pickedAddons }, estimate),
          source,
          website: honeypot,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; id?: string; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Something went wrong.');
      }
      trackEvent('generate_lead', {
        source,
        service: serviceSlug,
        estimate: estimate ? `${estimate.low}-${estimate.high}` : 'custom',
        addons: pickedAddons.length,
      });
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
    'h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-pink-500 focus-visible:ring-pink-500';

  /* -------------------------- sub-blocks -------------------------- */

  const servicePicker = (
    <ChoiceGroup step="Step 1" icon={Sparkles} title="What do you need?" hint="Pick a service — the quote builder adapts to it instantly.">
      <div role="radiogroup" aria-label="Service needed" className="grid gap-2 sm:grid-cols-2">
        {services.map((service) => (
          <PillChoice
            key={service.slug}
            name={`service-${idPrefix}`}
            value={service.slug}
            idPrefix={`${idPrefix}-svc`}
            selected={serviceSlug === service.slug}
            onSelect={() => pickService(service.slug)}
            label={service.shortName}
            icon={<ServiceIconGlyph icon={service.icon} className="size-4" />}
          />
        ))}
        <PillChoice
          name={`service-${idPrefix}`}
          value={NOT_SURE_SLUG}
          idPrefix={`${idPrefix}-svc`}
          selected={serviceSlug === NOT_SURE_SLUG}
          onSelect={() => pickService(NOT_SURE_SLUG)}
          label="Not sure yet"
          hint="Scope it with us on a free call"
        />
      </div>
    </ChoiceGroup>
  );

  const shapeProject = config ? (
    <div className="flex flex-col gap-6">
      <ChoiceGroup step="Step 2" icon={Package} title="Project type">
        <div role="radiogroup" aria-label="Project type" className="grid gap-2 sm:grid-cols-2">
          {config.types.map((type) => (
            <PillChoice
              key={type.value}
              name={`type-${idPrefix}`}
              value={type.value}
              idPrefix={`${idPrefix}-type`}
              selected={selection.type === type.value}
              onSelect={() => setSelection((prev) => ({ ...prev, type: type.value }))}
              label={type.label}
              hint={type.hint}
              badge={
                type.delta
                  ? `${type.delta > 0 ? '+' : '−'}$${Math.abs(type.delta).toLocaleString('en-US')}`
                  : undefined
              }
            />
          ))}
        </div>
      </ChoiceGroup>

      <ChoiceGroup step="Step 3" icon={Layers} title="Scope & size">
        <div role="radiogroup" aria-label="Project scope" className="grid gap-2 sm:grid-cols-2">
          {config.sizes.map((size) => (
            <PillChoice
              key={size.value}
              name={`size-${idPrefix}`}
              value={size.value}
              idPrefix={`${idPrefix}-size`}
              selected={selection.size === size.value}
              onSelect={() => setSelection((prev) => ({ ...prev, size: size.value }))}
              label={size.label}
              hint={size.hint}
            />
          ))}
        </div>
      </ChoiceGroup>

      <ChoiceGroup
        step="Step 4"
        icon={Plus}
        title="Add-ons"
        hint="Optional extras — tap to include them in the estimate."
      >
        <div role="group" aria-label="Add-ons" className="flex flex-wrap gap-2">
          {config.addons.map((addon) => (
            <AddonChip
              key={addon.value}
              addon={addon}
              idPrefix={`${idPrefix}-addon`}
              selected={pickedAddons.includes(addon.value)}
              onToggle={() =>
                setPickedAddons((prev) =>
                  prev.includes(addon.value)
                    ? prev.filter((value) => value !== addon.value)
                    : [...prev, addon.value]
                )
              }
            />
          ))}
        </div>
      </ChoiceGroup>

      <ChoiceGroup step="Step 5" icon={Clock3} title={config.billing === 'monthly' ? 'Commitment' : 'Timeline'}>
        <div role="radiogroup" aria-label="Timeline" className="grid gap-2 sm:grid-cols-3">
          {paceOptions.map((pace) => (
            <PillChoice
              key={pace.value}
              name={`pace-${idPrefix}`}
              value={pace.value}
              idPrefix={`${idPrefix}-pace`}
              selected={selection.pace === pace.value}
              onSelect={() => setSelection((prev) => ({ ...prev, pace: pace.value }))}
              label={pace.label}
              hint={pace.hint}
            />
          ))}
        </div>
      </ChoiceGroup>
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <ChoiceGroup step="Step 2" icon={Package} title="Budget range" hint="A rough idea is enough — we scope the details together.">
        <div className="grid gap-2 sm:grid-cols-2">
          <Field id={`${idPrefix}-budget`} label="Budget" required error={errors.budget}>
            <Select value={genericBudget} onValueChange={(value) => { setGenericBudget(value); setErrors((prev) => ({ ...prev, budget: undefined })); }}>
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
          <Field id={`${idPrefix}-gentime`} label="Timeline" optional>
            <Select value={genericTimeline} onValueChange={setGenericTimeline}>
              <SelectTrigger id={`${idPrefix}-gentime`} className={cn(inputClass, 'w-full')} aria-label="Project timeline">
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
      </ChoiceGroup>
    </div>
  );

  const detailsFields = (
    <ChoiceGroup step={config ? 'Step 6' : 'Step 3'} icon={Mail} title="Where do we send it?" hint="One business day, one fixed quote — no spam, ever.">
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
        <Field id={`${idPrefix}-phone`} label="Phone" optional>
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
        <Field id={`${idPrefix}-company`} label="Company" optional>
          <Input
            id={`${idPrefix}-company`}
            value={form.company}
            onChange={(e) => setFormValue('company')(e.target.value)}
            placeholder="Company or brand name"
            autoComplete="organization"
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        id={`${idPrefix}-notes`}
        label={config ? 'Anything else we should know?' : 'Tell us what you need'}
        required={!config}
        optional={Boolean(config)}
        error={errors.notes}
      >
        <Textarea
          id={`${idPrefix}-notes`}
          value={form.notes}
          onChange={(e) => setFormValue('notes')(e.target.value)}
          placeholder="Goals, links, deadlines, references — anything that helps us quote accurately…"
          rows={4}
          maxLength={NOTES_MAX}
          required={!config}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? `${idPrefix}-notes-error` : `${idPrefix}-notes-hint`}
          className={cn(inputClass, 'h-auto min-h-[110px] py-3')}
        />
        <div id={`${idPrefix}-notes-hint`} className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{config ? 'Optional — your configuration already tells us a lot.' : 'Goals, scope, links all help.'}</span>
          <span className={cn('tabular-nums', form.notes.length >= NOTES_MAX - 40 && 'text-destructive')} aria-live="polite">
            {form.notes.length}/{NOTES_MAX}
          </span>
        </div>
      </Field>
    </ChoiceGroup>
  );

  const honeypotField = (
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
  );

  const submitButton = (
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
          Send my quote request
        </>
      )}
    </button>
  );

  const consentCopy = (
    <p className="text-xs leading-relaxed text-muted-foreground">
      By submitting, you agree to our{' '}
      <Link
        href="/privacy-policy"
        className="font-medium text-pink-700 underline decoration-pink-300 underline-offset-2 hover:text-pink-800"
      >
        Privacy Policy
      </Link>
      . Estimates are guidance ranges — your final quote is fixed and itemized before any work starts.
    </p>
  );

  const formBody = submitted ? (
    <SuccessPanel leadId={leadId} onReset={resetToForm} />
  ) : (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7" aria-label="Instant quote builder">
      {honeypotField}
      {servicePicker}
      {shapeProject}
      {detailsFields}
      {submitButton}
      {consentCopy}
    </form>
  );

  /* --------------------------- variants --------------------------- */

  if (inline) {
    // Single-column, surface-less variant — the parent (contact page's
    // gradient-border card) supplies the card chrome; we draw the dark
    // estimate banner plus the builder steps inside a white canvas.
    return (
      <div className={cn('relative overflow-hidden rounded-[20px] bg-white', className)} data-slot="quote-builder">
        {submitted ? (
          <SuccessPanel leadId={leadId} onReset={resetToForm} />
        ) : (
          <div className="flex flex-col">
            <div className="bg-[#0a0a0a] p-6 sm:p-7">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-pink-300" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pink-200">Instant estimate</p>
              </div>
              <div className="mt-3">
                <EstimateContent estimate={estimate} compact />
              </div>
            </div>
            <div className="p-6 sm:p-7">{formBody}</div>
          </div>
        )}
      </div>
    );
  }

  // Full variant — split card with sticky estimate rail.
  // NOTE: no overflow-hidden on the card — it would break the rail's sticky
  // positioning, so each side rounds its own outer corners instead.
  return (
    <div className={cn('card-soft grid grid-cols-1 lg-split-quote', className)} data-slot="quote-builder">
      {/* Estimate rail — dark, sticky on desktop, stacks above the form on mobile */}
      <aside className="relative flex flex-col gap-6 overflow-hidden rounded-t-[24px] bg-[#0a0a0a] p-6 text-white sm:p-8 lg:sticky lg:top-28 lg:self-start lg:rounded-b-none lg:rounded-l-[24px]">
        <span className="blob -right-16 top-6 size-56 bg-gradient-to-br from-pink-600 to-pink-500" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-5">
          <p className="flex w-fit items-center gap-2 text-xs font-semibold text-pink-200">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-pink-300" aria-hidden="true" />
            Instant estimate · updates live
          </p>

          <EstimateContent estimate={estimate} />

          <div className="border-t-2 border-dashed border-white/15" role="presentation" />

          <ul className="flex flex-col gap-2.5">
            {[
              'Free consultation — no obligation',
              'Fixed, itemized quote before we start',
              'NDA on request',
            ].map((promise) => (
              <li key={promise} className="flex items-center gap-2.5 text-sm text-white/75">
                <BadgeCheck className="size-4 shrink-0 text-pink-300" aria-hidden="true" />
                {promise}
              </li>
            ))}
          </ul>

          <p className="mt-auto rounded-2xl bg-white/5 p-4 text-[13px] leading-relaxed text-white/60 ring-1 ring-inset ring-white/10">
            The estimate is a guidance range. After a short scoping call you get one fixed number —
            the price we agree is the price you pay.
          </p>
        </div>
      </aside>

      {/* Builder form */}
      <div className="relative rounded-b-[24px] bg-white p-6 sm:p-8 lg:rounded-b-none lg:rounded-r-[24px] lg:p-10">{formBody}</div>
    </div>
  );
}

