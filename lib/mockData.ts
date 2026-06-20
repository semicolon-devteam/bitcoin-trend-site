import type { CoinId, PricePoint } from "./types";

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

// Per-coin generation settings. Each coin gets its own seed so the two
// series look different while staying deterministic across renders.
const COIN_PARAMS: Record<CoinId, { seed: number; startPrice: number; drift: number; vol: number }> = {
  btc: { seed: 20260620, startPrice: 61000, drift: 0.0016, vol: 0.045 },
  eth: { seed: 31415926, startPrice: 3400, drift: 0.0011, vol: 0.052 },
};

function buildSeries(coin: CoinId): PricePoint[] {
  const { seed, startPrice, drift, vol } = COIN_PARAMS[coin];
  const rng = mulberry32(seed);
  const points: PricePoint[] = [];
  let price = startPrice;

  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const shock = (rng() - 0.5) * vol;
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

const FULL_SERIES: Record<CoinId, PricePoint[]> = {
  btc: buildSeries("btc"),
  eth: buildSeries("eth"),
};

/**
 * Returns the last `days` price points for a coin (most recent last).
 * Swap the body for a real API call when ready.
 */
export function getPriceHistory(coin: CoinId, days: number): PricePoint[] {
  return FULL_SERIES[coin].slice(-days);
}
