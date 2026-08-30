/** Type declarations for the gifenc GIF encoder (ships without types). */
declare module 'gifenc' {
  export interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: {
        palette?: number[][];
        delay?: number;
        transparent?: boolean;
        transparentIndex?: number;
        dispose?: number;
        first?: boolean;
        repeat?: number;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }
  export function GIFEncoder(): GIFEncoderInstance;
  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: string; oneBitAlpha?: boolean; clearAlpha?: boolean }
  ): number[][];
  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array;
  export function nearestColorIndex(palette: number[][], pixel: number[]): number;
  export function prequantize(
    data: Uint8Array | Uint8ClampedArray,
    opts?: { roundRGB?: number; roundAlpha?: number; oneBitAlpha?: boolean }
  ): void;
}
