'use client';

import * as React from 'react';
import { NumberInput, SelectInput, TextInput, ToolNote, Verdict } from '../tool-ui';

/* ═══════════════════════════════════════════════════════════════
   CALC ENGINE — inputs → instant computed results
   Used by every calculator: costs, ROI, EMI, engagement, etc.
   ═══════════════════════════════════════════════════════════════ */

export interface CalcField {
  id: string;
  label: string;
  type?: 'number' | 'text' | 'select';
  placeholder?: string;
  help?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  default: string;
  options?: { value: string; label: string }[];
  /** Wide fields span the full row. */
  full?: boolean;
}

export interface CalcResult {
  stats: { label: string; value: string; hint?: string; tone?: 'default' | 'good' | 'warn' | 'bad' }[];
  breakdown?: { label: string; value: string }[];
  verdict?: { tone: 'good' | 'warn' | 'bad'; title: string; message: string };
  note?: string;
}

export interface CalcConfig {
  fields: CalcField[];
  compute: (values: Record<string, string>) => CalcResult;
  /** Helper line shown under the tool. */
  note?: string;
}

const num = (v: string | undefined) => {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export const money = (n: number, currency = '$') =>
  `${currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const pct = (n: number, digits = 1) => `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`;

export function CalcTool({ config }: { config: CalcConfig }) {
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of config.fields) v[f.id] = f.default;
    return v;
  });

  const set = (id: string) => (v: string) => setValues((prev) => ({ ...prev, [id]: v }));

  const result = React.useMemo(() => {
    try {
      return config.compute(values);
    } catch {
      return null;
    }
  }, [config, values]);

  const halfFields = config.fields.filter((f) => !f.full);
  const fullFields = config.fields.filter((f) => f.full);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      {/* Inputs */}
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {[...halfFields, ...fullFields].map((f) =>
            f.type === 'select' ? (
              <SelectInput
                key={f.id}
                label={f.label}
                value={values[f.id]}
                onChange={set(f.id)}
                options={f.options ?? []}
                help={f.help}
                className={f.full ? 'sm:col-span-2' : undefined}
              />
            ) : (
              <NumberInput
                key={f.id}
                label={f.label}
                value={values[f.id]}
                onChange={set(f.id)}
                placeholder={f.placeholder}
                suffix={f.suffix}
                min={f.min}
                max={f.max}
                step={f.step}
                help={f.help}
                className={f.full ? 'sm:col-span-2' : undefined}
              />
            )
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4" aria-live="polite">
        {result ? (
          <>
            <div className={`grid gap-4 ${result.stats.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {result.stats.map((s) => (
                <div key={s.label} className="card-soft p-5">
                  <p className="font-display text-2xl font-bold sm:text-3xl">
                    <span className={s.tone === 'good' ? 'text-emerald-600' : s.tone === 'warn' ? 'text-amber-600' : s.tone === 'bad' ? 'text-teal-600' : 'text-gradient'}>
                      {s.value}
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">{s.label}</p>
                  {s.hint ? <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p> : null}
                </div>
              ))}
            </div>

            {result.verdict ? <Verdict {...result.verdict} /> : null}

            {result.breakdown && result.breakdown.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {result.breakdown.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2.5 font-medium text-[#374151]">{row.label}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-[#0a0a0a]">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {result.note ? <ToolNote>{result.note}</ToolNote> : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Enter valid numbers to see results.</p>
        )}
      </div>
    </div>
  );
}
