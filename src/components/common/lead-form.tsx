'use client';

import * as React from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+',
  'Not sure yet',
];

interface LeadFormProps {
  /** Lead source label stored with the submission, e.g. "service:web-dev". */
  source?: string;
  /** Preselect a service (slug) in the dropdown. */
  defaultService?: string;
  dark?: boolean;
  compact?: boolean;
  className?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', service: '', budget: '', message: '' };

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/**
 * Project inquiry form with honeypot spam protection.
 * Posts to /api/leads (stored in DB) and fires a GA4 generate_lead event.
 */
export function LeadForm({ source = 'contact', defaultService, dark, compact, className }: LeadFormProps) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<FormState>(() => ({
    ...EMPTY_FORM,
    service: defaultService ?? '',
  }));
  const [honeypot, setHoneypot] = React.useState('');
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'Please tell us a little more (at least 10 characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source, website: honeypot }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Something went wrong.');
      }
      trackEvent('generate_lead', { source, service: form.service || 'unspecified', budget: form.budget || 'unspecified' });
      setSubmitted(true);
      setForm({ ...EMPTY_FORM });
      toast({
        title: 'Request received!',
        description: 'Thanks — we will send your free quote within one business day.',
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

  if (submitted) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-2xl p-8 text-center',
          dark ? 'bg-white/5 ring-1 ring-inset ring-emerald-400/20' : 'bg-emerald-50 ring-1 ring-inset ring-emerald-600/15',
          className
        )}
        role="status"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className={cn('text-xl font-semibold', dark ? 'text-white' : 'text-foreground')}>Thank you!</h3>
        <p className={cn('max-w-sm text-sm leading-relaxed', dark ? 'text-emerald-100/70' : 'text-muted-foreground')}>
          Your request is in. A senior team member will reply with a free, itemized quote within one business day.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
          Send another request
        </Button>
      </div>
    );
  }

  const labelClass = cn('text-sm font-medium', dark ? 'text-emerald-50' : 'text-foreground');
  const inputClass = dark ? 'border-emerald-400/20 bg-white/5 text-emerald-50 placeholder:text-emerald-100/40' : '';

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('flex flex-col gap-5', className)} aria-label="Project inquiry form">
      {/* Honeypot — hidden from humans, traps bots */}
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

      <div className={cn('grid gap-5', compact ? '' : 'sm:grid-cols-2')}>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`lead-name-${source}`} className={labelClass}>
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`lead-name-${source}`}
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            className={cn(inputClass, dark && '[color-scheme:dark]')}
          />
          {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`lead-email-${source}`} className={labelClass}>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`lead-email-${source}`}
            type="email"
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
            placeholder="jane@company.com"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>
      </div>

      <div className={cn('grid gap-5', compact ? '' : 'sm:grid-cols-2')}>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`lead-phone-${source}`} className={labelClass}>
            Phone (optional)
          </Label>
          <Input
            id={`lead-phone-${source}`}
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone')(e.target.value)}
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`lead-service-${source}`} className={labelClass}>
            Service
          </Label>
          <Select value={form.service} onValueChange={set('service')}>
            <SelectTrigger id={`lead-service-${source}`} className={inputClass} aria-label="Service needed">
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
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`lead-budget-${source}`} className={labelClass}>
          Budget
        </Label>
        <Select value={form.budget} onValueChange={set('budget')}>
          <SelectTrigger id={`lead-budget-${source}`} className={inputClass} aria-label="Budget range">
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`lead-message-${source}`} className={labelClass}>
          Project details <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`lead-message-${source}`}
          value={form.message}
          onChange={(e) => set('message')(e.target.value)}
          placeholder="Tell us about your project, goals, and timeline…"
          rows={compact ? 3 : 5}
          required
          aria-invalid={Boolean(errors.message)}
          className={inputClass}
        />
        {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            Get My Free Quote
          </>
        )}
      </Button>
      <p className={cn('text-xs leading-relaxed', dark ? 'text-emerald-100/50' : 'text-muted-foreground')}>
        By submitting, you agree to our privacy policy. We reply within one business day and never share your details.
      </p>
    </form>
  );
}
