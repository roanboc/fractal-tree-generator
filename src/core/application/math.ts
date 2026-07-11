import { Interval } from '../domain/types';

export function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Sample a value from an interval, scaled by wildness: at wildness 0 the
 * midpoint is always returned; at wildness 1 the sample may land anywhere
 * in the interval. In between, samples stay proportionally closer to the
 * midpoint.
 */
export function sampleInterval(
  interval: Interval,
  wildness: number,
  rng: () => number = Math.random
): number {
  const mid = (interval.min + interval.max) / 2;
  const half = (interval.max - interval.min) / 2;
  return mid + (rng() * 2 - 1) * clamp(wildness, 0, 1) * half;
}

export function lerp(start: number, end: number, fraction: number): number {
  return start + (end - start) * fraction;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function hexToRgb(hex: string): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
