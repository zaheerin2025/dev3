'use client';

import * as React from 'react';
import { TextAreaInput, Verdict } from '../tool-ui';

/* ═══════════════════════════════════════════════════════════════
   ANALYZE ENGINE — paste text → instant report
   Used by density checkers, counters, subject-line testers, etc.
   ═══════════════════════════════════════════════════════════════ */

export interface AnalyzeStat {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export interface AnalyzeResult {
  stats?: AnalyzeStat[];
  table?: { head: string[]; rows: (string | number)[][] };
  verdict?: { tone: 'good' | 'warn' | 'bad'; title: string; message: string };
  note?: string;
}

export interface AnalyzeToolConfig {
  analyze: (text: string) => AnalyzeResult;
  inputLabel?: string;
  placeholder?: string;
  rows?: number;
  sample?: string;
  minChars?: number;
}

export function AnalyzeTool({ config }: { config: AnalyzeToolConfig }) {
  const [text, setText] = React.useState('');
  const result = React.useMemo(
    () => (text.trim().length >= (config.minChars ?? 1) ? config.analyze(text) : null),
    [config, text]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {config.inputLabel ? (
            <p className="text-sm font-bold text-[#0a0a0a]">{config.inputLabel}</p>
          ) : <span />}
          {config.sample ? (
            <button
              type="button"
              onClick={() => setText(config.sample!)}
              className="rounded-full border-2 border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
            >
              Load sample
            </button>
          ) : null}
        </div>
        <TextAreaInput
          label=""
          value={text}
          onChange={setText}
          placeholder={config.placeholder ?? 'Paste your text here — the report updates live…'}
          rows={config.rows ?? 10}
        />
      </div>

      {result ? (
        <div className="flex flex-col gap-5" aria-live="polite">
          {result.stats && result.stats.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.stats.map((s) => (
                <div key={s.label} className="card-soft p-4 text-center">
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">{s.label}</p>
                  {s.hint ? <p className="mt-1 text-[11px] text-muted-foreground">{s.hint}</p> : null}
                </div>
              ))}
            </div>
          ) : null}

          {result.verdict ? <Verdict {...result.verdict} /> : null}

          {result.table ? (
            <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="bg-[#0a0a0a] text-white">
                    {result.table.head.map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.table.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2.5 text-[#374151]">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {result.note ? (
            <p className="rounded-xl bg-pink-50 px-4 py-3 text-xs leading-relaxed text-pink-800">{result.note}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
