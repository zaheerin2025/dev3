'use client';

import * as React from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

/* ── copy / download helpers ─────────────────────────────────── */

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useCopy() {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, []);
  return { copied, copy };
}

export function CopyButton({ value, className, label = 'Copy' }: { value: string; className?: string; label?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      disabled={!value}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-2 text-xs font-bold text-[#0a0a0a] transition-all hover:bg-[#0a0a0a] hover:text-white disabled:opacity-40',
        className
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export function DownloadButton({
  filename, content, mime = 'text/plain', className, label = 'Download',
}: {
  filename: string; content: string; mime?: string; className?: string; label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadText(filename, content, mime)}
      disabled={!content}
      className={cn(
        'btn-primary-pill-sm !px-4 !py-2 !text-xs',
        className
      )}
    >
      <Download className="size-3.5" />
      {label}
    </button>
  );
}

/* ── fields ──────────────────────────────────────────────────── */

export function FieldShell({ label, help, children, className }: { label: string; help?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label className="text-sm font-bold text-[#0a0a0a]">{label}</Label>
      {children}
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, help, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; help?: string; className?: string;
}) {
  return (
    <FieldShell label={label} help={help} className={className}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500"
      />
    </FieldShell>
  );
}

export function NumberInput({ label, value, onChange, placeholder, min, max, step, suffix, help, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  min?: number; max?: number; step?: number; suffix?: string; help?: string; className?: string;
}) {
  return (
    <FieldShell label={label} help={help} className={className}>
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step ?? 'any'}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-xl border-gray-200 bg-white pr-14 text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{suffix}</span>
        ) : null}
      </div>
    </FieldShell>
  );
}

export function SelectInput({ label, value, onChange, options, help, className }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; help?: string; className?: string;
}) {
  return (
    <FieldShell label={label} help={help} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white text-[#0a0a0a] focus-visible:ring-purple-500">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function ToggleInput({ label, checked, onChange, help, className }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; help?: string; className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3', className)}>
      <div>
        <Label className="text-sm font-bold text-[#0a0a0a]">{label}</Label>
        {help ? <p className="mt-0.5 text-xs text-muted-foreground">{help}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function TextAreaInput({ label, value, onChange, placeholder, rows = 6, help, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; help?: string; className?: string;
}) {
  return (
    <FieldShell label={label} help={help} className={className}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-y rounded-xl border-gray-200 bg-white font-mono text-[13px] leading-relaxed text-[#0a0a0a] placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500"
      />
    </FieldShell>
  );
}

/* ── output / results ────────────────────────────────────────── */

export function OutputBox({ value, language = 'text', scroll }: { value: string; language?: string; scroll?: boolean }) {
  return (
    <pre
      className={cn(
        'custom-scrollbar overflow-auto rounded-xl border border-gray-200 bg-[#0a0a0a] p-4 font-mono text-[13px] leading-relaxed text-gray-100',
        scroll && 'max-h-[460px]'
      )}
    >
      <code>{value || 'Output appears here…'}</code>
      <span aria-hidden className="hidden">{language}</span>
    </pre>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: {
  label: string; value: React.ReactNode; hint?: string; tone?: 'default' | 'good' | 'warn' | 'bad';
}) {
  const toneClass =
    tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : tone === 'bad' ? 'text-rose-600' : 'text-gradient';
  return (
    <div className="card-soft p-4 text-center sm:p-5">
      <p className="font-display text-2xl font-bold sm:text-3xl"><span className={toneClass}>{value}</span></p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Verdict({ tone, title, message }: { tone: 'good' | 'warn' | 'bad'; title: string; message: string }) {
  const styles =
    tone === 'good'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';
  return (
    <div className={cn('rounded-2xl border-2 p-4 sm:p-5', styles)} role="status">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{message}</p>
    </div>
  );
}

export function ToolNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-purple-50 px-4 py-3 text-xs leading-relaxed text-purple-800">
      {children}
    </p>
  );
}
