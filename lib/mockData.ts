import type { PricePoint } from "./types";

/**
 * Mock price source. Deterministic so server and client render identically.
 *
 * To go live later, replace `getPriceHistory` with a fetch to a real API
 * (e.g. CoinGecko market_chart) that returns the same PricePoint[] shape.
 * Nothing else in the app needs to change.
 */

// Seeded PRNG (mulberry32) — keeps the series stable across renders.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TOTAL_DAYS = 90;
const END_DATE = new Date("2026-06-20T00:00:00Z");
const START_PRICE = 61000;

function buildSeries(): PricePoint[] {
  const rng = mulberry32(20260620);
  const points: PricePoint[] = [];
  let price = START_PRICE;

  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    // Gentle upward drift with daily volatility.
    const drift = 0.0016;
    const shock = (rng() - 0.5) * 0.045;
    price = price * (1 + drift + shock);

    const date = new Date(END_DATE);
    date.setUTCDate(date.getUTCDate() - i);

    points.push({
      date: date.toISOString().slice(0, 10),
      price: Math.round(price),
    });
  }
  return points;
}

const FULL_SERIES = buildSeries();

/**
 * Returns the last `days` price points (most recent last).
 * Swap the body for a real API call when ready.
 */
export function getPriceHistory(days: number): PricePoint[] {
  return FULL_SERIES.slice(-days);
}
