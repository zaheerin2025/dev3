/**
 * POP accent system — one disciplined 4-color ramp used everywhere.
 * Index 0 = tangerine (primary brand accent), then amber, jade, iris.
 * Colors are used systematically (by array index or slug hash) so the
 * site reads as colorful-but-cohesive instead of random.
 */
export const ACCENT_HEX = ['#FF4D00', '#FFB020', '#0FA36B', '#7A5AF8'] as const;

/** Full tile classes (background + readable foreground) for icon tiles. */
export const ACCENT_TILE = [
  'bg-[#FF4D00] text-white',
  'bg-[#FFB020] text-[#161613]',
  'bg-[#0FA36B] text-white',
  'bg-[#7A5AF8] text-white',
] as const;

/** Soft tinted chips / pills backgrounds (readable with ink text). */
export const ACCENT_SOFT = [
  'bg-[#FFE9E2]',
  'bg-[#FFF3D6]',
  'bg-[#E3F5EC]',
  'bg-[#EEE9FE]',
] as const;

/** Text-only accent classes (for labels, numbers, dots). */
export const ACCENT_TEXT = [
  'text-[#FF4D00]',
  'text-[#C77F00]',
  'text-[#0E8A59]',
  'text-[#6C4CE0]',
] as const;

/** Dot-only background classes. */
export const ACCENT_DOT = [
  'bg-[#FF4D00]',
  'bg-[#FFB020]',
  'bg-[#0FA36B]',
  'bg-[#7A5AF8]',
] as const;

/** Deterministic accent index for a key (djb2) — stable across renders. */
export function accentIndex(key: string): number {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % ACCENT_HEX.length;
}

/** Convenience: pick tile classes for a key. */
export function accentTile(key: string): string {
  return ACCENT_TILE[accentIndex(key)];
}
