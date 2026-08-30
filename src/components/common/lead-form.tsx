'use client';

import * as React from 'react';
import { CheckCircle2, Loader2, Mail, MessageCircle, Phone, Send, Star } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { services } from '@/data';
import { site, whatsappLink } from '@/lib/site';

const BUDGET_RANGES = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $2,500',
  '$2,500 – $5,000',
  '$5,000+',
  'Not sure yet',
];

const TIMELINE_OPTIONS = ['ASAP — this month', '1–3 months', '3–6 months', 'Just exploring'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MESSAGE_MAX = 500;
const MESSAGE_MIN = 20;

/** Short social-proof quote shown in the dark rail (real client, t2). */
const RAIL_QUOTE = {
  text: 'They think like product engineers, not contractors — every sprint shipped something we could put in front of customers.',
  name: 'David Chen',
  role: 'CEO, NorthPay',
};

interface LeadFormProps {
  /** Lead source label stored with the submission, e.g. "service:web-dev". */
  source?: string;
  /** Preselect a service (slug) in the dropdown. */
  defaultService?: string;
  /** Render the form surface on a dark background. */
  dark?: boolean;
  /** Single-column variant used on service/pricing pages. */
  compact?: boolean;
  className?: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  budget: '',
  timeline: '',
  message: '',
};

type Errors = Partial<Record<'name' | 'email' | 'service' | 'budget' | 'message', string>>;

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  required,
  optional,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-0.5 text-purple-600" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SuccessPanel({
  leadId,
  dark,
  onReset,
}: {
  leadId: string | null;
  dark?: boolean;
  onReset: () => void;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-10 text-center sm:p-12',
        dark && 'text-white'
      )}
      role="status"
      aria-live="polite"
    >
      <span className="gradient-frame flex rounded-full p-3" aria-hidden="true">
        <span
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full',
            dark ? 'bg-white/10' : 'bg-white'
          )}
        >
          <CheckCircle2 className="h-14 w-14 text-purple-600" />
        </span>
      </span>
      <h3
        className={cn('text-2xl font-bold', dark ? 'text-white' : 'text-foreground')}
      >
        Request received — thank you!
      </h3>
      <p
        className={cn(
          'max-w-md text-sm leading-relaxed sm:text-base',
          dark ? 'text-slate-300' : 'text-muted-foreground'
        )}
      >
        We&rsquo;ll reply within one business day with next steps and a fixed quote.
      </p>
      {leadId ? (
        <p className={cn('text-xs', dark ? 'text-slate-400' : 'text-muted-foreground')}>
          Reference: <span className="font-mono font-semibold text-purple-700">{leadId}</span>
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" asChild>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { location: 'lead_success' })}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Send another message
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LeadForm                                                           */
/* ------------------------------------------------------------------ */

/**
 * Project inquiry form with honeypot spam protection.
 * Posts to /api/leads (stored in DB) and fires a GA4 generate_lead event.
 */
export function LeadForm({
  source = 'contact',
  defaultService,
  dark,
  compact,
  className,
}: LeadFormProps) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<FormState>(() => ({
    ...EMPTY_FORM,
    service: defaultService ?? '',
  }));
  const [honeypot, setHoneypot] = React.useState('');
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [leadId, setLeadId] = React.useState<string | null>(null);

  /** Map form fields to their validation error keys. */
  const ERROR_KEY_FOR: Partial<Record<keyof FormState, keyof Errors>> = {
    firstName: 'name',
    email: 'email',
    service: 'service',
    budget: 'budget',
    message: 'message',
  };

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    const errorKey = ERROR_KEY_FOR[key];
    if (!errorKey) return;
    setErrors((prev) => (prev[errorKey] ? { ...prev, [errorKey]: undefined } : prev));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.firstName.trim().length < 2) next.name = 'Please enter your first name.';
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (!form.service) next.service = 'Please select a service.';
    if (!form.budget) next.budget = 'Please select a budget range.';
    if (form.message.trim().length < MESSAGE_MIN) {
      next.message = `Please add a little more detail (at least ${MESSAGE_MIN} characters).`;
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
      // Company is folded into the message so nothing the client shares gets lost.
      const message = form.company.trim()
        ? `Company: ${form.company.trim()}\n\n${form.message}`
        : form.message;

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: form.email,
          phone: form.phone,
          service: form.service,
          budget: form.budget,
          timeline: form.timeline,
          message,
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
        service: form.service || 'unspecified',
        budget: form.budget || 'unspecified',
        timeline: form.timeline || 'unspecified',
      });
      setLeadId(payload.id ?? null);
      setSubmitted(true);
      setForm({ ...EMPTY_FORM, service: defaultService ?? '' });
      toast({
        title: 'Request received!',
        description: 'Thanks — we will send your fixed quote within one business day.',
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
  };

  /* ---------------------------- styles ---------------------------- */

  const surfaceClass = dark ? 'section-dark-deep' : 'card-surface';
  const inputClass = dark
    ? 'h-11 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40'
    : 'h-11 rounded-xl bg-white';
  const triggerClass = cn(inputClass, 'w-full data-[size=default]:h-11');

  /* ------------------------- form fields -------------------------- */

  const nameFields = (
    <>
      <Field
        id={`lead-first-${source}`}
        label="First name"
        required
        error={errors.name}
      >
        <Input
          id={`lead-first-${source}`}
          value={form.firstName}
          onChange={(e) => set('firstName')(e.target.value)}
          placeholder="Jane"
          autoComplete="given-name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `lead-first-${source}-error` : undefined}
          className={inputClass}
        />
      </Field>
      <Field id={`lead-last-${source}`} label="Last name" optional>
        <Input
          id={`lead-last-${source}`}
          value={form.lastName}
          onChange={(e) => set('lastName')(e.target.value)}
          placeholder="Smith"
          autoComplete="family-name"
          className={inputClass}
        />
      </Field>
    </>
  );

  const contactFields = (
    <>
      <Field id={`lead-email-${source}`} label="Email" required error={errors.email}>
        <Input
          id={`lead-email-${source}`}
          type="email"
          value={form.email}
          onChange={(e) => set('email')(e.target.value)}
          placeholder="jane@company.com"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `lead-email-${source}-error` : undefined}
          className={inputClass}
        />
      </Field>
      <Field id={`lead-phone-${source}`} label="Phone" optional>
        <Input
          id={`lead-phone-${source}`}
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone')(e.target.value)}
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          className={inputClass}
        />
      </Field>
    </>
  );

  const pickFields = (
    <>
      <Field id={`lead-service-${source}`} label="Service" required error={errors.service}>
        <Select value={form.service} onValueChange={set('service')}>
          <SelectTrigger
            id={`lead-service-${source}`}
            className={triggerClass}
            aria-label="Service needed"
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? `lead-service-${source}-error` : undefined}
          >
            <SelectValue placeholder="What do you need?" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.slug} value={service.slug}>
                {service.name}
              </SelectItem>
            ))}
            <SelectItem value="not-sure">Not sure yet / something else</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field id={`lead-budget-${source}`} label="Budget" required error={errors.budget}>
        <Select value={form.budget} onValueChange={set('budget')}>
          <SelectTrigger
            id={`lead-budget-${source}`}
            className={triggerClass}
            aria-label="Budget range"
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? `lead-budget-${source}-error` : undefined}
          >
            <SelectValue placeholder="Select a range" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </>
  );

  const messageField = (
    <Field
      id={`lead-message-${source}`}
      label="Project details"
      required
      error={errors.message}
      className={compact ? undefined : 'sm:col-span-2'}
    >
      <Textarea
        id={`lead-message-${source}`}
        value={form.message}
        onChange={(e) => set('message')(e.target.value)}
        placeholder="Tell us about your project, goals, and timeline…"
        rows={compact ? 4 : 5}
        maxLength={MESSAGE_MAX}
        required
        aria-invalid={Boolean(errors.message)}
        aria-describedby={
          errors.message ? `lead-message-${source}-error` : `lead-message-${source}-hint`
        }
        className={cn(inputClass, 'h-auto min-h-[120px]')}
      />
      <div
        id={`lead-message-${source}-hint`}
        className="flex items-center justify-between text-[11px] text-muted-foreground"
      >
        <span>Min. {MESSAGE_MIN} characters — goals, scope, links all help.</span>
        <span
          className={cn('tabular-nums', form.message.length >= MESSAGE_MAX - 20 && 'text-destructive')}
          aria-live="polite"
        >
          {form.message.length}/{MESSAGE_MAX}
        </span>
      </div>
    </Field>
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

  const consentCopy = (
    <p
      className={cn(
        'text-xs leading-relaxed',
        dark ? 'text-slate-400' : 'text-muted-foreground'
      )}
    >
      By submitting, you agree to our{' '}
      <Link
        href="/privacy"
        className="font-medium text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-800"
      >
        Privacy Policy
      </Link>
      . We reply within one business day and never share your details.
    </p>
  );

  const submitButton = (
    <Button type="submit" size="lg" disabled={submitting} className="w-full">
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Sending…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" aria-hidden="true" />
          Send message
        </>
      )}
    </Button>
  );

  /* -------------------------- success ----------------------------- */

  if (submitted) {
    if (compact) {
      return (
        <div
          className={cn(surfaceClass, 'overflow-hidden rounded-3xl', className)}
          data-slot="lead-form-success"
        >
          <SuccessPanel leadId={leadId} dark={dark} onReset={resetToForm} />
        </div>
      );
    }
    return (
      <div
        className={cn(
          surfaceClass,
          'grid overflow-hidden rounded-3xl lg:grid-cols-[0.85fr_1.15fr]',
          className
        )}
        data-slot="lead-form-success"
      >
        <LeadRail />
        <div className="relative p-6 sm:p-8">
          <SuccessPanel leadId={leadId} dark={dark} onReset={resetToForm} />
        </div>
      </div>
    );
  }

  /* --------------------------- compact ---------------------------- */

  if (compact) {
    return (
      <div
        className={cn(
          surfaceClass,
          'relative overflow-hidden rounded-3xl p-6',
          className
        )}
      >
        <span
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
          aria-hidden="true"
        />
        <div className="flex items-center gap-3">
          <span className="icon-tile h-11 w-11 shrink-0" aria-hidden="true">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <h3 className={cn('font-semibold', dark ? 'text-white' : 'text-foreground')}>
              Get your free quote
            </h3>
            <p className={cn('text-sm', dark ? 'text-slate-300' : 'text-muted-foreground')}>
              Fixed price, no obligation — reply within one business day.
            </p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5 flex flex-col gap-4"
          aria-label="Project inquiry form"
        >
          {honeypotField}
          <div className="grid gap-4 sm:grid-cols-2">
            {nameFields}
            {contactFields}
            {pickFields}
          </div>
          {messageField}
          {submitButton}
          {consentCopy}
        </form>
      </div>
    );
  }

  /* ----------------------------- full ----------------------------- */

  return (
    <div
      className={cn(
        surfaceClass,
        'grid overflow-hidden rounded-3xl lg:grid-cols-[0.85fr_1.15fr]',
        className
      )}
    >
      <LeadRail />
      <div className="relative p-6 sm:p-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
          aria-label="Project inquiry form"
        >
          {honeypotField}
          <div className="grid gap-4 sm:grid-cols-2">
            {nameFields}
            {contactFields}
            {pickFields}
            <Field id={`lead-timeline-${source}`} label="Timeline" optional>
              <Select value={form.timeline} onValueChange={set('timeline')}>
                <SelectTrigger
                  id={`lead-timeline-${source}`}
                  className={triggerClass}
                  aria-label="Project timeline"
                >
                  <SelectValue placeholder="When do you want to start?" />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id={`lead-company-${source}`} label="Company" optional>
              <Input
                id={`lead-company-${source}`}
                value={form.company}
                onChange={(e) => set('company')(e.target.value)}
                placeholder="Company or brand name"
                autoComplete="organization"
                className={inputClass}
              />
            </Field>
            {messageField}
          </div>
          {submitButton}
          {consentCopy}
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dark left rail (full variant, desktop only)                        */
/* ------------------------------------------------------------------ */

const RAIL_CONTACT_ROWS = [
  {
    icon: Mail,
    label: 'Email us',
    value: site.email,
    href: `mailto:${site.email}`,
    external: false,
    event: 'email_click' as const,
  },
  {
    icon: Phone,
    label: 'Call us',
    value: site.phoneDisplay,
    href: site.phoneHref,
    external: false,
    event: 'call_click' as const,
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat instantly',
    href: whatsappLink(),
    external: true,
    event: 'whatsapp_click' as const,
  },
];

function LeadRail() {
  return (
    <aside className="section-dark-deep bg-dots-dark relative hidden overflow-hidden lg:flex lg:flex-col">
      <span className="glow-orb -right-20 top-10 h-72 w-72 bg-purple-500/25" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col gap-7 p-8">
        <p className="flex w-fit items-center gap-2 text-xs font-medium text-pink-200">
          <span
            className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-pink-300"
            aria-hidden="true"
          />
          Average response: under 4h
        </p>

        <div>
          <h3 className="text-2xl font-bold text-white">Tell us about your project</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            A few lines are enough — we reply with a fixed quote and a clear plan.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {RAIL_CONTACT_ROWS.map((row) => (
            <a
              key={row.label}
              href={row.href}
              target={row.external ? '_blank' : undefined}
              rel={row.external ? 'noopener noreferrer' : undefined}
              onClick={() => trackEvent(row.event, { location: 'lead_form' })}
              className="group flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-pink-300 transition-colors group-hover:bg-white/15"
                aria-hidden="true"
              >
                <row.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  {row.label}
                </span>
                <span className="block truncate text-sm font-semibold text-white">
                  {row.value}
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="divider-gradient" role="presentation" />

        <div className="mt-auto flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gradient-soft text-2xl font-bold">{site.stats.projects}</span>
              <span className="mt-0.5 block text-xs text-slate-400">projects delivered</span>
            </div>
            <div>
              <span className="text-gradient-soft text-2xl font-bold">
                {site.stats.satisfaction}
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">client satisfaction</span>
            </div>
          </div>

          <figure className="rounded-2xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
            <blockquote className="text-[13px] leading-relaxed text-slate-300">
              &ldquo;{RAIL_QUOTE.text}&rdquo;
            </blockquote>
            <figcaption className="mt-1.5 text-xs font-medium text-slate-400">
              {RAIL_QUOTE.name} — {RAIL_QUOTE.role}
            </figcaption>
          </figure>
        </div>
      </div>
    </aside>
  );
}
