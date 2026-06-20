import type { ClosePoint, CoinId, RangeDef, RangeKey } from "./types";

/**
 * Live market data from Binance public endpoints (no API key needed).
 * - REST klines  -> historical closing prices for a range
 * - WebSocket    -> realtime updates to the most recent point
 *
 * If Binance is unreachable (network/region), callers fall back to
 * `mockCloses` so the chart always renders.
 */

const REST = "https://api.binance.com/api/v3/klines";
const WS = "wss://stream.binance.com:9443/ws";

const SYMBOL: Record<CoinId, string> = {
  btc: "BTCUSDT",
  eth: "ETHUSDT",
};

const MIN = 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const RANGES: RangeDef[] = [
  { key: "1d", label: "1일", interval: "15m", limit: 96, intervalSec: 15 * MIN, intraday: true },
  { key: "1w", label: "1주일", interval: "1h", limit: 168, intervalSec: HOUR, intraday: true },
  { key: "1mo", label: "1달", interval: "4h", limit: 180, intervalSec: 4 * HOUR, intraday: true },
  { key: "1q", label: "1분기", interval: "1d", limit: 90, intervalSec: DAY, intraday: false },
  { key: "1y", label: "1년", interval: "1d", limit: 365, intervalSec: DAY, intraday: false },
  { key: "5y", label: "5년", interval: "1w", limit: 260, intervalSec: 7 * DAY, intraday: false },
];

export function rangeByKey(key: RangeKey): RangeDef {
  return RANGES.find((r) => r.key === key) ?? RANGES[3];
}

export function symbolFor(coin: CoinId): string {
  return SYMBOL[coin];
}

/** Fetch closing prices for a coin over the given range. */
export async function fetchCloses(coin: CoinId, range: RangeDef): Promise<ClosePoint[]> {
  const url = `${REST}?symbol=${SYMBOL[coin]}&interval=${range.interval}&limit=${range.limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance REST ${res.status}`);
  const raw: unknown[][] = await res.json();
  return raw.map((k) => ({ time: Math.floor(Number(k[0]) / 1000), close: Number(k[4]) }));
}

/**
 * Subscribe to realtime updates for the most recent point. Calls `onPoint`
 * with the latest (still-forming) close on every tick. Returns a cleanup fn.
 */
export function openCloseStream(
  coin: CoinId,
  range: RangeDef,
  onPoint: (p: ClosePoint) => void
): () => void {
  const stream = `${SYMBOL[coin].toLowerCase()}@kline_${range.interval}`;
  let ws: WebSocket | null = null;

  try {
    ws = new WebSocket(`${WS}/${stream}`);
    ws.onmessage = (ev) => {
      try {
        const k = JSON.parse(ev.data).k;
        if (!k) return;
        onPoint({ time: Math.floor(Number(k.t) / 1000), close: Number(k.c) });
      } catch {
        /* ignore malformed frame */
      }
    };
  } catch {
    /* WebSocket unavailable — caller keeps last data */
  }

  return () => {
    if (ws && ws.readyState <= WebSocket.OPEN) ws.close();
  };
}

// Seeded PRNG so the mock fallback is stable across renders.
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

const MOCK_SEED: Record<CoinId, number> = { btc: 20260620, eth: 31415926 };
const MOCK_START: Record<CoinId, number> = { btc: 61000, eth: 3400 };

/** Deterministic closing-price fallback when Binance is unreachable. */
export function mockCloses(coin: CoinId, range: RangeDef): ClosePoint[] {
  const rng = mulberry32(MOCK_SEED[coin] + range.limit);
  const nowSec = Math.floor(Date.now() / 1000);
  const points: ClosePoint[] = [];
  let price = MOCK_START[coin];

  for (let i = range.limit - 1; i >= 0; i--) {
    const shock = (rng() - 0.5) * 0.05;
    price = price * (1 + 0.0012 + shock);
    points.push({ time: nowSec - i * range.intervalSec, close: Math.round(price) });
  }
  return points;
}
