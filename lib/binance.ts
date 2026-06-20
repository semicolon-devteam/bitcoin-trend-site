import type { Candle, CoinId } from "./types";
import { getPriceHistory } from "./mockData";

/**
 * Live market data from Binance public endpoints (no API key needed).
 * - REST klines  -> historical OHLC candles
 * - WebSocket    -> realtime updates to the most recent candle
 *
 * If Binance is unreachable (network/region), callers fall back to
 * `mockCandles` so the chart always renders.
 */

const REST = "https://api.binance.com/api/v3/klines";
const WS = "wss://stream.binance.com:9443/ws";

const SYMBOL: Record<CoinId, string> = {
  btc: "BTCUSDT",
  eth: "ETHUSDT",
};

export function symbolFor(coin: CoinId): string {
  return SYMBOL[coin];
}

function toDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Fetch daily OHLC candles for the last `days` days. */
export async function fetchCandles(coin: CoinId, days: number): Promise<Candle[]> {
  const url = `${REST}?symbol=${SYMBOL[coin]}&interval=1d&limit=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance REST ${res.status}`);
  const raw: unknown[][] = await res.json();
  return raw.map((k) => ({
    time: toDate(Number(k[0])),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
  }));
}

/**
 * Subscribe to realtime daily-candle updates. Calls `onCandle` with the
 * latest (still-forming) candle on every tick. Returns a cleanup function.
 */
export function openCandleStream(coin: CoinId, onCandle: (c: Candle) => void): () => void {
  const stream = `${SYMBOL[coin].toLowerCase()}@kline_1d`;
  let ws: WebSocket | null = null;

  try {
    ws = new WebSocket(`${WS}/${stream}`);
    ws.onmessage = (ev) => {
      try {
        const k = JSON.parse(ev.data).k;
        if (!k) return;
        onCandle({
          time: toDate(Number(k.t)),
          open: Number(k.o),
          high: Number(k.h),
          low: Number(k.l),
          close: Number(k.c),
        });
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

/** Deterministic OHLC fallback synthesized from the mock close series. */
export function mockCandles(coin: CoinId, days: number): Candle[] {
  const points = getPriceHistory(coin, days);
  return points.map((p, i) => {
    const prevClose = i > 0 ? points[i - 1].price : p.price;
    const open = prevClose;
    const close = p.price;
    const high = Math.round(Math.max(open, close) * 1.012);
    const low = Math.round(Math.min(open, close) * 0.988);
    return { time: p.date, open, high, low, close };
  });
}
