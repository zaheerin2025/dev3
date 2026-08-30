'use client';

import * as React from 'react';
import { Sparkle } from 'lucide-react';
import { CopyButton, DownloadButton, OutputBox, SelectInput, TextAreaInput, TextInput, ToggleInput } from '../tool-ui';

/* ═══════════════════════════════════════════════════════════════
   GENERATOR ENGINE — guided form → document/code output
   Used by policy generators, meta tags, briefs, templates, etc.
   ═══════════════════════════════════════════════════════════════ */

export type GeneratorValue = string | string[] | boolean;

export type GeneratorField =
  | { kind: 'text'; id: string; label: string; placeholder?: string; help?: string; default?: string; half?: boolean }
  | { kind: 'textarea'; id: string; label: string; placeholder?: string; rows?: number; help?: string; default?: string }
  | { kind: 'number'; id: string; label: string; placeholder?: string; help?: string; default?: string; half?: boolean }
  | { kind: 'select'; id: string; label: string; options: { value: string; label: string }[]; default?: string; help?: string; half?: boolean }
  | { kind: 'toggle'; id: string; label: string; help?: string; default?: boolean }
  | { kind: 'list'; id: string; label: string; placeholder?: string; help?: string; default?: string };

export type GeneratorValues = Record<string, GeneratorValue>;

export interface GeneratorConfig {
  fields: GeneratorField[];
  /** Build the output document from the current values. */
  template: (v: GeneratorValues) => string;
  outputLabel: string;
  /** 'html' output gets a live-styled preview tab as well as source. */
  previewHtml?: boolean;
  downloadName: string;
  downloadExt: string;
  downloadMime?: string;
}

const MIME: Record<string, string> = {
  html: 'text/html', json: 'application/json', xml: 'application/xml', text: 'text/plain', css: 'text/css',
};

function defaults(config: GeneratorConfig): GeneratorValues {
  const v: GeneratorValues = {};
  for (const f of config.fields) {
    if (f.kind === 'toggle') v[f.id] = f.default ?? false;
    else if (f.kind === 'list') v[f.id] = f.default ?? '';
    else v[f.id] = f.default ?? '';
  }
  return v;
}

function renderField(f: GeneratorField, values: GeneratorValues, set: (id: string, v: GeneratorValue) => void) {
  const key = `gf-${f.id}`;
  switch (f.kind) {
    case 'text':
    case 'number':
      return (
        <TextInput
          key={key}
          label={f.label}
          value={String(values[f.id] ?? '')}
          onChange={(v) => set(f.id, v)}
          placeholder={f.placeholder}
          help={f.help}
          className={f.half ? undefined : 'sm:col-span-2'}
        />
      );
    case 'textarea':
      return (
        <TextAreaInput
          key={key}
          label={f.label}
          value={String(values[f.id] ?? '')}
          onChange={(v) => set(f.id, v)}
          placeholder={f.placeholder}
          rows={f.rows ?? 4}
          help={f.help}
          className="sm:col-span-2"
        />
      );
    case 'select':
      return (
        <SelectInput
          key={key}
          label={f.label}
          value={String(values[f.id] ?? '')}
          onChange={(v) => set(f.id, v)}
          options={f.options}
          help={f.help}
          className={f.half ? undefined : 'sm:col-span-2'}
        />
      );
    case 'toggle':
      return (
        <ToggleInput
          key={key}
          label={f.label}
          checked={Boolean(values[f.id])}
          onChange={(v) => set(f.id, v)}
          help={f.help}
          className="sm:col-span-2"
        />
      );
    case 'list':
      return (
        <TextAreaInput
          key={key}
          label={f.label}
          value={String(values[f.id] ?? '')}
          onChange={(v) => set(f.id, v)}
          placeholder={f.placeholder}
          rows={5}
          help={f.help ?? 'One item per line.'}
          className="sm:col-span-2"
        />
      );
  }
}

export function GeneratorTool({ config }: { config: GeneratorConfig }) {
  const [values, setValues] = React.useState<GeneratorValues>(() => defaults(config));
  const [tab, setTab] = React.useState<'preview' | 'source'>('preview');

  const set = (id: string, v: GeneratorValue) => setValues((prev) => ({ ...prev, [id]: v }));

  const output = React.useMemo(() => {
    try {
      return config.template(values);
    } catch {
      return '';
    }
  }, [config, values]);

  const halves = config.fields.filter((f) => 'half' in f && f.half);
  const fulls = config.fields.filter((f) => !('half' in f && f.half));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {[...halves, ...fulls].map((f) => renderField(f, values, set))}
        </div>
      </div>

      {/* Output */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0a0a0a]">
            <Sparkle className="size-4 fill-yellow-300 text-yellow-300" />
            {config.outputLabel}
          </p>
          <div className="flex gap-2">
            <CopyButton value={output} />
            <DownloadButton
              filename={`${config.downloadName}.${config.downloadExt}`}
              content={output}
              mime={config.downloadMime ?? MIME[config.downloadExt] ?? 'text/plain'}
            />
          </div>
        </div>

        {config.previewHtml ? (
          <div className="flex gap-1.5">
            {(['preview', 'source'] as const).map((tKey) => (
              <button
                key={tKey}
                type="button"
                onClick={() => setTab(tKey)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  tab === tKey ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tKey === 'preview' ? 'Live preview' : 'Source code'}
              </button>
            ))}
          </div>
        ) : null}

        {config.previewHtml && tab === 'preview' ? (
          <div className="custom-scrollbar max-h-[460px] overflow-auto rounded-xl border border-gray-200 bg-white">
            <iframe
              title="Preview"
              className="h-[440px] w-full"
              sandbox=""
              srcDoc={output}
            />
          </div>
        ) : (
          <OutputBox value={output} language={config.downloadExt} scroll />
        )}
      </div>
    </div>
  );
}
