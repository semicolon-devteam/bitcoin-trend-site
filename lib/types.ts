export interface PricePoint {
  /** ISO date string, e.g. "2026-06-20" */
  date: string;
  /** Closing price in USD */
  price: number;
}

/** A single closing price at a point in time (UNIX seconds). */
export interface ClosePoint {
  time: number;
  close: number;
}

/** A point for a chart line series (value is normalized % change). */
export interface LinePoint {
  time: number;
  value: number;
}

export type DataSource = "live" | "mock";

export type RangeKey = "1d" | "1w" | "1mo" | "1q" | "1y" | "5y";

export interface RangeDef {
  key: RangeKey;
  label: string;
  /** Binance kline interval, e.g. "15m", "1d". */
  interval: string;
  /** Number of candles to request. */
  limit: number;
  /** Seconds per candle — used for the mock fallback timeline. */
  intervalSec: number;
  /** True when points are sub-daily (affects axis time formatting). */
  intraday: boolean;
}

export type CoinId = "btc" | "eth";

export interface Coin {
  id: CoinId;
  /** Korean display name, e.g. "비트코인" */
  name: string;
  /** Ticker, e.g. "BTC" */
  ticker: string;
  /** Currency symbol shown in the logo, e.g. "₿" */
  symbol: string;
  /** Line color on the comparison chart. */
  color: string;
}

export type Direction = "up" | "down" | "flat";

/** Per-coin snapshot over the selected range. */
export interface CoinStat {
  direction: Direction;
  /** Percent change across the selected range, e.g. 12.4 */
  changePercent: number;
  current: number;
  high: number;
  low: number;
}

export interface TrendSummary extends CoinStat {
  rangeDays: number;
}
