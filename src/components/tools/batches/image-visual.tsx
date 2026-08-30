'use client';

/**
 * Batch: IMAGE & VISUAL tools — agent task 23-e — 19 bespoke tools.
 * Group A (upload → canvas image pipeline): 6 tools built directly on FileReader,
 *   <canvas> and Blob APIs (there is deliberately no shared image engine).
 * Group B (visual / CSS / marketing): 13 bespoke interactive components.
 * Every tool is fully client-side; nothing is uploaded to a server.
 * Slugs MUST match src/data/tools/registry.ts exactly.
 */

import * as React from 'react';
import {
  Bell, Box, Check, Circle, Copy, Crop, Download, ExternalLink, Film, Frame, Grid3x3,
  Image as ImageIcon, LayoutGrid, Link2, MousePointer2, PartyPopper, Play,
  Plus, Printer, RefreshCw, Smartphone, Sparkles, Square, Ticket, Trash2, Undo2,
  Upload, Users, Video, Wand2, Workflow, X, Youtube,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { BatchTool } from '../batch-types';
import {
  CopyButton,
  FieldShell,
  NumberInput,
  OutputBox,
  SelectInput,
  StatCard,
  TextAreaInput,
  TextInput,
  ToggleInput,
  ToolNote,
  Verdict,
  downloadBlob,
  downloadText,
  useCopy,
} from '../tool-ui';
import { createPortal } from 'react-dom';
// gifenc is loaded on demand inside the GIF export flow — the static import
// used to pull the encoder into every page that renders this batch.
type GifencModule = typeof import('gifenc');
let gifencPromise: Promise<GifencModule> | null = null;
function loadGifenc(): Promise<GifencModule> {
  gifencPromise ??= import('gifenc');
  return gifencPromise;
}

/* ═══════════════════════════════════════════════════════════════
   SHARED HELPERS + UI ATOMS (image/canvas toolkit for this batch)
   ═══════════════════════════════════════════════════════════════ */

interface RGB { r: number; g: number; b: number }
interface CMYK { c: number; m: number; y: number; k: number }

interface LoadedImage {
  img: HTMLImageElement;
  url: string;
  name: string;
  bytes: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

let uidCounter = 0;
function uid(): string {
  uidCounter += 1;
  return `id${Date.now().toString(36)}${uidCounter.toString(36)}`;
}

function fmtBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file could not be decoded as an image.'));
    img.src = src;
  });
}

async function fileToImage(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);
  const img = await loadImageEl(url);
  return { img, url, name: file.name, bytes: file.size };
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Your browser refused to export this canvas (format unsupported or canvas too large).'))),
      type,
      quality,
    );
  });
}

/** Path helper — rounded rectangle (radius is clamped so huge radii can't crash the path). */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

/** Draw an image filling the target rect with a center-crop "cover" fit. */
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Draw an image fully inside the target rect ("contain" fit). Returns the drawn rect. */
function drawImageContain(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number,
): { dx: number; dy: number; dw: number; dh: number } {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return { dx: x, dy: y, dw: 0, dh: 0 };
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return { dx, dy, dw, dh };
}

const CANVAS_FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';

/* ── color math ── */

function hexToRgb(hex: string): RGB | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: RGB): string {
  const to = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0));
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  if (ss === 0) { const v = Math.round(ll * 255); return { r: v, g: v, b: v }; }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hue = (t: number) => {
    let tt = t; if (tt < 0) tt += 1; if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return { r: Math.round(hue(hh + 1 / 3) * 255), g: Math.round(hue(hh) * 255), b: Math.round(hue(hh - 1 / 3) * 255) };
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 0.9999) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  const cc = clamp(c, 0, 100) / 100, mm = clamp(m, 0, 100) / 100, yy = clamp(y, 0, 100) / 100, kk = clamp(k, 0, 100) / 100;
  return {
    r: Math.round(255 * (1 - cc) * (1 - kk)),
    g: Math.round(255 * (1 - mm) * (1 - kk)),
    b: Math.round(255 * (1 - yy) * (1 - kk)),
  };
}

/** All numbers in a string, in order — tolerant parser for "rgb(...)", "5 150 105", etc. */
function parseNumbers(s: string): number[] {
  return (s.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

/** Mix a color toward white (t > 0) or black (t < 0); t in [-1, 1]. */
function shade(rgb: RGB, t: number): RGB {
  const target = t >= 0 ? 255 : 0;
  const f = Math.abs(t);
  return {
    r: Math.round(rgb.r + (target - rgb.r) * f),
    g: Math.round(rgb.g + (target - rgb.g) * f),
    b: Math.round(rgb.b + (target - rgb.b) * f),
  };
}

/** Perceived brightness 0–255 (good enough for sorting/swapping grid images). */
function perceivedBrightness(rgb: RGB): number {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

/** Average perceived brightness of a whole image (8×8 downsample) — used by the grid planner. */
function imageAverageLum(img: HTMLImageElement): number {
  try {
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 8;
    const ctx = c.getContext('2d');
    if (!ctx) return 128;
    ctx.drawImage(img, 0, 0, 8, 8);
    const d = ctx.getImageData(0, 0, 8, 8).data;
    let total = 0;
    for (let i = 0; i < d.length; i += 4) total += perceivedBrightness({ r: d[i], g: d[i + 1], b: d[i + 2] });
    return total / (d.length / 4);
  } catch {
    return 128;
  }
}

function hexWithAlpha(hex: string, alphaPct: number): string {
  const c = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${(clamp(alphaPct, 0, 100) / 100).toFixed(3)})`;
}

/** Cryptographically fair random integer in [0, maxExclusive). */
function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const limit = Math.floor(4294967296 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let v = 0;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % maxExclusive;
}

/* ── shared UI atoms ── */

function PillButton({ children, onClick, variant = 'primary', disabled, className, type = 'button', ariaLabel }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean; className?: string; type?: 'button' | 'submit'; ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        variant === 'primary' && 'btn-primary-pill-sm',
        variant === 'secondary' && 'btn-secondary-pill-sm',
        variant === 'ghost' &&
          'inline-flex items-center justify-center gap-2 rounded-full border-2 border-dashed border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:border-emerald-400 hover:text-emerald-700',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      {children}
    </button>
  );
}

function LabeledSlider({ label, value, onChange, min, max, step = 1, format, help, className }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; format?: (v: number) => string;
  help?: string; className?: string;
}) {
  return (
    <FieldShell label={label} help={help} className={className}>
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0] ?? value)}
          aria-label={label}
          className="min-w-0 flex-1"
        />
        <span className="w-20 shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-center font-mono text-xs font-bold text-[#0a0a0a]">
          {format ? format(value) : value}
        </span>
      </div>
    </FieldShell>
  );
}

function ColorField({ label, value, onChange, help, className }: {
  label: string; value: string; onChange: (v: string) => void; help?: string; className?: string;
}) {
  const safe = hexToRgb(value) ? value : '#000000';
  return (
    <FieldShell label={label} help={help} className={className}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} — color picker`}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} — hex value`}
          className="h-11 min-w-0 flex-1 rounded-xl border-gray-200 bg-white font-mono text-sm text-[#0a0a0a]"
        />
      </div>
    </FieldShell>
  );
}

function FileDrop({ onFiles, accept, multiple, title, hint, icon, compact, className }: {
  onFiles: (files: File[]) => void;
  accept: string; multiple?: boolean; title: string; hint?: string;
  icon?: React.ReactNode; compact?: boolean; className?: string;
}) {
  const [over, setOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pick = (files: FileList | null) => {
    const fs = Array.from(files ?? []);
    if (fs.length) onFiles(fs);
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors',
        compact ? 'p-4' : 'p-8 sm:p-10',
        over ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { pick(e.target.files); e.target.value = ''; }}
      />
      <span className={cn('text-emerald-600', compact ? '[&_svg]:size-5' : '[&_svg]:size-8')}>{icon ?? <Upload aria-hidden />}</span>
      <span className={cn('font-bold text-[#0a0a0a]', compact ? 'text-xs' : 'text-sm sm:text-base')}>{title}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/** Checkerboard backdrop so transparent exports are visible. */
const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #e9e9ee 25%, transparent 25%), linear-gradient(-45deg, #e9e9ee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e9e9ee 75%), linear-gradient(-45deg, transparent 75%, #e9e9ee 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
};

function darkened(hex: string, f: number): string {
  const c = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  return rgbToHex(shade(c, -f));
}

/* ═════════════════════ 1. webp-image-converter ═════════════════════ */

type ConvFormat = 'image/webp' | 'image/png' | 'image/jpeg';

const CONV_FORMATS: { value: ConvFormat; label: string; ext: string; lossy: boolean }[] = [
  { value: 'image/webp', label: 'WebP — best compression for the web', ext: 'webp', lossy: true },
  { value: 'image/png', label: 'PNG — lossless, keeps transparency', ext: 'png', lossy: false },
  { value: 'image/jpeg', label: 'JPEG — universal photos format', ext: 'jpg', lossy: true },
];

const WebpConverterTool = () => {
  const [src, setSrc] = React.useState<LoadedImage | null>(null);
  const [format, setFormat] = React.useState<ConvFormat>('image/webp');
  const [quality, setQuality] = React.useState(82);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState<{ blob: Blob; url: string; bytes: number } | null>(null);
  const [webpSupported, setWebpSupported] = React.useState(true);
  const lastUrl = React.useRef<string | null>(null);

  React.useEffect(() => {
    try {
      setWebpSupported(document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'));
    } catch {
      setWebpSupported(false);
    }
  }, []);

  React.useEffect(() => () => {
    if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
  }, []);

  const pickFile = async (files: File[]) => {
    setError('');
    setResult(null);
    try {
      const loaded = await fileToImage(files[0]);
      setSrc(loaded);
    } catch (e) {
      setSrc(null);
      setError((e as Error).message);
    }
  };

  const convert = async () => {
    if (!src || busy) return;
    setBusy(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = src.img.naturalWidth;
      canvas.height = src.img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D is unavailable in this browser.');
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(src.img, 0, 0);
      const blob = await canvasToBlob(canvas, format, format === 'image/png' ? undefined : quality / 100);
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setResult({ blob, url, bytes: blob.size });
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const savedPct = src && result ? ((src.bytes - result.bytes) / src.bytes) * 100 : null;
  const meta = CONV_FORMATS.find((f) => f.value === format) ?? CONV_FORMATS[0];

  return (
    <div className="flex flex-col gap-5">
      {!src ? (
        <FileDrop
          accept="image/*"
          title="Drop an image here or click to browse"
          hint="JPG, PNG, GIF, BMP, HEIC-converted… any format your browser can decode"
          icon={<ImageIcon />}
          onFiles={pickFile}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="card-soft overflow-hidden p-2 sm:col-span-2">
            { }
            <img src={src.url} alt="Original upload" className="mx-auto max-h-56 w-auto rounded-xl object-contain" />
          </div>
          <div className="flex flex-col gap-4 sm:col-span-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Original" value={fmtBytes(src.bytes)} hint={`${src.img.naturalWidth}×${src.img.naturalHeight} px`} />
              <StatCard label="Converted" value={result ? fmtBytes(result.bytes) : '—'} hint={result ? `${meta.ext.toUpperCase()} output` : 'Run a conversion'} />
              <StatCard
                label="Saved"
                value={savedPct === null ? '—' : `${savedPct > 0 ? '−' : '+'}${Math.abs(savedPct).toFixed(1)}%`}
                hint={savedPct === null ? undefined : savedPct > 0 ? 'Smaller file' : 'Format came out larger'}
                tone={savedPct === null ? 'default' : savedPct > 0 ? 'good' : 'warn'}
              />
            </div>
            <SelectInput
              label="Output format"
              value={format}
              onChange={(v) => { setFormat(v as ConvFormat); setResult(null); }}
              options={CONV_FORMATS.map((f) => ({ value: f.value, label: f.label }))}
            />
            {meta.lossy ? (
              <LabeledSlider
                label="Quality"
                value={quality}
                onChange={(v) => { setQuality(v); setResult(null); }}
                min={5} max={100}
                format={(v) => `${v}%`}
                help="80–85 is the sweet spot for photos; go lower for thumbnails, higher for graphics with text."
              />
            ) : (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">PNG is lossless — the quality slider does not apply.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <PillButton onClick={convert} disabled={busy}>
                <RefreshCw className={cn('size-4', busy && 'animate-spin')} /> {busy ? 'Converting…' : `Convert to ${meta.ext.toUpperCase()}`}
              </PillButton>
              {result ? (
                <PillButton variant="secondary" onClick={() => downloadBlob(`${src.name.replace(/\.[^.]+$/, '')}-converted.${meta.ext}`, result.blob)}>
                  <Download className="size-4" /> Download {fmtBytes(result.bytes)}
                </PillButton>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {result ? (
        <div className="card-soft p-3">
          { }
          <img src={result.url} alt="Converted result" className="mx-auto max-h-72 w-auto rounded-xl" />
        </div>
      ) : null}

      {!webpSupported ? (
        <Verdict tone="warn" title="WebP encoding looks unavailable here" message="This browser's canvas cannot produce image/webp — PNG and JPEG output still work. Safari 14+ or any Chromium browser will encode WebP." />
      ) : null}
      {error ? <Verdict tone="bad" title="Conversion failed" message={error} /> : null}

      <ToolNote>
        Animated GIFs convert as their first frame only, and JPEG output flattens transparency onto white. The comparison is always measured on the exact
        bytes this browser produced, so the “saved” figure is real — not an estimate.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 2. app-splash-screen-preview ═════════════════════ */

interface SplashDevice {
  id: string; label: string; w: number; h: number; scale: number; radius: number;
}

const SPLASH_DEVICES: SplashDevice[] = [
  { id: 'iphone15', label: 'iPhone 15 Pro', w: 393, h: 852, scale: 3, radius: 55 },
  { id: 'iphone15-plus', label: 'iPhone 15 Plus', w: 430, h: 932, scale: 3, radius: 55 },
  { id: 'iphone-se', label: 'iPhone SE (home button)', w: 375, h: 667, scale: 2, radius: 0 },
  { id: 'pixel8', label: 'Pixel 8', w: 412, h: 915, scale: 2.625, radius: 46 },
  { id: 'galaxy-s24', label: 'Galaxy S24 Ultra', w: 412, h: 893, scale: 3.5, radius: 40 },
  { id: 'ipad-129', label: 'iPad Pro 12.9"', w: 1024, h: 1366, scale: 2, radius: 18 },
  { id: 'ipad-mini', label: 'iPad mini', w: 744, h: 1133, scale: 2, radius: 18 },
];

const SplashPreviewTool = () => {
  const [deviceId, setDeviceId] = React.useState('iphone15');
  const [bgMode, setBgMode] = React.useState<'solid' | 'gradient'>('gradient');
  const [bg1, setBg1] = React.useState('#059669');
  const [bg2, setBg2] = React.useState('#059669');
  const [bgAngle, setBgAngle] = React.useState(160);
  const [icon, setIcon] = React.useState<LoadedImage | null>(null);
  const [iconScale, setIconScale] = React.useState(24);
  const [iconRadius, setIconRadius] = React.useState(24);
  const [appName, setAppName] = React.useState('My App');
  const [textColor, setTextColor] = React.useState('#ffffff');
  const [showName, setShowName] = React.useState(true);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const device = SPLASH_DEVICES.find((d) => d.id === deviceId) ?? SPLASH_DEVICES[0];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = Math.round(device.w * device.scale);
    const H = Math.round(device.h * device.scale);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bgMode === 'solid') {
      ctx.fillStyle = hexToRgb(bg1) ? bg1 : '#059669';
      ctx.fillRect(0, 0, W, H);
    } else {
      const rad = (bgAngle * Math.PI) / 180;
      const len = Math.abs(W * Math.cos(rad)) + Math.abs(H * Math.sin(rad));
      const cx = W / 2, cy = H / 2;
      const grad = ctx.createLinearGradient(cx - (Math.cos(rad) * len) / 2, cy - (Math.sin(rad) * len) / 2, cx + (Math.cos(rad) * len) / 2, cy + (Math.sin(rad) * len) / 2);
      grad.addColorStop(0, hexToRgb(bg1) ? bg1 : '#059669');
      grad.addColorStop(1, hexToRgb(bg2) ? bg2 : '#059669');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    const iconSize = (Math.min(W, H) * iconScale) / 100;
    const iconX = (W - iconSize) / 2;
    const iconCenterY = H * (showName ? 0.4 : 0.5);
    const iconY = iconCenterY - iconSize / 2;

    ctx.save();
    roundRectPath(ctx, iconX, iconY, iconSize, iconSize, (iconSize * iconRadius) / 100);
    ctx.clip();
    if (icon) {
      ctx.drawImage(icon.img, iconX, iconY, iconSize, iconSize);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(iconX, iconY, iconSize, iconSize);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `600 ${iconSize * 0.42}px ${CANVAS_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((appName.trim()[0] || 'A').toUpperCase(), W / 2, iconCenterY);
    }
    ctx.restore();

    if (showName && appName.trim()) {
      ctx.fillStyle = hexToRgb(textColor) ? textColor : '#ffffff';
      ctx.font = `600 ${Math.round(W * 0.055)}px ${CANVAS_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(appName.trim(), W / 2, iconY + iconSize + W * 0.12);
    }
  }, [device, bgMode, bg1, bg2, bgAngle, icon, iconScale, iconRadius, appName, textColor, showName]);

  const exportPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(`splash-${device.id}.png`, blob);
    } catch {
      /* canvasToBlob already reports via its rejection; nothing else to surface here */
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SelectInput
            label="Device preset"
            value={deviceId}
            onChange={setDeviceId}
            options={SPLASH_DEVICES.map((d) => ({ value: d.id, label: `${d.label} — ${Math.round(d.w * d.scale)}×${Math.round(d.h * d.scale)}` }))}
            help="Exports at the device's full pixel resolution (points × scale factor)."
          />
          <SelectInput
            label="Background style"
            value={bgMode}
            onChange={(v) => setBgMode(v as 'solid' | 'gradient')}
            options={[
              { value: 'solid', label: 'Solid color' },
              { value: 'gradient', label: 'Linear gradient (two colors)' },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label={bgMode === 'gradient' ? 'Gradient start' : 'Background color'} value={bg1} onChange={setBg1} />
            {bgMode === 'gradient' ? <ColorField label="Gradient end" value={bg2} onChange={setBg2} /> : null}
          </div>
          {bgMode === 'gradient' ? (
            <LabeledSlider label="Gradient angle" value={bgAngle} onChange={setBgAngle} min={0} max={360} format={(v) => `${v}°`} />
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          <FileDrop
            compact
            accept="image/*"
            title={icon ? `Icon: ${icon.name} — click to replace` : 'Add app icon (PNG with transparency works best)'}
            icon={<ImageIcon />}
            onFiles={async (files) => {
              try { setIcon(await fileToImage(files[0])); } catch { /* ignore undecodable icon */ }
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <LabeledSlider label="Icon size" value={iconScale} onChange={setIconScale} min={10} max={45} format={(v) => `${v}%`} />
            <LabeledSlider label="Icon corner radius" value={iconRadius} onChange={setIconRadius} min={0} max={50} format={(v) => `${v}%`} help="22% ≈ iOS squircle, 50% = circle." />
          </div>
          <TextInput label="App name" value={appName} onChange={setAppName} placeholder="My App" />
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Name color" value={textColor} onChange={setTextColor} />
            <ToggleInput label="Show app name" checked={showName} onChange={setShowName} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="rounded-3xl border-4 border-[#0a0a0a] bg-[#0a0a0a] p-1 shadow-xl">
          <canvas ref={canvasRef} className="h-auto w-auto max-w-full rounded-[2rem]" style={{ maxHeight: 480 }} aria-label="Splash screen preview" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PillButton onClick={exportPng}>
            <Download className="size-4" /> Export PNG ({Math.round(device.w * device.scale)}×{Math.round(device.h * device.scale)})
          </PillButton>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════ 3. app-store-screenshot-resizer ═════════════════════ */

interface StorePreset { id: string; label: string; w: number; h: number; note: string }

const STORE_PRESETS: StorePreset[] = [
  { id: 'iphone-67', label: 'iPhone 6.7"', w: 1290, h: 2796, note: 'Required for iPhone 15/14 Pro Max listings' },
  { id: 'iphone-65', label: 'iPhone 6.5"', w: 1284, h: 2778, note: 'iPhone 11 / XS Max class devices' },
  { id: 'iphone-55', label: 'iPhone 5.5"', w: 1242, h: 2208, note: 'Legacy App Store support' },
  { id: 'ipad-129', label: 'iPad Pro 12.9"', w: 2048, h: 2732, note: 'Required for universal iOS apps' },
  { id: 'play-phone', label: 'Phone (Play)', w: 1080, h: 1920, note: 'Google Play phone screenshots' },
  { id: 'play-tablet', label: '10" Tablet (Play)', w: 1600, h: 2560, note: 'Google Play tablet screenshots' },
  { id: 'play-foldable', label: 'Foldable (Play)', w: 1170, h: 2532, note: 'Google Play foldable slot' },
];

type StoreFit = 'cover' | 'contain' | 'blur';

const StoreResizerTool = () => {
  const [src, setSrc] = React.useState<LoadedImage | null>(null);
  const [fit, setFit] = React.useState<StoreFit>('blur');
  const [bgColor, setBgColor] = React.useState('#0f172a');
  const [results, setResults] = React.useState<Record<string, { url: string; bytes: number; blob: Blob } | 'error'>>({});
  const [working, setWorking] = React.useState(false);
  const runId = React.useRef(0);
  const urls = React.useRef<string[]>([]);

  React.useEffect(() => () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const generate = React.useCallback(async () => {
    if (!src) return;
    const myRun = ++runId.current;
    setWorking(true);
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    const next: Record<string, { url: string; bytes: number; blob: Blob } | 'error'> = {};
    for (const preset of STORE_PRESETS) {
      if (myRun !== runId.current) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = preset.w;
        canvas.height = preset.h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no 2d');
        if (fit === 'cover') {
          drawImageCover(ctx, src.img, 0, 0, preset.w, preset.h);
        } else if (fit === 'contain') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, preset.w, preset.h);
          drawImageContain(ctx, src.img, 0, 0, preset.w, preset.h);
        } else {
          ctx.save();
          ctx.filter = 'blur(48px) saturate(1.4)';
          ctx.translate(preset.w / 2, preset.h / 2);
          ctx.scale(1.25, 1.25);
          ctx.translate(-preset.w / 2, -preset.h / 2);
          drawImageCover(ctx, src.img, 0, 0, preset.w, preset.h);
          ctx.restore();
          const box = drawImageContain(ctx, src.img, 0, 0, preset.w, preset.h);
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = Math.max(2, preset.w * 0.002);
          roundRectPath(ctx, box.dx - 1, box.dy - 1, box.dw + 2, box.dh + 2, preset.w * 0.012);
          ctx.stroke();
        }
        const blob = await canvasToBlob(canvas, 'image/png');
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        next[preset.id] = { url, bytes: blob.size, blob };
      } catch {
        next[preset.id] = 'error';
      }
      setResults({ ...next });
    }
    if (myRun === runId.current) setWorking(false);
  }, [src, fit, bgColor]);

  return (
    <div className="flex flex-col gap-5">
      {!src ? (
        <FileDrop
          accept="image/*"
          title="Drop your screenshot here"
          hint={'Design once at 1290×2796 (6.7") and every store size below is generated from it'}
          icon={<Crop />}
          onFiles={async (files) => {
            try {
              const loaded = await fileToImage(files[0]);
              setSrc(loaded);
              setResults({});
            } catch { /* undecodable file */ }
          }}
        />
      ) : (
        <>
          <div className="grid items-start gap-4 sm:grid-cols-[1fr_1fr] lg:grid-cols-[240px_1fr]">
            <div className="card-soft p-2">
              { }
              <img src={src.url} alt="Uploaded screenshot" className="mx-auto max-h-64 w-auto rounded-lg" />
              <p className="mt-1 truncate text-center text-xs text-muted-foreground">{src.name} · {src.img.naturalWidth}×{src.img.naturalHeight}</p>
            </div>
            <div className="flex flex-col gap-3">
              <SelectInput
                label="Fill mode"
                value={fit}
                onChange={(v) => { setFit(v as StoreFit); setResults({}); }}
                options={[
                  { value: 'blur', label: 'Blurred backdrop — keep the whole screenshot visible' },
                  { value: 'contain', label: 'Letterbox — solid background bars' },
                  { value: 'cover', label: 'Cover — crop to fill the frame' },
                ]}
              />
              {fit === 'contain' ? <ColorField label="Letterbox color" value={bgColor} onChange={(v) => { setBgColor(v); setResults({}); }} /> : null}
              <div className="flex flex-wrap gap-3">
                <PillButton onClick={generate} disabled={working}>
                  <Wand2 className="size-4" /> {working ? 'Generating…' : results && Object.keys(results).length ? 'Regenerate all sizes' : 'Generate all store sizes'}
                </PillButton>
                <PillButton variant="ghost" onClick={() => { setSrc(null); setResults({}); }}>Choose a different screenshot</PillButton>
              </div>
              <ToolNote>
                Sizes generate sequentially at full store resolution — big canvases take a couple of seconds each. Stores accept extra screenshots beyond the
                required slots, so exporting every preset keeps one set reusable for both App Store Connect and Play Console.
              </ToolNote>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STORE_PRESETS.map((preset) => {
              const raw = results[preset.id];
              const r = raw && raw !== 'error' ? raw : null;
              return (
                <div key={preset.id} className="card-soft flex flex-col gap-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#0a0a0a]">{preset.label}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">{preset.w}×{preset.h}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.note}</p>
                  <div className="flex items-center justify-center overflow-hidden rounded-xl border border-gray-100" style={CHECKER_STYLE}>
                    {r ? (
                       
                      <img src={r.url} alt={`${preset.label} render`} className="max-h-64 w-auto" />
                    ) : (
                      <div className="flex h-40 items-center px-6 text-center text-xs text-gray-400">
                        {raw === 'error' ? 'Export failed for this size' : working ? 'Rendering…' : 'Press “Generate all store sizes”'}
                      </div>
                    )}
                  </div>
                  {r ? (
                    <PillButton variant="secondary" className="!py-2 !text-xs" onClick={() => downloadBlob(`screenshot-${preset.id}.png`, r.blob)}>
                      <Download className="size-4" /> Download PNG · {fmtBytes(r.bytes)}
                    </PillButton>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/* ═════════════════════ 4. mobile-mockup-generator ═════════════════════ */

interface MockupOpts {
  frame: string; bgMode: 'transparent' | 'solid' | 'gradient'; bg1: string; bg2: string;
  shadow: boolean; notch: boolean; scale: number;
}

const MOCKUP_FRAMES = [
  { value: '#1c1c1e', label: 'Graphite' },
  { value: '#f5f5f7', label: 'Silver' },
  { value: '#e7ddcf', label: 'Sand' },
  { value: '#059669', label: 'Brand emerald' },
  { value: '#059669', label: 'Brand emerald' },
  { value: '#0f766e', label: 'Teal' },
];

function drawMockup(canvas: HTMLCanvasElement, img: HTMLImageElement, o: MockupOpts) {
  const s = o.scale;
  const bodyH = 1400 * s;
  const bezel = Math.max(12 * s, bodyH * 0.024);
  const aspect = clamp((img.naturalWidth || 1) / (img.naturalHeight || 1), 0.45, 0.88);
  const screenH = bodyH - bezel * 2;
  const screenW = screenH * aspect;
  const bodyW = screenW + bezel * 2;
  const margin = (o.shadow ? bodyH * 0.075 : bodyH * 0.03);

  canvas.width = Math.round(bodyW + margin * 2);
  canvas.height = Math.round(bodyH + margin * 2);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (o.bgMode === 'solid') {
    ctx.fillStyle = hexToRgb(o.bg1) ? o.bg1 : '#f4f1fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (o.bgMode === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, hexToRgb(o.bg1) ? o.bg1 : '#059669');
    grad.addColorStop(1, hexToRgb(o.bg2) ? o.bg2 : '#059669');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const bx = margin, by = margin;

  if (o.shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(10, 10, 40, 0.45)';
    ctx.shadowBlur = bodyH * 0.055;
    ctx.shadowOffsetY = bodyH * 0.03;
    ctx.fillStyle = o.frame;
    roundRectPath(ctx, bx, by, bodyW, bodyH, bodyW * 0.16);
    ctx.fill();
    ctx.restore();
  }

  // body
  ctx.fillStyle = o.frame;
  roundRectPath(ctx, bx, by, bodyW, bodyH, bodyW * 0.16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2 * s;
  ctx.stroke();

  // screen
  const sx = bx + bezel, sy = by + bezel;
  ctx.save();
  roundRectPath(ctx, sx, sy, screenW, screenH, bodyW * 0.16 - bezel * 0.4);
  ctx.clip();
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(sx, sy, screenW, screenH);
  drawImageCover(ctx, img, sx, sy, screenW, screenH);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5 * s;
  roundRectPath(ctx, sx, sy, screenW, screenH, bodyW * 0.16 - bezel * 0.4);
  ctx.stroke();

  // notch
  if (o.notch) {
    ctx.fillStyle = darkened(o.frame, 0.35);
    roundRectPath(ctx, bx + bodyW / 2 - screenW * 0.21, sy + bezel * 0.28, screenW * 0.42, bezel * 0.85, bezel * 0.42);
    ctx.fill();
  }

  // side buttons
  ctx.fillStyle = darkened(o.frame, 0.4);
  roundRectPath(ctx, bx + bodyW, by + bodyH * 0.28, bezel * 0.38, bodyH * 0.10, bezel * 0.18);
  ctx.fill(); // power
  roundRectPath(ctx, bx - bezel * 0.38, by + bodyH * 0.22, bezel * 0.38, bodyH * 0.06, bezel * 0.18);
  ctx.fill(); // vol up
  roundRectPath(ctx, bx - bezel * 0.38, by + bodyH * 0.30, bezel * 0.38, bodyH * 0.06, bezel * 0.18);
  ctx.fill(); // vol down
}

const MockupGeneratorTool = () => {
  const [src, setSrc] = React.useState<LoadedImage | null>(null);
  const [frame, setFrame] = React.useState('#1c1c1e');
  const [bgMode, setBgMode] = React.useState<'transparent' | 'solid' | 'gradient'>('gradient');
  const [bg1, setBg1] = React.useState('#059669');
  const [bg2, setBg2] = React.useState('#059669');
  const [shadow, setShadow] = React.useState(true);
  const [notch, setNotch] = React.useState(true);
  const [exportScale, setExportScale] = React.useState(2);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    drawMockup(canvas, src.img, { frame, bgMode, bg1, bg2, shadow, notch, scale: 0.45 });
  }, [src, frame, bgMode, bg1, bg2, shadow, notch]);

  const exportPng = async () => {
    if (!src) return;
    setError('');
    try {
      const canvas = document.createElement('canvas');
      drawMockup(canvas, src.img, { frame, bgMode, bg1, bg2, shadow, notch, scale: exportScale });
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(`${src.name.replace(/\.[^.]+$/, '')}-mockup.png`, blob);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {!src ? (
        <FileDrop
          accept="image/*"
          title="Drop your app screenshot here"
          hint="Portrait screenshots look best — landscape ones get letterboxed inside the frame"
          icon={<Smartphone />}
          onFiles={async (files) => {
            setError('');
            try { setSrc(await fileToImage(files[0])); } catch (e) { setError((e as Error).message); }
          }}
        />
      ) : (
        <div className="grid gap-5 lg-split-1fr-320">
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <canvas ref={canvasRef} className="h-auto max-h-[480px] w-auto max-w-full rounded-2xl" aria-label="Phone mockup preview" />
          </div>
          <div className="flex flex-col gap-3">
            <SelectInput label="Frame color" value={frame} onChange={setFrame} options={MOCKUP_FRAMES} />
            <SelectInput
              label="Background"
              value={bgMode}
              onChange={(v) => setBgMode(v as 'transparent' | 'solid' | 'gradient')}
              options={[
                { value: 'gradient', label: 'Brand gradient' },
                { value: 'solid', label: 'Solid color' },
                { value: 'transparent', label: 'Transparent PNG' },
              ]}
            />
            {bgMode !== 'transparent' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField label={bgMode === 'gradient' ? 'Background from' : 'Background color'} value={bg1} onChange={setBg1} />
                {bgMode === 'gradient' ? <ColorField label="Background to" value={bg2} onChange={setBg2} /> : null}
              </div>
            ) : null}
            <ToggleInput label="Drop shadow" checked={shadow} onChange={setShadow} />
            <ToggleInput label="Draw notch" checked={notch} onChange={setNotch} />
            <SelectInput
              label="Export resolution"
              value={String(exportScale)}
              onChange={(v) => setExportScale(Number(v))}
              options={[
                { value: '1', label: '1× — fast, previews and decks' },
                { value: '2', label: '2× — retina websites' },
                { value: '3', label: '3× — large hero sections' },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <PillButton onClick={exportPng}><Download className="size-4" /> Download mockup</PillButton>
              <PillButton variant="ghost" onClick={() => setSrc(null)}>New screenshot</PillButton>
            </div>
            {error ? <Verdict tone="bad" title="Export failed" message={error} /> : null}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═════════════════════ 5. reel-story-size-resizer ═════════════════════ */

interface ReelPreset { id: string; label: string; w: number; h: number; guides: boolean }

const REEL_PRESETS: ReelPreset[] = [
  { id: 'reels', label: 'Reels / Stories / TikTok — 9:16', w: 1080, h: 1920, guides: true },
  { id: 'square', label: 'Feed post — 1:1', w: 1080, h: 1080, guides: false },
  { id: 'portrait', label: 'Feed portrait — 4:5', w: 1080, h: 1350, guides: false },
  { id: 'thumb', label: 'YouTube thumbnail — 16:9', w: 1280, h: 720, guides: false },
];

function renderReel(
  canvas: HTMLCanvasElement, img: HTMLImageElement, preset: ReelPreset,
  zoom: number, offX: number, offY: number, withGuides: boolean, bg: string,
) {
  const cw = preset.w, ch = preset.h;
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = hexToRgb(bg) ? bg : '#0a0a0a';
  ctx.fillRect(0, 0, cw, ch);
  const iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
  const scale = Math.max(cw / iw, ch / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const maxX = Math.max(0, (dw - cw) / 2);
  const maxY = Math.max(0, (dh - ch) / 2);
  ctx.drawImage(img, (cw - dw) / 2 + offX * maxX, (ch - dh) / 2 + offY * maxY, dw, dh);

  if (withGuides && preset.guides) {
    const topH = ch * 0.14;
    const bottomH = ch * 0.17;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
    ctx.fillRect(0, 0, cw, topH);
    ctx.fillRect(0, ch - bottomH, cw, bottomH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.setLineDash([12, 10]);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, topH); ctx.lineTo(cw, topH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, ch - bottomH); ctx.lineTo(cw, ch - bottomH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = `700 ${Math.round(cw * 0.032)}px ${CANVAS_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('platform UI — keep captions and CTAs clear of this zone', cw / 2, topH - cw * 0.03);
    ctx.fillText('caption / engagement bar', cw / 2, ch - bottomH + cw * 0.06);
  }
}

const ReelStoryResizerTool = () => {
  const [src, setSrc] = React.useState<LoadedImage | null>(null);
  const [presetId, setPresetId] = React.useState('reels');
  const [zoom, setZoom] = React.useState(100);
  const [off, setOff] = React.useState({ x: 0, y: 0 });
  const [guides, setGuides] = React.useState(true);
  const [bg, setBg] = React.useState('#0a0a0a');
  const [format, setFormat] = React.useState<'image/png' | 'image/jpeg'>('image/jpeg');
  const [quality, setQuality] = React.useState(90);
  const [busy, setBusy] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const dragRef = React.useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const preset = REEL_PRESETS.find((p) => p.id === presetId) ?? REEL_PRESETS[0];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    renderReel(canvas, src.img, preset, zoom / 100, off.x, off.y, guides, bg);
  }, [src, preset, zoom, off, guides, bg]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!src) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: off.x, oy: off.y };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || !src) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cw = preset.w, ch = preset.h;
    const iw = src.img.naturalWidth || 1, ih = src.img.naturalHeight || 1;
    const scale = Math.max(cw / iw, ch / ih) * (zoom / 100);
    const maxX = Math.max(0.0001, ((iw * scale) - cw) / 2);
    const maxY = Math.max(0.0001, ((ih * scale) - ch) / 2);
    const displayScale = rect.width / cw;
    const nx = clamp(drag.ox + (e.clientX - drag.startX) / displayScale / maxX, -1, 1);
    const ny = clamp(drag.oy + (e.clientY - drag.startY) / displayScale / maxY, -1, 1);
    setOff({ x: nx, y: ny });
  };
  const onPointerUp = () => { dragRef.current = null; };

  const exportImage = async () => {
    if (!src || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      renderReel(canvas, src.img, preset, zoom / 100, off.x, off.y, false, bg);
      const blob = await canvasToBlob(canvas, format, format === 'image/jpeg' ? quality / 100 : undefined);
      downloadBlob(`${src.name.replace(/\.[^.]+$/, '')}-${preset.id}.${format === 'image/png' ? 'png' : 'jpg'}`, blob);
    } catch {
      /* canvasToBlob rejection is the guard; keep UI calm */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {!src ? (
        <FileDrop
          accept="image/*"
          title="Drop the image or exported video frame here"
          hint="Vertical screenshots, product shots and camera rolls all work"
          icon={<Crop />}
          onFiles={async (files) => {
            try { setSrc(await fileToImage(files[0])); } catch { /* ignore undecodable */ }
          }}
        />
      ) : (
        <div className="grid gap-5 lg-split-1fr-340">
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-900 p-3">
            <canvas
              ref={canvasRef}
              className="max-h-[460px] w-auto max-w-full cursor-grab touch-none rounded-lg active:cursor-grabbing"
              aria-label="Crop preview — drag to reposition"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          <div className="flex flex-col gap-3">
            <SelectInput
              label="Output size"
              value={presetId}
              onChange={(v) => { setPresetId(v); setOff({ x: 0, y: 0 }); }}
              options={REEL_PRESETS.map((p) => ({ value: p.id, label: `${p.label} (${p.w}×${p.h})` }))}
            />
            <LabeledSlider
              label="Zoom"
              value={zoom}
              onChange={setZoom}
              min={40} max={300}
              format={(v) => `${v}%`}
              help="Below 100% letterboxes with the background color; drag the preview to reposition."
            />
            <ColorField label="Background (letterbox) color" value={bg} onChange={setBg} />
            {preset.guides ? (
              <ToggleInput
                label="Safe-zone guides"
                checked={guides}
                onChange={setGuides}
                help="Red bands mark the platform UI overlays. Guides are preview-only — exports are always clean."
              />
            ) : null}
            <SelectInput
              label="Export format"
              value={format}
              onChange={(v) => setFormat(v as 'image/png' | 'image/jpeg')}
              options={[
                { value: 'image/jpeg', label: 'JPEG — small files for uploads' },
                { value: 'image/png', label: 'PNG — lossless' },
              ]}
            />
            {format === 'image/jpeg' ? (
              <LabeledSlider label="JPEG quality" value={quality} onChange={setQuality} min={40} max={100} format={(v) => `${v}%`} />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <PillButton onClick={exportImage} disabled={busy}>
                <Download className="size-4" /> {busy ? 'Exporting…' : `Export ${preset.w}×${preset.h}`}
              </PillButton>
              <PillButton variant="ghost" onClick={() => { setSrc(null); setOff({ x: 0, y: 0 }); setZoom(100); }}>New image</PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═════════════════════ 6. profile-picture-resizer ═════════════════════ */

const AVATAR_PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn — 400×400', size: 400 },
  { id: 'instagram', label: 'Instagram — 320×320', size: 320 },
  { id: 'x', label: 'X / Twitter — 400×400', size: 400 },
  { id: 'github', label: 'GitHub — 460×460', size: 460 },
];

function renderAvatar(canvas: HTMLCanvasElement, img: HTMLImageElement, size: number, zoom: number, offX: number, offY: number) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  const iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
  const scale = Math.max(size / iw, size / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const maxX = Math.max(0, (dw - size) / 2);
  const maxY = Math.max(0, (dh - size) / 2);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, (size - dw) / 2 + offX * maxX, (size - dh) / 2 + offY * maxY, dw, dh);
  ctx.restore();
  ctx.strokeStyle = 'rgba(5, 150, 105, 0.55)';
  ctx.lineWidth = Math.max(2, size * 0.008);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();
}

const ProfilePictureResizerTool = () => {
  const [src, setSrc] = React.useState<LoadedImage | null>(null);
  const [platformId, setPlatformId] = React.useState('linkedin');
  const [zoom, setZoom] = React.useState(100);
  const [off, setOff] = React.useState({ x: 0, y: 0 });
  const [busy, setBusy] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const dragRef = React.useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const platform = AVATAR_PLATFORMS.find((p) => p.id === platformId) ?? AVATAR_PLATFORMS[0];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    renderAvatar(canvas, src.img, 320, zoom / 100, off.x, off.y);
  }, [src, zoom, off]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!src) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: off.x, oy: off.y };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || !src) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const iw = src.img.naturalWidth || 1, ih = src.img.naturalHeight || 1;
    const scale = Math.max(320 / iw, 320 / ih) * (zoom / 100);
    const maxX = Math.max(0.0001, ((iw * scale) - 320) / 2);
    const maxY = Math.max(0.0001, ((ih * scale) - 320) / 2);
    const displayScale = rect.width / 320;
    setOff({
      x: clamp(drag.ox + (e.clientX - drag.startX) / displayScale / maxX, -1, 1),
      y: clamp(drag.oy + (e.clientY - drag.startY) / displayScale / maxY, -1, 1),
    });
  };
  const onPointerUp = () => { dragRef.current = null; };

  const exportPng = async () => {
    if (!src || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      renderAvatar(canvas, src.img, platform.size, zoom / 100, off.x, off.y);
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(`avatar-${platform.id}.png`, blob);
    } catch {
      /* guarded */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {!src ? (
        <FileDrop
          accept="image/*"
          title="Drop your photo here"
          hint="One crop, four platform-perfect avatars — the circle preview is exactly what gets exported"
          icon={<Circle />}
          onFiles={async (files) => {
            try { setSrc(await fileToImage(files[0])); } catch { /* ignore */ }
          }}
        />
      ) : (
        <div className="grid gap-5 lg-split-1fr-340">
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <canvas
              ref={canvasRef}
              className="size-56 cursor-grab touch-none rounded-full shadow-lg ring-4 ring-white sm:size-72"
              aria-label="Circular avatar preview — drag to reposition the photo"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          <div className="flex flex-col gap-3">
            <SelectInput
              label="Platform size"
              value={platformId}
              onChange={setPlatformId}
              options={AVATAR_PLATFORMS.map((p) => ({ value: p.id, label: p.label }))}
              help="Every platform stores a square image — corners outside the circle stay transparent."
            />
            <LabeledSlider
              label="Zoom"
              value={zoom}
              onChange={setZoom}
              min={100} max={300}
              format={(v) => `${v}%`}
              help="Drag the circle to reposition; zoom in for a tighter head-and-shoulders crop."
            />
            <div className="flex flex-wrap gap-2">
              <PillButton onClick={exportPng} disabled={busy}>
                <Download className="size-4" /> {busy ? 'Exporting…' : `Export ${platform.size}×${platform.size} PNG`}
              </PillButton>
              <PillButton variant="ghost" onClick={() => { setSrc(null); setZoom(100); setOff({ x: 0, y: 0 }); }}>New photo</PillButton>
            </div>
            <ToolNote>
              The export is a square PNG with fully transparent corners, so it sits cleanly on any profile background — the emerald ring in the preview is a
              guide only and is never drawn into the file. One framing works for every platform, since each stores the same square asset.
            </ToolNote>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═════════════════════ 7. screen-recorder-to-gif ═════════════════════ */

interface GifEncoderInstance {
  writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: number[][]; delay?: number }): void;
  finish(): void;
  bytes(): Uint8Array;
}

type GifSource =
  | { kind: 'video'; label: string; url: string; duration: number; w: number; h: number }
  | { kind: 'frames'; label: string; count: number; w: number; h: number };

const GIF_FPS_OPTIONS = [
  { value: '5', label: '5 fps — tiny files, slideshows' },
  { value: '10', label: '10 fps — balanced (recommended)' },
  { value: '12', label: '12 fps — smooth UI motion' },
  { value: '15', label: '15 fps — silky, larger files' },
];

const GIF_WIDTH_OPTIONS = [
  { value: '320', label: '320 px — chat and docs' },
  { value: '480', label: '480 px — README hero' },
  { value: '640', label: '640 px — landing pages' },
  { value: '800', label: '800 px — big demos' },
];

function tickAsync(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function seekVideo(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      v.removeEventListener('seeked', finish);
      resolve();
    };
    v.addEventListener('seeked', finish);
    try {
      v.currentTime = clamp(t, 0, Math.max(0, (v.duration || t) - 0.001));
    } catch {
      finish();
    }
    window.setTimeout(finish, 2500);
  });
}

async function probeVideo(blob: Blob): Promise<{ el: HTMLVideoElement; url: string; duration: number; w: number; h: number }> {
  const url = URL.createObjectURL(blob);
  const el = document.createElement('video');
  el.preload = 'auto';
  el.muted = true;
  el.playsInline = true;
  el.src = url;
  await new Promise<void>((resolve, reject) => {
    el.onloadeddata = () => resolve();
    el.onerror = () => reject(new Error('This video format cannot be decoded in your browser. Try re-recording or an MP4/WebM file.'));
  });
  try {
    await el.play();
    el.pause();
  } catch {
    /* headless or blocked autoplay — seeking usually still works */
  }
  return { el, url, duration: Number.isFinite(el.duration) ? el.duration : 0, w: el.videoWidth, h: el.videoHeight };
}

const ScreenRecorderToGifTool = () => {
  const [supported, setSupported] = React.useState(true);
  const [recording, setRecording] = React.useState(false);
  const [recSeconds, setRecSeconds] = React.useState(0);
  const [source, setSource] = React.useState<GifSource | null>(null);
  const [fps, setFps] = React.useState('10');
  const [maxWidth, setMaxWidth] = React.useState('480');
  const [building, setBuilding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [statusMsg, setStatusMsg] = React.useState('');
  const [gif, setGif] = React.useState<{ url: string; blob: Blob; bytes: number; frames: number; w: number; h: number } | null>(null);
  const [error, setError] = React.useState('');

  const recRef = React.useRef<MediaRecorder | null>(null);
  const recStreamRef = React.useRef<MediaStream | null>(null);
  const recTimerRef = React.useRef<number | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const videoUrlRef = React.useRef<string | null>(null);
  const framesRef = React.useRef<HTMLImageElement[]>([]);
  const gifUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function');
  }, []);

  React.useEffect(() => {
    if (!recording) return;
    const iv = window.setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(iv);
  }, [recording]);

  React.useEffect(() => () => {
    if (recTimerRef.current !== null) window.clearTimeout(recTimerRef.current);
    recStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    if (gifUrlRef.current) URL.revokeObjectURL(gifUrlRef.current);
  }, []);

  const adoptVideoBlob = async (blob: Blob, label: string) => {
    setError('');
    setGif(null);
    try {
      const probed = await probeVideo(blob);
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = probed.url;
      videoRef.current = probed.el;
      framesRef.current = [];
      if (!probed.duration || !probed.w) throw new Error('The recording has no readable video track — try again or upload a file instead.');
      setSource({ kind: 'video', label, url: probed.url, duration: probed.duration, w: probed.w, h: probed.h });
    } catch (e) {
      setSource(null);
      setError((e as Error).message);
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false });
      recStreamRef.current = stream;
      const mimes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
      const mime = typeof MediaRecorder !== 'undefined' ? mimes.find((m) => MediaRecorder.isTypeSupported(m)) : undefined;
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        if (recTimerRef.current !== null) window.clearTimeout(recTimerRef.current);
        const blob = new Blob(chunksRef.current, { type: mime ?? 'video/webm' });
        chunksRef.current = [];
        void adoptVideoBlob(blob, 'Screen recording');
      };
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (rec.state !== 'inactive') rec.stop();
      });
      rec.start();
      setRecSeconds(0);
      setRecording(true);
      recTimerRef.current = window.setTimeout(() => {
        if (rec.state !== 'inactive') rec.stop();
      }, 30000);
    } catch (e) {
      setRecording(false);
      const msg = (e as Error).message || '';
      setError(/permission|denied|dismissed|cancel/i.test(msg) || e instanceof DOMException
        ? 'Screen capture was cancelled or permission was denied — you can still upload a video or image sequence below.'
        : `Recording could not start: ${msg}`);
    }
  };

  const stopRecording = () => {
    if (recTimerRef.current !== null) window.clearTimeout(recTimerRef.current);
    const rec = recRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  };

  const uploadImages = async (files: File[]) => {
    setError('');
    setGif(null);
    try {
      const capped = files.slice(0, 60);
      const imgs: HTMLImageElement[] = [];
      for (const f of capped) imgs.push((await fileToImage(f)).img);
      if (imgs.length === 0) return;
      framesRef.current = imgs;
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoRef.current = null;
      setSource({ kind: 'frames', label: `${capped.length} uploaded frame${capped.length === 1 ? '' : 's'}`, count: imgs.length, w: imgs[0].naturalWidth, h: imgs[0].naturalHeight });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const buildGif = async () => {
    if (!source || building) return;
    setBuilding(true);
    setError('');
    setGif(null);
    setProgress(0);
    try {
      const nFps = Number(fps) || 10;
      const mw = Number(maxWidth) || 480;
      const canvases: HTMLCanvasElement[] = [];

      if (source.kind === 'video') {
        const v = videoRef.current;
        if (!v) throw new Error('Video source was lost — re-upload or re-record.');
        const span = Math.min(source.duration, 60);
        const count = Math.max(1, Math.min(300, Math.floor(span * nFps)));
        for (let i = 0; i < count; i++) {
          await seekVideo(v, i / nFps);
          const s = Math.min(1, mw / (v.videoWidth || mw));
          const w = Math.max(2, Math.round((v.videoWidth * s) / 2) * 2);
          const h = Math.max(2, Math.round((v.videoHeight * s) / 2) * 2);
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          const cx = c.getContext('2d');
          if (!cx) throw new Error('Canvas 2D is unavailable.');
          cx.drawImage(v, 0, 0, w, h);
          canvases.push(c);
          setProgress(((i + 1) / count) * 0.6);
          setStatusMsg(`Extracting frame ${i + 1} of ${count}…`);
          if (i % 3 === 2) await tickAsync();
        }
      } else {
        for (const im of framesRef.current) {
          const s = Math.min(1, mw / (im.naturalWidth || mw));
          const w = Math.max(2, Math.round((im.naturalWidth * s) / 2) * 2);
          const h = Math.max(2, Math.round((im.naturalHeight * s) / 2) * 2);
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          const cx = c.getContext('2d');
          if (!cx) throw new Error('Canvas 2D is unavailable.');
          cx.drawImage(im, 0, 0, w, h);
          canvases.push(c);
        }
      }

      const { GIFEncoder, quantize, applyPalette } = await loadGifenc();
      const gifEnc: GifEncoderInstance = GIFEncoder();
      const delay = Math.round(1000 / nFps);
      for (let i = 0; i < canvases.length; i++) {
        const cx = canvases[i].getContext('2d');
        if (!cx) throw new Error('Canvas 2D is unavailable.');
        const data = cx.getImageData(0, 0, canvases[i].width, canvases[i].height).data;
        const palette: number[][] = quantize(data, 256);
        const index: Uint8Array = applyPalette(data, palette);
        gifEnc.writeFrame(index, canvases[i].width, canvases[i].height, { palette, delay });
        setProgress(0.6 + ((i + 1) / canvases.length) * 0.4);
        setStatusMsg(`Encoding frame ${i + 1} of ${canvases.length}…`);
        if (i % 2 === 1) await tickAsync();
      }
      gifEnc.finish();
      const bytes = gifEnc.bytes();
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
      if (gifUrlRef.current) URL.revokeObjectURL(gifUrlRef.current);
      const url = URL.createObjectURL(blob);
      gifUrlRef.current = url;
      setGif({ url, blob, bytes: blob.size, frames: canvases.length, w: canvases[0].width, h: canvases[0].height });
      setStatusMsg('');
      setProgress(0);
    } catch (e) {
      setError((e as Error).message);
      setStatusMsg('');
    } finally {
      setBuilding(false);
    }
  };

  const mmss = `${String(Math.floor(recSeconds / 60)).padStart(2, '0')}:${String(recSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-soft flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Video className="size-5 text-emerald-600" aria-hidden />
            <h3 className="font-display text-lg font-bold text-[#0a0a0a]">Record the screen</h3>
          </div>
          {supported ? (
            <>
              <p className="text-sm leading-relaxed text-gray-600">
                Pick a tab, window or the whole screen when the browser asks. Recording auto-stops after 30 seconds, or stop it here — sharing bar “Stop” works too.
              </p>
              {recording ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-600">
                    <span className="size-2.5 animate-pulse rounded-full bg-teal-500" aria-hidden /> REC {mmss}
                  </span>
                  <PillButton variant="secondary" onClick={stopRecording}><Square className="size-4" /> Stop & use take</PillButton>
                </div>
              ) : (
                <div><PillButton onClick={startRecording}><Play className="size-4" /> Start screen recording</PillButton></div>
              )}
            </>
          ) : (
            <Verdict
              tone="warn"
              title="Live capture needs a desktop browser"
              message="getDisplayMedia is unavailable here (mobile browsers mostly). The upload paths below — a video file or numbered image frames — work everywhere and produce the same GIF."
            />
          )}
        </div>
        <div className="card-soft flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Film className="size-5 text-emerald-600" aria-hidden />
            <h3 className="font-display text-lg font-bold text-[#0a0a0a]">Or upload existing footage</h3>
          </div>
          <FileDrop
            compact
            accept="video/*"
            title="Upload a video clip (WebM / MP4)"
            icon={<Video />}
            onFiles={async (files) => { await adoptVideoBlob(files[0], files[0].name); }}
          />
          <FileDrop
            compact
            accept="image/*"
            multiple
            title="Or a numbered image sequence (up to 60 frames)"
            icon={<ImageIcon />}
            onFiles={uploadImages}
          />
        </div>
      </div>

      {source ? (
        <div className="card-soft flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#0a0a0a]">
              Source ready: {source.label}
              {source.kind === 'video' ? ` — ${source.duration.toFixed(1)}s at ${source.w}×${source.h}` : ` — ${source.w}×${source.h}`}
            </p>
            <span className="text-xs text-muted-foreground">First 60 seconds / 300 frames max per GIF</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectInput label="Frame rate" value={fps} onChange={setFps} options={GIF_FPS_OPTIONS} />
            <SelectInput label="Max width" value={maxWidth} onChange={setMaxWidth} options={GIF_WIDTH_OPTIONS} />
          </div>
          {building ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-[#0a0a0a]" role="status">{statusMsg || 'Working…'}</p>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200" aria-hidden>
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
          ) : (
            <div><PillButton onClick={buildGif}><Film className="size-4" /> Build animated GIF</PillButton></div>
          )}
        </div>
      ) : null}

      {gif ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="GIF size" value={fmtBytes(gif.bytes)} />
            <StatCard label="Frames" value={gif.frames} hint="unique stills encoded" />
            <StatCard label="Dimensions" value={`${gif.w}×${gif.h}`} />
          </div>
          <div className="card-soft p-3">
            { }
            <img src={gif.url} alt="Generated GIF preview" className="mx-auto max-h-80 w-auto rounded-xl" style={CHECKER_STYLE} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PillButton onClick={() => downloadBlob('screen-recording.gif', gif.blob)}>
              <Download className="size-4" /> Download GIF · {fmtBytes(gif.bytes)}
            </PillButton>
            <span className="text-xs text-muted-foreground">Looping is built in — GIFs replay automatically everywhere.</span>
          </div>
        </div>
      ) : null}

      {error ? <Verdict tone="bad" title="Something went wrong" message={error} /> : null}
    </div>
  );
};

/* ═════════════════════ 8. app-wireframe-sketcher ═════════════════════ */

interface WfBlock { id: string; type: string; x: number; y: number; w: number; h: number }

const WF_BLOCK_DEFS: { type: string; label: string; w: number; h: number }[] = [
  { type: 'header', label: 'Header bar', w: 1, h: 0.09 },
  { type: 'nav', label: 'Nav bar', w: 1, h: 0.06 },
  { type: 'hero', label: 'Hero block', w: 0.92, h: 0.24 },
  { type: 'image', label: 'Image box', w: 0.44, h: 0.24 },
  { type: 'text', label: 'Text lines', w: 0.62, h: 0.09 },
  { type: 'button', label: 'Button', w: 0.32, h: 0.06 },
  { type: 'input', label: 'Input field', w: 0.62, h: 0.055 },
  { type: 'card', label: 'Card', w: 0.44, h: 0.3 },
  { type: 'tabbar', label: 'Tab bar', w: 1, h: 0.07 },
  { type: 'footer', label: 'Footer', w: 1, h: 0.1 },
];

const WF_DEVICES: Record<string, { label: string; w: number; h: number; ratio: string; radius: number }> = {
  phone: { label: 'Phone screen', w: 300, h: 580, ratio: '300 / 580', radius: 26 },
  desktop: { label: 'Desktop page', w: 680, h: 420, ratio: '680 / 420', radius: 12 },
};

function wfBlockStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'header': return { background: '#e5e7eb', borderRadius: 4 };
    case 'nav': return { background: '#f3f4f6', borderRadius: 4 };
    case 'hero': return { background: 'linear-gradient(120deg, rgba(5,150,105,0.22), rgba(5,150,105,0.22))', borderRadius: 8, border: '1.5px dashed rgba(5,150,105,0.5)' };
    case 'image': return { background: '#eef2f7', borderRadius: 8, border: '1.5px solid #cbd5e1' };
    case 'text': return { background: 'transparent' };
    case 'button': return { background: 'linear-gradient(90deg,#059669,#059669)', borderRadius: 999 };
    case 'input': return { background: '#ffffff', borderRadius: 8, border: '1.5px solid #cbd5e1' };
    case 'card': return { background: '#ffffff', borderRadius: 10, border: '1.5px solid #cbd5e1' };
    case 'tabbar': return { background: '#e5e7eb', borderRadius: 10 };
    case 'footer': return { background: '#e5e7eb', borderRadius: 6 };
    default: return { background: '#f3f4f6' };
  }
}

function drawWfGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // mountain-in-frame glyph used by image-ish blocks
  ctx.save();
  ctx.strokeStyle = '#94a3b8';
  ctx.fillStyle = '#cbd5e1';
  ctx.lineWidth = Math.max(1.5, h * 0.03);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.12, y + h * 0.78);
  ctx.lineTo(x + w * 0.38, y + h * 0.38);
  ctx.lineTo(x + w * 0.58, y + h * 0.66);
  ctx.lineTo(x + w * 0.72, y + h * 0.5);
  ctx.lineTo(x + w * 0.88, y + h * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w * 0.7, y + h * 0.26, Math.max(2, h * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawWfBlock(ctx: CanvasRenderingContext2D, b: WfBlock, W: number, H: number) {
  const x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H;
  ctx.save();
  switch (b.type) {
    case 'header': {
      ctx.fillStyle = '#e5e7eb';
      roundRectPath(ctx, x, y, w, h, 6); ctx.fill();
      ctx.fillStyle = '#9ca3af';
      for (let i = 0; i < 3; i++) { roundRectPath(ctx, x + w * 0.04 + i * w * 0.035, y + h * 0.4, w * 0.025, h * 0.2, 2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(x + w - h * 0.5, y + h / 2, h * 0.22, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'nav': {
      ctx.fillStyle = '#f3f4f6';
      roundRectPath(ctx, x, y, w, h, 6); ctx.fill();
      ctx.fillStyle = '#9ca3af';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + w / 2 + (i - 1) * w * 0.09, y + h / 2, h * 0.14, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'hero': {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, 'rgba(5,150,105,0.25)');
      g.addColorStop(1, 'rgba(5,150,105,0.25)');
      ctx.fillStyle = g;
      ctx.setLineDash([8, 6]);
      roundRectPath(ctx, x, y, w, h, 10); ctx.fill(); ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case 'image': {
      ctx.fillStyle = '#eef2f7';
      roundRectPath(ctx, x, y, w, h, 10); ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; roundRectPath(ctx, x, y, w, h, 10); ctx.stroke();
      drawWfGlyph(ctx, x, y, w, h);
      break;
    }
    case 'text': {
      ctx.fillStyle = '#d1d5db';
      const rows: [number, number][] = [[1, 0], [0.72, 0.36], [0.42, 0.72]];
      for (const [frac, off] of rows) { roundRectPath(ctx, x, y + h * off, w * frac, h * 0.16, h * 0.08); ctx.fill(); }
      break;
    }
    case 'button': {
      const g = ctx.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, '#059669'); g.addColorStop(1, '#059669');
      ctx.fillStyle = g;
      roundRectPath(ctx, x, y, w, h, h / 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.max(9, h * 0.42)}px ${CANVAS_FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Button', x + w / 2, y + h / 2 + 1);
      break;
    }
    case 'input': {
      ctx.fillStyle = '#ffffff';
      roundRectPath(ctx, x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; roundRectPath(ctx, x, y, w, h, 8); ctx.stroke();
      ctx.fillStyle = '#d1d5db';
      roundRectPath(ctx, x + w * 0.05, y + h * 0.32, w * 0.35, h * 0.34, h * 0.16); ctx.fill();
      break;
    }
    case 'card': {
      ctx.fillStyle = '#ffffff';
      roundRectPath(ctx, x, y, w, h, 12); ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; roundRectPath(ctx, x, y, w, h, 12); ctx.stroke();
      drawWfGlyph(ctx, x, y, w, h * 0.6);
      ctx.fillStyle = '#d1d5db';
      roundRectPath(ctx, x + w * 0.08, y + h * 0.72, w * 0.6, h * 0.09, h * 0.04); ctx.fill();
      roundRectPath(ctx, x + w * 0.08, y + h * 0.86, w * 0.42, h * 0.07, h * 0.03); ctx.fill();
      break;
    }
    case 'tabbar': {
      ctx.fillStyle = '#e5e7eb';
      roundRectPath(ctx, x, y, w, h, 10); ctx.fill();
      ctx.fillStyle = '#9ca3af';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + w * (0.14 + i * 0.24), y + h / 2, h * 0.18, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'footer': {
      ctx.fillStyle = '#e5e7eb';
      roundRectPath(ctx, x, y, w, h, 6); ctx.fill();
      ctx.fillStyle = '#9ca3af';
      roundRectPath(ctx, x + w * 0.04, y + h * 0.22, w * 0.24, h * 0.18, 3); ctx.fill();
      roundRectPath(ctx, x + w * 0.04, y + h * 0.55, w * 0.36, h * 0.14, 3); ctx.fill();
      break;
    }
    default:
      ctx.fillStyle = '#f3f4f6';
      roundRectPath(ctx, x, y, w, h, 8); ctx.fill();
  }
  ctx.restore();
}

const WireframeSketcherTool = () => {
  const [device, setDevice] = React.useState<'phone' | 'desktop'>('phone');
  const [blocks, setBlocks] = React.useState<WfBlock[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const historyRef = React.useRef<WfBlock[][]>([]);
  // Render-time mirror of the history depth — refs must not be read in JSX.
  const [canUndo, setCanUndo] = React.useState(false);
  const layerRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{ id: string; startX: number; startY: number; ox: number; oy: number; moved: boolean } | null>(null);

  const dev = WF_DEVICES[device];

  const pushHistory = (snapshot: WfBlock[]) => {
    historyRef.current = [...historyRef.current.slice(-40), snapshot.map((b) => ({ ...b }))];
    setCanUndo(true);
  };

  const addBlock = (type: string) => {
    const def = WF_BLOCK_DEFS.find((d) => d.type === type);
    if (!def) return;
    pushHistory(blocks);
    const idx = blocks.length;
    const b: WfBlock = {
      id: uid(),
      type,
      x: clamp(0.04 + (idx % 4) * 0.05, 0, 1 - def.w),
      y: clamp(0.04 + (idx % 7) * 0.07, 0, 1 - def.h),
      w: def.w,
      h: def.h,
    };
    setBlocks((prev) => [...prev, b]);
    setSelected(b.id);
  };

  const removeSelected = () => {
    if (!selected) return;
    pushHistory(blocks);
    setBlocks((prev) => prev.filter((b) => b.id !== selected));
    setSelected(null);
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
    if (prev) { setBlocks(prev); setSelected(null); }
  };

  const clearAll = () => {
    if (!blocks.length) return;
    pushHistory(blocks);
    setBlocks([]);
    setSelected(null);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); removeSelected(); }
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
     
  }, [selected, blocks]);

  const onBlockPointerDown = (e: React.PointerEvent<HTMLDivElement>, b: WfBlock) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(b.id);
    dragRef.current = { id: b.id, startX: e.clientX, startY: e.clientY, ox: b.x, oy: b.y, moved: false };
  };
  const onBlockPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const layer = layerRef.current;
    if (!d || !layer) return;
    const rect = layer.getBoundingClientRect();
    const b = blocks.find((bl) => bl.id === d.id);
    if (!b) return;
    d.moved = true;
    const nx = clamp(d.ox + (e.clientX - d.startX) / rect.width, 0, 1 - b.w);
    const ny = clamp(d.oy + (e.clientY - d.startY) / rect.height, 0, 1 - b.h);
    setBlocks((prev) => prev.map((bl) => (bl.id === d.id ? { ...bl, x: nx, y: ny } : bl)));
  };
  const onBlockPointerUp = () => { dragRef.current = null; };

  const exportPng = async () => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = dev.w * scale;
    canvas.height = dev.h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    roundRectPath(ctx, 0, 0, dev.w, dev.h, dev.radius);
    ctx.fill();
    ctx.save();
    roundRectPath(ctx, 0, 0, dev.w, dev.h, dev.radius);
    ctx.clip();
    for (const b of blocks) drawWfBlock(ctx, b, dev.w, dev.h);
    ctx.restore();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, 1, 1, dev.w - 2, dev.h - 2, dev.radius);
    ctx.stroke();
    try {
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob('wireframe.png', blob);
    } catch {
      /* guarded */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border-2 border-[#0a0a0a]" role="group" aria-label="Device toggle">
          {(['phone', 'desktop'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={cn('px-4 py-2 text-xs font-bold transition-colors', device === d ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a] hover:bg-gray-100')}
            >
              {WF_DEVICES[d].label}
            </button>
          ))}
        </div>
        <span className="ml-auto flex gap-2">
          <PillButton variant="ghost" onClick={undo} disabled={!canUndo}><Undo2 className="size-4" /> Undo</PillButton>
          <PillButton variant="ghost" onClick={clearAll} disabled={!blocks.length}><Trash2 className="size-4" /> Clear</PillButton>
          <PillButton onClick={exportPng} disabled={!blocks.length}><Download className="size-4" /> Export PNG</PillButton>
        </span>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-bold text-[#0a0a0a]">Click a block to drop it in, then drag to arrange</Label>
        <div className="flex flex-wrap gap-2">
          {WF_BLOCK_DEFS.map((d) => (
            <button
              key={d.type}
              type="button"
              onClick={() => addBlock(d.type)}
              className="rounded-full border-2 border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:border-emerald-400 hover:text-emerald-700"
            >
              + {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center rounded-2xl border border-gray-200 bg-gray-100 p-4 sm:p-6">
        <div
          className="relative bg-white shadow-inner"
          style={{ width: '100%', maxWidth: dev.w, aspectRatio: dev.ratio, borderRadius: dev.radius, border: '2.5px solid #0a0a0a' }}
        >
          <div
            ref={layerRef}
            className="absolute inset-0"
            onPointerDown={() => setSelected(null)}
            role="application"
            aria-label={`Wireframe canvas — ${blocks.length} blocks placed`}
          >
            {blocks.map((b) => (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                aria-label={`${b.type} block`}
                onPointerDown={(e) => onBlockPointerDown(e, b)}
                onPointerMove={onBlockPointerMove}
                onPointerUp={onBlockPointerUp}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelected(b.id); }}
                className={cn(
                  'absolute cursor-grab touch-none select-none active:cursor-grabbing',
                  selected === b.id && 'ring-2 ring-emerald-500 ring-offset-1',
                  b.type === 'text' && 'p-1',
                )}
                style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%`, ...wfBlockStyle(b.type) }}
              >
                {b.type === 'text' ? (
                  <div className="flex h-full w-full flex-col justify-around">
                    <span className="h-1.5 w-full rounded bg-gray-300" />
                    <span className="h-1.5 w-3/4 rounded bg-gray-300" />
                    <span className="h-1.5 w-2/5 rounded bg-gray-300" />
                  </div>
                ) : null}
              </div>
            ))}
            {blocks.length === 0 ? (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-400">
                Empty canvas — add blocks above, then drag them into place.
              </p>
            ) : null}
          </div>
          {selected ? (
            <button
              type="button"
              onClick={() => removeSelected()}
              aria-label="Delete selected block"
              className="absolute -right-3 -top-3 z-10 flex size-7 items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <ToolNote>
        Positions export exactly as arranged — the PNG is rendered from the same normalized layout at 2× resolution, so a 300×580 phone sketch becomes a crisp
        600×1160 image. Blocks stay inside the frame; press Delete with a block selected to remove it.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 9. user-flow-mapper ═════════════════════ */

type FlowNodeType = 'screen' | 'decision' | 'action';

interface FlowNode { id: string; type: FlowNodeType; label: string; x: number; y: number }
interface FlowEdge { id: string; from: string; to: string }

const FLOW_NODE_SIZE: Record<FlowNodeType, { w: number; h: number }> = {
  screen: { w: 170, h: 64 },
  decision: { w: 170, h: 82 },
  action: { w: 150, h: 52 },
};

const FLOW_TYPE_STYLES: Record<FlowNodeType, { fill: string; stroke: string; pill: string; chip: string; label: string }> = {
  screen: { fill: '#ecfdf5', stroke: '#059669', pill: 'bg-emerald-100 text-emerald-700', chip: 'Screen', label: 'Screen' },
  decision: { fill: '#fffbeb', stroke: '#d97706', pill: 'bg-amber-100 text-amber-700', chip: 'Decision', label: 'Decision' },
  action: { fill: '#ecfdf5', stroke: '#059669', pill: 'bg-emerald-100 text-emerald-700', chip: 'Action', label: 'Action' },
};

const PRESET_FLOW_NODES: FlowNode[] = [
  { id: 'n-splash', type: 'screen', label: 'Splash screen', x: 30, y: 250 },
  { id: 'n-signup', type: 'screen', label: 'Sign up', x: 290, y: 50 },
  { id: 'n-home', type: 'screen', label: 'Home feed', x: 290, y: 250 },
  { id: 'n-pro', type: 'decision', label: 'Pro user?', x: 290, y: 450 },
  { id: 'n-trial', type: 'action', label: 'Start free trial', x: 580, y: 465 },
  { id: 'n-upgrade', type: 'action', label: 'Show upgrade', x: 580, y: 265 },
  { id: 'n-lessons', type: 'screen', label: 'Lesson player', x: 790, y: 60 },
];

const PRESET_FLOW_EDGES: FlowEdge[] = [
  { id: 'e1', from: 'n-splash', to: 'n-signup' },
  { id: 'e2', from: 'n-splash', to: 'n-home' },
  { id: 'e3', from: 'n-signup', to: 'n-pro' },
  { id: 'e4', from: 'n-pro', to: 'n-home' },
  { id: 'e5', from: 'n-pro', to: 'n-trial' },
  { id: 'e6', from: 'n-trial', to: 'n-home' },
  { id: 'e7', from: 'n-home', to: 'n-upgrade' },
  { id: 'e8', from: 'n-upgrade', to: 'n-lessons' },
];

function wrapFlowLabel(s: string, max = 15): string[] {
  const words = s.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? cur + ' ' + w : w;
    if (candidate.length <= max) cur = candidate;
    else { if (cur) lines.push(cur); cur = w; }
    if (lines.length === 2) break;
  }
  if (cur && lines.length < 2) lines.push(cur);
  if (words.join(' ').length > lines.join(' ').length) lines[lines.length - 1] = lines[lines.length - 1].slice(0, max - 1) + '…';
  return lines.length ? lines.slice(0, 2) : ['—'];
}

const UserFlowMapperTool = () => {
  const [nodes, setNodes] = React.useState<FlowNode[]>(PRESET_FLOW_NODES);
  const [edges, setEdges] = React.useState<FlowEdge[]>(PRESET_FLOW_EDGES);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = React.useState<string | null>(null);
  const [connectMode, setConnectMode] = React.useState(false);
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const dragRef = React.useRef<{ id: string; dx: number; dy: number } | null>(null);

  const svgPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = 960 / rect.width;
    const sy = 600 / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const addNode = (type: FlowNodeType) => {
    const n: FlowNode = {
      id: uid(),
      type,
      label: FLOW_TYPE_STYLES[type].label === 'Decision' ? 'Choice?' : type === 'screen' ? 'New screen' : 'New action',
      x: 60 + Math.round(Math.random() * 600),
      y: 60 + Math.round(Math.random() * 400),
    };
    setNodes((prev) => [...prev, n]);
    setSelectedNode(n.id);
    setSelectedEdge(null);
  };

  const onNodePointerDown = (e: React.PointerEvent<SVGGElement>, node: FlowNode) => {
    e.stopPropagation();
    const p = svgPoint(e);
    if (!p) return;
    if (connectMode) {
      if (!connectFrom) { setConnectFrom(node.id); return; }
      if (connectFrom !== node.id && !edges.some((ed) => (ed.from === connectFrom && ed.to === node.id) || (ed.from === node.id && ed.to === connectFrom))) {
        setEdges((prev) => [...prev, { id: uid(), from: connectFrom, to: node.id }]);
      }
      setConnectFrom(null);
      return;
    }
    dragRef.current = { id: node.id, dx: p.x - node.x, dy: p.y - node.y };
    setSelectedNode(node.id);
    setSelectedEdge(null);
  };

  const onSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const p = svgPoint(e);
    if (!p) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === d.id
          ? { ...n, x: clamp(p.x - d.dx, 4, 960 - FLOW_NODE_SIZE[n.type].w - 4), y: clamp(p.y - d.dy, 4, 600 - FLOW_NODE_SIZE[n.type].h - 4) }
          : n,
      ),
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNode));
    setEdges((prev) => prev.filter((e) => e.from !== selectedNode && e.to !== selectedNode));
    setSelectedNode(null);
  };
  const deleteSelectedEdge = () => {
    if (!selectedEdge) return;
    setEdges((prev) => prev.filter((e) => e.id !== selectedEdge));
    setSelectedEdge(null);
  };

  const selected = nodes.find((n) => n.id === selectedNode) ?? null;

  const exportSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('[data-noexport]').forEach((el) => el.remove());
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const str = new XMLSerializer().serializeToString(clone);
    downloadText('user-flow.svg', `<?xml version="1.0" encoding="UTF-8"?>\n${str}`, 'image/svg+xml');
  };

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(FLOW_TYPE_STYLES) as FlowNodeType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addNode(t)}
            className={cn('rounded-full px-4 py-2 text-xs font-bold transition-transform hover:scale-105', FLOW_TYPE_STYLES[t].pill)}
          >
            + {FLOW_TYPE_STYLES[t].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setConnectMode((v) => !v); setConnectFrom(null); }}
          aria-pressed={connectMode}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-xs font-bold transition-colors',
            connectMode ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-400',
          )}
        >
          <Link2 className="size-3.5" aria-hidden /> {connectMode ? 'Connecting — pick A, then B' : 'Connect nodes'}
        </button>
        <span className="ml-auto flex gap-2">
          <PillButton variant="ghost" onClick={() => { setNodes(PRESET_FLOW_NODES); setEdges(PRESET_FLOW_EDGES); setSelectedNode(null); setSelectedEdge(null); }}>
            <Workflow className="size-4" /> Load example
          </PillButton>
          <PillButton onClick={exportSvg}><Download className="size-4" /> Export SVG</PillButton>
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <svg
          ref={svgRef}
          viewBox="0 0 960 600"
          className="block h-auto w-full touch-none select-none bg-white"
          role="img"
          aria-label="User flow diagram"
          onPointerMove={onSvgPointerMove}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerLeave={() => { dragRef.current = null; }}
        >
          <defs>
            <pattern id="flow-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#e5e7eb" />
            </pattern>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
            </marker>
          </defs>
          <rect width="960" height="600" fill="url(#flow-dots)" />
          {edges.map((e) => {
            const a = nodeById.get(e.from);
            const b = nodeById.get(e.to);
            if (!a || !b) return null;
            const x1 = a.x + FLOW_NODE_SIZE[a.type].w / 2;
            const y1 = a.y + FLOW_NODE_SIZE[a.type].h / 2;
            const x2 = b.x + FLOW_NODE_SIZE[b.type].w / 2;
            const y2 = b.y + FLOW_NODE_SIZE[b.type].h / 2;
            const sel = selectedEdge === e.id;
            return (
              <g key={e.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={sel ? '#059669' : '#9ca3af'} strokeWidth={sel ? 3 : 2} markerEnd="url(#flow-arrow)" />
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedEdge(e.id); setSelectedNode(null); }}
                />
              </g>
            );
          })}
          {nodes.map((n) => {
            const s = FLOW_NODE_SIZE[n.type];
            const st = FLOW_TYPE_STYLES[n.type];
            const lines = wrapFlowLabel(n.label);
            const isSel = selectedNode === n.id;
            const isFrom = connectFrom === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                style={{ cursor: connectMode ? 'crosshair' : 'grab' }}
                onPointerDown={(e) => onNodePointerDown(e, n)}
              >
                {n.type === 'decision' ? (
                  <polygon
                    points={`${s.w / 2},0 ${s.w},${s.h / 2} ${s.w / 2},${s.h} 0,${s.h / 2}`}
                    fill={st.fill}
                    stroke={isFrom ? '#059669' : isSel ? '#0a0a0a' : st.stroke}
                    strokeWidth={isSel || isFrom ? 3 : 1.8}
                  />
                ) : (
                  <rect
                    width={s.w}
                    height={s.h}
                    rx={n.type === 'action' ? 26 : 14}
                    fill={st.fill}
                    stroke={isFrom ? '#059669' : isSel ? '#0a0a0a' : st.stroke}
                    strokeWidth={isSel || isFrom ? 3 : 1.8}
                  />
                )}
                {n.type === 'screen' ? (
                  <rect x={10} y={8} width={s.w - 20} height={9} rx={4.5} fill={st.stroke} opacity={0.55} />
                ) : null}
                {lines.map((ln, i) => (
                  <text
                    key={i}
                    x={s.w / 2}
                    y={s.h / 2 + (i - (lines.length - 1) / 2) * 16 + 4}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="#374151"
                    style={{ pointerEvents: 'none' }}
                  >
                    {ln}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TextInput
          label="Selected node label"
          value={selected ? selected.label : ''}
          onChange={(v) => selected && setNodes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, label: v } : n)))}
          placeholder={selected ? undefined : 'Click a node first'}
          help={selected ? FLOW_TYPE_STYLES[selected.type].label : 'Nodes are draggable — grab and move them anywhere.'}
        />
        <div className="flex flex-col justify-end gap-2">
          <PillButton variant="secondary" onClick={deleteSelectedNode} disabled={!selectedNode}>
            <Trash2 className="size-4" /> Delete node {selectedNode ? ' + its arrows' : ''}
          </PillButton>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <PillButton variant="secondary" onClick={deleteSelectedEdge} disabled={!selectedEdge}>
            <Trash2 className="size-4" /> Delete selected arrow
          </PillButton>
        </div>
      </div>

      <ToolNote>
        Arrows are drawn between node centers and stay attached while you drag, so re-routing is just moving the shape. The exported SVG keeps the dotted
        grid, colors and arrowheads — it opens cleanly in Figma, Excalidraw or any browser and scales without blurring.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 10. color-code-converter ═════════════════════ */

const SHADE_STEPS: { label: string; t: number }[] = [
  { label: '50', t: 0.92 }, { label: '100', t: 0.84 }, { label: '200', t: 0.68 }, { label: '300', t: 0.5 },
  { label: '400', t: 0.3 }, { label: '500', t: 0 }, { label: '600', t: -0.18 }, { label: '700', t: -0.36 },
  { label: '800', t: -0.54 }, { label: '900', t: -0.72 }, { label: '950', t: -0.84 },
];

const ColorConverterTool = () => {
  const [rgb, setRgb] = React.useState<RGB>({ r: 124, g: 58, b: 237 });
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const { copy } = useCopy();
  const [flash, setFlash] = React.useState('');

  const hex = rgbToHex(rgb).toUpperCase();
  const hsl = rgbToHsl(rgb);
  const cmyk = rgbToCmyk(rgb);

  const canonical: Record<string, string> = {
    hex: hex,
    rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    hsl: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
    cmyk: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
  };
  const copyValues: Record<string, string> = {
    hex: hex,
    rgb: `rgb(${canonical.rgb})`,
    hsl: `hsl(${canonical.hsl})`,
    cmyk: `cmyk(${canonical.cmyk})`,
  };

  const parsers: Record<string, (raw: string) => RGB | null> = {
    hex: (raw) => hexToRgb(raw),
    rgb: (raw) => {
      const n = parseNumbers(raw);
      return n.length >= 3 ? { r: clamp(Math.round(n[0]), 0, 255), g: clamp(Math.round(n[1]), 0, 255), b: clamp(Math.round(n[2]), 0, 255) } : null;
    },
    hsl: (raw) => {
      const n = parseNumbers(raw);
      return n.length >= 3 ? hslToRgb(n[0], n[1], n[2]) : null;
    },
    cmyk: (raw) => {
      const n = parseNumbers(raw);
      return n.length >= 4 ? cmykToRgb(n[0], n[1], n[2], n[3]) : null;
    },
  };

  const onChange = (key: string, raw: string) => {
    setDrafts((d) => ({ ...d, [key]: raw }));
    const c = parsers[key](raw);
    if (c) setRgb(c);
  };
  const clearDraft = (key: string) => () =>
    setDrafts((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });

  const copyAndFlash = (key: string) => {
    void copy(copyValues[key]);
    setFlash(key);
    window.setTimeout(() => setFlash(''), 1500);
  };

  const lightText = perceivedBrightness(rgb) > 150;

  const fields: { key: string; label: string; hint: string }[] = [
    { key: 'hex', label: 'HEX', hint: '3 or 6 digits, # optional' },
    { key: 'rgb', label: 'RGB', hint: 'r, g, b — 0 to 255' },
    { key: 'hsl', label: 'HSL', hint: 'hue 0–360°, saturation %, lightness %' },
    { key: 'cmyk', label: 'CMYK', hint: 'c, m, y, k percentages for print' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg-split-340-1fr">
        <div
          className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-gray-200 shadow-inner"
          style={{ backgroundColor: hex }}
          role="img"
          aria-label={`Color preview ${hex}`}
        >
          <p className={cn('font-mono text-2xl font-bold', lightText ? 'text-[#0a0a0a]' : 'text-white')}>{hex}</p>
          <p className={cn('mt-1 text-xs font-semibold', lightText ? 'text-[#0a0a0a]/70' : 'text-white/70')}>
            {rgb.r} {rgb.g} {rgb.b} · HSL {hsl.h}° {hsl.s}% {hsl.l}%
          </p>
        </div>
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <FieldShell key={f.key} label={f.label} help={f.hint}>
              <div className="flex items-center gap-2">
                <Input
                  value={drafts[f.key] !== undefined ? drafts[f.key] : canonical[f.key]}
                  onFocus={() => setDrafts((d) => ({ ...d, [f.key]: canonical[f.key] }))}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  onBlur={clearDraft(f.key)}
                  aria-label={`${f.label} color value`}
                  className="h-11 min-w-0 flex-1 rounded-xl border-gray-200 bg-white font-mono text-sm text-[#0a0a0a]"
                />
                <button
                  type="button"
                  onClick={() => copyAndFlash(f.key)}
                  aria-label={`Copy ${f.label} value`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
                >
                  {flash === f.key ? <Check className="size-4 text-emerald-500" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                </button>
              </div>
            </FieldShell>
          ))}
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Edit any field — the others update live. Invalid input is simply ignored until it parses.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm font-bold text-[#0a0a0a]">Shade & tint scale</Label>
          <span className="text-xs text-muted-foreground">Click a step to make it the working color</span>
        </div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {SHADE_STEPS.map((s) => {
            const c = rgbToHex(shade(rgb, s.t));
            return (
              <button
                key={s.label}
                type="button"
                title={`${s.label} — ${c}`}
                aria-label={`Set ${s.label} shade ${c} as working color`}
                onClick={() => { const parsed = hexToRgb(c); if (parsed) setRgb(parsed); }}
                className="group flex h-14 flex-col justify-end rounded-xl border border-black/10 transition-transform hover:scale-105 sm:h-16"
                style={{ backgroundColor: c }}
              >
                <span className={cn('rounded-bl-xl px-1 pb-0.5 text-[10px] font-bold', perceivedBrightness(hexToRgb(c) ?? rgb) > 150 ? 'text-black/70' : 'text-white/85')}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ToolNote>
        The 50–950 ladder follows the Tailwind convention designers expect: low numbers are tints mixed toward white, high numbers shades mixed toward black,
        with 500 as the untouched input. It is generated from the exact color you typed, so brand palettes stay mathematically consistent.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 11. gradient-css-generator ═════════════════════ */

interface GradStop { color: string; pos: number }

const GRADIENT_PRESETS: { name: string; colors: [string, string]; angle: number }[] = [
  { name: 'Brand pop', colors: ['#059669', '#059669'], angle: 90 },
  { name: 'Sunset', colors: ['#f59e0b', '#059669'], angle: 45 },
  { name: 'Ocean', colors: ['#059669', '#059669'], angle: 135 },
  { name: 'Mint', colors: ['#10b981', '#a7f3d0'], angle: 120 },
  { name: 'Midnight', colors: ['#0f172a', '#059669'], angle: 160 },
  { name: 'Peach', colors: ['#5eead4', '#fcd34d'], angle: 60 },
  { name: 'Aurora', colors: ['#34d399', '#059669'], angle: 110 },
  { name: 'Lava', colors: ['#ef4444', '#fbbf24'], angle: 30 },
];

const GradientGeneratorTool = () => {
  const [stops, setStops] = React.useState<GradStop[]>([
    { color: '#059669', pos: 0 },
    { color: '#059669', pos: 100 },
  ]);
  const [kind, setKind] = React.useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = React.useState(90);

  const stopsCss = stops.map((s) => `${hexToRgb(s.color) ? s.color : '#000000'} ${s.pos}%`).join(', ');
  const modern = kind === 'linear'
    ? `linear-gradient(${angle}deg, ${stopsCss})`
    : `radial-gradient(circle at center, ${stopsCss})`;
  const legacy = kind === 'linear'
    ? `-webkit-linear-gradient(${(((90 - angle) % 360) + 360) % 360}deg, ${stopsCss})`
    : `-webkit-radial-gradient(circle at center, ${stopsCss})`;

  const css = `.gradient {\n  background-image: ${legacy};\n  background-image: ${modern};\n}`;

  const setStop = (i: number, patch: Partial<GradStop>) =>
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const applyPreset = (p: (typeof GRADIENT_PRESETS)[number]) => {
    setStops([
      { color: p.colors[0], pos: 0 },
      { color: p.colors[1], pos: 100 },
    ]);
    setAngle(p.angle);
    setKind('linear');
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="h-48 rounded-2xl border border-gray-200 shadow-inner sm:h-60"
        style={{ backgroundImage: modern }}
        role="img"
        aria-label="Live gradient preview"
      />

      <div>
        <Label className="mb-2 block text-sm font-bold text-[#0a0a0a]">Preset gallery</Label>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              title={`${p.name} — click to load`}
              className="group flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white py-1 pl-1 pr-3.5 text-xs font-bold text-gray-700 transition-colors hover:border-emerald-400"
            >
              <span className="size-6 rounded-full border border-black/10" style={{ backgroundImage: `linear-gradient(90deg, ${p.colors[0]}, ${p.colors[1]})` }} aria-hidden />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex overflow-hidden rounded-full border-2 border-[#0a0a0a] self-start" role="group" aria-label="Gradient type">
            {(['linear', 'radial'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={cn('px-5 py-2 text-xs font-bold capitalize transition-colors', kind === k ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a] hover:bg-gray-100')}
              >
                {k}
              </button>
            ))}
          </div>
          {kind === 'linear' ? (
            <LabeledSlider label="Angle" value={angle} onChange={setAngle} min={0} max={360} format={(v) => `${v}°`} help="0° points up, 90° points right, 180° points down." />
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          {stops.map((s, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex items-end gap-3">
                <ColorField label={`Stop ${i + 1}`} value={s.color} onChange={(v) => setStop(i, { color: v })} className="flex-1" />
                {stops.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label={`Remove stop ${i + 1}`}
                    className="mb-1 flex size-9 items-center justify-center rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                ) : null}
              </div>
              <LabeledSlider label="Position" value={s.pos} onChange={(v) => setStop(i, { pos: v })} min={0} max={100} format={(v) => `${v}%`} className="mt-2" />
            </div>
          ))}
          {stops.length < 3 ? (
            <PillButton
              variant="ghost"
              className="self-start"
              onClick={() => setStops((prev) => [...prev.slice(0, 1), { color: '#ffffff', pos: 50 }, ...prev.slice(1)])}
            >
              <Plus className="size-4" /> Add middle stop
            </PillButton>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label className="text-sm font-bold text-[#0a0a0a]">Generated CSS</Label>
          <CopyButton value={css} label="Copy CSS" />
        </div>
        <OutputBox value={css} language="css" />
      </div>

      <ToolNote>
        Both declarations matter: the -webkit- line covers older WebKit builds still common in embedded webviews, and browsers that understand the modern
        syntax override it because it comes last. The legacy angle is converted for you (WebKit measured degrees counter-clockwise from east, not from north).
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 12. box-shadow-generator ═════════════════════ */

interface ShadowLayer { x: number; y: number; blur: number; spread: number; color: string; opacity: number; inset: boolean }

const SHADOW_DEFAULT_1: ShadowLayer = { x: 0, y: 18, blur: 40, spread: -12, color: '#059669', opacity: 35, inset: false };
const SHADOW_DEFAULT_2: ShadowLayer = { x: 0, y: 2, blur: 4, spread: 0, color: '#0a0a0a', opacity: 10, inset: false };

function shadowLayerCss(l: ShadowLayer): string {
  return `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexWithAlpha(l.color, l.opacity)}`;
}

function ShadowLayerEditor({ layer, onChange, title }: {
  layer: ShadowLayer; onChange: (patch: Partial<ShadowLayer>) => void; title: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <p className="font-display text-sm font-bold text-[#0a0a0a]">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <LabeledSlider label="Offset X" value={layer.x} onChange={(v) => onChange({ x: v })} min={-60} max={60} format={(v) => `${v}px`} />
        <LabeledSlider label="Offset Y" value={layer.y} onChange={(v) => onChange({ y: v })} min={-60} max={60} format={(v) => `${v}px`} />
        <LabeledSlider label="Blur" value={layer.blur} onChange={(v) => onChange({ blur: v })} min={0} max={120} format={(v) => `${v}px`} />
        <LabeledSlider label="Spread" value={layer.spread} onChange={(v) => onChange({ spread: v })} min={-60} max={60} format={(v) => `${v}px`} />
        <LabeledSlider label="Opacity" value={layer.opacity} onChange={(v) => onChange({ opacity: v })} min={0} max={100} format={(v) => `${v}%`} />
        <ColorField label="Color" value={layer.color} onChange={(v) => onChange({ color: v })} />
      </div>
      <ToggleInput label="Inset shadow" checked={layer.inset} onChange={(v) => onChange({ inset: v })} help="Draws inside the element — great for pressed states and inner glows." />
    </div>
  );
}

const BoxShadowGeneratorTool = () => {
  const [layer1, setLayer1] = React.useState<ShadowLayer>(SHADOW_DEFAULT_1);
  const [useLayer2, setUseLayer2] = React.useState(true);
  const [layer2, setLayer2] = React.useState<ShadowLayer>(SHADOW_DEFAULT_2);
  const [cardBg, setCardBg] = React.useState('#ffffff');
  const [pageBg, setPageBg] = React.useState('#f4f1fa');

  const shadowCss = useLayer2 ? `${shadowLayerCss(layer1)}, ${shadowLayerCss(layer2)}` : shadowLayerCss(layer1);
  const fullCss = `.card {\n  box-shadow: ${shadowCss};\n}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-center gap-4 rounded-2xl border border-gray-200 lg:grid-cols-[1fr_280px]" style={{ backgroundColor: pageBg }}>
        <div className="flex min-h-64 items-center justify-center p-8">
          <div
            className="h-40 w-56 rounded-3xl transition-shadow sm:h-44 sm:w-64"
            style={{ backgroundColor: hexToRgb(cardBg) ? cardBg : '#ffffff', boxShadow: shadowCss }}
            role="img"
            aria-label="Live box shadow preview"
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-200 p-4 lg:border-l lg:border-t-0">
          <ColorField label="Card color" value={cardBg} onChange={setCardBg} />
          <ColorField label="Backdrop color" value={pageBg} onChange={setPageBg} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ShadowLayerEditor title="Layer 1 — the main shadow" layer={layer1} onChange={(patch) => setLayer1((p) => ({ ...p, ...patch }))} />
        <div className="flex flex-col gap-3">
          <ToggleInput label="Enable layer 2" checked={useLayer2} onChange={setUseLayer2} help="Two stacked shadows read as more natural depth: one soft ambient, one tight contact edge." />
          {useLayer2 ? (
            <ShadowLayerEditor title="Layer 2 — contact / accent" layer={layer2} onChange={(patch) => setLayer2((p) => ({ ...p, ...patch }))} />
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label className="text-sm font-bold text-[#0a0a0a]">Generated CSS</Label>
          <CopyButton value={fullCss} label="Copy CSS" />
        </div>
        <OutputBox value={fullCss} language="css" />
      </div>
    </div>
  );
};

/* ═════════════════════ 13. border-radius-generator ═════════════════════ */

const BLOB_PRESETS: { name: string; h: number[]; v: number[] }[] = [
  { name: 'Blob', h: [30, 70, 70, 30], v: [30, 30, 70, 70] },
  { name: 'Pebble', h: [43, 57, 55, 45], v: [48, 52, 48, 52] },
  { name: 'Leaf', h: [70, 30, 70, 30], v: [30, 70, 30, 70] },
  { name: 'Egg', h: [50, 50, 50, 50], v: [60, 60, 40, 40] },
];

const CORNER_NAMES = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

const BorderRadiusTool = () => {
  const [mode, setMode] = React.useState<'corners' | 'blob'>('corners');
  const [corners, setCorners] = React.useState<number[]>([24, 24, 24, 24]);
  const [link, setLink] = React.useState(false);
  const [blobH, setBlobH] = React.useState<number[]>([30, 70, 70, 30]);
  const [blobV, setBlobV] = React.useState<number[]>([30, 30, 70, 70]);

  const setCorner = (i: number, v: number) => {
    if (link) setCorners([v, v, v, v]);
    else setCorners((prev) => prev.map((c, idx) => (idx === i ? v : c)));
  };

  const radiusCss = mode === 'corners'
    ? corners.map((c) => `${c}px`).join(' ')
    : `${blobH.map((v) => `${v}%`).join(' ')} / ${blobV.map((v) => `${v}%`).join(' ')}`;
  const fullCss = `.shape {\n  border-radius: ${radiusCss};\n}`;

  const randomizeBlob = () => {
    const r = () => 20 + Math.round(Math.random() * 60);
    setBlobH([r(), r(), r(), r()]);
    setBlobV([r(), r(), r(), r()]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-center justify-items-center gap-4 rounded-2xl border border-gray-200 bg-[#f4f1fa] p-8">
        <div
          className="size-52 bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-lg transition-all duration-200 sm:size-64"
          style={{ borderRadius: radiusCss }}
          role="img"
          aria-label="Live border radius preview"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border-2 border-[#0a0a0a]" role="group" aria-label="Radius mode">
          {(['corners', 'blob'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn('px-5 py-2 text-xs font-bold capitalize transition-colors', mode === m ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a] hover:bg-gray-100')}
            >
              {m === 'corners' ? 'Per-corner (px)' : 'Organic blob (%)'}
            </button>
          ))}
        </div>
        {mode === 'blob' ? (
          <PillButton variant="ghost" onClick={randomizeBlob}><Sparkles className="size-4" /> Randomize blob</PillButton>
        ) : (
          <div className="max-w-56"><ToggleInput label="Link all corners" checked={link} onChange={setLink} /></div>
        )}
      </div>

      {mode === 'corners' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {corners.map((c, i) => (
            <LabeledSlider key={CORNER_NAMES[i]} label={`${CORNER_NAMES[i]}`} value={c} onChange={(v) => setCorner(i, v)} min={0} max={160} format={(v) => `${v}px`} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {[
            { title: 'Horizontal radii (left-top, right-top, right-bottom, left-bottom)', values: blobH, set: setBlobH },
            { title: 'Vertical radii (same order)', values: blobV, set: setBlobV },
          ].map((group) => (
            <div key={group.title} className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">{group.title}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.values.map((v, i) => (
                  <LabeledSlider key={i} label={CORNER_NAMES[i]} value={v} onChange={(nv) => group.set(group.values.map((old, idx) => (idx === i ? nv : old)))} min={0} max={100} format={(nv) => `${nv}%`} />
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {BLOB_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => { setBlobH([...p.h]); setBlobV([...p.v]); }}
                className="rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition-colors hover:border-emerald-400 hover:text-emerald-700"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label className="text-sm font-bold text-[#0a0a0a]">Generated CSS</Label>
          <CopyButton value={fullCss} label="Copy CSS" />
        </div>
        <OutputBox value={fullCss} language="css" />
      </div>

      <ToolNote>
        Blob mode uses the two-axis border-radius syntax — four horizontal radii, a slash, then four vertical radii — which is how squircles, leaves and
        organic shapes are possible in pure CSS with no SVG mask or clip-path involved.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 14. instagram-grid-planner ═════════════════════ */

interface GridTile {
  key: string;
  kind: 'image' | 'color';
  img?: HTMLImageElement;
  url?: string;
  name?: string;
  color?: string;
  lum: number;
}

const GRID_SNAKE_ORDER = [0, 1, 2, 5, 4, 3, 6, 7, 8]; // boustrophedon reading order for tone alternation

const InstagramGridPlannerTool = () => {
  const [slots, setSlots] = React.useState<(GridTile | null)[]>(Array(9).fill(null));
  const [selected, setSelected] = React.useState<number | null>(null);
  const [aspect, setAspect] = React.useState<'1:1' | '2:3'>('1:1');
  const [placeholderColor, setPlaceholderColor] = React.useState('#059669');
  const [busy, setBusy] = React.useState(false);

  const filled = slots.filter(Boolean).length;

  const fillNext = (tile: GridTile) => {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s === null);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = tile;
      return next;
    });
  };

  const uploadImages = async (files: File[]) => {
    const room = 9 - filled;
    for (const f of files.slice(0, Math.max(0, room))) {
      try {
        const loaded = await fileToImage(f);
        fillNext({ key: uid(), kind: 'image', img: loaded.img, url: loaded.url, name: loaded.name, lum: imageAverageLum(loaded.img) });
      } catch {
        /* skip undecodable */
      }
    }
  };

  const addColorTile = () => {
    const c = hexToRgb(placeholderColor) ?? { r: 124, g: 58, b: 237 };
    fillNext({ key: uid(), kind: 'color', color: placeholderColor, lum: perceivedBrightness(c) });
  };

  const onSlotClick = (i: number) => {
    if (selected === null) {
      if (slots[i]) setSelected(i);
      return;
    }
    if (selected === i) { setSelected(null); return; }
    setSlots((prev) => {
      const next = [...prev];
      const tmp = next[selected];
      next[selected] = next[i];
      next[i] = tmp;
      return next;
    });
    setSelected(null);
  };

  const removeTile = (i: number) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? null : s)));
    setSelected(null);
  };

  const alternateTones = () => {
    const tiles = slots.filter((s): s is GridTile => s !== null);
    if (tiles.length < 3) return;
    const sorted = [...tiles].sort((a, b) => b.lum - a.lum);
    setSlots(() => {
      const next: (GridTile | null)[] = Array(9).fill(null);
      sorted.forEach((t, i) => { next[GRID_SNAKE_ORDER[i]] = t; });
      return next;
    });
    setSelected(null);
  };

  const exportGrid = async () => {
    if (busy || filled === 0) return;
    setBusy(true);
    try {
      const cell = 480;
      const cellH = aspect === '2:3' ? 720 : cell;
      const canvas = document.createElement('canvas');
      canvas.width = cell * 3;
      canvas.height = cellH * 3;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      for (let i = 0; i < 9; i++) {
        const x = (i % 3) * cell;
        const y = Math.floor(i / 3) * cellH;
        const tile = slots[i];
        if (!tile) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, y, cell, cellH);
        } else if (tile.kind === 'color') {
          ctx.fillStyle = tile.color ?? '#059669';
          ctx.fillRect(x, y, cell, cellH);
        } else if (tile.img) {
          drawImageCover(ctx, tile.img, x, y, cell, cellH);
        }
      }
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob('instagram-grid.png', blob);
    } catch {
      /* guarded */
    } finally {
      setBusy(false);
    }
  };

  const cellAspect = aspect === '1:1' ? 'aspect-square' : 'aspect-[2/3]';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border-2 border-[#0a0a0a]" role="group" aria-label="Tile aspect">
          {(['1:1', '2:3'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAspect(a)}
              aria-pressed={aspect === a}
              className={cn('px-4 py-2 text-xs font-bold transition-colors', aspect === a ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a] hover:bg-gray-100')}
            >
              {a === '1:1' ? 'Square tiles' : '2:3 portrait'}
            </button>
          ))}
        </div>
        <PillButton variant="ghost" onClick={alternateTones} disabled={filled < 3}><Sparkles className="size-4" /> Alternate light/dark</PillButton>
        <PillButton onClick={exportGrid} disabled={!filled || busy}><Download className="size-4" /> {busy ? 'Exporting…' : 'Export grid PNG'}</PillButton>
        <span className="text-xs font-bold text-gray-500">{filled}/9 tiles placed</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
        <div className="grid grid-cols-3 gap-1.5">
          {slots.map((tile, i) => (
            <div key={i} className="relative">
              <button
                type="button"
                onClick={() => onSlotClick(i)}
                aria-label={`Grid slot ${i + 1}${tile ? ` — ${tile.kind === 'color' ? 'color tile' : tile.name ?? 'image'}` : ' (empty)'}`}
                className={cn(
                  'flex w-full items-center justify-center overflow-hidden rounded-lg border-2 bg-white transition-all',
                  cellAspect,
                  selected === i ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-transparent hover:border-emerald-300',
                )}
                style={tile ? undefined : CHECKER_STYLE}
              >
                {tile ? (
                  tile.kind === 'color' ? (
                    <span className="h-full w-full" style={{ backgroundColor: tile.color }} />
                  ) : (
                     
                    <img src={tile.url} alt="" className="h-full w-full object-cover" />
                  )
                ) : (
                  <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                )}
              </button>
              {tile ? (
                <button
                  type="button"
                  onClick={() => removeTile(i)}
                  aria-label={`Remove tile ${i + 1}`}
                  className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-[#0a0a0a] text-white shadow hover:bg-teal-600"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <FileDrop
            compact
            accept="image/*"
            multiple
            title={`Upload posts (${9 - filled} slots free)`}
            hint="They fill the grid in order — click two tiles to swap"
            icon={<ImageIcon />}
            onFiles={uploadImages}
          />
          <div className="rounded-2xl border border-gray-200 bg-white p-3">
            <ColorField label="Solid tile color" value={placeholderColor} onChange={setPlaceholderColor} />
            <PillButton variant="secondary" className="mt-2 w-full !text-xs" onClick={addColorTile} disabled={filled >= 9}>
              <Plus className="size-4" /> Add solid tile
            </PillButton>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            “Alternate light/dark” sorts tiles by brightness and lays them out in a snake pattern so neighbours contrast — the classic checkerboard trick for
            cohesive feeds.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════ 15. youtube-thumbnail-downloader ═════════════════════ */

interface YtVariant { file: string; label: string; dims: string; note: string }

const YT_VARIANTS: YtVariant[] = [
  { file: 'maxresdefault', label: 'Max resolution', dims: '1280 × 720', note: 'Only exists when the uploader supplied HD custom art.' },
  { file: 'sddefault', label: 'Standard definition', dims: '640 × 480', note: '4:3 canvas — pillarboxed bars on most videos.' },
  { file: 'hqdefault', label: 'High quality', dims: '480 × 360', note: 'The always-present fallback for every video.' },
  { file: 'mqdefault', label: 'Medium quality', dims: '320 × 180', note: 'Compact 16:9 used in lists and suggestion cards.' },
];

function extractYouTubeId(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)([a-zA-Z0-9_-]{11})/i,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

type YtStatus = 'unknown' | 'ok' | 'missing';

const YouTubeThumbnailDownloaderTool = () => {
  const [input, setInput] = React.useState('');
  const [activeId, setActiveId] = React.useState('');
  const [status, setStatus] = React.useState<Record<string, YtStatus>>({});

  React.useEffect(() => {
    setStatus({});
  }, [activeId]);

  const parsed = extractYouTubeId(input);

  const mark = (file: string, next: YtStatus) =>
    setStatus((prev) => (prev[file] === next ? prev : { ...prev, [file]: next }));

  const watchUrl = activeId ? `https://www.youtube.com/watch?v=${activeId}` : '';
  const availableUrls = YT_VARIANTS.filter((v) => status[v.file] === 'ok').map((v) => `https://i.ytimg.com/vi/${activeId}/${v.file}.jpg`);

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => { e.preventDefault(); if (parsed) setActiveId(parsed); }}
        className="flex flex-col gap-1.5"
      >
        <Label className="text-sm font-bold text-[#0a0a0a]">YouTube URL or video ID</Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const id = extractYouTubeId(e.target.value);
              if (id) setActiveId(id);
            }}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            aria-label="YouTube URL or video ID"
            className="h-11 min-w-0 flex-1 rounded-xl border-gray-200 bg-white font-mono text-sm text-[#0a0a0a] placeholder:text-gray-400"
          />
          <PillButton type="submit" disabled={!parsed} ariaLabel="Fetch thumbnails">
            <Youtube className="size-4" /> Get thumbnails
          </PillButton>
        </div>
        <p className="text-xs text-muted-foreground">
          Watch links, Shorts, youtu.be shares, embed URLs or a bare 11-character ID all work — thumbnails are read straight from the public CDN.
        </p>
        {input.trim() && !parsed ? (
          <p className="text-xs font-semibold text-amber-600">No video ID found yet — paste a full YouTube link or an 11-character ID.</p>
        ) : null}
      </form>

      {activeId ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 font-mono text-xs font-bold text-[#0a0a0a]">
              <Youtube className="size-3.5 text-teal-600" aria-hidden /> {activeId}
            </span>
            <CopyButton value={watchUrl} label="Copy video link" />
            <CopyButton
              value={availableUrls.join('\n')}
              label={availableUrls.length ? `Copy all thumbnail URLs (${availableUrls.length})` : 'Copy all thumbnail URLs'}
            />
          </div>

          <div className="flex items-center gap-2">
            <Grid3x3 className="size-4 text-emerald-600" aria-hidden />
            <Label className="text-sm font-bold text-[#0a0a0a]">Every size on the CDN</Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {YT_VARIANTS.map((v) => {
              const url = `https://i.ytimg.com/vi/${activeId}/${v.file}.jpg`;
              const st = status[v.file] ?? 'unknown';
              return (
                <div key={v.file} className="card-soft flex flex-col gap-2 p-3">
                  <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50" style={{ aspectRatio: '16 / 10' }}>
                    {st === 'missing' ? (
                      <div className="flex flex-col items-center gap-1 p-3 text-center">
                        <X className="size-5 text-gray-300" aria-hidden />
                        <p className="text-xs font-semibold text-gray-400">Not available for this video</p>
                      </div>
                    ) : (
                       
                      <img
                        src={url}
                        alt={`${v.label} thumbnail (${v.dims})`}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onLoad={(e) => mark(v.file, e.currentTarget.naturalWidth > 120 ? 'ok' : 'missing')}
                        onError={() => mark(v.file, 'missing')}
                      />
                    )}
                    {st === 'unknown' ? <span className="absolute inset-0 animate-pulse bg-gray-100/80" aria-hidden /> : null}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#0a0a0a]">{v.label}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">{v.dims}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.note}</p>
                  {st === 'ok' ? (
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                      <CopyButton value={url} label="Copy URL" className="!px-3 !py-1.5" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-white px-3 py-1.5 text-xs font-bold text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
                      >
                        <ExternalLink className="size-3.5" aria-hidden /> Open
                      </a>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="card-soft flex flex-col items-center gap-2 p-10 text-center">
          <Youtube className="size-10 text-gray-300" aria-hidden />
          <p className="text-sm font-bold text-[#0a0a0a]">Thumbnails appear here</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Paste a link above — the tool probes maxres, sd, hq and mq in one pass and hides the sizes a video does not have.
          </p>
        </div>
      )}

      <ToolNote>
        These are the same public i.ytimg.com files the watch page loads — no API key, no quota and nothing is proxied through a server. A missing size is
        detected by the 120×90 grey placeholder YouTube substitutes, so you never grab a blank tile. Remember thumbnails stay © their creators: fine for
        reference, research and fair-use commentary, not for republishing as your own art.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 16. giveaway-winner-picker ═════════════════════ */

interface Entrant { name: string; weight: number }

/** Parse one-entrant-per-line text; “Name ×3” (also x / X / *) adds bonus entries. */
function parseEntrants(text: string): Entrant[] {
  const out: Entrant[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const stripped = line.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();
    const m = stripped.match(/^(.+?)\s*[×xX*]\s*(\d{1,3})$/);
    if (m) {
      const name = m[1].trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '');
      if (name) out.push({ name, weight: clamp(parseInt(m[2], 10) || 1, 1, 99) });
    } else if (stripped) {
      out.push({ name: stripped, weight: 1 });
    }
  }
  return out;
}

/** Merge repeated names (case/space-insensitive); their bonus entries are summed. */
function dedupeEntrants(list: Entrant[]): Entrant[] {
  const map = new Map<string, Entrant>();
  for (const e of list) {
    const key = e.name.toLowerCase().replace(/\s+/g, ' ');
    const prev = map.get(key);
    if (prev) map.set(key, { name: prev.name, weight: clamp(prev.weight + e.weight, 1, 999) });
    else map.set(key, { ...e });
  }
  return [...map.values()];
}

/** Draw without replacement: every ticket is an entry, winners are removed with all their tickets. */
function drawWinners(pool: Entrant[], count: number): Entrant[] {
  const tickets: number[] = [];
  pool.forEach((e, i) => {
    for (let k = 0; k < e.weight; k++) tickets.push(i);
  });
  const winners: Entrant[] = [];
  const n = Math.min(count, pool.length);
  for (let w = 0; w < n && tickets.length > 0; w++) {
    const chosen = tickets[secureRandomInt(tickets.length)];
    winners.push(pool[chosen]);
    for (let i = tickets.length - 1; i >= 0; i--) {
      if (tickets[i] === chosen) tickets.splice(i, 1);
    }
  }
  return winners;
}

const GIVEAWAY_SAMPLE = `Ava Chen ×3
Marcus Webb
Priya Patel ×2
Jonas Weber
Sofia Reyes
Liam O’Connor ×2
Maya Singh
Tom Becker`;

const GiveawayWinnerPickerTool = () => {
  const [text, setText] = React.useState('');
  const [dedupe, setDedupe] = React.useState(true);
  const [count, setCount] = React.useState('1');
  const [result, setResult] = React.useState<{ winners: Entrant[]; poolSize: number; tickets: number; at: string } | null>(null);
  const [revealed, setRevealed] = React.useState(0);

  const parsedList = React.useMemo(() => parseEntrants(text), [text]);
  const pool = React.useMemo(() => (dedupe ? dedupeEntrants(parsedList) : parsedList), [parsedList, dedupe]);
  const ticketCount = pool.reduce((s, e) => s + e.weight, 0);

  React.useEffect(() => {
    if (!result || revealed >= result.winners.length) return;
    const t = window.setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 180 : 430);
    return () => window.clearTimeout(t);
  }, [result, revealed]);

  const draw = () => {
    if (!pool.length) return;
    const winners = drawWinners(pool, Number(count) || 1);
    setResult({
      winners,
      poolSize: pool.length,
      tickets: ticketCount,
      at: new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    });
    setRevealed(0);
  };

  const winnersText = result
    ? [
        `Giveaway winners — drawn ${result.at}`,
        ...result.winners.map((w, i) => `${i + 1}. ${w.name}${w.weight > 1 ? ` (${w.weight} entries)` : ''}`),
        `${result.winners.length} winner${result.winners.length === 1 ? '' : 's'} from ${result.poolSize} entrants (${result.tickets} total entries).`,
      ].join('\n')
    : '';

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg-split-1fr-300">
        <TextAreaInput
          label="Entrants — one per line"
          value={text}
          onChange={(v) => setText(v)}
          rows={10}
          placeholder={'Ava Chen\nMarcus Webb\nPriya Patel ×3'}
          help="Write “Name ×3” (x, X or * also work) to give someone bonus entries; copied comment names with quotes are cleaned automatically."
        />
        <div className="flex flex-col gap-3">
          <SelectInput
            label="Number of winners"
            value={count}
            onChange={setCount}
            options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} winner${i === 0 ? '' : 's'}` }))}
          />
          <ToggleInput
            label="Merge duplicate names"
            checked={dedupe}
            onChange={setDedupe}
            help="Repeated people collapse into one entrant; their bonus entries combine instead of multiplying."
          />
          <PillButton variant="ghost" onClick={() => { setText(GIVEAWAY_SAMPLE); setResult(null); }}>
            <Wand2 className="size-4" /> Load example
          </PillButton>
          <PillButton onClick={draw} disabled={!pool.length} className="w-full">
            <Users className="size-4" /> Draw {count} winner{Number(count) === 1 ? '' : 's'}
          </PillButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Entrants" value={parsedList.length} hint="lines parsed" />
        <StatCard label="Unique" value={pool.length} hint={dedupe ? 'after merging' : 'dedupe is off'} />
        <StatCard label="Total entries" value={ticketCount} hint="tickets in the pool" />
        <StatCard label="Winners" value={result ? result.winners.length : Number(count)} tone="good" hint={result ? 'drawn' : 'to draw'} />
      </div>

      {pool.length > 0 && pool.length < Number(count) ? (
        <ToolNote>
          Only {pool.length} unique entrant{pool.length === 1 ? '' : 's'} are in the pool but {count} winners were requested — the draw stops once everyone has
          won, so nobody appears twice.
        </ToolNote>
      ) : null}

      {result ? (
        <div className="card-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-[#0a0a0a]">
              <PartyPopper className="size-5 text-emerald-600" aria-hidden /> Your winners
            </p>
            <p className="text-xs font-semibold text-gray-500">Drawn {result.at}</p>
          </div>
          <ol className="mt-4 flex flex-col gap-2" aria-live="polite" role="list">
            {result.winners.map((w, i) => (
              <li
                key={`${w.name}-${i}`}
                role="listitem"
                aria-hidden={i >= revealed}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-3 transition-all duration-500',
                  i < revealed ? 'translate-y-0 border-emerald-200 bg-white opacity-100' : 'translate-y-3 border-transparent opacity-0',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white',
                    i === 0 ? 'bg-gradient-to-br from-emerald-600 to-emerald-500' : 'bg-[#0a0a0a]',
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#0a0a0a]">{w.name}</span>
                {w.weight > 1 ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">won with {w.weight} entries</span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PillButton variant="secondary" onClick={draw}>
              <RefreshCw className="size-4" /> Draw again
            </PillButton>
            <CopyButton value={winnersText} label="Copy winners + timestamp" />
            {revealed < result.winners.length ? <span className="text-xs text-gray-400" role="status">Revealing…</span> : null}
          </div>
        </div>
      ) : null}

      <ToolNote>
        The draw is cryptographically fair: every entry is a ticket in a pool sampled with crypto.getRandomValues using modulo-rejection (no Math.random and no
        modulo bias), and winners are removed together with all their tickets so one person can never win twice. The timestamp on the result is meant to be
        copied into your announcement post as a public audit trail.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 17. invoice-generator ═════════════════════ */

/** ── shared document helpers (invoice + quote) ── */

function docMoney(symbol: string, n: number): string {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n < 0 ? '−' : ''}${symbol}${abs}`;
}

function docDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.trim() || '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localIso(d);
}

function docNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

interface DocParty { name: string; details: string }

const DOC_PRINT_CSS = `
.ivinv-print-root, .ivquote-print-root { display: none; }
@media print {
  .ivinv-print-root, .ivquote-print-root { display: block !important; }
  body > *:not(.ivinv-print-root):not(.ivquote-print-root) { display: none !important; }
  .ivinv-print-root .ivinv-doc { border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
  .ivquote-print-root .ivquote-doc { border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; }
}
@page { margin: 12mm; }
`;

function DocPrintStyle() {
  return <style dangerouslySetInnerHTML={{ __html: DOC_PRINT_CSS }} />;
}

/** ── invoice document ── */

interface InvoiceLine { desc: string; qty: string; rate: string }

interface InvoiceData {
  business: DocParty;
  client: DocParty;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxPct: string;
  notes: string;
  items: InvoiceLine[];
}

function invoiceTotals(d: InvoiceData) {
  const lines = d.items.map((it) => ({ ...it, total: docNum(it.qty) * docNum(it.rate) }));
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const taxPct = clamp(docNum(d.taxPct), 0, 100);
  const tax = (subtotal * taxPct) / 100;
  return { lines, subtotal, taxPct, tax, total: subtotal + tax };
}

function InvoiceDoc({ data }: { data: InvoiceData }) {
  const t = invoiceTotals(data);
  return (
    <div
      className="ivinv-doc mx-auto w-full max-w-[720px] rounded-2xl border border-gray-200 bg-white p-6 text-[#0a0a0a] shadow-xl sm:p-9"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#0a0a0a] pb-5">
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold">{data.business.name || 'Your business'}</p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">{data.business.details || 'Your address, email and phone'}</p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-full bg-emerald-600 px-4 py-1.5 font-display text-sm font-bold tracking-[0.2em] text-white">INVOICE</span>
          <p className="mt-2 font-mono text-sm font-bold">{data.invoiceNo || '—'}</p>
        </div>
      </div>

      <div className="grid gap-5 py-5 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bill to</p>
          <p className="mt-1 text-sm font-bold">{data.client.name || 'Client name'}</p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">{data.client.details}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-gray-500">Issued: <span className="font-bold text-[#0a0a0a]">{docDate(data.issueDate)}</span></p>
          <p className="mt-1 text-xs text-gray-500">Due: <span className="font-bold text-[#0a0a0a]">{docDate(data.dueDate)}</span></p>
        </div>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left text-[10px] uppercase tracking-widest text-gray-400">
            <th className="py-2 font-bold">Description</th>
            <th className="py-2 text-right font-bold">Qty</th>
            <th className="py-2 text-right font-bold">Rate</th>
            <th className="py-2 text-right font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {t.lines.map((l, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2.5 pr-3">{l.desc || <span className="italic text-gray-400">Untitled item</span>}</td>
              <td className="py-2.5 text-right tabular-nums">{docNum(l.qty) || '—'}</td>
              <td className="py-2.5 text-right tabular-nums">{docMoney(data.currency, docNum(l.rate))}</td>
              <td className="py-2.5 text-right font-bold tabular-nums">{docMoney(data.currency, l.total)}</td>
            </tr>
          ))}
          {t.lines.length === 0 ? (
            <tr><td colSpan={4} className="py-4 text-center italic text-gray-400">No line items yet — add one from the form.</td></tr>
          ) : null}
        </tbody>
      </table>

      <div className="ml-auto mt-5 w-full max-w-60 space-y-1.5 text-xs">
        <p className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold tabular-nums">{docMoney(data.currency, t.subtotal)}</span></p>
        <p className="flex justify-between"><span className="text-gray-500">Tax ({t.taxPct}%)</span><span className="font-bold tabular-nums">{docMoney(data.currency, t.tax)}</span></p>
        <p className="flex justify-between border-t-2 border-[#0a0a0a] pt-2 font-display text-base font-bold"><span>Total</span><span className="tabular-nums">{docMoney(data.currency, t.total)}</span></p>
      </div>

      {data.notes.trim() ? (
        <div className="mt-7 border-t border-gray-200 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes</p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-600">{data.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

interface InvItem { id: string; desc: string; qty: string; rate: string }

const INV_SAMPLE: Omit<InvoiceData, 'issueDate' | 'dueDate'> = {
  business: { name: 'Studio Nova Design', details: 'hello@studionova.design\n+1 (555) 210-8890\nstudionova.design' },
  client: { name: 'Acme Coffee Co.', details: 'Attn: Jordan Blake\n88 Market Street\nPortland, OR 97205' },
  invoiceNo: 'INV-2024-018',
  currency: '$',
  taxPct: '8.5',
  notes: 'Payment via bank transfer within 14 days.\nThank you for the project!',
  items: [
    { desc: 'Brand identity system', qty: '1', rate: '1200' },
    { desc: 'Landing page design', qty: '1', rate: '850' },
    { desc: 'Design system handover session', qty: '2', rate: '300' },
  ],
};

const InvoiceGeneratorTool = () => {
  const [business, setBusiness] = React.useState<DocParty>({ name: '', details: '' });
  const [client, setClient] = React.useState<DocParty>({ name: '', details: '' });
  const [invoiceNo, setInvoiceNo] = React.useState('INV-001');
  const [issueDate, setIssueDate] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [currency, setCurrency] = React.useState('$');
  const [taxPct, setTaxPct] = React.useState('0');
  const [notes, setNotes] = React.useState('');
  const [items, setItems] = React.useState<InvItem[]>([{ id: uid(), desc: '', qty: '1', rate: '' }]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIssueDate(isoDaysFromToday(0));
    setDueDate(isoDaysFromToday(14));
  }, []);

  const updateItem = (id: string, patch: Partial<InvItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  const addItem = () => setItems((prev) => [...prev, { id: uid(), desc: '', qty: '1', rate: '' }]);

  const data: InvoiceData = {
    business,
    client,
    invoiceNo,
    issueDate,
    dueDate,
    currency: currency || '$',
    taxPct,
    notes,
    items: items.map(({ desc, qty, rate }) => ({ desc, qty, rate })),
  };

  const loadSample = () => {
    setBusiness(INV_SAMPLE.business);
    setClient(INV_SAMPLE.client);
    setInvoiceNo(INV_SAMPLE.invoiceNo);
    setCurrency(INV_SAMPLE.currency);
    setTaxPct(INV_SAMPLE.taxPct);
    setNotes(INV_SAMPLE.notes);
    setIssueDate(isoDaysFromToday(0));
    setDueDate(isoDaysFromToday(14));
    setItems(INV_SAMPLE.items.map((it) => ({ ...it, id: uid() })));
  };

  const clearAll = () => {
    setBusiness({ name: '', details: '' });
    setClient({ name: '', details: '' });
    setInvoiceNo('INV-001');
    setCurrency('$');
    setTaxPct('0');
    setNotes('');
    setItems([{ id: uid(), desc: '', qty: '1', rate: '' }]);
  };

  const invoiceText = () => {
    const t = invoiceTotals(data);
    const rows = t.lines.map((l, i) =>
      `${i + 1}. ${l.desc || 'Untitled item'} — ${docNum(l.qty)} × ${docMoney(data.currency, docNum(l.rate))} = ${docMoney(data.currency, l.total)}`);
    return [
      `INVOICE ${data.invoiceNo || ''}`.trim(),
      `From: ${data.business.name || '—'}`,
      `Bill to: ${data.client.name || '—'}`,
      `Issued: ${docDate(data.issueDate)} · Due: ${docDate(data.dueDate)}`,
      '',
      ...rows,
      '',
      `Subtotal: ${docMoney(data.currency, t.subtotal)}`,
      `Tax (${t.taxPct}%): ${docMoney(data.currency, t.tax)}`,
      `TOTAL: ${docMoney(data.currency, t.total)}`,
      data.notes.trim() ? `\nNotes: ${data.notes.trim()}` : '',
    ].filter((s) => s !== '').join('\n');
  };

  return (
    <div className="flex flex-col gap-5">
      <DocPrintStyle />
      {mounted
        ? createPortal(
            <div className="ivinv-print-root" aria-hidden="true">
              <InvoiceDoc data={data} />
            </div>,
            document.body,
          )
        : null}

      <div className="grid items-start gap-5 xl-split-430-1fr">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="Your business" value={business.name} onChange={(v) => setBusiness((p) => ({ ...p, name: v }))} placeholder="Studio Nova Design" />
            <TextInput label="Client name" value={client.name} onChange={(v) => setClient((p) => ({ ...p, name: v }))} placeholder="Acme Coffee Co." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextAreaInput label="Your details" value={business.details} onChange={(v) => setBusiness((p) => ({ ...p, details: v }))} rows={3} placeholder={'Address\nemail@example.com'} />
            <TextAreaInput label="Client details" value={client.details} onChange={(v) => setClient((p) => ({ ...p, details: v }))} rows={3} placeholder={'Attn: …\nStreet, City'} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="Invoice number" value={invoiceNo} onChange={setInvoiceNo} placeholder="INV-001" />
            <TextInput label="Currency symbol" value={currency} onChange={setCurrency} placeholder="$" help="Any symbol or code: $, €, ₹, AED…" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldShell label="Issue date">
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} aria-label="Issue date" className="h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a]" />
            </FieldShell>
            <FieldShell label="Due date">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" className="h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a]" />
            </FieldShell>
          </div>
          <NumberInput label="Tax" value={taxPct} onChange={setTaxPct} suffix="%" min={0} max={100} step={0.1} />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-[#0a0a0a]">Line items</Label>
              <span className="text-xs font-bold text-gray-400">{items.length} item{items.length === 1 ? '' : 's'}</span>
            </div>
            {items.map((it, i) => {
              const lineTotal = docNum(it.qty) * docNum(it.rate);
              return (
                <div key={it.id} className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={it.desc}
                      onChange={(e) => updateItem(it.id, { desc: e.target.value })}
                      placeholder={`Item ${i + 1} description`}
                      aria-label={`Item ${i + 1} description`}
                      className="h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      aria-label={`Remove item ${i + 1}`}
                      disabled={items.length === 1}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100 disabled:opacity-30"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Qty</Label>
                      <Input
                        type="number" inputMode="decimal" min="0" step="any" value={it.qty}
                        onChange={(e) => updateItem(it.id, { qty: e.target.value })}
                        aria-label={`Item ${i + 1} quantity`}
                        className="h-10 rounded-lg border-gray-200 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Rate</Label>
                      <Input
                        type="number" inputMode="decimal" min="0" step="any" value={it.rate}
                        onChange={(e) => updateItem(it.id, { rate: e.target.value })}
                        placeholder="0.00"
                        aria-label={`Item ${i + 1} rate`}
                        className="h-10 rounded-lg border-gray-200 bg-white text-sm"
                      />
                    </div>
                    <p className="col-span-2 text-right text-xs font-bold text-[#0a0a0a]">= {docMoney(currency || '$', lineTotal)}</p>
                  </div>
                </div>
              );
            })}
            <PillButton variant="ghost" className="self-start" onClick={addItem}>
              <Plus className="size-4" /> Add line item
            </PillButton>
          </div>

          <TextAreaInput label="Notes" value={notes} onChange={setNotes} rows={3} placeholder="Payment terms, thanks, bank details…" />

          <div className="flex flex-wrap gap-2">
            <PillButton variant="ghost" onClick={loadSample}><Wand2 className="size-4" /> Load example</PillButton>
            <PillButton variant="ghost" onClick={clearAll}><Trash2 className="size-4" /> Clear all</PillButton>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Frame className="size-4 text-emerald-600" aria-hidden />
            <Label className="text-sm font-bold text-[#0a0a0a]">Live document preview</Label>
          </div>
          <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-gray-200 bg-gray-100 p-3 sm:p-5">
            <InvoiceDoc data={data} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PillButton onClick={() => window.print()}>
              <Printer className="size-4" /> Print / Save as PDF
            </PillButton>
            <CopyButton value={invoiceText()} label="Copy as text" />
            <span className="text-xs text-muted-foreground">Printing hides everything except the invoice — pick “Save as PDF” as the destination.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════ 18. quote-estimate-generator ═════════════════════ */

type QuoteMode = 'hours' | 'fixed';

interface QuoteLine { desc: string; mode: QuoteMode; hours: string; rate: string; amount: string }

interface QuoteData {
  business: DocParty;
  client: DocParty;
  quoteNo: string;
  projectName: string;
  validUntil: string;
  currency: string;
  discountPct: string;
  terms: string;
  lines: QuoteLine[];
}

function quoteLineTotal(l: QuoteLine): number {
  return l.mode === 'hours' ? docNum(l.hours) * docNum(l.rate) : docNum(l.amount);
}

function quoteTotals(lines: QuoteLine[], discountPct: string) {
  const subtotal = lines.reduce((s, l) => s + quoteLineTotal(l), 0);
  const pct = clamp(docNum(discountPct), 0, 100);
  const discount = (subtotal * pct) / 100;
  return { subtotal, pct, discount, total: subtotal - discount };
}

function QuoteDoc({ data }: { data: QuoteData }) {
  const t = quoteTotals(data.lines, data.discountPct);
  return (
    <div
      className="ivquote-doc mx-auto w-full max-w-[720px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-[#0a0a0a] shadow-xl"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-white sm:px-9">
        <div className="flex items-center gap-2.5">
          <Ticket className="size-5" aria-hidden />
          <span className="font-display text-xl font-bold tracking-[0.14em]">QUOTATION</span>
        </div>
        <div className="text-right text-xs">
          <p className="font-mono font-bold">{data.quoteNo || '—'}</p>
          <p className="opacity-90">Valid until {docDate(data.validUntil)}</p>
        </div>
      </div>

      <div className="p-6 sm:p-9">
        {data.projectName.trim() ? <p className="font-display text-lg font-bold">{data.projectName}</p> : null}

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Prepared for</p>
            <p className="mt-1 text-sm font-bold">{data.client.name || 'Client name'}</p>
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">{data.client.details}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Prepared by</p>
            <p className="mt-1 text-sm font-bold">{data.business.name || 'Your business'}</p>
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">{data.business.details}</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left text-[10px] uppercase tracking-widest text-gray-400">
              <th className="py-2 font-bold">Service</th>
              <th className="py-2 text-right font-bold">Basis</th>
              <th className="py-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2.5 pr-3">{l.desc || <span className="italic text-gray-400">Untitled service</span>}</td>
                <td className="py-2.5 text-right tabular-nums text-gray-500">
                  {l.mode === 'hours' ? `${docNum(l.hours)} h × ${docMoney(data.currency, docNum(l.rate))}` : 'Fixed scope'}
                </td>
                <td className="py-2.5 text-right font-bold tabular-nums">{docMoney(data.currency, quoteLineTotal(l))}</td>
              </tr>
            ))}
            {data.lines.length === 0 ? (
              <tr><td colSpan={3} className="py-4 text-center italic text-gray-400">No service lines yet — add one from the form.</td></tr>
            ) : null}
          </tbody>
        </table>

        <div className="ml-auto mt-5 w-full max-w-60 space-y-1.5 text-xs">
          <p className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold tabular-nums">{docMoney(data.currency, t.subtotal)}</span></p>
          <p className="flex justify-between"><span className="text-gray-500">Discount ({t.pct}%)</span><span className="font-bold tabular-nums text-emerald-700">−{docMoney(data.currency, t.discount)}</span></p>
          <p className="flex justify-between border-t-2 border-emerald-600 pt-2 font-display text-base font-bold text-emerald-700"><span>Total</span><span className="tabular-nums">{docMoney(data.currency, t.total)}</span></p>
        </div>

        {data.terms.trim() ? (
          <div className="mt-7 border-t border-gray-200 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Terms</p>
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-600">{data.terms}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface QItem extends QuoteLine { id: string }

const Q_SAMPLE_LINES: QuoteLine[] = [
  { desc: 'Discovery & UX workshop', mode: 'hours', hours: '6', rate: '95', amount: '' },
  { desc: 'Responsive design — 5 templates', mode: 'hours', hours: '18', rate: '95', amount: '' },
  { desc: 'Front-end build', mode: 'fixed', hours: '', rate: '', amount: '2400' },
];

const QuoteEstimateGeneratorTool = () => {
  const [business, setBusiness] = React.useState<DocParty>({ name: '', details: '' });
  const [client, setClient] = React.useState<DocParty>({ name: '', details: '' });
  const [quoteNo, setQuoteNo] = React.useState('Q-001');
  const [projectName, setProjectName] = React.useState('');
  const [validUntil, setValidUntil] = React.useState('');
  const [currency, setCurrency] = React.useState('$');
  const [discountPct, setDiscountPct] = React.useState('0');
  const [terms, setTerms] = React.useState('');
  const [lines, setLines] = React.useState<QItem[]>([{ id: uid(), desc: '', mode: 'hours', hours: '1', rate: '', amount: '' }]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setValidUntil(isoDaysFromToday(30));
  }, []);

  const updateLine = (id: string, patch: Partial<QItem>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: string) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const addLine = () =>
    setLines((prev) => [...prev, { id: uid(), desc: '', mode: 'hours', hours: '1', rate: '', amount: '' }]);

  const data: QuoteData = {
    business,
    client,
    quoteNo,
    projectName,
    validUntil,
    currency: currency || '$',
    discountPct,
    terms,
    lines: lines.map(({ desc, mode, hours, rate, amount }) => ({ desc, mode, hours, rate, amount })),
  };

  const loadSample = () => {
    setBusiness({ name: 'Studio Nova Design', details: 'hello@studionova.design\n+1 (555) 210-8890' });
    setClient({ name: 'Acme Coffee Co.', details: 'Attn: Jordan Blake\n88 Market Street, Portland' });
    setQuoteNo('Q-2024-042');
    setProjectName('Website Redesign — Phase 1');
    setCurrency('$');
    setDiscountPct('10');
    setValidUntil(isoDaysFromToday(30));
    setTerms('50% due on kickoff, 50% on delivery.\nPrices valid until the date shown above.\nIncludes two revision rounds per deliverable.');
    setLines(Q_SAMPLE_LINES.map((l) => ({ ...l, id: uid() })));
  };

  const clearAll = () => {
    setBusiness({ name: '', details: '' });
    setClient({ name: '', details: '' });
    setQuoteNo('Q-001');
    setProjectName('');
    setCurrency('$');
    setDiscountPct('0');
    setTerms('');
    setLines([{ id: uid(), desc: '', mode: 'hours', hours: '1', rate: '', amount: '' }]);
  };

  const quoteText = () => {
    const t = quoteTotals(data.lines, data.discountPct);
    const rows = data.lines.map((l, i) => {
      const basis = l.mode === 'hours' ? `${docNum(l.hours)}h × ${docMoney(data.currency, docNum(l.rate))}` : 'fixed';
      return `${i + 1}. ${l.desc || 'Untitled service'} (${basis}) = ${docMoney(data.currency, quoteLineTotal(l))}`;
    });
    return [
      `QUOTATION ${data.quoteNo || ''}`.trim(),
      data.projectName.trim() ? `Project: ${data.projectName.trim()}` : '',
      `Prepared for: ${data.client.name || '—'}`,
      `Prepared by: ${data.business.name || '—'}`,
      `Valid until: ${docDate(data.validUntil)}`,
      '',
      ...rows,
      '',
      `Subtotal: ${docMoney(data.currency, t.subtotal)}`,
      `Discount (${t.pct}%): −${docMoney(data.currency, t.discount)}`,
      `TOTAL: ${docMoney(data.currency, t.total)}`,
      data.terms.trim() ? `\nTerms: ${data.terms.trim()}` : '',
    ].filter((s) => s !== '').join('\n');
  };

  return (
    <div className="flex flex-col gap-5">
      <DocPrintStyle />
      {mounted
        ? createPortal(
            <div className="ivquote-print-root" aria-hidden="true">
              <QuoteDoc data={data} />
            </div>,
            document.body,
          )
        : null}

      <div className="grid items-start gap-5 xl-split-430-1fr">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="Your business" value={business.name} onChange={(v) => setBusiness((p) => ({ ...p, name: v }))} placeholder="Studio Nova Design" />
            <TextInput label="Client name" value={client.name} onChange={(v) => setClient((p) => ({ ...p, name: v }))} placeholder="Acme Coffee Co." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextAreaInput label="Your details" value={business.details} onChange={(v) => setBusiness((p) => ({ ...p, details: v }))} rows={2} placeholder={'Address\nemail@example.com'} />
            <TextAreaInput label="Client details" value={client.details} onChange={(v) => setClient((p) => ({ ...p, details: v }))} rows={2} placeholder={'Attn: …\nStreet, City'} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="Quote number" value={quoteNo} onChange={setQuoteNo} placeholder="Q-001" />
            <TextInput label="Currency symbol" value={currency} onChange={setCurrency} placeholder="$" help="Any symbol or code: $, €, ₹, AED…" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="Project name" value={projectName} onChange={setProjectName} placeholder="Website Redesign — Phase 1" />
            <FieldShell label="Valid until" help="Estimates should always carry an expiry.">
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} aria-label="Valid until" className="h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a]" />
            </FieldShell>
          </div>
          <NumberInput label="Discount" value={discountPct} onChange={setDiscountPct} suffix="%" min={0} max={100} step={0.5} help="Shown as its own line so the client sees the goodwill." />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-[#0a0a0a]">Service lines</Label>
              <span className="text-xs font-bold text-gray-400">{lines.length} line{lines.length === 1 ? '' : 's'}</span>
            </div>
            {lines.map((l, i) => {
              const total = quoteLineTotal(l);
              return (
                <div key={l.id} className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={l.desc}
                      onChange={(e) => updateLine(l.id, { desc: e.target.value })}
                      placeholder={`Service ${i + 1} description`}
                      aria-label={`Service ${i + 1} description`}
                      className="h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(l.id)}
                      aria-label={`Remove service ${i + 1}`}
                      disabled={lines.length === 1}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100 disabled:opacity-30"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="flex overflow-hidden rounded-full border-2 border-gray-200" role="group" aria-label={`Service ${i + 1} pricing mode`}>
                      {(['hours', 'fixed'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => updateLine(l.id, { mode: m })}
                          aria-pressed={l.mode === m}
                          className={cn(
                            'px-3 py-1.5 text-[11px] font-bold transition-colors',
                            l.mode === m ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
                          )}
                        >
                          {m === 'hours' ? 'Hours × rate' : 'Fixed price'}
                        </button>
                      ))}
                    </div>
                    {l.mode === 'hours' ? (
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Input
                          type="number" inputMode="decimal" min="0" step="any" value={l.hours}
                          onChange={(e) => updateLine(l.id, { hours: e.target.value })}
                          aria-label={`Service ${i + 1} hours`}
                          className="h-10 w-full min-w-0 rounded-lg border-gray-200 bg-white text-sm"
                        />
                        <span className="text-xs font-bold text-gray-400">×</span>
                        <Input
                          type="number" inputMode="decimal" min="0" step="any" value={l.rate}
                          onChange={(e) => updateLine(l.id, { rate: e.target.value })}
                          placeholder="rate"
                          aria-label={`Service ${i + 1} hourly rate`}
                          className="h-10 w-full min-w-0 rounded-lg border-gray-200 bg-white text-sm"
                        />
                      </div>
                    ) : (
                      <Input
                        type="number" inputMode="decimal" min="0" step="any" value={l.amount}
                        onChange={(e) => updateLine(l.id, { amount: e.target.value })}
                        placeholder="Fixed amount"
                        aria-label={`Service ${i + 1} fixed amount`}
                        className="h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm"
                      />
                    )}
                    <span className="ml-auto shrink-0 text-xs font-bold text-emerald-700">= {docMoney(currency || '$', total)}</span>
                  </div>
                </div>
              );
            })}
            <PillButton variant="ghost" className="self-start" onClick={addLine}>
              <Plus className="size-4" /> Add service line
            </PillButton>
          </div>

          <TextAreaInput
            label="Terms"
            value={terms}
            onChange={setTerms}
            rows={4}
            placeholder={'Payment schedule…\nWhat voids this quote…\nRevision limits…'}
          />

          <div className="flex flex-wrap gap-2">
            <PillButton variant="ghost" onClick={loadSample}><Wand2 className="size-4" /> Load example</PillButton>
            <PillButton variant="ghost" onClick={clearAll}><Trash2 className="size-4" /> Clear all</PillButton>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Frame className="size-4 text-emerald-600" aria-hidden />
            <Label className="text-sm font-bold text-[#0a0a0a]">Live quote preview</Label>
          </div>
          <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-gray-200 bg-gray-100 p-3 sm:p-5">
            <QuoteDoc data={data} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PillButton onClick={() => window.print()}>
              <Printer className="size-4" /> Print / Save as PDF
            </PillButton>
            <CopyButton value={quoteText()} label="Copy as text" />
            <span className="text-xs text-muted-foreground">The emerald header keeps estimates visually separate from invoices in the same email thread.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════ 19. push-notification-tester ═════════════════════ */

const PUSH_TITLE_LIMIT = 65;
const PUSH_BODY_LIMIT = 240;

const PUSH_SAMPLE = {
  title: '🚀 v2.4 is live — dark mode!',
  body: 'Update now to get dark mode, 2× faster sync and a redesigned search. It takes about 20 seconds.',
  app: 'Task Rocket',
};

const PushNotificationTesterTool = () => {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [appName, setAppName] = React.useState('Your App');
  const [iconUrl, setIconUrl] = React.useState('');
  const [iconBroken, setIconBroken] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    setIconBroken(false);
  }, [iconUrl]);

  const overTitle = title.length > PUSH_TITLE_LIMIT;
  const overBody = body.length > PUSH_BODY_LIMIT;
  const initial = (appName.trim()[0] || 'A').toUpperCase();

  const wall = theme === 'dark'
    ? 'bg-gradient-to-b from-[#191138] via-[#241a4d] to-[#0c0a1d]'
    : 'bg-gradient-to-b from-yellow-200 via-emerald-200 to-teal-200';

  const appIcon = iconUrl && !iconBroken ? (
     
    <img src={iconUrl} alt="" className="size-10 rounded-xl object-cover" onError={() => setIconBroken(true)} />
  ) : (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white" aria-hidden="true">
      {iconUrl ? <span className="text-sm font-bold">{initial}</span> : <Box className="size-5" />}
    </span>
  );

  const counterClass = (len: number, limit: number) =>
    cn('text-right text-xs font-bold', len > limit ? 'text-teal-600' : 'text-gray-400');

  const loadSample = () => {
    setTitle(PUSH_SAMPLE.title);
    setBody(PUSH_SAMPLE.body);
    setAppName(PUSH_SAMPLE.app);
    setIconUrl('');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg-split-380-1fr">
        <div className="flex flex-col gap-3">
          <div>
            <FieldShell label="Title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your notification title"
                aria-label="Notification title"
                className="h-11 rounded-xl border-gray-200 bg-white text-[#0a0a0a] placeholder:text-gray-400"
              />
              <p className={counterClass(title.length, PUSH_TITLE_LIMIT)}>{title.length} / {PUSH_TITLE_LIMIT}</p>
            </FieldShell>
          </div>
          <FieldShell label="Body" help="Android truncates long bodies even when expanded.">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What happened, and why it matters…"
              aria-label="Notification body"
              className="resize-y rounded-xl border-gray-200 bg-white text-sm text-[#0a0a0a] placeholder:text-gray-400"
            />
            <p className={counterClass(body.length, PUSH_BODY_LIMIT)}>{body.length} / {PUSH_BODY_LIMIT}</p>
          </FieldShell>
          <TextInput label="App name" value={appName} onChange={setAppName} placeholder="Your App" />
          <TextInput
            label="Icon URL (optional)"
            value={iconUrl}
            onChange={setIconUrl}
            placeholder="https://example.com/icon-192.png"
            help="Square PNG/WebP ≥192px works best — the preview letter-crops anything else, like the platforms do."
          />
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-full border-2 border-[#0a0a0a]" role="group" aria-label="Preview theme">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                  className={cn('px-5 py-2 text-xs font-bold capitalize transition-colors', theme === t ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a] hover:bg-gray-100')}
                >
                  {t}
                </button>
              ))}
            </div>
            <PillButton variant="ghost" onClick={loadSample}><Wand2 className="size-4" /> Load sample</PillButton>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-4 text-emerald-600" aria-hidden />
            <Label className="text-sm font-bold text-[#0a0a0a]">Three surfaces, one message</Label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Android lockscreen */}
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><Smartphone className="size-3.5" aria-hidden /> Android lockscreen</p>
              <div className={cn('flex min-h-72 flex-col rounded-3xl p-4 shadow-inner', wall)}>
                <p className="text-center font-display text-4xl font-light tracking-wide text-white drop-shadow">10:08</p>
                <p className="text-center text-xs font-semibold text-white/70">Mon, January 1</p>
                <div className={cn('mt-auto rounded-3xl p-4', theme === 'dark' ? 'bg-[#1c1c1e]/95 text-white ring-1 ring-white/10' : 'bg-white/95 text-neutral-900 shadow-lg')}>
                  <div className="flex items-center gap-2">
                    {appIcon}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{appName || 'Your App'}</p>
                      <p className={cn('text-[10px]', theme === 'dark' ? 'text-white/60' : 'text-neutral-500')}>now · Alerts</p>
                    </div>
                  </div>
                  {title.trim() ? <p className="mt-2 text-[15px] font-semibold leading-snug">{title}</p> : <p className="mt-2 text-[15px] font-semibold italic opacity-40">Title appears here</p>}
                  {body.trim() ? <p className="mt-1 text-[13px] leading-relaxed opacity-90">{body}</p> : <p className="mt-1 text-[13px] italic opacity-40">Body appears here</p>}
                </div>
              </div>
            </div>

            {/* iOS banner */}
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><Bell className="size-3.5" aria-hidden /> iOS banner</p>
              <div className={cn('flex min-h-72 flex-col rounded-3xl p-4 shadow-inner', wall)}>
                <div className={cn('rounded-[22px] p-3 backdrop-blur-md', theme === 'dark' ? 'bg-[#2c2c2e]/90 text-white ring-1 ring-white/10' : 'bg-white/85 text-neutral-900 shadow-lg ring-1 ring-black/5')}>
                  <div className="flex items-start gap-2.5">
                    {appIcon}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[13px] font-bold">{title.trim() || 'Title appears here'}</p>
                        <span className={cn('shrink-0 text-[10px]', theme === 'dark' ? 'text-white/60' : 'text-neutral-500')}>now</span>
                      </div>
                      {body.trim() ? <p className="mt-0.5 line-clamp-2 text-xs leading-snug opacity-90">{body}</p> : <p className="mt-0.5 text-xs italic opacity-40">Body — clamps to two lines</p>}
                    </div>
                  </div>
                </div>
                <p className={cn('mt-3 text-center text-[10px] font-semibold', theme === 'dark' ? 'text-white/50' : 'text-neutral-600/70')}>
                  Long-press to expand — banners clamp at ~2 lines
                </p>
              </div>
            </div>

            {/* Desktop Chrome */}
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><MousePointer2 className="size-3.5" aria-hidden /> Desktop Chrome</p>
              <div className={cn('flex min-h-72 items-center rounded-3xl p-4 shadow-inner', wall)}>
                <div className={cn('w-full rounded-xl p-3.5', theme === 'dark' ? 'bg-[#202020] text-white ring-1 ring-white/15' : 'bg-white text-neutral-900 shadow-2xl ring-1 ring-black/10')}>
                  <div className="flex items-start gap-3">
                    {appIcon}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{title.trim() || 'Title appears here'}</p>
                      {body.trim() ? <p className="mt-0.5 line-clamp-3 text-xs leading-snug opacity-85">{body}</p> : <p className="mt-0.5 text-xs italic opacity-40">Body — clamps to three lines</p>}
                    </div>
                  </div>
                  <p className={cn('mt-2 text-[10px] font-semibold', theme === 'dark' ? 'text-white/50' : 'text-neutral-500')}>{(appName || 'Your App')} · via Chrome</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {title.trim() || body.trim() ? (
        overTitle || overBody ? (
          <Verdict
            tone="warn"
            title="This message will truncate on Android"
            message={`${overTitle ? `Title is ${title.length} characters — Android wraps past ~${PUSH_TITLE_LIMIT}, so the tail may not read. ` : ''}${overBody ? `Body is ${body.length} characters — Android cuts around ${PUSH_BODY_LIMIT}; what survives is what the previews show. ` : ''}Trim the copy or move the payoff into the first line.`}
          />
        ) : (
          <Verdict
            tone="good"
            title="Fits every surface"
            message={`Title ${title.length}/${PUSH_TITLE_LIMIT} and body ${body.length}/${PUSH_BODY_LIMIT} are within Android’s practical limits. The iOS banner still clamps to about two lines, so keep the hook up front — exactly as previewed.`}
          />
        )
      ) : (
        <ToolNote>
          Start typing to see the previews fill in. Counters measure UTF-16 code units — emoji can cost two units each, so leave a little headroom under the
          limits, and remember each platform re-wraps with the user’s font scale.
        </ToolNote>
      )}
    </div>
  );
};

/* ═════════════════════ batch export — entries follow src/data/tools/registry.ts order ═════════════════════ */

export const batch: BatchTool[] = [
  {
    slug: 'webp-image-converter',
    Component: WebpConverterTool,
    doc: {
      longDescription:
        'Convert JPG, PNG and other browser-decodable images to WebP — or back to PNG/JPEG — entirely on your device; the file never leaves your browser. The Saved card reports the real byte difference between the original and the converted result, so you can pick the quality that genuinely shrinks your page weight.',
      howTo: [
        'Drop in an image, or click the upload area to browse for one.',
        'Choose WebP, PNG or JPEG output; lossy formats expose a quality slider.',
        'Press Convert, read the saved-percentage card, then download the result.',
      ],
      faqs: [
        {
          q: 'Will converting to WebP always make files smaller?',
          a: 'For photos and UI screenshots at 80–85 quality, WebP typically cuts 25–60% versus JPEG or PNG. Flat graphics with very few colors sometimes compress better as PNG — the Saved card tells you which way it went for your exact file.',
        },
        {
          q: 'Does anything get uploaded to a server?',
          a: 'No. Decoding, re-encoding and measuring all happen in your browser through the Canvas API, which is why the converter works offline and is safe for private or unreleased screenshots.',
        },
        {
          q: 'What happens to animation and transparency?',
          a: 'Animated GIFs keep only their first frame, transparency survives in WebP and PNG output, and JPEG flattens it onto a white background.',
        },
      ],
    },
  },
  {
    slug: 'app-splash-screen-preview',
    Component: SplashPreviewTool,
    doc: {
      longDescription:
        'Upload your app icon and see the splash screen rendered on real iPhone, Pixel, Galaxy and iPad pixel dimensions before you ever open Xcode or Android Studio. Every preview exports at the device’s full points-×-scale resolution, so what you approve here is exactly what ships.',
      howTo: [
        'Pick a device preset — each one exports at its true pixel resolution.',
        'Drop in your icon, then set its size and corner radius (22% mimics the iOS squircle).',
        'Choose a solid or gradient background and type the app name if you show one.',
        'Export the PNG and drop it straight into your native project.',
      ],
      faqs: [
        {
          q: 'Why does my icon look different across devices?',
          a: 'The preview renders at each device’s exact points and scale factor, so an icon sized 24% of width occupies a different physical share on an iPhone SE than on an iPad Pro — matching what users actually see on first launch.',
        },
        {
          q: 'Do Android and iOS use splash images the same way?',
          a: 'Not quite: Android 12+ draws your icon as an animated splash, while iOS stretches a full-screen launch image. Export per device and follow each platform’s current sizing guidance.',
        },
        {
          q: 'Can I use this for a web app or PWA?',
          a: 'Yes — export the size that matches your manifest’s icon and splash entries; the gradient background and name styling work for PWA splash screens too.',
        },
      ],
    },
  },
  {
    slug: 'app-store-screenshot-resizer',
    Component: StoreResizerTool,
    doc: {
      longDescription:
        'Design one screenshot at 1290×2796 and this tool re-renders it into every App Store and Google Play size in a single pass, including the legacy 5.5″ iPhone slot plus Play tablet and foldable frames. Three fill modes — blurred backdrop, letterbox or cover-crop — keep any aspect ratio looking intentional.',
      howTo: [
        'Upload your master screenshot; 1290×2796 gives the sharpest results everywhere.',
        'Pick a fill mode, and a letterbox color if you choose solid bars.',
        'Press Generate all store sizes and let each preset render at full resolution.',
        'Download each PNG and upload it to the matching store slot.',
      ],
      faqs: [
        {
          q: 'Which store sizes are actually required nowadays?',
          a: 'App Store Connect requires the 6.7″/6.9″ iPhone set and iPad 13″ for universal apps; Google Play needs at least two phone screenshots. The extra presets exist so one export set covers every optional slot and future requirements.',
        },
        {
          q: 'Why does the blurred mode add a frame around my screenshot?',
          a: 'Blurred backdrops are the store-featured look: your full screenshot stays readable while the canvas fills with its own colors, and the subtle outline separates it from the background without you designing a border.',
        },
        {
          q: 'Can I export JPEGs to keep files small?',
          a: 'This tool exports PNG for lossless quality because the stores re-compress uploads anyway. If weight matters, run the PNGs through your optimizer afterwards rather than re-encoding here.',
        },
      ],
    },
  },
  {
    slug: 'push-notification-tester',
    Component: PushNotificationTesterTool,
    doc: {
      longDescription:
        'Write a push title and body once and see it rendered on an Android lockscreen, an iOS banner and a desktop Chrome toast side by side, in light or dark mode. Android’s ~65-character title and ~240-character body budgets are counted live, so you catch truncation before your campaign does.',
      howTo: [
        'Type the notification title and body; the counters turn red past the Android limits.',
        'Optionally paste a square icon URL to replace the placeholder app icon.',
        'Toggle dark or light to check both color schemes on every surface.',
        'Iterate until the verdict stays green, then take the copy into your push service.',
      ],
      faqs: [
        {
          q: 'Why do Android and iOS show different amounts of text?',
          a: 'Android reveals a longer body on expanded lockscreen notifications, while iOS banners clamp to roughly two lines until long-pressed. Checking all three surfaces stops you from burying the payoff where it gets cut.',
        },
        {
          q: 'What image works best as the icon?',
          a: 'A square PNG or WebP of at least 192×192 with a transparent or solid background. The preview letter-crops anything else, exactly like the platforms do.',
        },
        {
          q: 'Are the 65 and 240 numbers hard cutoffs?',
          a: 'They are the practical Android budgets where titles wrap and bodies truncate; exact behavior varies by launcher and font scale. Treat them as safe targets rather than legal limits.',
        },
      ],
    },
  },
  {
    slug: 'screen-recorder-to-gif',
    Component: ScreenRecorderToGifTool,
    doc: {
      longDescription:
        'Capture any tab, window or screen for up to 30 seconds and turn the take into a tightly quantized animated GIF — no upload, no watermark, no signup. Existing footage works too: drop a WebM/MP4 clip or a numbered PNG sequence and the same encoder produces the identical GIF.',
      howTo: [
        'Press Start screen recording and choose what to share; recording auto-stops at 30 seconds.',
        'Pick a frame rate and maximum width — 10 fps at 480 px suits most READMEs.',
        'Build the GIF and watch the progress bar quantize each frame.',
        'Download it and check the size; lower the fps or width if you need it lighter.',
      ],
      faqs: [
        {
          q: 'GIF or video for a product demo?',
          a: 'GIFs autoplay silently everywhere — docs, app stores, even many email clients — which makes them unbeatable for 5–15 second loops. For anything with narration or beyond 30 seconds, ship an MP4 instead.',
        },
        {
          q: 'Why is my GIF bigger than the video was?',
          a: 'GIF stores every frame as full pixels with a 256-color palette while video uses inter-frame compression. Keep clips short, drop the fps and narrow the width — those three levers control most of the weight.',
        },
        {
          q: 'Can I record a phone screen?',
          a: 'Mobile browsers do not expose screen capture. Record there with the built-in recorder, send the clip to a desktop and use the upload path in this tool — the encoder output is identical.',
        },
      ],
    },
  },
  {
    slug: 'mobile-mockup-generator',
    Component: MockupGeneratorTool,
    doc: {
      longDescription:
        'Drop a portrait screenshot into a drawn-to-canvas phone body — bezel, notch, side buttons and a soft drop shadow included — and export a ready-to-post mockup on a transparent, solid or gradient backdrop. Exports go up to 3× so the result stays crisp in hero sections and pitch decks.',
      howTo: [
        'Upload the screenshot you want framed; portrait shots fill the screen naturally.',
        'Choose a frame color, background style, and whether to draw the notch and shadow.',
        'Pick an export resolution — 2× covers retina websites, 3× suits large heroes.',
        'Download the PNG and drop it into your landing page or deck.',
      ],
      faqs: [
        {
          q: 'What aspect ratio screenshot works best?',
          a: 'Anything between 9:19.5 and roughly 1:2.2 fills the frame edge to edge. Wider landscape shots get letterboxed inside the screen area, which usually looks unintended — crop first for a cleaner result.',
        },
        {
          q: 'Is the mockup a photo of a real device?',
          a: 'No — it is a clean vector-style body rendered on canvas, which keeps the file small, avoids trademark issues with specific device imagery and scales to 3× without artifacts.',
        },
        {
          q: 'Why choose the transparent background?',
          a: 'A transparent PNG sits directly on your site’s own gradient or photo, so the mockup blends into any layout without a rectangular halo to mask.',
        },
      ],
    },
  },
  {
    slug: 'app-wireframe-sketcher',
    Component: WireframeSketcherTool,
    doc: {
      longDescription:
        'Sketch low-fidelity app or web screens by dropping standardized blocks — headers, heroes, lists, buttons, tab bars — onto a phone or desktop frame, then export the arrangement as a crisp 2× PNG for docs and handoffs. Blocks keep normalized positions, so layouts stay tidy without a design tool.',
      howTo: [
        'Pick a phone or desktop canvas, then click palette blocks to drop them in.',
        'Drag each block into place; press Delete with a block selected to remove it.',
        'Use Undo and Clear to iterate quickly without losing the arrangement.',
        'Export the PNG and paste it into tickets, specs or sprint docs.',
      ],
      faqs: [
        {
          q: 'Why wireframe in a browser instead of Figma?',
          a: 'For early ideas the friction matters more than fidelity: no file setup, no component libraries — just blocks that keep the conversation on structure and flow before anyone argues about colors.',
        },
        {
          q: 'Can collaborators edit the same sketch?',
          a: 'The sketch lives in your browser session only. Export the PNG and attach it to the ticket or drop it in your team chat — that is what keeps the tool instant and private.',
        },
        {
          q: 'Do exported sizes match real device screens?',
          a: 'The phone canvas mirrors a 300×580 logical viewport and desktop 680×420, both exported at 2× — close enough for annotated flows rather than pixel-accurate UI specs.',
        },
      ],
    },
  },
  {
    slug: 'user-flow-mapper',
    Component: UserFlowMapperTool,
    doc: {
      longDescription:
        'Chain screens, decisions and actions into a flow diagram with draggable nodes and auto-attached arrows, then export the whole map as a clean SVG that scales infinitely in wikis, docs and Figma. A worked onboarding example loads instantly, so you can edit instead of starting blank.',
      howTo: [
        'Add Screen, Decision or Action nodes — they land on the dotted canvas ready to drag.',
        'Hit Connect nodes, click the source, then the target to draw an arrow.',
        'Rename anything with the label field; delete arrows or nodes with the buttons below.',
        'Export the SVG for your spec doc — it keeps colors, arrowheads and the grid.',
      ],
      faqs: [
        {
          q: 'What is the difference between the three node types?',
          a: 'Screens are destinations users land on, decisions are branch points that split paths, and actions are steps like “start trial”. Keeping that vocabulary consistent is what makes flows readable across a whole team.',
        },
        {
          q: 'Why SVG instead of PNG?',
          a: 'SVG stays sharp at any zoom, weighs a few kilobytes and pastes into Confluence, Notion and Figma as editable vectors — a raster export would blur on the first pinch-zoom.',
        },
        {
          q: 'Can I map two alternative paths from one screen?',
          a: 'Yes — connect the same source node to as many targets as you need. Arrows attach to node centers and follow the shapes while you drag, so re-routing is just moving a box.',
        },
      ],
    },
  },
  {
    slug: 'color-code-converter',
    Component: ColorConverterTool,
    doc: {
      longDescription:
        'Type any HEX, RGB, HSL or CMYK value and get all four formats live, plus a 50–950 shade-and-tint ladder generated from your exact color for Tailwind-style palettes. Every field is bidirectional — edit one and the rest, including the big preview swatch, follow instantly.',
      howTo: [
        'Paste a color into any field — HEX, RGB, HSL or CMYK, in any common notation.',
        'Copy the format you need with the button beside each field.',
        'Click a step on the 50–950 ladder to promote that shade to the working color.',
        'Judge light or dark text straight from the swatch before committing UI colors.',
      ],
      faqs: [
        {
          q: 'Why does my CMYK conversion look duller than the screen?',
          a: 'CMYK describes ink on paper with a smaller gamut than displays. This conversion is the standard mathematical one — for print production always soft-proof in a tool that knows your actual ICC profile.',
        },
        {
          q: 'How is the shade ladder calculated?',
          a: 'Each step mixes the input toward white (tints) or black (shades) by fixed factors with 500 as the untouched color — the same mental model Tailwind’s palette ladder uses.',
        },
        {
          q: 'Can I enter colors like “rgb(5 150 105)” without commas?',
          a: 'Yes — the parser reads the numbers out of any string, so spaces, commas, css rgb()/hsl() wrappers and missing # signs all work.',
        },
      ],
    },
  },
  {
    slug: 'gradient-css-generator',
    Component: GradientGeneratorTool,
    doc: {
      longDescription:
        'Build linear or radial gradients visually — up to three color stops at any angle — and copy CSS that ships with both the modern syntax and a correctly converted -webkit- fallback. Eight curated presets put a production-looking starting point one click away.',
      howTo: [
        'Load a preset or set your own stops with the color pickers and position sliders.',
        'Switch linear/radial and dial the angle — the preview updates as you drag.',
        'Add a middle stop for duotone-style transitions when two colors feel flat.',
        'Copy the CSS block; the -webkit- line is already angle-corrected for you.',
      ],
      faqs: [
        {
          q: 'Why does the generated CSS contain two background-image lines?',
          a: 'Older WebKit builds and many embedded webviews still parse only the -webkit- prefix, and because the modern declaration comes last, capable browsers simply override it — one block, full coverage.',
        },
        {
          q: 'Why is my legacy angle different from the slider?',
          a: 'WebKit measured gradient angles counter-clockwise from east while the standard measures clockwise from north; the tool converts between the two so the fallback renders identically.',
        },
        {
          q: 'Can I add more than three stops?',
          a: 'The UI caps at three because most UI gradients degrade visually past that, but you can copy the CSS and extend the stop list by hand — browsers accept as many as you like.',
        },
      ],
    },
  },
  {
    slug: 'box-shadow-generator',
    Component: BoxShadowGeneratorTool,
    doc: {
      longDescription:
        'Design layered box shadows with sliders for offset, blur, spread, opacity and inset, previewed live on a card whose own and page colors you control. Two stackable layers let you build the soft-ambient-plus-tight-contact pairing that reads as natural depth in modern UI.',
      howTo: [
        'Adjust layer 1 for the main ambient shadow — big blur, negative spread, low opacity.',
        'Enable layer 2 for a tight contact shadow that grounds the element.',
        'Match the card and backdrop colors to your real UI for an honest preview.',
        'Copy the box-shadow rule into your stylesheet or a Tailwind arbitrary value.',
      ],
      faqs: [
        {
          q: 'Why layer two shadows instead of one?',
          a: 'Real objects cast a diffuse ambient shadow plus a sharper one where they touch the surface. A single blurred shadow looks floaty — the two-layer combo is what makes cards feel physically present.',
        },
        {
          q: 'How does opacity work with the color picker?',
          a: 'The color stays in hex and the opacity becomes the alpha channel in the final rgba() value, so you can reuse one shadow color across a theme while tuning strength separately.',
        },
        {
          q: 'What is an inset shadow for?',
          a: 'It draws inside the element instead of outside — perfect for pressed states, wells, inputs and the subtle inner glow on raised dark-mode surfaces.',
        },
      ],
    },
  },
  {
    slug: 'border-radius-generator',
    Component: BorderRadiusTool,
    doc: {
      longDescription:
        'Set border radius per corner in pixels with a linked-corners option, or switch to organic blob mode using the two-axis 8-value syntax with one-click presets. The preview updates live and the generated CSS is exactly what you paste — no guessing which number maps to which corner.',
      howTo: [
        'Drag each corner’s slider, or toggle Link all corners for a uniform radius.',
        'Switch to blob mode for organic shapes — try the Egg and Leaf presets.',
        'Randomize blobs until one fits, then fine-tune the eight radii by hand.',
        'Copy the CSS; blob mode uses the horizontal/vertical slash syntax automatically.',
      ],
      faqs: [
        {
          q: 'What is the slash syntax in blob mode?',
          a: 'border-radius accepts eight values: four horizontal radii, a slash, then four vertical radii. Varying the two axes independently is what produces leaf, egg and pebble shapes instead of simple rounded rectangles.',
        },
        {
          q: 'Why did my huge radius flatten the shape?',
          a: 'Browsers clamp radii proportionally when adjacent corners overlap — the same reason a 50% square becomes a circle. Reduce the value or enlarge the element and the corner reappears.',
        },
        {
          q: 'Do blob shapes work on images too?',
          a: 'Yes — apply the generated border-radius to any img or video element; the corners clip the media itself with no wrapper or clip-path needed.',
        },
      ],
    },
  },
  {
    slug: 'instagram-grid-planner',
    Component: InstagramGridPlannerTool,
    doc: {
      longDescription:
        'Upload up to nine posts — or drop in solid color tiles — and see your Instagram profile grid exactly as followers will, in square or 2:3 portrait cells. An “alternate light/dark” pass sorts tiles by brightness in a snake pattern: the classic trick for a feed that contrasts without looking staged.',
      howTo: [
        'Drop up to nine images; they fill the grid in posting order.',
        'Click two tiles to swap them, or remove one with its corner button.',
        'Add solid tiles to stand in for quote cards or text posts you have not designed yet.',
        'Try Alternate light/dark, then export the finished grid as a PNG for the team.',
      ],
      faqs: [
        {
          q: 'Why 2:3 portrait tiles?',
          a: 'Instagram currently crops profile thumbnails to portrait, so planning in 1:1 can hide the top and bottom of your art. Preview both aspects before you crop final assets.',
        },
        {
          q: 'How does the brightness sort work?',
          a: 'Each tile’s average luminance is measured on an 8×8 downsample, then tiles are laid out in a boustrophedon (snake) order from darkest to lightest so neighbours always contrast.',
        },
        {
          q: 'Does uploading leak my photos?',
          a: 'No — files are read with the browser’s FileReader and drawn locally; nothing is sent anywhere, which also makes the planner safe for unreleased campaign visuals.',
        },
      ],
    },
  },
  {
    slug: 'reel-story-size-resizer',
    Component: ReelStoryResizerTool,
    doc: {
      longDescription:
        'One image in, every social size out: Reels/Stories 9:16 with red safe-zone guides, feed square, 4:5 portrait and YouTube thumbnail 16:9. Drag to reposition, zoom precisely, and export JPEG or PNG at full platform resolution — the guides are never baked into the file.',
      howTo: [
        'Upload your image or an exported video frame.',
        'Choose an output size and drag the preview to reposition the crop.',
        'Toggle the safe-zone guides on 9:16 to keep captions clear of platform UI.',
        'Export — guides are preview-only, so the file is always clean.',
      ],
      faqs: [
        {
          q: 'What are the red bands on the Reels preset?',
          a: 'They mark where Instagram and TikTok overlay usernames, captions and engagement bars. Content in those zones gets covered — keep faces, text and CTAs between the lines.',
        },
        {
          q: 'Which format should I export?',
          a: 'JPEG at 90% for photos (small upload, visually identical) and PNG for graphics with text or flat colors where compression artifacts show. Platforms re-compress anyway, so prioritize a clean, correctly-sized upload.',
        },
        {
          q: 'Can I use one export for both Reels and TikTok?',
          a: 'Yes — both accept 1080×1920. Their safe zones differ slightly, but the conservative band shown here covers the overlap of both overlays.',
        },
      ],
    },
  },
  {
    slug: 'youtube-thumbnail-downloader',
    Component: YouTubeThumbnailDownloaderTool,
    doc: {
      longDescription:
        'Paste any YouTube link — watch, Shorts, share or a bare video ID — and instantly see every thumbnail the CDN holds: maxres 1280×720, sd 640×480, hq 480×360 and mq 320×180. Sizes a video does not have are detected and hidden, and every URL can be copied or opened full-size in a new tab.',
      howTo: [
        'Paste a YouTube URL or 11-character video ID; the grid loads automatically.',
        'Check each size’s badge — only versions that actually exist stay visible.',
        'Copy a URL for embeds, or open the file in a new tab and save it.',
        'Use Copy all thumbnail URLs to grab every available size at once.',
      ],
      faqs: [
        {
          q: 'Why is maxresdefault missing for some videos?',
          a: 'That size only exists when the uploader provided HD art of 1280×720 or larger. The tool detects the 120×90 placeholder YouTube serves instead and marks the size unavailable rather than showing a grey tile.',
        },
        {
          q: 'Can I download thumbnails without an API key?',
          a: 'Yes — these are public i.ytimg.com CDN files, the same ones the watch page loads. No quota, no key and nothing is proxied through a server.',
        },
        {
          q: 'Is grabbing a thumbnail legal?',
          a: 'Thumbnails are copyrighted by their creators. Downloading for reference, research or fair-use commentary is generally fine; republishing one as your own art is not.',
        },
      ],
    },
  },
  {
    slug: 'profile-picture-resizer',
    Component: ProfilePictureResizerTool,
    doc: {
      longDescription:
        'Center-crop one photo into perfect square avatars for LinkedIn, Instagram, X and GitHub, with a circular preview that shows exactly what gets exported. Zoom and drag to frame the face, then download a PNG with fully transparent corners at each platform’s native size.',
      howTo: [
        'Drop in your photo — the circle preview is exactly what gets exported.',
        'Zoom in for a tighter head-and-shoulders crop and drag to reposition.',
        'Pick the platform size you need from the dropdown.',
        'Export the square PNG; the corners outside the circle stay transparent.',
      ],
      faqs: [
        {
          q: 'Why is the export square if the preview is a circle?',
          a: 'Every platform stores a square image and applies its own mask on top. Exporting the square with transparent corners means your file works everywhere without re-cropping.',
        },
        {
          q: 'What resolution should I aim for?',
          a: 'The presets match each platform’s native size (400×400 LinkedIn/X, 320×320 Instagram, 460×460 GitHub). Starting from a photo at least twice that large keeps the crop sharp after platform compression.',
        },
        {
          q: 'Is the emerald ring saved into the file?',
          a: 'No — it is a preview guide only. The exported PNG contains just your photo on a transparent background.',
        },
      ],
    },
  },
  {
    slug: 'giveaway-winner-picker',
    Component: GiveawayWinnerPickerTool,
    doc: {
      longDescription:
        'Paste entrants one per line — “Name ×3” grants bonus entries — and draw up to ten winners with cryptographic randomness (crypto.getRandomValues with rejection sampling, not Math.random). Duplicate handling, a live entrant/ticket count and an animated one-by-one reveal make the draw easy to defend in public.',
      howTo: [
        'Paste names one per line; add ×2, ×3… after a name for extra entries.',
        'Toggle dedupe to merge repeated people — their bonus entries combine.',
        'Choose how many winners to draw and press Draw; names reveal one at a time.',
        'Copy the timestamped winners list, or hit Draw again for a fresh take.',
      ],
      faqs: [
        {
          q: 'How is the draw fair?',
          a: 'Every entry is a ticket in a pool; winners are drawn without replacement using crypto.getRandomValues with modulo-rejection — the same bias-free technique secure samplers use — so each person’s odds equal their ticket share.',
        },
        {
          q: 'What does the ×3 syntax actually do?',
          a: 'It adds two bonus tickets on top of the base one, so that entrant holds three of the pool. The usual case is liking, commenting and tagging, each worth an entry.',
        },
        {
          q: 'Why deduplicate entrants?',
          a: 'Comment exports often contain the same person several times. Dedupe collapses them to one entrant while summing any bonus entries, so honest multi-entry comments keep their odds but spam does not multiply.',
        },
      ],
    },
  },
  {
    slug: 'invoice-generator',
    Component: InvoiceGeneratorTool,
    doc: {
      longDescription:
        'Fill in your business and client details, add line items with quantity and rate, set tax, and watch a clean invoice document build itself live. Print straight to PDF with styles that strip the entire app shell, or copy the whole invoice as plain text for the email thread.',
      howTo: [
        'Fill the business and client blocks — the preview updates on every keystroke.',
        'Add line items with description, quantity and rate; remove rows you do not need.',
        'Set the invoice number, issue and due dates, currency symbol and tax percentage.',
        'Press Print / Save as PDF, or Copy as text to paste into email.',
      ],
      faqs: [
        {
          q: 'How do I get a PDF?',
          a: 'Use Print / Save as PDF and pick your browser’s “Save as PDF” destination. The print stylesheet hides everything except the invoice document, giving you a clean A4-style page with no watermarks.',
        },
        {
          q: 'Is my client data stored anywhere?',
          a: 'No — every field lives in your browser tab only. Nothing is transmitted, saved or logged, so you can invoice real clients without a second thought about privacy.',
        },
        {
          q: 'Can I change the currency?',
          a: 'The symbol field accepts anything: $, €, £, ₹, AED, US$ … Amounts are formatted with thousands separators and two decimals, and the tax line always shows the exact percentage you set.',
        },
      ],
    },
  },
  {
    slug: 'quote-estimate-generator',
    Component: QuoteEstimateGeneratorTool,
    doc: {
      longDescription:
        'Turn scope into a client-ready estimate: service lines priced as hours × rate or a fixed amount, an optional discount, a validity date and terms — previewed live on a document with a distinct emerald header so it is never confused with an invoice. Print to PDF or copy the whole quote as text.',
      howTo: [
        'Name the project and fill in both parties; the emerald-headed document builds as you type.',
        'Add service lines and switch each one between hours × rate and fixed price.',
        'Apply a discount percentage, then set the valid-until date and terms.',
        'Print / Save as PDF, or copy the quote as text for the email thread.',
      ],
      faqs: [
        {
          q: 'How is this different from the invoice tool?',
          a: 'Estimates precede work: they carry a validity date, terms and discounting, and they are priced as effort (hours × rate) or fixed scope. The emerald header keeps the two documents apart in the same thread.',
        },
        {
          q: 'Should I show the discount to the client?',
          a: 'Yes — a visible discount line documents the goodwill and anchors the original value. The total already accounts for it, and the percentage prints exactly as entered.',
        },
        {
          q: 'What belongs in the terms field?',
          a: 'Three short clauses work best: a payment schedule (e.g. 50% upfront), what voids the quote (prices valid until the date shown) and revision limits. Keep it plain — a quote should read in under a minute.',
        },
      ],
    },
  },
];

