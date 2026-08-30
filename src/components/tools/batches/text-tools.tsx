'use client';

import * as React from 'react';
import { diffLines } from 'diff';
import { AnalyzeTool } from '../engines/analyze-tool';
import { TextTool } from '../engines/text-tool';
import type { BatchTool } from '../batch-types';
import {
  CopyButton,
  NumberInput,
  SelectInput,
  StatCard,
  TextAreaInput,
  TextInput,
  ToggleInput,
  ToolNote,
  useCopy,
  Verdict,
} from '../tool-ui';

/* ═══════════════════════════════════════════════════════════════
   TEXT TOOLS BATCH — agent task 23-c
   10 text-engine tools · 6 analyze-engine tools · 4 bespoke tools
   ═══════════════════════════════════════════════════════════════ */

/* ───────────────────────── shared helpers ───────────────────────── */

const STOPWORDS = new Set(
  ('a,about,above,after,again,against,all,also,am,an,and,any,are,as,at,be,because,been,before,being,' +
    'below,between,both,but,by,can,could,did,do,does,doing,down,during,each,few,for,from,further,had,' +
    'has,have,having,he,her,here,hers,him,his,how,i,if,in,into,is,it,its,itself,just,like,me,more,most,' +
    'my,no,nor,not,now,of,off,on,once,only,or,other,our,ours,out,over,own,same,she,should,so,some,such,' +
    'than,that,the,their,theirs,them,then,there,these,they,this,those,through,to,too,under,until,up,' +
    'very,was,we,were,what,when,where,which,while,who,whom,why,will,with,within,would,you,your,yours')
    .split(',')
);

function splitWords(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${Math.max(1, Math.round(sec))} sec`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

/* ═════════════════════ 1. css-minifier ═════════════════════ */

function minifyCss(css: string): string {
  try {
    const stash: string[] = [];
    const keep = (raw: string) => {
      stash.push(raw);
      return '\u0000' + (stash.length - 1) + '\u0000';
    };
    let out = '';
    let i = 0;
    const n = css.length;
    while (i < n) {
      const c = css[i];
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < n && css[j] !== c) {
          if (css[j] === '\\') j++;
          j++;
        }
        out += keep(css.slice(i, Math.min(j + 1, n)));
        i = j + 1;
        continue;
      }
      if (c === '/' && css[i + 1] === '*') {
        const end = css.indexOf('*/', i + 2);
        out += ' ';
        i = end === -1 ? n : end + 2;
        continue;
      }
      if (css.slice(i, i + 5).toLowerCase() === 'calc(') {
        let depth = 0;
        let j = i + 4;
        for (; j < n; j++) {
          if (css[j] === '(') depth++;
          else if (css[j] === ')') {
            depth--;
            if (depth === 0) break;
          }
        }
        out += keep(css.slice(i, Math.min(j + 1, n)));
        i = j + 1;
        continue;
      }
      out += c;
      i++;
    }
    out = out.replace(/\s+/g, ' ').trim();
    out = out.replace(/\s*([{}:;,>+~])\s*/g, '$1');
    out = out.replace(/;}/g, '}');
    out = out.replace(/\u0000(\d+)\u0000/g, (_, d: string) => stash[Number(d)]);
    return out;
  } catch (e) {
    return '⚠ Minify failed: ' + (e as Error).message;
  }
}

const CSS_SAMPLE = [
  '/* theme colors — do not edit */',
  ':root { --brand: #0a0a0a; --accent: #ec4899; }',
  'body { margin: 0; padding: 0 ; font-family: Arial, sans-serif; }',
  '.hero { width: calc(100% - 40px); background: url("bg.png"); content: "a  b"; }',
  '.empty {}',
].join('\n');

const CssMinifierTool = () => (
  <TextTool
    config={{
      transform: minifyCss,
      inputLabel: 'Your stylesheet',
      outputLabel: 'Minified CSS',
      placeholder: 'Paste CSS here — comments and extra whitespace are stripped live…',
      rows: 14,
      downloadName: 'minified',
      downloadExt: 'css',
      acceptFile: true,
      sample: CSS_SAMPLE,
    }}
  />
);

/* ═════════════════════ 2. js-minifier ═════════════════════ */

const JS_KEYWORDS_BEFORE_REGEX = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'throw', 'case', 'do', 'else', 'yield', 'await',
]);

function regexAllowedAfter(out: string): boolean {
  let i = out.length - 1;
  while (i >= 0 && /\s/.test(out[i])) i--;
  if (i < 0) return true;
  const c = out[i];
  if ('.,=:([!&|?{};+-*%<>~^'.includes(c)) return true;
  let j = i;
  while (j >= 0 && /[A-Za-z0-9_$]/.test(out[j])) j--;
  const word = out.slice(j + 1, i + 1);
  return word !== '' && JS_KEYWORDS_BEFORE_REGEX.has(word);
}

function stripJsComments(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) {
        if (src[j] === '\\') j++;
        j++;
      }
      out += src.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }
    if (c === '`') {
      let j = i + 1;
      while (j < n && src[j] !== '`') {
        if (src[j] === '\\') j++;
        j++;
      }
      out += src.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i);
      i = nl === -1 ? n : nl; // keep the newline itself
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      out += ' ';
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '/' && regexAllowedAfter(out)) {
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') {
          j += 2;
          continue;
        }
        if (ch === '[') inClass = true;
        else if (ch === ']') inClass = false;
        else if (ch === '/' && !inClass) break;
        j++;
      }
      let k = j + 1;
      while (k < n && /[a-z]/i.test(src[k])) k++; // flags
      out += src.slice(i, Math.min(k, n));
      i = k;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function minifyJsSafe(src: string): string {
  try {
    const stripped = stripJsComments(src);
    const lines = stripped.split('\n').map((l) => l.replace(/[ \t]+$/, ''));
    const out: string[] = [];
    let blanks = 0;
    for (const l of lines) {
      if (l.trim() === '') {
        blanks++;
        if (blanks === 1 && out.length > 0) out.push('');
      } else {
        blanks = 0;
        out.push(l);
      }
    }
    while (out.length > 0 && out[out.length - 1] === '') out.pop();
    return out.join('\n');
  } catch (e) {
    return '⚠ Minify failed: ' + (e as Error).message;
  }
}

const JS_SAMPLE = [
  '// invoice helpers — v2',
  'const RATE = 0.2; // sales tax',
  'const banner = "http://example.com is not a comment"; // strip me',
  'const re = /a\\/b\\/c/g; /* regex literal with slashes */',
  'const tpl = `total: ${1 + 2}`; // template literal',
  'function total(price) {',
  '  return price * (1 + RATE); // TODO: rounding',
  '}',
].join('\n');

const JsMinifierTool = () => (
  <TextTool
    config={{
      transform: minifyJsSafe,
      inputLabel: 'Your JavaScript',
      outputLabel: 'Stripped JavaScript',
      placeholder: 'Paste JavaScript here — comments disappear, code stays byte-identical…',
      rows: 14,
      downloadName: 'stripped',
      downloadExt: 'js',
      acceptFile: true,
      sample: JS_SAMPLE,
    }}
  />
);

/* ═════════════════════ 3. html-formatter-beautifier ═════════════════════ */

const HTML_VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
const HTML_INLINE = new Set([
  'a', 'span', 'em', 'strong', 'b', 'i', 'u', 's', 'small', 'sub', 'sup', 'code', 'kbd', 'q',
  'abbr', 'cite', 'mark', 'time', 'td', 'th', 'option', 'label', 'del', 'ins', 'bdi', 'bdo',
]);
const RAW_ELEMENTS = new Set(['script', 'style', 'pre']);

function tokenizeHtml(src: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i + 4);
      const stop = end === -1 ? n : end + 3;
      tokens.push(src.slice(i, stop));
      i = stop;
      continue;
    }
    if (src[i] === '<') {
      const m = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(src.slice(i, i + 40));
      if (m) {
        const name = m[1].toLowerCase();
        if (RAW_ELEMENTS.has(name) && !src.startsWith('</', i)) {
          const close = src.toLowerCase().indexOf('</' + name, i + 1);
          const stop = close === -1 ? n : close + name.length + 3;
          tokens.push(src.slice(i, stop));
          i = stop;
          continue;
        }
        const end = src.indexOf('>', i);
        const stop = end === -1 ? n : end + 1;
        tokens.push(src.slice(i, stop));
        i = stop;
        continue;
      }
    }
    const next = src.indexOf('<', i + 1);
    const stop = next === -1 ? n : next;
    if (stop > i) tokens.push(src.slice(i, stop));
    i = stop > i ? stop : i + 1;
  }
  return tokens;
}

function formatHtml(src: string): string {
  try {
    const tokens = tokenizeHtml(src);
    const out: string[] = [];
    let depth = 0;
    let line: string | null = null;
    const flush = () => {
      if (line !== null && line.trim() !== '') {
        out.push('  '.repeat(Math.max(0, depth)) + line.trim());
      }
      line = null;
    };
    for (const tok of tokens) {
      if (tok.startsWith('<!--')) {
        flush();
        out.push('  '.repeat(depth) + tok.trim());
        continue;
      }
      if (tok.startsWith('<')) {
        const m = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(tok.slice(0, 40));
        const name = (m?.[1] ?? '').toLowerCase();
        const closing = tok.startsWith('</');
        const selfClosing = /\/>$/.test(tok) || HTML_VOID.has(name);
        if (RAW_ELEMENTS.has(name) && !closing) {
          flush();
          const lines = tok.split('\n').map((l) => l.replace(/[ \t]+$/, ''));
          out.push('  '.repeat(depth) + lines[0]);
          for (let k = 1; k < lines.length - 1; k++) out.push(lines[k]);
          if (lines.length > 1) out.push('  '.repeat(depth) + lines[lines.length - 1]);
          continue;
        }
        if (HTML_INLINE.has(name) || (selfClosing && (name === 'br' || name === 'wbr' || name === 'img'))) {
          line = (line ?? '') + tok.replace(/\s+/g, ' ');
          continue;
        }
        flush();
        const tag = tok.replace(/\s+/g, ' ').trim();
        if (closing) {
          depth = Math.max(0, depth - 1);
          out.push('  '.repeat(depth) + tag);
        } else if (selfClosing) {
          out.push('  '.repeat(depth) + tag);
        } else {
          out.push('  '.repeat(depth) + tag);
          depth++;
        }
      } else {
        let text = tok.replace(/\s+/g, ' ');
        // keep the boundary space that separates text from inline tags,
        // but drop a leading space when it would start a fresh line
        if (line === null && text.startsWith(' ')) text = text.slice(1);
        if (text !== '') line = (line ?? '') + text;
      }
    }
    flush();
    const cleaned: string[] = [];
    for (const l of out) {
      if (l === '' && cleaned[cleaned.length - 1] === '') continue;
      cleaned.push(l);
    }
    while (cleaned.length > 0 && cleaned[cleaned.length - 1] === '') cleaned.pop();
    return cleaned.join('\n');
  } catch (e) {
    return '⚠ Format failed: ' + (e as Error).message;
  }
}

const HTML_SAMPLE =
  '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Demo page</title>' +
  '<style>body{margin:0;font-family:sans-serif}</style></head><body>' +
  '<h1>Hello <em>beautiful</em> world</h1>' +
  '<p>Text with <a href="https://developers3.com">a link</a> and <strong>bold</strong> words.' +
  '<pre>keep   this\n   exactly</pre></p></body></html>';

const HtmlFormatterTool = () => (
  <TextTool
    config={{
      transform: formatHtml,
      inputLabel: 'Messy markup',
      outputLabel: 'Formatted HTML',
      placeholder: 'Paste HTML here — nested tags get consistent two-space indentation…',
      rows: 14,
      downloadName: 'formatted',
      downloadExt: 'html',
      acceptFile: true,
      sample: HTML_SAMPLE,
    }}
  />
);

/* ═════════════════════ 4. base64-encoder-decoder ═════════════════════ */

function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function base64Decode(text: string): string {
  let clean = text.trim().replace(/\s+/g, '');
  const dataMatch = /^data:[^,]*,/i.exec(clean);
  if (dataMatch) clean = clean.slice(dataMatch[0].length);
  const bin = atob(clean);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const Base64Tool = () => (
  <TextTool
    config={{
      transform: (input, opts) => {
        try {
          if (opts.mode === 'decode') return base64Decode(input);
          const enc = base64Encode(input);
          return opts.dataUri === 'on' ? 'data:;base64,' + enc : enc;
        } catch (e) {
          return '⚠ Could not process this input: ' + (e as Error).message + '. If decoding, check that the string is valid Base64 (no stray characters, correct padding).';
        }
      },
      options: [
        {
          id: 'mode',
          label: 'Direction',
          default: 'encode',
          options: [
            { value: 'encode', label: 'Encode text → Base64' },
            { value: 'decode', label: 'Decode Base64 → text' },
          ],
        },
        {
          id: 'dataUri',
          label: 'Data URI mode',
          default: 'off',
          options: [
            { value: 'off', label: 'Plain Base64' },
            { value: 'on', label: 'Add data:;base64, prefix' },
          ],
        },
      ],
      inputLabel: 'Input',
      outputLabel: 'Result',
      placeholder: 'Paste text to encode, or a Base64 string / data URI to decode…',
      rows: 10,
      downloadName: 'base64',
      downloadExt: 'txt',
      sample: 'Hello Developers3!',
    }}
  />
);

/* ═════════════════════ unicode font alphabets ═════════════════════ */

function codeAlpha(upperStart: number, lowerStart: number, digitStart: number | null, exceptions: Record<string, string> = {}) {
  return (ch: string): string => {
    if (exceptions[ch] !== undefined) return exceptions[ch];
    const c = ch.codePointAt(0)!;
    if (c >= 65 && c <= 90) return String.fromCodePoint(upperStart + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(lowerStart + (c - 97));
    if (digitStart !== null && c >= 48 && c <= 57) return String.fromCodePoint(digitStart + (c - 48));
    return ch;
  };
}

const CIRCLED_MAP = (ch: string): string => {
  const c = ch.codePointAt(0)!;
  if (c >= 65 && c <= 90) return String.fromCodePoint(0x24b6 + (c - 65));
  if (c >= 97 && c <= 122) return String.fromCodePoint(0x24d0 + (c - 97));
  if (c === 48) return '⓪';
  if (c >= 49 && c <= 57) return String.fromCodePoint(0x2460 + (c - 49));
  return ch;
};

const FULLWIDTH_MAP = (ch: string): string => {
  const c = ch.codePointAt(0)!;
  return c >= 0x21 && c <= 0x7e ? String.fromCodePoint(c + 0xfee0) : ch;
};

const SQUARED_MAP = (ch: string): string => {
  const c = ch.codePointAt(0)!;
  if (c >= 65 && c <= 90) return String.fromCodePoint(0x1f130 + (c - 65));
  if (c >= 97 && c <= 122) return String.fromCodePoint(0x1f130 + (c - 97));
  return ch;
};

const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ',
  m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
  y: 'ʏ', z: 'ᴢ',
};
const smallCaps = (ch: string): string => {
  const lower = ch.toLowerCase();
  return SMALL_CAPS_MAP[lower] ?? ch;
};

const FANCY_LOWER: Record<string, string> = {
  a: 'α', b: 'ß', c: '¢', d: 'δ', e: 'є', f: 'ƒ', g: 'g', h: 'н', i: 'í', j: 'ј', k: 'κ', l: 'ℓ',
  m: 'м', n: 'η', o: 'σ', p: 'ρ', q: 'q', r: 'я', s: 'ѕ', t: 'т', u: 'υ', v: 'ν', w: 'ω', x: 'χ',
  y: 'у', z: 'z',
};
const FANCY_UPPER: Record<string, string> = {
  A: 'Λ', B: 'ß', C: '₵', D: 'Ð', E: '€', F: 'ƒ', G: 'G', H: 'н', I: 'í', J: 'Ĵ', K: 'κ', L: 'ℓ',
  M: 'м', N: 'η', O: 'σ', P: 'ρ', Q: 'Q', R: 'я', S: 'ѕ', T: 'т', U: 'υ', V: 'ν', W: 'ω', X: 'χ',
  Y: 'у', Z: 'Ź',
};
const fancySerif = (ch: string): string => FANCY_UPPER[ch] ?? FANCY_LOWER[ch] ?? ch;

function mapChars(text: string, fn: (ch: string) => string): string {
  let out = '';
  for (const ch of text) out += fn(ch);
  return out;
}

/* ═════════════════════ 5. fancy-font-generator ═════════════════════ */

const FANCY_STYLES: { name: string; convert: (t: string) => string }[] = [
  { name: 'Bold', convert: (t) => mapChars(t, codeAlpha(0x1d400, 0x1d41a, 0x1d7ce)) },
  { name: 'Italic', convert: (t) => mapChars(t, codeAlpha(0x1d434, 0x1d44e, null, { h: 'ℎ' })) },
  { name: 'Bold Italic', convert: (t) => mapChars(t, codeAlpha(0x1d468, 0x1d482, null)) },
  {
    name: 'Script',
    convert: (t) =>
      mapChars(
        t,
        codeAlpha(0x1d49c, 0x1d4b6, null, {
          B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ',
          e: 'ℯ', g: 'ℊ', o: 'ℴ',
        })
      ),
  },
  { name: 'Bold Script', convert: (t) => mapChars(t, codeAlpha(0x1d4d0, 0x1d4ea, null)) },
  {
    name: 'Gothic',
    convert: (t) =>
      mapChars(t, codeAlpha(0x1d504, 0x1d51e, null, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' })),
  },
  {
    name: 'Double-Struck',
    convert: (t) =>
      mapChars(
        t,
        codeAlpha(0x1d538, 0x1d552, 0x1d7d8, {
          C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ',
        })
      ),
  },
  { name: 'Circled', convert: (t) => mapChars(t, CIRCLED_MAP) },
  { name: 'Fullwidth', convert: (t) => mapChars(t, FULLWIDTH_MAP) },
  { name: 'Small Caps', convert: (t) => mapChars(t, smallCaps) },
  { name: 'Fancy Serif', convert: (t) => mapChars(t, fancySerif) },
  { name: 'Squared', convert: (t) => mapChars(t, SQUARED_MAP) },
];

const FancyFontTool = () => (
  <TextTool
    config={{
      transform: (input) => FANCY_STYLES.map((s) => `${s.name}: ${s.convert(input)}`).join('\n\n'),
      inputLabel: 'Your text',
      outputLabel: 'All styles',
      placeholder: 'Type a heading, name or short phrase…',
      rows: 4,
      downloadName: 'fancy-fonts',
      downloadExt: 'txt',
      sample: 'Developers3',
    }}
  />
);

/* ═════════════════════ 6. instagram-font-generator ═════════════════════ */

const IG_STYLES: { name: string; note: string; convert: (t: string) => string }[] = [
  { name: 'Bold Sans', note: '→ punchy captions & hooks', convert: (t) => mapChars(t, codeAlpha(0x1d5d4, 0x1d5ee, 0x1d7ec)) },
  { name: 'Italic Sans', note: '→ soft, editorial bios', convert: (t) => mapChars(t, codeAlpha(0x1d608, 0x1d622, null)) },
  {
    name: 'Cursive Script',
    note: '→ signature-style name fields',
    convert: (t) =>
      mapChars(
        t,
        codeAlpha(0x1d49c, 0x1d4b6, null, {
          B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ',
        })
      ),
  },
  { name: 'Outlined', note: '→ list accents & highlights', convert: (t) => mapChars(t, CIRCLED_MAP) },
  { name: 'Fullwidth', note: '→ spaced-out aesthetic lines', convert: (t) => mapChars(t, FULLWIDTH_MAP) },
  { name: 'Small Caps', note: '→ clean, classy subtitles', convert: (t) => mapChars(t, smallCaps) },
  { name: 'Typewriter', note: '→ tech-y, minimal bios', convert: (t) => mapChars(t, codeAlpha(0x1d670, 0x1d68a, 0x1d7f6)) },
  { name: 'Double-Struck', note: '→ bold one-word statements', convert: (t) => mapChars(t, codeAlpha(0x1d538, 0x1d552, 0x1d7d8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' })) },
];

const InstagramFontTool = () => (
  <TextTool
    config={{
      transform: (input) => IG_STYLES.map((s) => `${s.name}: ${s.convert(input)} ${s.note}`).join('\n'),
      inputLabel: 'Bio line or caption',
      outputLabel: 'Instagram-ready styles',
      placeholder: 'Type the bio line, caption or name you want to style…',
      rows: 4,
      downloadName: 'instagram-fonts',
      downloadExt: 'txt',
      sample: 'Bio vibe check',
    }}
  />
);

/* ═════════════════════ 7. slug-generator ═════════════════════ */

const SLUG_STOPWORDS = new Set(
  'a,an,the,and,or,but,of,to,in,on,for,with,at,by,from,is,are,was,were,be,been,it,its,this,that,as,your,you,we,our'.split(',')
);

const SlugGeneratorTool = () => (
  <TextTool
    config={{
      transform: (input, opts) => {
        const sep = opts.separator === 'underscore' ? '_' : '-';
        let s = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        s = s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        let parts = s.split(/\s+/).filter(Boolean);
        if (opts.stopwords === 'trim') parts = parts.filter((w) => !SLUG_STOPWORDS.has(w));
        let slug = parts.join(sep);
        if (opts.maxlen === '60' && slug.length > 60) {
          slug = slug.slice(0, 60);
          const cut = slug.lastIndexOf(sep);
          if (cut > 20) slug = slug.slice(0, cut);
        }
        return slug;
      },
      options: [
        {
          id: 'stopwords',
          label: 'Stop words',
          default: 'keep',
          options: [
            { value: 'keep', label: 'Keep every word' },
            { value: 'trim', label: 'Trim (the, and, of…)' },
          ],
        },
        {
          id: 'separator',
          label: 'Separator',
          default: 'hyphen',
          options: [
            { value: 'hyphen', label: 'Hyphen  -' },
            { value: 'underscore', label: 'Underscore  _' },
          ],
        },
        {
          id: 'maxlen',
          label: 'Max length',
          default: '60',
          options: [
            { value: '60', label: 'Clamp to 60 chars' },
            { value: 'off', label: 'No clamping' },
          ],
        },
      ],
      inputLabel: 'Page title',
      outputLabel: 'URL slug',
      placeholder: 'Paste a headline or page title…',
      rows: 4,
      downloadName: 'slug',
      downloadExt: 'txt',
      sample: '10 Best Coffee Shops in São Paulo — 2024 Guide!',
    }}
  />
);

/* ═════════════════════ 8. lorem-ipsum-generator ═════════════════════ */

const LOREM_BANK = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum',
];

const LOREM_COUNTS = Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

function loremSentence(start: number, len: number): string {
  const parts: string[] = [];
  for (let k = 0; k < len; k++) parts.push(LOREM_BANK[(start + k) % LOREM_BANK.length]);
  const s = parts.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

function buildLorem(type: string, count: number, html: string, startLorem: string): string {
  const startOn = startLorem === 'yes';
  if (type === 'words') {
    let n = count;
    let out: string[] = [];
    if (startOn) {
      out = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur'];
      n = Math.max(0, count - out.length);
    }
    for (let k = 0; k < n; k++) out.push(LOREM_BANK[(k * 5 + 3) % LOREM_BANK.length]);
    return out.join(' ');
  }
  if (type === 'sentences') {
    const list: string[] = [];
    const first = startOn ? 1 : 0;
    if (startOn) list.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
    for (let s = first; s < count; s++) list.push(loremSentence(s * 3 + 2, 7 + ((s * 3) % 6)));
    return list.join(' ');
  }
  if (type === 'list') {
    const items: string[] = [];
    for (let k = 0; k < count; k++) {
      if (k === 0 && startOn) {
        items.push('Lorem ipsum dolor sit amet');
        continue;
      }
      const len = 4 + (k % 3);
      let item = '';
      for (let w = 0; w < len; w++) item += (w === 0 ? '' : ' ') + LOREM_BANK[(k * 7 + w * 2 + 1) % LOREM_BANK.length];
      items.push(item.charAt(0).toUpperCase() + item.slice(1));
    }
    if (html === 'html') {
      return '<ul>\n' + items.map((it) => '  <li>' + it + '</li>').join('\n') + '\n</ul>';
    }
    return items.map((it) => '- ' + it).join('\n');
  }
  // paragraphs
  const paras: string[] = [];
  for (let p = 0; p < count; p++) {
    const sents = 4 + (p % 3);
    const list: string[] = [];
    let offset = p * 9 + 1;
    if (p === 0 && startOn) {
      list.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.');
      offset += 10;
    }
    for (let s = 0; s < sents - (p === 0 && startOn ? 1 : 0); s++) {
      list.push(loremSentence(offset + s * 3, 8 + ((s * 5) % 5)));
    }
    const body = list.join(' ');
    paras.push(html === 'html' ? '<p>' + body + '</p>' : body);
  }
  return paras.join(html === 'html' ? '\n\n' : '\n\n');
}

const LoremIpsumTool = () => (
  <TextTool
    config={{
      transform: (_input, opts) =>
        buildLorem(opts.type ?? 'paragraphs', Math.min(20, Math.max(1, parseInt(opts.count ?? '3', 10) || 3)), opts.html ?? 'plain', opts.start ?? 'yes'),
      options: [
        {
          id: 'type',
          label: 'Unit',
          default: 'paragraphs',
          options: [
            { value: 'paragraphs', label: 'Paragraphs' },
            { value: 'sentences', label: 'Sentences' },
            { value: 'words', label: 'Words' },
            { value: 'list', label: 'Bulleted list' },
          ],
        },
        { id: 'count', label: 'How many (1–20)', default: '3', options: LOREM_COUNTS },
        {
          id: 'html',
          label: 'Output format',
          default: 'plain',
          options: [
            { value: 'plain', label: 'Plain text' },
            { value: 'html', label: 'Wrap in <p>/<li> HTML' },
          ],
        },
        {
          id: 'start',
          label: 'Opening',
          default: 'yes',
          options: [
            { value: 'yes', label: 'Start with “Lorem ipsum…”' },
            { value: 'no', label: 'Random-style Latin only' },
          ],
        },
      ],
      inputLabel: 'Generator',
      outputLabel: 'Placeholder text',
      placeholder: 'No input needed — the options below drive everything. Click “Load sample” to activate.',
      rows: 4,
      downloadName: 'lorem',
      downloadExt: 'txt',
      sample: 'generate',
    }}
  />
);

/* ═════════════════════ 9. text-case-converter ═════════════════════ */

const TITLE_MINOR = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via']);

function caseTokens(s: string): string[] {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

function convertCases(input: string): string {
  const toks = caseTokens(input);
  const lower = toks.map((w) => w.toLowerCase());
  const camel = lower.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
  const pascal = lower.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const snake = lower.join('_');
  const kebab = lower.join('-');
  const constant = lower.join('_').toUpperCase();
  const title = toks
    .map((w, i) => (i > 0 && TITLE_MINOR.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
  const sentence = input.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
  const upper = input.toUpperCase();
  const lowerAll = input.toLowerCase();
  let altIdx = 0;
  const alternating = input
    .split('')
    .map((ch) => (/[a-zA-Z]/.test(ch) ? (altIdx++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()) : ch))
    .join('');
  return [
    'camelCase: ' + (camel || input),
    'PascalCase: ' + (pascal || input),
    'snake_case: ' + (snake || input),
    'kebab-case: ' + (kebab || input),
    'CONSTANT_CASE: ' + (constant || input),
    'Title Case: ' + (title || input),
    'Sentence case: ' + (sentence || input),
    'UPPER CASE: ' + upper,
    'lower case: ' + lowerAll,
    'aLtErNaTiNg: ' + alternating,
  ].join('\n');
}

const TextCaseTool = () => (
  <TextTool
    config={{
      transform: convertCases,
      inputLabel: 'Any text or identifier',
      outputLabel: 'All case variants',
      placeholder: 'Paste a phrase, headline or variable name…',
      rows: 4,
      downloadName: 'case-variants',
      downloadExt: 'txt',
      sample: 'developers3 tools portal launch',
    }}
  />
);

/* ═════════════════════ 10. sql-query-formatter ═════════════════════ */

function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') {
      depth++;
      cur += ch;
    } else if (ch === ')') {
      depth--;
      cur += ch;
    } else if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts;
}

function formatSql(input: string): string {
  try {
    const stash: string[] = [];
    let flat = input.replace(/'(?:[^']|'')*'/g, (m) => {
      stash.push(m);
      return '\u0001' + (stash.length - 1) + '\u0001';
    });
    flat = flat.replace(/\s+/g, ' ').trim();
    const KEYWORDS = [
      'SELECT', 'INSERT INTO', 'DELETE', 'UPDATE', 'SET', 'VALUES', 'FROM', 'WHERE', 'GROUP BY',
      'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN',
      'FULL OUTER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'OUTER JOIN', 'JOIN',
      'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS', 'ASC', 'DESC',
      'UNION ALL', 'UNION', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'BY',
    ];
    for (const kw of KEYWORDS) {
      flat = flat.replace(new RegExp('\\b' + kw + '\\b', 'gi'), kw);
    }
    // split the (first) SELECT list onto indented lines
    const upperFlat = flat.toUpperCase();
    const selIdx = upperFlat.indexOf('SELECT');
    if (selIdx >= 0) {
      let depth = 0;
      let i = selIdx + 6;
      let fromIdx = -1;
      while (i < flat.length) {
        const ch = flat[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (depth === 0 && flat.slice(i, i + 5).toUpperCase() === ' FROM') {
          fromIdx = i;
          break;
        }
        i++;
      }
      if (fromIdx > selIdx) {
        const cols = flat.slice(selIdx + 6, fromIdx).trim();
        const splitCols = splitTopLevel(cols)
          .map((c) => c.trim())
          .filter((c) => c !== '')
          .join(',\n    ');
        flat = flat.slice(0, selIdx + 6) + ' ' + splitCols + ' ' + flat.slice(fromIdx + 1);
      }
    }
    flat = flat.replace(
      /\b(GROUP BY|ORDER BY|INNER JOIN|LEFT OUTER JOIN|RIGHT OUTER JOIN|FULL OUTER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|OUTER JOIN|FROM|WHERE|HAVING|LIMIT|OFFSET|UNION ALL|UNION|VALUES|SET|JOIN)\b/gi,
      '\n$1'
    );
    flat = flat.replace(/\bON\b/gi, '\n  ON');
    flat = flat.replace(/\b(AND|OR)\b/gi, '\n  $1');
    let lines = flat.split('\n').map((l) => l.replace(/[ \t]+$/g, ''));
    lines = lines.filter((l, idx) => l.trim() !== '' || idx === 0);
    let result = lines.join('\n');
    result = result.replace(/\u0001(\d+)\u0001/g, (_, d: string) => stash[Number(d)]);
    return result;
  } catch (e) {
    return '⚠ Format failed: ' + (e as Error).message;
  }
}

const SQL_SAMPLE =
  "select id, name, email from users where status = 'active' and created_at > '2024-01-01' order by name asc limit 10;";

const SqlFormatterTool = () => (
  <TextTool
    config={{
      transform: formatSql,
      inputLabel: 'Your query',
      outputLabel: 'Formatted SQL',
      placeholder: 'Paste a single-line or messy SQL query…',
      rows: 10,
      downloadName: 'formatted',
      downloadExt: 'sql',
      acceptFile: true,
      sample: SQL_SAMPLE,
    }}
  />
);

/* ═════════════════════ 11. word-character-counter ═════════════════════ */

const WORD_COUNTER_SAMPLE = [
  'Content teams often overestimate how much their readers actually absorb. A typical blog visitor skims the first two paragraphs, decides in seconds whether the piece deserves attention, and abandons anything that wastes that trust.',
  'Short sentences keep momentum. Familiar words keep clarity. Concrete examples keep interest. When you edit, count what matters: not just the volume of your draft, but the density of ideas per paragraph and the rhythm of every sentence you keep.',
].join('\n\n');

function fmtReadTime(wordCount: number, wpm: number): string {
  const sec = Math.round((wordCount / wpm) * 60);
  if (sec < 60) return sec <= 8 ? 'under 10 sec' : `${sec} sec`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

const WordCounterTool = () => (
  <AnalyzeTool
    config={{
      inputLabel: 'Your draft',
      placeholder: 'Paste an article, essay or email — every stat updates live…',
      rows: 10,
      sample: WORD_COUNTER_SAMPLE,
      analyze: (text) => {
        const ws = splitWords(text);
        const wordCount = ws.length;
        const letters = ws.reduce((acc, w) => acc + w.replace(/[^A-Za-z0-9]/g, '').length, 0);
        const sentences = text.split(/[.!?…]+/).filter((s) => s.trim() !== '').length;
        const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== '').length;
        const counts = new Map<string, number>();
        for (const raw of ws) {
          const w = raw.toLowerCase().replace(/[^a-z0-9'-]/g, '');
          if (w.length < 3 || STOPWORDS.has(w)) continue;
          counts.set(w, (counts.get(w) ?? 0) + 1);
        }
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        return {
          stats: [
            { label: 'Words', value: wordCount.toLocaleString() },
            { label: 'Characters', value: text.length.toLocaleString() },
            { label: 'No spaces', value: text.replace(/\s/g, '').length.toLocaleString() },
            { label: 'Sentences', value: sentences.toLocaleString() },
            { label: 'Paragraphs', value: paragraphs.toLocaleString() },
            { label: 'Avg word length', value: wordCount ? (letters / wordCount).toFixed(1) : '0', hint: 'letters only' },
            { label: 'Reading time', value: fmtReadTime(wordCount, 200), hint: '200 wpm silent reading' },
            { label: 'Speaking time', value: fmtReadTime(wordCount, 130), hint: '130 wpm aloud' },
          ],
          table: {
            head: ['Keyword', 'Count', 'Share of text'],
            rows: top.map(([w, c]) => [w, c, wordCount ? ((c / wordCount) * 100).toFixed(1) + '%' : '0%']),
          },
          note: 'The keyword list ignores common stop words and counts only words of 3+ letters, so function words never crowd out the terms that carry your meaning.',
        };
      },
    }}
  />
);

/* ═════════════════════ 12. title-length-checker ═════════════════════ */

const TITLE_SAMPLE = 'Best Free CSS Minifier Tools for Developers in 2025 (Ranked & Compared)';

function estTitlePx(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) units += 0.26;
    else if (/[a-z]/.test(ch)) units += 0.48;
    else if (/[A-Z]/.test(ch)) units += 0.62;
    else if (/[0-9]/.test(ch)) units += 0.5;
    else if (/[\u3000-\u9fff\uff01-\uff60]/.test(ch)) units += 1;
    else units += 0.34;
  }
  return units * fontSize;
}

const TitleLengthTool = () => (
  <AnalyzeTool
    config={{
      inputLabel: 'SEO title',
      placeholder: 'Paste the exact title tag you plan to publish…',
      rows: 3,
      sample: TITLE_SAMPLE,
      analyze: (text) => {
        const trimmed = text.trim();
        const pxMobile = estTitlePx(trimmed, 20);
        const pxDesktop = estTitlePx(trimmed, 20);
        const fitsMobile = pxMobile <= 560;
        const fitsDesktop = pxDesktop <= 580;
        const lower = (trimmed.match(/[a-z]/g) ?? []).length;
        const upper = (trimmed.match(/[A-Z]/g) ?? []).length;
        const spaces = (trimmed.match(/\s/g) ?? []).length;
        const digits = (trimmed.match(/[0-9]/g) ?? []).length;
        const other = trimmed.length - lower - upper - spaces - digits;
        const row = (label: string, count: number, factor: string, px: number) => [label, count.toLocaleString(), factor, Math.round(px) + ' px'];
        const tone: 'good' | 'warn' | 'bad' = fitsMobile && fitsDesktop ? 'good' : fitsDesktop ? 'warn' : 'bad';
        const title =
          tone === 'good'
            ? 'Fits the results page'
            : tone === 'warn'
              ? 'Fits desktop, clipped on mobile'
              : 'Likely truncated';
        const preview = 'developers3.com › guides › your-page  ▸  ' + (trimmed.length > 70 ? trimmed.slice(0, 67) + '…' : trimmed) + '  ▸  your meta description line appears here in grey.';
        const message =
          'Heuristic width at a 20 px title font: ~' +
          Math.round(pxMobile) +
          ' px vs the ~560 px mobile limit and ~580 px desktop limit. ' +
          (tone === 'good'
            ? 'Every word should survive the cut on both. '
            : tone === 'warn'
              ? 'Desktop users see it all, but phone results will ellipsize the tail — move the important words to the front. '
              : 'Google will ellipsize the overflow on most devices — shorten it or front-load the essential keywords. ') +
          'SERP simulation: ' +
          preview;
        return {
          stats: [
            { label: 'Characters', value: trimmed.length, hint: 'display ~50–60 max · mobile SERP cuts near ~35–40 chars' },
            { label: 'Words', value: splitWords(trimmed).length },
            { label: 'Est. width', value: Math.round(pxDesktop) + ' px', hint: 'desktop ~580 px limit' },
            { label: 'Mobile width', value: Math.round(pxMobile) + ' px', hint: 'mobile ~560 px limit' },
          ],
          table: {
            head: ['Character class', 'Count', 'Width factor', 'Est. px (20 px font)'],
            rows: [
              row('Lowercase letters', lower, '0.48', lower * 0.48 * 20),
              row('Uppercase letters', upper, '0.62', upper * 0.62 * 20),
              row('Spaces', spaces, '0.26', spaces * 0.26 * 20),
              row('Digits', digits, '0.50', digits * 0.5 * 20),
              row('Punctuation & symbols', other, '0.34', other * 0.34 * 20),
            ],
          },
          verdict: { tone, title, message },
          note: 'The pixel estimate is a documented approximation (per-class width factors × 20 px), not a browser measurement — Google renders titles differently across devices and may rewrite them anyway.',
        };
      },
    }}
  />
);

/* ═════════════════════ 13. keyword-density-checker ═════════════════════ */

const DENSITY_SAMPLE = [
  'Coffee brewing starts with fresh coffee beans, but great coffee at home also depends on grind size, water temperature and timing. Our coffee guides walk through pour-over coffee, French press coffee and cold brew coffee step by step.',
  'Whether you prefer light-roast coffee or dark espresso-style coffee, brewing better coffee is mostly consistency: weigh your coffee, time your extraction and adjust one coffee variable at a time.',
].join('\n\n');

const KeywordDensityTool = () => (
  <AnalyzeTool
    config={{
      inputLabel: 'Article copy',
      placeholder: 'Paste your article or page copy — density updates live…',
      rows: 10,
      sample: DENSITY_SAMPLE,
      analyze: (text) => {
        const raw = text.toLowerCase().match(/[a-z0-9''-]+/g) ?? [];
        const total = raw.length;
        const unigrams = new Map<string, number>();
        const bigrams = new Map<string, number>();
        for (let i = 0; i < raw.length; i++) {
          const w = raw[i];
          if (w.length >= 3 && !STOPWORDS.has(w)) unigrams.set(w, (unigrams.get(w) ?? 0) + 1);
          if (i + 1 < raw.length) {
            const w2 = raw[i + 1];
            if (w.length >= 3 && w2.length >= 3 && !STOPWORDS.has(w) && !STOPWORDS.has(w2)) {
              const phrase = w + ' ' + w2;
              bigrams.set(phrase, (bigrams.get(phrase) ?? 0) + 1);
            }
          }
        }
        const pct = (c: number) => (total ? ((c / total) * 100).toFixed(2) + '%' : '0%');
        const top1 = [...unigrams.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const top2 = [...bigrams.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const rows: (string | number)[][] = [];
        for (const [w, c] of top1) rows.push(['1 word', w, c, pct(c)]);
        for (const [w, c] of top2) rows.push(['2 words', w, c, pct(c)]);
        const maxTop = top1[0];
        const maxDensity = maxTop && total ? (maxTop[1] / total) * 100 : 0;
        let verdict: { tone: 'good' | 'warn' | 'bad'; title: string; message: string } | undefined;
        if (maxTop && maxDensity > 4) {
          verdict = {
            tone: 'bad',
            title: 'Heavy over-optimization',
            message: `"${maxTop[0]}" appears ${maxTop[1]} times (${maxDensity.toFixed(1)}%) — well past the point where search engines read it as stuffing. Rewrite repeats into pronouns, synonyms and related phrases.`,
          };
        } else if (maxTop && maxDensity > 2.5) {
          verdict = {
            tone: 'warn',
            title: 'One term is running hot',
            message: `"${maxTop[0]}" sits at ${maxDensity.toFixed(1)}% density. That is above the ~2.5% comfort line — trim a few mentions or vary the phrasing to stay natural.`,
          };
        } else if (maxTop) {
          verdict = {
            tone: 'good',
            title: 'Balanced keyword profile',
            message: `Your strongest term "${maxTop[0]}" is at ${maxDensity.toFixed(1)}% — inside the healthy range. Keep the mix of single keywords and phrases varied.`,
          };
        }
        return {
          stats: [
            { label: 'Total words', value: total.toLocaleString() },
            { label: 'Unique words', value: unigrams.size.toLocaleString() },
            { label: 'Top term', value: maxTop ? maxTop[0] : '—' },
            { label: 'Top density', value: maxTop ? pct(maxTop[1]) : '—' },
          ],
          table: {
            head: ['Length', 'Phrase', 'Count', 'Density'],
            rows: rows.length > 0 ? rows : [['—', 'No significant keywords yet', 0, '0%']],
          },
          verdict,
          note: 'Healthy copy usually keeps any single keyword between 1% and 2% density. The table blends your top ten single words and top ten two-word phrases, all stop-word filtered.',
        };
      },
    }}
  />
);

/* ═════════════════════ 14. aso-keyword-density-checker ═════════════════════ */

const ASO_SAMPLE =
  'Fitness Tracker Pro — workout planner & step counter. Track runs, gym sessions and calories with smart reminders. Fitness Tracker Pro syncs with your watch, plans workouts and counts steps offline. Download Fitness Tracker Pro free and reach your fitness goals faster with the workout planner users rate 4.8 stars.';

const AsoDensityTool = () => (
  <AnalyzeTool
    config={{
      inputLabel: 'App store description',
      placeholder: 'Paste your Google Play or Apple App Store description…',
      rows: 9,
      sample: ASO_SAMPLE,
      analyze: (text) => {
        const raw = text.toLowerCase().match(/[a-z0-9''-]+/g) ?? [];
        const total = raw.length;
        const counts = new Map<string, number>();
        for (const w of raw) {
          if (w.length >= 3 && !STOPWORDS.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
        }
        const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
        const opening = text.toLowerCase().slice(0, 100);
        const pct = (c: number) => (total ? ((c / total) * 100).toFixed(2) + '%' : '0%');
        const rows = ranked.map(([w, c]) => [w, c, pct(c), opening.includes(w) ? 'yes ✓' : '—']);
        const maxEntry = ranked[0];
        const maxDensity = maxEntry && total ? (maxEntry[1] / total) * 100 : 0;
        const first30 = text.trim().slice(0, 30);
        let verdict: { tone: 'good' | 'warn' | 'bad'; title: string; message: string } | undefined;
        if (maxEntry && maxDensity > 5) {
          verdict = {
            tone: 'bad',
            title: 'Keyword stuffing — stores will notice',
            message: `"${maxEntry[0]}" hits ${maxDensity.toFixed(1)}% density. Both Apple and Google demote listings that repeat terms unnaturally — cap any keyword near 3% and vary the wording.`,
          };
        } else if (maxEntry && maxDensity > 3) {
          verdict = {
            tone: 'warn',
            title: 'Close to the stuffing line',
            message: `"${maxEntry[0]}" is at ${maxDensity.toFixed(1)}%. Stores reward readable copy — swap a couple of repeats for feature synonyms (tracker, coach, planner).`,
          };
        } else if (maxEntry) {
          verdict = {
            tone: 'good',
            title: 'Listing reads naturally',
            message: `Top term "${maxEntry[0]}" is at ${maxDensity.toFixed(1)}% — a safe level. Make sure that term also appears in your title's first 30 characters.`,
          };
        }
        return {
          stats: [
            { label: 'Characters', value: text.length.toLocaleString(), hint: 'Apple description cap: 4,000' },
            { label: 'Words', value: total.toLocaleString() },
            { label: 'First 30 chars', value: first30.length > 0 ? first30 + (text.trim().length > 30 ? '…' : '') : '—', hint: 'front-load primary keywords here' },
            { label: 'Budget left', value: Math.max(0, 4000 - text.length).toLocaleString(), hint: 'before the 4,000-char cap' },
          ],
          table: {
            head: ['Keyword', 'Count', 'Density', 'In opening 100 chars?'],
            rows: rows.length > 0 ? rows : [['—', 0, '0%', '—']],
          },
          verdict,
          note: 'Store budgets: Apple title 30 + subtitle 30 chars; Google Play title 30 + short description 80 chars. The “opening 100 chars” column shows which keywords are visible before a shopper taps “more”.',
        };
      },
    }}
  />
);

/* ═════════════════════ 15. twitter-character-counter ═════════════════════ */

const TWITTER_SAMPLE =
  'Big update: Developers3 just crossed 10,000 users 🎉 and we built something new for you — a full analytics dashboard that runs entirely in your browser. No accounts, no uploads, no waiting. Try it and tell us what breaks first 😅 https://developers3.com/tools';

function weightedLength(text: string): number {
  let total = 0;
  const ranges: [number, number][] = [];
  const re = /https?:\/\/\S+|www\.\S+/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ranges.push([m.index, m.index + m[0].length]);
  let i = 0;
  const advance = (stop: number) => {
    while (i < stop) {
      const cp = text.codePointAt(i)!;
      total += cp > 0x2000 ? 2 : 1;
      i += cp > 0xffff ? 2 : 1;
    }
  };
  for (const [s, e] of ranges) {
    advance(s);
    total += 23;
    i = Math.max(i, e);
  }
  advance(text.length);
  return total;
}

function splitThread(text: string, limit = 275): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  for (const para of paragraphs) {
    if (weightedLength(para) <= limit) {
      chunks.push(para);
      continue;
    }
    const sentences = para.match(/[^.!?…\n]+[.!?…]*/g) ?? [para];
    let buf = '';
    const pushBuf = () => {
      if (buf !== '') chunks.push(buf);
      buf = '';
    };
    for (const raw of sentences) {
      const s = raw.trim();
      const candidate = buf === '' ? s : buf + ' ' + s;
      if (weightedLength(candidate) <= limit) {
        buf = candidate;
        continue;
      }
      pushBuf();
      if (weightedLength(s) <= limit) {
        buf = s;
        continue;
      }
      let wordBuf = '';
      for (const word of s.split(/\s+/)) {
        const c2 = wordBuf === '' ? word : wordBuf + ' ' + word;
        if (weightedLength(c2) <= limit) wordBuf = c2;
        else {
          if (wordBuf !== '') chunks.push(wordBuf);
          wordBuf = word;
        }
      }
      buf = wordBuf;
    }
    pushBuf();
  }
  const posts: string[] = [];
  let post = '';
  for (const c of chunks) {
    const candidate = post === '' ? c : post + '\n\n' + c;
    if (weightedLength(candidate) <= limit) post = candidate;
    else {
      if (post !== '') posts.push(post);
      post = c;
    }
  }
  if (post !== '') posts.push(post);
  return posts;
}

const TwitterCounterTool = () => (
  <AnalyzeTool
    config={{
      inputLabel: 'Your post',
      placeholder: 'Paste or draft your X/Twitter post — links and emoji weighted like the real counter…',
      rows: 7,
      sample: TWITTER_SAMPLE,
      analyze: (text) => {
        const len = weightedLength(text);
        const remaining = 280 - len;
        const posts = splitThread(text);
        const pctUsed = Math.min(100, Math.round((len / 280) * 100));
        const tone: 'good' | 'warn' | 'bad' = len <= 280 ? 'good' : len <= 560 ? 'warn' : 'bad';
        const title = len <= 280 ? 'Fits in one post' : len <= 560 ? 'Needs a short thread' : 'Multi-post thread required';
        const message =
          len <= 280
            ? `You have ${remaining} weighted characters to spare. Links counted as 23 each; emoji and wide scripts as 2.`
            : `This draft is ${len} weighted characters — ${posts.length} posts in the auto-split thread below (each capped at 275 to leave room for 1/, 2/ markers).`;
        return {
          stats: [
            { label: 'Weighted length', value: len.toLocaleString(), hint: 'of 280 per post' },
            { label: 'Remaining', value: remaining.toLocaleString(), hint: 'negative = over the 280 limit' },
            { label: 'Thread posts', value: posts.length },
            { label: 'Limit used', value: pctUsed + '%' },
          ],
          table: {
            head: ['Post', 'Content', 'Weighted chars'],
            rows: posts.map((p, i) => [`${i + 1}/${posts.length}`, p, weightedLength(p)]),
          },
          verdict: { tone, title, message },
          note: 'Splitting happens on paragraph, sentence and finally word boundaries — never mid-word — and every post stays ≤ 275 characters so numbered markers still fit inside the 280 limit.',
        };
      },
    }}
  />
);

/* ═════════════════════ 16. email-subject-line-tester ═════════════════════ */

const SUBJECT_SAMPLE = '🎉 LAST CHANCE: Your FREE gift expires tonight - act now!!!';

const SPAM_WORDS = [
  'free', 'guarantee', 'act now', 'limited time', 'winner', 'cash', 'risk-free', 'click here',
  'urgent', '100%', 'make money', 'no obligation', 'congratulations', 'expires', 'instant win',
  'no cost', 'miracle', "this isn't spam", 'double your', 'save big', 'credit card', 'risk free',
];

const POWER_WORDS = [
  'how', 'why', 'proven', 'secret', 'secrets', 'easy', 'today', 'new', 'finally', 'fast',
  'simple', 'quick', 'now', 'guide', 'tips', 'instantly', 'boost', 'grow', 'ultimate', 'essential',
  'tried', 'tested', 'real', 'honest',
];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findHits(lowerText: string, list: string[]): string[] {
  return list.filter((w) => new RegExp('(^|[^a-z0-9])' + escapeRe(w) + '([^a-z0-9]|$)', 'i').test(lowerText));
}

const EmailSubjectTool = () => (
  <AnalyzeTool
    config={{
      inputLabel: 'Subject line',
      placeholder: 'Type the exact subject line you plan to send…',
      rows: 2,
      sample: SUBJECT_SAMPLE,
      analyze: (text) => {
        const trimmed = text.trim();
        const letters = (trimmed.match(/[A-Za-z]/g) ?? []).length;
        const caps = (trimmed.match(/[A-Z]/g) ?? []).length;
        const capsRatio = letters > 0 ? caps / letters : 0;
        const digits = (trimmed.match(/[0-9]/g) ?? []).length;
        const spam = findHits(trimmed.toLowerCase(), SPAM_WORDS);
        const power = findHits(trimmed.toLowerCase(), POWER_WORDS);
        const capsWords = splitWords(trimmed).filter((w) => w.length >= 2 && /^[A-Z]+$/.test(w));
        const mobilePreview = trimmed.length > 38 ? trimmed.slice(0, 35) + '…' : trimmed;
        const tone: 'good' | 'warn' | 'bad' =
          spam.length >= 2 || trimmed.length > 65 || capsRatio > 0.5
            ? 'bad'
            : spam.length === 1 || trimmed.length > 50 || capsRatio > 0.3
              ? 'warn'
              : 'good';
        const title =
          tone === 'good' ? 'Clean, deliverable subject line' : tone === 'warn' ? 'Sendable, with reservations' : 'High spam-filter risk';
        const message =
          (spam.length > 0
            ? `Spam triggers found: ${spam.join(', ')}. Filters weigh these heavily in combination with ALL-CAPS words and repeated punctuation. `
            : 'No classic spam triggers detected. ') +
          (power.length > 0 ? `Power words working for you: ${power.slice(0, 6).join(', ')}. ` : 'Consider one power word (how, proven, finally…) to lift opens. ') +
          (capsRatio > 0.3 ? `Caps ratio is ${Math.round(capsRatio * 100)}% — shouting gets filtered. ` : `Caps ratio ${Math.round(capsRatio * 100)}% is fine. `) +
          `Mobile inboxes cut near 35–40 characters; there it would read: “${mobilePreview}”.`;
        return {
          stats: [
            { label: 'Characters', value: trimmed.length, hint: 'sweet spot 30–50' },
            { label: 'Words', value: splitWords(trimmed).length },
            { label: 'Caps ratio', value: Math.round(capsRatio * 100) + '%', hint: 'share of A–Z that is uppercase' },
            { label: 'Digits', value: digits, hint: 'numbers can lift opens' },
          ],
          table: {
            head: ['Signal', 'What we found'],
            rows: [
              ['Spam triggers', spam.length > 0 ? spam.join(', ') : 'none ✓'],
              ['Power words', power.length > 0 ? power.join(', ') : 'none'],
              ['ALL-CAPS words', capsWords.length > 0 ? capsWords.join(', ') : 'none ✓'],
            ],
          },
          verdict: { tone, title, message },
          note: 'Tip: front-load the point in the first 30 characters, keep one emoji at most, and prefer curiosity or specificity over “FREE!!!” urgency — filtered sends never get opened at all.',
        };
      },
    }}
  />
);

/* ═════════════════════ 17. regex-tester-generator (bespoke) ═════════════════════ */

interface RegexMatchInfo {
  index: number;
  text: string;
  groups: (string | undefined)[];
}

const COMMON_PATTERNS: { value: string; label: string }[] = [
  { value: '__none', label: 'Pick a starter pattern…' },
  { value: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', label: 'Email address' },
  { value: 'https?:\\/\\/[^\\s]+', label: 'HTTP(S) URL' },
  { value: '\\+?\\d[\\d\\s().-]{7,}\\d', label: 'Phone number (loose)' },
  { value: '\\d{4}-\\d{2}-\\d{2}', label: 'Date (YYYY-MM-DD)' },
  { value: '#(?:[0-9a-fA-F]{3}){1,2}\\b', label: 'Hex color' },
  { value: '(?:\\d{1,3}\\.){3}\\d{1,3}', label: 'IPv4 address' },
  { value: '(\\w+)\\s*=\\s*([^;]+);', label: 'Assignment (key = value;)' },
];

const REGEX_TEST_SAMPLE = 'Reach us at info@developers3.com or support@openai.org — replies within 24h, no spam please.';

const RegexTesterTool = () => {
  const [pattern, setPattern] = React.useState('(\\w+)@(\\w+)\\.(com|org)');
  const [flags, setFlags] = React.useState({ g: true, i: true, m: false, s: false, u: false });
  const [test, setTest] = React.useState(REGEX_TEST_SAMPLE);

  const flagString =
    (flags.g ? 'g' : '') + (flags.i ? 'i' : '') + (flags.m ? 'm' : '') + (flags.s ? 's' : '') + (flags.u ? 'u' : '');

  const { matches, error } = React.useMemo<{ matches: RegexMatchInfo[]; error: string }>(() => {
    if (pattern === '') return { matches: [], error: '' };
    let re: RegExp;
    try {
      re = new RegExp(pattern, flagString);
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
    const src = test.length > 100000 ? test.slice(0, 100000) : test;
    const out: RegexMatchInfo[] = [];
    if (re.global) {
      let guard = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null && guard < 500) {
        out.push({ index: m.index, text: m[0], groups: m.slice(1) });
        if (m[0].length === 0) re.lastIndex++;
        guard++;
      }
    } else {
      const m = re.exec(src);
      if (m) out.push({ index: m.index, text: m[0], groups: m.slice(1) });
    }
    return { matches: out, error: '' };
  }, [pattern, flagString, test]);

  const highlighted = React.useMemo(() => {
    if (matches.length === 0) return <span>{test}</span>;
    const nodes: React.ReactNode[] = [];
    let pos = 0;
    matches.forEach((m, i) => {
      if (m.index > pos) nodes.push(<span key={'t' + i}>{test.slice(pos, m.index)}</span>);
      nodes.push(
        <mark key={'m' + i} className="bg-yellow-200 text-[#0a0a0a]">
          {test.slice(m.index, m.index + m.text.length)}
        </mark>
      );
      pos = m.index + m.text.length;
    });
    if (pos < test.length) nodes.push(<span key="tail">{test.slice(pos)}</span>);
    return <>{nodes}</>;
  }, [matches, test]);

  const shown = matches.slice(0, 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextInput
          label="Pattern"
          value={pattern}
          onChange={setPattern}
          placeholder="e.g. \d{3}-\d{4}"
          help="Raw regex syntax, no surrounding slashes"
          className="lg:col-span-2"
        />
        <SelectInput
          label="Starter patterns"
          value="__none"
          onChange={(v) => {
            if (v !== '__none') setPattern(v);
          }}
          options={COMMON_PATTERNS}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(['g', 'i', 'm', 's', 'u'] as const).map((f) => (
          <ToggleInput
            key={f}
            label={'/' + f}
            checked={flags[f]}
            onChange={(v) => setFlags((p) => ({ ...p, [f]: v }))}
          />
        ))}
      </div>

      <TextAreaInput
        label="Test string"
        value={test}
        onChange={(v) => setTest(v.length > 100000 ? v.slice(0, 100000) : v)}
        placeholder="Paste the text to run the pattern against…"
        rows={6}
        help={test.length > 90000 ? 'Approaching the 100,000-character safety cap.' : undefined}
      />

      {error !== '' ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">Invalid pattern — {error}</p>
      ) : null}

      {!error && test.trim() !== '' ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-[#0a0a0a]">Highlighted test string</p>
          <pre className="custom-scrollbar max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-white p-4 font-mono text-[13px] leading-relaxed text-[#0a0a0a]">
            {highlighted}
          </pre>
        </div>
      ) : null}

      {!error && matches.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#0a0a0a]">Matches ({matches.length.toLocaleString()})</p>
            {matches.length > 100 ? <p className="text-xs text-muted-foreground">Showing the first 100</p> : null}
          </div>
          <div className="custom-scrollbar max-h-72 overflow-auto rounded-xl border border-gray-200">
            {shown.map((m, i) => (
              <div key={i} className="border-b border-gray-100 px-4 py-2.5 font-mono text-xs text-[#374151] last:border-b-0">
                <span className="mr-2 font-bold text-pink-600">#{i + 1}</span>
                <span className="mr-2 text-gray-400">@ {m.index}</span>
                <span className="font-bold">“{m.text.length > 80 ? m.text.slice(0, 77) + '…' : m.text}”</span>
                {m.groups.length > 0 ? (
                  <span className="ml-2 text-gray-500">
                    groups: {m.groups.map((g, gi) => `$${gi + 1}="${g ?? ''}"`).join(' ')}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!error && test.trim() !== '' && matches.length === 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">No matches — adjust the pattern or add the /i flag.</p>
      ) : null}

      <ToolNote>
        {
          'Cheat sheet — \\d digit · \\w word char · \\s whitespace · . any char (also newline with /s) · [abc] set · [^abc] negated · a+ one or more · a* zero or more · a? optional · a{2,4} repeat range · ^ start · $ end · (…) capture group · (?:…) non-capturing · (?<name>…) named group · a|b alternation · flags: g global, i ignore case, m multiline, s dotall, u unicode.'
        }
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 18. diff-checker (bespoke) ═════════════════════ */

const DIFF_OLD_SAMPLE = ['function welcome(name) {', '  console.log("Hello " + name);', '  return true;', '}'].join('\n');
const DIFF_NEW_SAMPLE = ['function welcome(name) {', '  console.log(`Hello ${name}!`);', '  return name.length > 0;', '}'].join('\n');

type DiffRow = { type: 'add' | 'del' | 'same'; text: string };

const DiffCheckerTool = () => {
  const [oldText, setOldText] = React.useState(DIFF_OLD_SAMPLE);
  const [newText, setNewText] = React.useState(DIFF_NEW_SAMPLE);
  const [whitespace, setWhitespace] = React.useState('exact');
  const [caseMode, setCaseMode] = React.useState('sensitive');

  /**
   * Normalize per-line instead of relying on lib options (the installed diff
   * typings lack ignoreCase) — line counts are preserved so rows below can
   * still display the ORIGINAL text side by side.
   */
  const normalizeForCompare = React.useCallback(
    (line: string) => {
      let v = line;
      if (whitespace === 'ignore') v = v.replace(/\s+/g, ' ').trim();
      if (caseMode === 'ignore') v = v.toLowerCase();
      return v;
    },
    [whitespace, caseMode]
  );

  const changes = React.useMemo(
    () =>
      diffLines(
        oldText.split('\n').map(normalizeForCompare).join('\n'),
        newText.split('\n').map(normalizeForCompare).join('\n')
      ),
    [oldText, newText, normalizeForCompare]
  );

  const rows = React.useMemo<DiffRow[]>(() => {
    const a = oldText.split('\n');
    const b = newText.split('\n');
    let ai = 0;
    let bi = 0;
    const out: DiffRow[] = [];
    for (const ch of changes) {
      const lines = ch.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      const type: DiffRow['type'] = ch.added ? 'add' : ch.removed ? 'del' : 'same';
      for (let i = 0; i < lines.length; i++) {
        if (type === 'add') {
          out.push({ type, text: b[bi] ?? lines[i] });
          bi += 1;
        } else if (type === 'del') {
          out.push({ type, text: a[ai] ?? lines[i] });
          ai += 1;
        } else {
          out.push({ type, text: a[ai] ?? lines[i] });
          ai += 1;
          bi += 1;
        }
      }
    }
    return out;
  }, [changes, oldText, newText]);

  const added = rows.filter((r) => r.type === 'add').length;
  const removed = rows.filter((r) => r.type === 'del').length;
  const unchanged = rows.filter((r) => r.type === 'same').length;
  const identical = added === 0 && removed === 0 && oldText !== '' && newText !== '';

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label="Whitespace"
          value={whitespace}
          onChange={setWhitespace}
          options={[
            { value: 'exact', label: 'Treat every space as a change' },
            { value: 'ignore', label: 'Ignore whitespace-only edits' },
          ]}
        />
        <SelectInput
          label="Letter case"
          value={caseMode}
          onChange={setCaseMode}
          options={[
            { value: 'sensitive', label: 'Case-sensitive compare' },
            { value: 'ignore', label: 'Ignore case differences' },
          ]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TextAreaInput label="Original text" value={oldText} onChange={setOldText} rows={12} placeholder="Paste the old version…" />
        <TextAreaInput label="New text" value={newText} onChange={setNewText} rows={12} placeholder="Paste the new version…" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Added lines" value={added} tone={added > 0 ? 'good' : 'default'} />
        <StatCard label="Removed lines" value={removed} tone={removed > 0 ? 'bad' : 'default'} />
        <StatCard label="Unchanged" value={unchanged} />
      </div>

      {identical ? (
        <Verdict tone="good" title="No differences" message="Both versions match exactly under the current comparison settings." />
      ) : (
        <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <div className="min-w-[520px] font-mono text-[13px] leading-relaxed">
            {rows.map((r, i) => (
              <div
                key={i}
                className={
                  r.type === 'add'
                    ? 'border-l-2 border-emerald-400 bg-emerald-50 px-4 py-1 text-emerald-800'
                    : r.type === 'del'
                      ? 'border-l-2 border-rose-400 bg-rose-50 px-4 py-1 text-rose-800'
                      : 'border-l-2 border-transparent px-4 py-1 text-[#374151]'
                }
              >
                <span className="mr-3 inline-block w-3 select-none font-bold opacity-60">
                  {r.type === 'add' ? '+' : r.type === 'del' ? '−' : ' '}
                </span>
                {r.text === '' ? '\u00A0' : r.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <ToolNote>
        Comparison is line based, powered by the same algorithm code review tools use: green blocks are lines that exist only in the new version, red blocks only in the original. Switch both selects to “ignore” modes when reviewing prose edits where reflowed spaces are noise, not signal.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 19. emoji-picker-by-industry (bespoke) ═════════════════════ */

interface IndustryEmoji {
  label: string;
  groups: { g: string; e: string[] }[];
  combos: string[];
}

const EMOJI_DATA: Record<string, IndustryEmoji> = {
  food: {
    label: 'Food & Restaurant',
    groups: [
      { g: 'Dishes', e: ['🍔', '🍕', '🌮', '🌯', '🍜', '🍣', '🥗', '🍟', '🍩', '🥐'] },
      { g: 'Drinks', e: ['☕', '🧋', '🥤', '🍺', '🍷', '🥂', '🧃', '🍵'] },
      { g: 'Service & hype', e: ['🔥', '😋', '👨‍🍳', '🛎️', '📍', '⭐', '🥡', '🧑‍🍳'] },
    ],
    combos: ['🍔 🍟 🥤 — combo for promos', '🍕 🧀 🍅 — pizza night special', '☕ 🥐 📅 — morning menu drop'],
  },
  fitness: {
    label: 'Fitness & Gym',
    groups: [
      { g: 'Training', e: ['💪', '🏋️', '🧘', '🏃', '🚴', '🤸', '🥊', '🧗'] },
      { g: 'Nutrition', e: ['🥑', '🍌', '🥦', '🍗', '🥚', '🥛', '💊', '💧'] },
      { g: 'Results', e: ['🔥', '⏱️', '📈', '🏆', '👟', '🫀', '✅', '⚡'] },
    ],
    combos: ['💪 🔥 🏆 — transformation posts', '🏃 ⏱️ 📈 — race-day updates', '🧘 🌿 ☕ — recovery & wellness'],
  },
  realestate: {
    label: 'Real Estate',
    groups: [
      { g: 'Properties', e: ['🏠', '🏡', '🏢', '🏗️', '🔑', '🗝️', '🛏️', '🛁'] },
      { g: 'Deals', e: ['✅', '📄', '💰', '📈', '⏳', '🤝', '🔖', '💼'] },
      { g: 'Location', e: ['📍', '🏙️', '🗺️', '🌳', '🚗', '☀️', '🌉', '🏫'] },
    ],
    combos: ['🏠 🔑 ✅ — just sold', '🏡 📸 📍 — new listing', '🤝 💰 🏠 — offer accepted'],
  },
  beauty: {
    label: 'Beauty & Skincare',
    groups: [
      { g: 'Treatments', e: ['💅', '💄', '💇‍♀️', '🧴', '🧖‍♀️', '💆', '🫧', '🪞'] },
      { g: 'Aesthetic', e: ['✨', '🌸', '🕯️', '🎀', '💖', '🌿', '🕊️', '🤍'] },
      { g: 'Booking', e: ['📅', '🎁', '⭐', '💳', '🔖', '📞', '⏰', '✅'] },
    ],
    combos: ['💅 ✨ 🌸 — nail art drops', '🧴 🫧 💦 — skincare routine', '🎁 🎀 💖 — gift sets'],
  },
  tech: {
    label: 'Tech & SaaS',
    groups: [
      { g: 'Hardware', e: ['💻', '🖥️', '⌨️', '🖱️', '📱', '🔌', '🕹️', '🖨️'] },
      { g: 'Stack', e: ['🤖', '🧠', '⚛️', '🐍', '🐳', '☁️', '🗄️', '🔐'] },
      { g: 'Ship it', e: ['🚀', '⚡', '🔧', '🧩', '🐛', '📊', '✅', '📣'] },
    ],
    combos: ['🚀 💻 ⚡ — launch day', '🐛 🔧 ✅ — fixed & shipped', '🧠 ⚙️ 📈 — performance wins'],
  },
  education: {
    label: 'Education & Courses',
    groups: [
      { g: 'Study', e: ['📚', '✏️', '📝', '🧮', '🔬', '🌍', '🗣️', '🎒'] },
      { g: 'Milestones', e: ['🎓', '🏅', '⭐', '💡', '✅', '📈', '🥇', '🎉'] },
      { g: 'Planning', e: ['📅', '⏰', '📋', '🗂️', '🏫', '🧠', '🎯', '🔔'] },
    ],
    combos: ['📚 ✏️ 🎓 — study tips', '🧠 💡 🔬 — science explained', '📅 📝 ✅ — exam prep plan'],
  },
  travel: {
    label: 'Travel & Tourism',
    groups: [
      { g: 'Journeys', e: ['✈️', '🚆', '🚐', '🧳', '🗺️', '🧭', '🛫', '⛴️'] },
      { g: 'Destinations', e: ['🏝️', '⛰️', '🌊', '🌅', '🏨', '🏛️', '🎡', '🌵'] },
      { g: 'Moments', e: ['📷', '🍜', '🎟️', '🌞', '🎒', '💫', '📅', '💳'] },
    ],
    combos: ['✈️ 🏝️ 🌅 — destination reveal', '🧳 🗺️ 🧭 — packing list', '📷 🏛️ 🍜 — city diary'],
  },
  finance: {
    label: 'Finance & Investing',
    groups: [
      { g: 'Money', e: ['💰', '💸', '💳', '🏦', '🪙', '💼', '🧾', '💵'] },
      { g: 'Markets', e: ['📈', '📉', '📊', '🎯', '⚖️', '🧮', '🔍', '⏰'] },
      { g: 'Habits', e: ['🐷', '🌱', '🔒', '✅', '⚠️', '🧠', '📝', '🔁'] },
    ],
    combos: ['📈 💰 🎯 — investing basics', '🐷 🔒 🌱 — savings challenge', '⚠️ 📉 🧠 — market dips explained'],
  },
  pets: {
    label: 'Pets & Animals',
    groups: [
      { g: 'Friends', e: ['🐶', '🐱', '🐹', '🐦', '🐢', '🐟', '🐇', '🐾'] },
      { g: 'Care', e: ['🩺', '🥣', '🛁', '✂️', '💉', '🦴', '💊', '🧶'] },
      { g: 'Play', e: ['🎾', '🏃', '❤️', '😍', '📸', '🏡', '😴', '✨'] },
    ],
    combos: ['🐶 🦴 🎾 — pup essentials', '🐱 😴 💤 — cat nap content', '🐾 🩺 ✅ — vet-approved tips'],
  },
  events: {
    label: 'Events & Weddings',
    groups: [
      { g: 'Party', e: ['🎉', '🥳', '🎊', '🎈', '🎁', '🎶', '🎂', '🕺'] },
      { g: 'Wedding', e: ['💍', '💒', '💐', '🥂', '👰', '🤵', '📸', '🕊️'] },
      { g: 'Planning', e: ['📅', '📍', '🗓️', '✅', '🍰', '🎫', '🕯️', '📋'] },
    ],
    combos: ['🎉 🥳 🎈 — party vibes', '💍 💒 🥂 — wedding season', '🎂 🍰 🎁 — birthday planning'],
  },
  ecommerce: {
    label: 'E-commerce & Shops',
    groups: [
      { g: 'Shopping', e: ['🛒', '🛍️', '🏷️', '💳', '💸', '🎁', '🎟️', '🧾'] },
      { g: 'Fulfillment', e: ['📦', '🚚', '✅', '🔄', '📬', '⏱️', '🏭', '🚀'] },
      { g: 'Urgency & trust', e: ['🔥', '⏰', '❗', '⭐', '🔒', '↩️', '💯', '⚡'] },
    ],
    combos: ['🛍️ 🏷️ 🔥 — flash sale', '📦 🚚 ✅ — order shipped', '⭐ 🔒 ↩️ — why buy from us'],
  },
  healthcare: {
    label: 'Healthcare & Clinics',
    groups: [
      { g: 'Medical', e: ['🩺', '🏥', '💊', '💉', '🩹', '🦷', '👁️', '🫀'] },
      { g: 'Wellness', e: ['🧘', '🌿', '💧', '🍎', '😴', '🧠', '🥗', '☀️'] },
      { g: 'Trust', e: ['✅', '👩‍⚕️', '📋', '⭐', '🔬', '📞', '📅', '🤝'] },
    ],
    combos: ['🩺 💊 ✅ — health tips', '🧘 🌿 💧 — daily wellness', '👩‍⚕️ 🏥 📋 — clinic updates'],
  },
  coffee: {
    label: 'Coffee & Café',
    groups: [
      { g: 'Menu', e: ['☕', '🫖', '🍵', '🥛', '🧊', '🧋', '🥐', '🧇'] },
      { g: 'Treats', e: ['🍩', '🍪', '🍰', '🌰', '🍫', '🧁', '🥧', '🍞'] },
      { g: 'Café life', e: ['📚', '🎧', '💻', '🌿', '☀️', '🎨', '💬', '⭐'] },
    ],
    combos: ['☕ 🥐 ☀️ — morning specials', '🎧 ☕ 💻 — laptop-friendly hours', '🍵 🌿 🫖 — afternoon menu'],
  },
};

const EmojiPickerTool = () => {
  const [industry, setIndustry] = React.useState('food');
  const { copy } = useCopy();
  const [lastCopied, setLastCopied] = React.useState('');

  React.useEffect(() => {
    if (lastCopied === '') return;
    const t = window.setTimeout(() => setLastCopied(''), 1500);
    return () => window.clearTimeout(t);
  }, [lastCopied]);

  const data = EMOJI_DATA[industry];

  const grab = (emoji: string) => {
    copy(emoji);
    setLastCopied(emoji);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label="Your industry"
          value={industry}
          onChange={setIndustry}
          options={Object.entries(EMOJI_DATA).map(([id, d]) => ({ value: id, label: d.label }))}
          help="Each niche gets hand-picked sets — no generic emoji walls."
        />
        <div className="flex items-end">
          <p className="text-xs leading-relaxed text-muted-foreground" aria-live="polite">
            {lastCopied !== '' ? (
              <span className="font-bold text-emerald-600">Copied! {lastCopied} is on your clipboard.</span>
            ) : (
              'Click any emoji to copy it instantly, then paste into your caption, bio or CTA.'
            )}
          </p>
        </div>
      </div>

      {data.groups.map((group) => (
        <div key={group.g} className="flex flex-col gap-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{group.g}</p>
          <div className="flex flex-wrap gap-2">
            {group.e.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => grab(emoji)}
                title={'Copy ' + emoji}
                className={
                  'flex size-13 items-center justify-center rounded-2xl border-2 text-2xl transition-all hover:-translate-y-0.5 hover:border-[#0a0a0a] ' +
                  (lastCopied === emoji ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white')
                }
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Combo suggestions</p>
        {data.combos.map((combo) => {
          const [emojis, meaning] = combo.split(' — ');
          return (
            <div key={combo} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-[#374151]">
                <span className="mr-2 text-lg">{emojis}</span>
                {meaning ? <span className="text-gray-500">— {meaning}</span> : null}
              </p>
              <CopyButton value={emojis ?? combo} label="Copy combo" />
            </div>
          );
        })}
      </div>

      <ToolNote>
        Emoji lift engagement when they echo the message, not decorate it: one or two per caption, placed after the hook or next to the CTA. Sets above are curated per niche so they read as industry-native, never random.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ 20. reading-time-calculator (bespoke) ═════════════════════ */

const READING_SPEEDS = [
  { value: '100', label: 'Technical / dense docs — 100 wpm' },
  { value: '150', label: 'Slow, careful reader — 150 wpm' },
  { value: '200', label: 'Average adult — 200 wpm' },
  { value: '250', label: 'Fast skimmer — 250 wpm' },
];

const ReadingTimeTool = () => {
  const [wordInput, setWordInput] = React.useState('1200');
  const [speed, setSpeed] = React.useState('200');
  const [pasted, setPasted] = React.useState('');

  const pastedWords = React.useMemo(() => (pasted.trim() === '' ? 0 : splitWords(pasted).length), [pasted]);
  const manualWords = Math.max(0, parseInt(wordInput || '0', 10) || 0);
  const wordCount = pastedWords > 0 ? pastedWords : manualWords;
  const wpm = parseInt(speed, 10) || 200;
  const seconds = (wordCount / wpm) * 60;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label="Word count"
          value={wordInput}
          onChange={setWordInput}
          min={0}
          step={1}
          suffix="words"
          help={pastedWords > 0 ? 'Overridden by the pasted text below.' : 'Type the count, or paste text below to count it.'}
        />
        <SelectInput label="Reading speed" value={speed} onChange={setSpeed} options={READING_SPEEDS} />
      </div>

      <TextAreaInput
        label="Paste text (optional)"
        value={pasted}
        onChange={setPasted}
        rows={7}
        placeholder={'Optional — paste the actual article and the word count fills itself automatically…'}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card-soft flex flex-col items-center justify-center p-6 text-center lg:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Estimated read</p>
          <p className="font-display mt-2 text-5xl font-bold">
            <span className="text-gradient">{wordCount > 0 ? fmtDuration(seconds) : '—'}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">at {wpm} words per minute</p>
        </div>
        <StatCard label="Words counted" value={wordCount.toLocaleString()} hint={pastedWords > 0 ? 'from pasted text' : 'manual entry'} />
        <StatCard
          label="Characters"
          value={pastedWords > 0 ? pasted.length.toLocaleString() : '—'}
          hint={pastedWords > 0 ? 'from pasted text' : 'paste text to count characters'}
        />
        <StatCard
          label="Pages @ 300 wpp"
          value={wordCount > 0 ? (wordCount / 300).toFixed(1) : '—'}
          hint="standard 300-words-per-page manuscript"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {READING_SPEEDS.map((s) => {
          const w = parseInt(s.value, 10);
          const sec = (wordCount / w) * 60;
          return (
            <StatCard
              key={s.value}
              label={'@ ' + w + ' wpm'}
              value={wordCount > 0 ? fmtDuration(sec) : '—'}
              tone={w === wpm ? 'good' : 'default'}
              hint={s.label.split(' — ')[0]}
            />
          );
        })}
      </div>

      <ToolNote>
        Estimates assume sustained silent reading of flowing prose. Add roughly 15% for headings, images, code blocks or tables, and remember publishing platforms round up — 1,200 words is conventionally shown as a 6 min read even though the raw math says 6:00 at 200 wpm.
      </ToolNote>
    </div>
  );
};

/* ═════════════════════ batch export — 20 tools ═════════════════════ */

export const batch: BatchTool[] = [
  {
    slug: 'css-minifier',
    Component: CssMinifierTool,
    doc: {
      longDescription:
        'Shrink stylesheets by stripping comments and collapsing every unnecessary space or line break. The compressor is deliberately conservative: calc() math, url() references and quoted content are set aside before compressing and restored afterwards, so the minified output behaves exactly like the original.',
      howTo: [
        'Paste your stylesheet or upload a .css file — the compressed version appears on the right as you work.',
        'Watch the “smaller” percentage under the output to see exactly how many bytes you removed.',
        'Copy the one-liner into your build output or download it as minified.css.',
        'Keep the readable master file for future edits and re-minify after every change.',
      ],
      faqs: [
        {
          q: 'Will minifying break calc() or responsive rules?',
          a: 'No. Whitespace inside calc() expressions is mathematically meaningful, so those regions — plus quoted strings — are protected during compression and put back byte-for-byte.',
        },
        {
          q: 'How much smaller does CSS typically get?',
          a: 'Hand-written stylesheets usually lose 20–40% of their size once comments and indentation are gone; files that were already compact shrink far less.',
        },
        {
          q: 'Should I minify CSS I still edit often?',
          a: 'Minified output is for production. Keep a formatted source of truth and regenerate the compact version whenever you ship.',
        },
      ],
    },
  },
  {
    slug: 'js-minifier',
    Component: JsMinifierTool,
    doc: {
      longDescription:
        'A safety-first JavaScript shrinker: it removes // and /* */ comments and trims trailing whitespace without renaming variables or restructuring a single statement. A small state machine tracks strings, template literals and regex literals, so comment-lookalikes inside them are never touched.',
      howTo: [
        'Paste JavaScript or upload a .js file — comments disappear from the output instantly.',
        'Skim the result to confirm string contents and regex literals survived intact (the sample shows the tricky cases).',
        'Copy or download the stripped file and deploy it with your build.',
        'Treat this as comment/whitespace cleanup only — pair it with a real bundler for mangling and dead-code elimination.',
      ],
      faqs: [
        {
          q: 'Why does it not rename variables like big minifiers do?',
          a: 'Renaming and scope analysis belong in build pipelines where mistakes get caught by tests. This tool does the safe subset — comment and whitespace removal — with zero risk of changing behavior.',
        },
        {
          q: 'Does it understand regex literals that contain slashes?',
          a: 'Yes. A context scanner decides when a forward slash starts a regex (after =, (, return, etc.) and skips escaped slashes and character classes inside it.',
        },
        {
          q: 'Will my ES modules and template literals survive?',
          a: 'Completely. Backtick templates are scanned as raw regions, and import/export statements are ordinary code that passes through untouched.',
        },
      ],
    },
  },
  {
    slug: 'html-formatter-beautifier',
    Component: HtmlFormatterTool,
    doc: {
      longDescription:
        'Turn tangled or minified markup into readable, consistently indented HTML. Block elements each get their own line while inline tags such as a, span, em, strong and td flow together with their text, and the contents of pre, script and style blocks are preserved exactly as written.',
      howTo: [
        'Paste messy or minified HTML, or upload an .html file.',
        'Check that preformatted blocks kept their internal spacing — they always do.',
        'Copy the indented result back into your editor or download it as formatted.html.',
        'Re-run the formatter after pasting new sections to keep indentation consistent across the whole document.',
      ],
      faqs: [
        {
          q: 'How does it decide what goes on the same line?',
          a: 'A small tag tokenizer knows the inline elements (links, emphasis, table cells…) and keeps them inline with surrounding text; structural elements like div, p and section always break onto their own indented lines.',
        },
        {
          q: 'Will it reformat the JavaScript inside my script tags?',
          a: 'Never — script, style and pre contents are treated as raw regions and reproduced verbatim, only the surrounding markup is re-indented.',
        },
        {
          q: 'What happens with unclosed tags?',
          a: 'The formatter is indentation-tolerant: it clamps nesting depth at zero and still produces a readable layout rather than throwing an error.',
        },
      ],
    },
  },
  {
    slug: 'base64-encoder-decoder',
    Component: Base64Tool,
    doc: {
      longDescription:
        'Convert text to Base64 and back with full UTF-8 support — accents, emoji and non-Latin scripts survive the round trip because encoding runs through TextEncoder, not the byte-lossy shortcut. A data URI mode adds the data:;base64, prefix for embedding small assets directly in HTML or CSS.',
      howTo: [
        'Choose Encode or Decode in the Direction select.',
        'Paste your text (or a Base64 string / data URI when decoding) — the result updates live.',
        'Flip on Data URI mode when you need the data:;base64, prefix for inline assets.',
        'Copy the output or download it as a .txt file.',
      ],
      faqs: [
        {
          q: 'Why did my decode fail?',
          a: 'Decoding throws when the input contains characters outside the Base64 alphabet or broken padding. The tool surfaces the exact browser error plus a hint instead of crashing — check for stray spaces, quotes or truncated tails.',
        },
        {
          q: 'Is Base64 a form of encryption?',
          a: 'No — it is a reversible transport encoding. Anyone can decode it, so never treat Base64 as protection for secrets.',
        },
        {
          q: 'Does it handle emoji and Chinese characters?',
          a: 'Yes. Encoding converts the string to UTF-8 bytes first, so any Unicode text round-trips perfectly.',
        },
      ],
    },
  },
  {
    slug: 'fancy-font-generator',
    Component: FancyFontTool,
    doc: {
      longDescription:
        'Render any phrase in a dozen Unicode letter styles — mathematical bold, script, fraktur, double-struck, circled, fullwidth and more. Every style is printed as its own labeled block so you can copy just the line you want, and characters without a mapped glyph simply pass through unchanged.',
      howTo: [
        'Type a heading, name or short phrase in the input box.',
        'Scan the twelve labeled style blocks and pick the one that fits your design.',
        'Copy a single line straight from the output box — each block is self-contained.',
        'Paste into wherever plain text is accepted: bios, docs, nicknames, chat apps.',
      ],
      faqs: [
        {
          q: 'Are these real fonts?',
          a: 'They are Unicode code points that happen to look like styled letters — which is why they paste anywhere as text. Screen readers may announce them oddly, so keep them decorative rather than for body copy.',
        },
        {
          q: 'Why do some characters stay unchanged?',
          a: 'Unicode does not define styled glyphs for every letter, digit or symbol. Anything without a mapping in a given alphabet falls through as the original character.',
        },
        {
          q: 'Will styled text hurt my SEO?',
          a: 'Search engines read the underlying code points, which may not match the visual letters — use fancy fonts for display accents, never for keywords or headings that matter.',
        },
      ],
    },
  },
  {
    slug: 'instagram-font-generator',
    Component: InstagramFontTool,
    doc: {
      longDescription:
        'Eight font styles curated specifically for Instagram bios, captions and comments — each one pastes as plain text inside the app, no keyboard tricks needed. Usage hints are appended to every line (bios vs captions vs name fields) so you know exactly where each style earns its keep.',
      howTo: [
        'Type the bio line, caption or name you want to restyle.',
        'Review the eight Instagram-safe styles — the arrow note on each line tells you its best use.',
        'Copy the single line you like (copy the whole block and delete the rest if easier).',
        'Paste it into your Instagram profile or post editor — formatting travels as plain text.',
      ],
      faqs: [
        {
          q: 'Are styled fonts allowed on Instagram?',
          a: 'Yes — they are ordinary Unicode characters, not an app hack. Instagram does not prohibit them; just avoid making your entire bio styled, which can read poorly on some devices.',
        },
        {
          q: 'Why do a few followers see boxes instead of letters?',
          a: 'Older Android fonts lack some glyph coverage. Stick to the Bold Sans, Small Caps or Typewriter styles for the widest support.',
        },
        {
          q: 'Can I mix two styles in one bio?',
          a: 'Absolutely — a common pattern is a cursive name on line one and small-caps descriptors below. Generate both lines here and paste them one at a time.',
        },
      ],
    },
  },
  {
    slug: 'slug-generator',
    Component: SlugGeneratorTool,
    doc: {
      longDescription:
        'Turn headlines into clean, lowercase URL slugs with accents stripped via Unicode normalization and word separators normalized. Optionally drop common stop words, switch between hyphens and underscores, and clamp the result to a search-friendly 60 characters without ever cutting a word in half.',
      howTo: [
        'Paste your page title or headline — the slug appears live as you type.',
        'Switch stop words to “Trim” when you want shorter URLs (the, and, of… are dropped).',
        'Pick the separator that matches your framework: hyphens for most sites, underscores where required.',
        'Copy the slug into your CMS URL field — it is already clamped to 60 characters at a word boundary.',
      ],
      faqs: [
        {
          q: 'Why 60 characters?',
          a: 'Google typically displays roughly 60 characters of a URL before truncating; shorter slugs also wrap less in shares and analytics reports. Disable the clamp if your platform allows longer paths.',
        },
        {
          q: 'Hyphens or underscores for SEO?',
          a: 'Hyphens are the established word separator for URLs — search engines treat them as spaces. Underscores are offered for legacy systems that require them.',
        },
        {
          q: 'What happens to accented or non-Latin titles?',
          a: 'Accented Latin letters are transliterated by NFD normalization (São → sao). Scripts outside the Latin alphabet are stripped, so review the output for those languages.',
        },
      ],
    },
  },
  {
    slug: 'lorem-ipsum-generator',
    Component: LoremIpsumTool,
    doc: {
      longDescription:
        'Generate Latin-style placeholder text on demand — whole paragraphs, single sentences, bare word runs or bulleted lists, with an optional HTML wrapper of p and li tags ready to paste into templates. Output is fully deterministic, so the same settings always reproduce the exact same text.',
      howTo: [
        'Click “Load sample” to activate the generator — the input box itself is ignored by design.',
        'Pick a unit (paragraphs, sentences, words or a bulleted list) and a quantity from 1 to 20.',
        'Toggle the HTML option when you need wrapped p or li markup instead of plain text.',
        'Copy the placeholder straight into your mockup, wireframe or CMS test content.',
      ],
      faqs: [
        {
          q: 'Where does lorem ipsum come from?',
          a: 'It is scrambled Latin from Cicero’s “De Finibus”, used by typesetters since the 1500s. Its nonsense is the point: readers judge layout instead of getting distracted by real copy.',
        },
        {
          q: 'What does the HTML option produce?',
          a: 'Paragraph mode wraps each block in p tags; list mode builds a ul with li children; sentences and words stay plain because they are inline content.',
        },
        {
          q: 'Why is the output identical every time?',
          a: 'The generator walks a fixed word bank with a deterministic pattern instead of Math.random, so your mockups never shift between reloads — ideal for screenshots and design reviews.',
        },
      ],
    },
  },
  {
    slug: 'text-case-converter',
    Component: TextCaseTool,
    doc: {
      longDescription:
        'One paste, ten naming conventions: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, Sentence case, plain upper and lower, plus aLtErNaTiNg case. Word boundaries are detected from spaces, hyphens, underscores and camel-case humps, so existing code identifiers convert cleanly too.',
      howTo: [
        'Paste a phrase, headline or variable name — all ten variants render at once.',
        'Grab the line matching the convention your language or platform expects.',
        'For code identifiers, note that punctuation is stripped first so tokens split correctly.',
        'Copy the single variant you need; the rest of the block is just for comparison.',
      ],
      faqs: [
        {
          q: 'How are acronyms handled?',
          a: 'Runs of capitals are treated as one token (parseHTTPResponse splits into parse, HTTP, response) before rebuilding, so conversions stay readable.',
        },
        {
          q: 'Which case should URLs and file names use?',
          a: 'kebab-case — lowercase words separated by hyphens — is the safest for URLs, file names and CSS classes alike.',
        },
        {
          q: 'Does Title Case follow editorial style?',
          a: 'It applies a standard rule set: minor words (a, and, of, the…) stay lowercase unless they open the title, matching most style guides closely enough for headlines.',
        },
      ],
    },
  },
  {
    slug: 'sql-query-formatter',
    Component: SqlFormatterTool,
    doc: {
      longDescription:
        'Reformat dense single-line SQL into readable, clause-aligned queries. Keywords are upper-cased, major clauses (FROM, WHERE, JOINs, GROUP BY, ORDER BY…) start on fresh lines, SELECT columns are indented under one another, and string literals are protected so reserved words inside quotes stay untouched.',
      howTo: [
        'Paste a messy or minified query — formatting happens instantly, no options needed.',
        'Verify that string values kept their original casing (only keywords outside quotes are upper-cased).',
        'Copy the aligned query back into your migration, ORM log or code review comment.',
        'For very long SELECT lists, the one-column-per-line layout makes diffs far easier to read.',
      ],
      faqs: [
        {
          q: 'Which SQL dialects does it support?',
          a: 'The keyword set covers the shared core of MySQL, PostgreSQL, SQLite and SQL Server. Dialect-specific syntax passes through unchanged — worst case it is simply not re-broken.',
        },
        {
          q: 'Are keywords inside string literals upper-cased?',
          a: 'Never. Single-quoted strings are swapped out for placeholders before formatting and restored afterwards, so select inside a quoted value stays exactly as written.',
        },
        {
          q: 'How are subqueries handled?',
          a: 'The formatter indents the outermost SELECT list and breaks top-level clauses; nested subqueries are preserved inline. It is a readability pass, not a full parser.',
        },
      ],
    },
  },
  {
    slug: 'word-character-counter',
    Component: WordCounterTool,
    doc: {
      longDescription:
        'Live counting for writers and students: words, characters with and without spaces, sentences, paragraphs and average word length, plus reading time at 200 wpm and speaking time at 130 wpm. A keyword table lists your ten most used significant words so repetitive phrasing jumps out before your editor finds it.',
      howTo: [
        'Paste your draft, essay or email — every stat recalculates on each keystroke.',
        'Check reading vs speaking time when deciding whether content fits a slot or script.',
        'Scan the keyword table for words whose share looks heavier than you intended.',
        'Trim or vary the overused terms and watch the balance shift instantly.',
      ],
      faqs: [
        {
          q: 'What are the reading and speaking rates based on?',
          a: 'Industry conventions: about 200 words per minute for silent adult reading and 130 wpm for a natural speaking pace — the numbers most speech coaches and presentation timers use.',
        },
        {
          q: 'How is the keyword top-list chosen?',
          a: 'Words of three or more letters are lower-cased and filtered against a stop-word list, then ranked by count — so “the” never outranks the terms that actually carry your topic.',
        },
        {
          q: 'Is my text uploaded anywhere?',
          a: 'No. All counting runs in your browser; nothing leaves the page.',
        },
      ],
    },
  },
  {
    slug: 'title-length-checker',
    Component: TitleLengthTool,
    doc: {
      longDescription:
        'Estimate whether your SEO title fits Google’s results page before you publish. The checker applies a per-character width heuristic — narrow lowercase, wider capitals, wider still for CJK — at a typical 20 px title font against mobile (~560 px) and desktop (~580 px) limits, and shows a simulated SERP line so you see what truncation looks like.',
      howTo: [
        'Paste the exact title tag you plan to publish.',
        'Read the estimated pixel widths against the mobile and desktop limits in the stat cards.',
        'Check the verdict: it tells you whether to shorten, or simply to front-load the important words.',
        'Adjust the title until the estimate clears both limits, then copy it into your CMS.',
      ],
      faqs: [
        {
          q: 'How accurate is the pixel estimate?',
          a: 'It is an honest approximation using width factors per character class — real rendering depends on the font Google serves your visitor. Treat ±10% as noise and aim to clear the limit with room to spare.',
        },
        {
          q: 'What is the ideal title length?',
          a: 'Around 50–60 characters usually clears both the ~560 px mobile and ~600 px desktop cuts, but pixel width — not the character count — is what actually decides truncation.',
        },
        {
          q: 'Why does character count alone mislead?',
          a: 'ALL-CAPS titles and wide glyphs eat pixels far faster than lowercase, so a 55-character capital-heavy title can truncate while a 60-character lowercase one fits.',
        },
      ],
    },
  },
  {
    slug: 'keyword-density-checker',
    Component: KeywordDensityTool,
    doc: {
      longDescription:
        'See which words and two-word phrases dominate your draft before search engines do. The report ranks the ten most frequent single keywords and the ten most frequent bigrams with counts and density percentages, and warns the moment any term pushes past the ~2.5% over-optimization line.',
      howTo: [
        'Paste your article or page copy — density figures update live.',
        'Read the combined table: single words and 2-word phrases are ranked separately, stop words excluded.',
        'Watch the verdict: anything above ~2.5% density risks reading as keyword stuffing.',
        'Rewrite repeats into pronouns and synonyms until the top term sits near 1–2%.',
      ],
      faqs: [
        {
          q: 'What keyword density should I aim for?',
          a: 'There is no official target, but 1–2% keeps a term present without distorting the prose. Consistently above ~2.5% for your main phrase is where over-optimization warnings start.',
        },
        {
          q: 'Why are stop words excluded from the table?',
          a: 'Words like “the” and “and” can be 5–8% of any English text and tell you nothing about topical focus — filtering them surfaces the terms that actually describe your page.',
        },
        {
          q: 'Can keyword stuffing really hurt rankings?',
          a: 'Yes — repeated terms trigger spam classifiers and make copy unreadable, which suppresses engagement signals. Natural variation with related phrases is the sustainable strategy.',
        },
      ],
    },
  },
  {
    slug: 'aso-keyword-density-checker',
    Component: AsoDensityTool,
    doc: {
      longDescription:
        'Built for app store copy: check keyword balance in your Google Play or Apple App Store description, track how many of the 4,000 allowed characters you have used, and verify that your most important terms appear in the opening lines shoppers actually read before tapping “more”.',
      howTo: [
        'Paste your store description (the body text, not the title field).',
        'Check the “First 30 chars” card — Apple shows roughly that many before truncation, so primary keywords belong there.',
        'Review the density table: the “opening 100 chars” column shows which keywords are front-loaded.',
        'Keep any keyword under ~3% and rewrite repeats — stores demote listings that read as stuffed.',
      ],
      faqs: [
        {
          q: 'What are the character budgets per store?',
          a: 'Apple allows 30 characters for the title and 30 for the subtitle, with descriptions up to 4,000 characters; Google Play allows 30 for the title and 80 for the short description.',
        },
        {
          q: 'What density counts as stuffing for app listings?',
          a: 'This tool warns past 3% for any keyword and flags heavy stuffing past 5% — store algorithms are stricter than web search because description spam is rampant.',
        },
        {
          q: 'Should the same keyword appear in title and description?',
          a: 'Yes — consistent terms across title, subtitle and the first description lines reinforce relevance, as long as each placement reads naturally to a human.',
        },
      ],
    },
  },
  {
    slug: 'twitter-character-counter',
    Component: TwitterCounterTool,
    doc: {
      longDescription:
        'Count characters the way X does: every link counts as 23 regardless of its real length, emoji and wide scripts weigh double, everything else is one. If your draft will not fit, the tool splits it into a numbered thread of posts capped at 275 weighted characters, leaving room for the 1/, 2/ markers.',
      howTo: [
        'Paste or draft your post — the weighted count updates as you type.',
        'If it fits within 280, copy it straight out; the remaining budget is shown live.',
        'If it overflows, read the auto-split thread table: each post is numbered with its own count.',
        'Paste the posts one by one into X, keeping the numbering markers intact.',
      ],
      faqs: [
        {
          q: 'Why do links count as 23 characters?',
          a: 'X wraps every URL through its own t.co shortener, which always occupies 23 characters — so a 10-character link and a 200-character link cost exactly the same.',
        },
        {
          q: 'Why split at 275 instead of 280?',
          a: 'The 1/, 2/ thread markers and a space consume roughly five characters, so capping posts at 275 guarantees the numbered version still fits the limit.',
        },
        {
          q: 'How does the weighting work for emoji and CJK?',
          a: 'Code points above U+2000 — which covers emoji, CJK characters and most symbols — count as 2, matching X’s weighted counting heuristic; plain Latin text counts 1 per character.',
        },
      ],
    },
  },
  {
    slug: 'email-subject-line-tester',
    Component: EmailSubjectTool,
    doc: {
      longDescription:
        'Stress-test a subject line before you hit send: length against the ~35–40 character mobile cutoff, spam-trigger words like “free” and “act now”, the capital-letter ratio, digits, and the power words that historically lift open rates. The verdict spells out exactly what to trim and what to keep.',
      howTo: [
        'Type the exact subject line as recipients will see it, emoji included.',
        'Check the character stat against the mobile preview hint — most inboxes cut near 35–40.',
        'Review the signal table: spam triggers, power words and ALL-CAPS words are listed explicitly.',
        'Apply the verdict’s fixes — fewer caps, fewer triggers, one strong power word — and re-test.',
      ],
      faqs: [
        {
          q: 'Does one spam word get me filtered?',
          a: 'Rarely on its own. Filters score combinations — “FREE!!!” plus ALL-CAPS plus exclamation marks stacks risk fast, which is why two or more triggers here flips the verdict.',
        },
        {
          q: 'What subject length gets the best opens?',
          a: 'Data across email platforms points to 30–50 characters: long enough to make one clear promise, short enough to survive mobile inboxes where most opens happen.',
        },
        {
          q: 'Are power words guaranteed opens?',
          a: 'No word guarantees anything — but specificity and curiosity (how, proven, finally, a number) consistently outperform vague hype. Treat the power-word list as inspiration, not a formula.',
        },
      ],
    },
  },
  {
    slug: 'regex-tester-generator',
    Component: RegexTesterTool,
    doc: {
      longDescription:
        'Prototype regular expressions with instant feedback: toggle the g, i, m, s and u flags, type a test string and see every match with its index, captured groups and yellow highlighting in context. Starter patterns for emails, URLs, dates and more get you going in one click, and a syntax cheat sheet sits below the results.',
      howTo: [
        'Enter a raw pattern (no surrounding slashes) or pick a starter pattern from the dropdown.',
        'Toggle flags: g for all matches, i to ignore case, m for line anchors, s so dot matches newlines, u for unicode mode.',
        'Paste your test string — matches light up in yellow with a numbered list of captures below.',
        'Copy the working pattern into your code, adding the language’s own delimiter syntax around it.',
      ],
      faqs: [
        {
          q: 'What do the five flags mean?',
          a: 'g returns every match instead of the first, i ignores letter case, m makes ^ and $ match line boundaries, s lets . match newlines, and u enables full unicode escapes and code-point handling.',
        },
        {
          q: 'Where do I see capture group values?',
          a: 'Under the highlighted text: each match row lists $1, $2… with the captured substring, so you can verify groups before wiring the regex into production code.',
        },
        {
          q: 'Can a pathological pattern freeze the page?',
          a: 'The tester caps test input at 100,000 characters and stops after 500 matches, which keeps runaway loops from locking the tab — a safety net, not a sandbox.',
        },
      ],
    },
  },
  {
    slug: 'diff-checker',
    Component: DiffCheckerTool,
    doc: {
      longDescription:
        'Compare two versions of text or code line by line: added lines glow green, removed lines glow red, and the summary counts exactly what changed. Optional modes ignore whitespace-only edits or letter case — handy when reviewing prose where reflowed spaces are noise, or config files where casing matters.',
      howTo: [
        'Paste the original version on the left and the new version on the right.',
        'Read the unified result: green lines exist only in the new text, red lines only in the original.',
        'Use the summary cards to confirm the change size before approving or shipping.',
        'Flip on “ignore whitespace” or “ignore case” when those differences are irrelevant to your review.',
      ],
      faqs: [
        {
          q: 'Is this a word-level or line-level diff?',
          a: 'Line level — the same granularity code review uses. Whole lines move between the added and removed buckets, which keeps the output stable and readable.',
        },
        {
          q: 'How large can the inputs be?',
          a: 'Comfortably thousands of lines; the comparison runs in your browser via a linear-ish Myers diff, so the practical limit is your tab’s memory, not the network.',
        },
        {
          q: 'What does “ignore whitespace” actually ignore?',
          a: 'Runs of spaces and tabs are collapsed before comparing, so indentation changes and alignment edits no longer count as content changes — real word changes still show.',
        },
      ],
    },
  },
  {
    slug: 'emoji-picker-by-industry',
    Component: EmojiPickerTool,
    doc: {
      longDescription:
        'Skip generic emoji walls: pick your niche — food, fitness, real estate, beauty, tech, education, travel, finance, pets, events, e-commerce, healthcare or coffee — and get hand-picked, genuinely relevant sets plus ready-made caption combos. One click copies any single emoji or a full combo to your clipboard.',
      howTo: [
        'Select your industry from the dropdown — the curated sets swap instantly.',
        'Click any emoji chip to copy it; a confirmation shows exactly what landed on your clipboard.',
        'Use the combo suggestions for full caption accents — each copies as one string.',
        'Paste into Instagram, TikTok, X or your scheduling tool; everything is plain text.',
      ],
      faqs: [
        {
          q: 'Why industry-specific sets instead of one big grid?',
          a: 'Context beats volume: a 🔑 lands differently for real estate than for tech support. Curated per-niche sets keep your captions reading native to your audience.',
        },
        {
          q: 'How many emoji should a caption use?',
          a: 'One or two beats a wall — place them after the hook or beside the call to action. The sets are grouped (dish, drink, hype…) so you can mix without cluttering.',
        },
        {
          q: 'Do the combos work everywhere?',
          a: 'Yes — emoji are Unicode text, so they paste identically into bios, captions, ad copy and even email subject lines.',
        },
      ],
    },
  },
  {
    slug: 'reading-time-calculator',
    Component: ReadingTimeTool,
    doc: {
      longDescription:
        'Convert a word count into an honest “X min read” label using four realistic paces: 100 wpm for dense technical documentation, 150 for careful readers, 200 for the average adult and 250 for skimmers. Paste real text to count it automatically, or type a number to plan content before it is written.',
      howTo: [
        'Enter a word count, or paste the actual article to have it counted for you.',
        'Choose the reading speed that matches your audience — technical docs need the 100 wpm setting.',
        'Read the big estimate plus the four-speed breakdown to see the full spread.',
        'Copy the “X min read” label into your CMS or editorial checklist.',
      ],
      faqs: [
        {
          q: 'Which words-per-minute number is “correct”?',
          a: 'Around 200 wpm is the widely cited average for silent adult reading of general prose; technical material with jargon and code realistically slows readers to near 100.',
        },
        {
          q: 'Why does my blog platform show a different time?',
          a: 'Most platforms divide by a fixed 200–265 wpm and round up. This tool shows the raw math plus a four-speed spread so you can pick the label that fits your audience honestly.',
        },
        {
          q: 'Should images count toward reading time?',
          a: 'They add scanning time. A practical rule: add about 15% for image-heavy or code-heavy posts rather than pretending every visual is free.',
        },
      ],
    },
  },
];
