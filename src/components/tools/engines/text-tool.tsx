'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { CopyButton, DownloadButton, OutputBox, SelectInput, TextAreaInput } from '../tool-ui';

/* ═══════════════════════════════════════════════════════════════
   TEXT ENGINE — paste text → transform → output
   Used by minifiers, formatters, converters, fonts, slug, etc.
   ═══════════════════════════════════════════════════════════════ */

export interface TextToolOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  default: string;
}

export interface TextToolConfig {
  transform: (input: string, options: Record<string, string>) => string;
  options?: TextToolOption[];
  inputLabel: string;
  outputLabel: string;
  placeholder?: string;
  rows?: number;
  downloadName: string;
  downloadExt: string;
  /** Show live character stats under the output. */
  showStats?: boolean;
  sample?: string;
  /** File input instead of paste-first (e.g. for minifiers). */
  acceptFile?: boolean;
}

export function TextTool({ config }: { config: TextToolConfig }) {
  const [input, setInput] = React.useState('');
  const [opts, setOpts] = React.useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const opt of config.options ?? []) o[opt.id] = opt.default;
    return o;
  });

  const output = React.useMemo(() => (input ? config.transform(input, opts) : ''), [config, input, opts]);

  const saved = input.length - output.length;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setInput(await file.text());
  };

  return (
    <div className="flex flex-col gap-5">
      {config.options && config.options.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.options.map((opt) => (
            <SelectInput
              key={opt.id}
              label={opt.label}
              value={opts[opt.id]}
              onChange={(v) => setOpts((p) => ({ ...p, [opt.id]: v }))}
              options={opt.options}
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#0a0a0a]">{config.inputLabel}</p>
            <div className="flex gap-2">
              {config.sample ? (
                <button
                  type="button"
                  onClick={() => setInput(config.sample!)}
                  className="rounded-full border-2 border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-zinc-200 hover:text-[#0a0a0a]"
                >
                  Load sample
                </button>
              ) : null}
              {config.acceptFile ? (
                <label className="cursor-pointer rounded-full border-2 border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-zinc-200 hover:text-[#0a0a0a]">
                  Upload file
                  <input
                    type="file"
                    className="hidden"
                    accept=".css,.js,.html,.htm,.txt,.json,.xml,.svg,.md"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </label>
              ) : null}
            </div>
          </div>
          <TextAreaInput
            label=""
            value={input}
            onChange={setInput}
            placeholder={config.placeholder ?? 'Paste your text here…'}
            rows={config.rows ?? 12}
          />
          {input ? (
            <p className="text-xs text-muted-foreground">
              Input: {input.length.toLocaleString()} chars · {input.split('\n').length.toLocaleString()} lines
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0a0a0a]">
              {config.outputLabel}
              <ArrowRight className="size-3.5 text-gray-800" />
            </p>
            <div className="flex gap-2">
              <CopyButton value={output} />
              <DownloadButton
                filename={`${config.downloadName}.${config.downloadExt}`}
                content={output}
              />
            </div>
          </div>
          <OutputBox value={output} language={config.downloadExt} scroll />
          {config.showStats !== false && input ? (
            <p className="text-xs text-muted-foreground">
              Output: {output.length.toLocaleString()} chars
              {saved > 0 ? <span className="font-bold text-gray-800"> · {((saved / input.length) * 100).toFixed(1)}% smaller</span> : null}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
