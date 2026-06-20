export interface PricePoint {
  /** ISO date string, e.g. "2026-06-20" */
  date: string;
  /** Closing price in USD */
  price: number;
}

export interface Candle {
  /** ISO date string "yyyy-mm-dd" (used as lightweight-charts time) */
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type DataSource = "live" | "mock";

export type RangeKey = "30" | "90";

export type CoinId = "btc" | "eth";

export interface Coin {
  id: CoinId;
  /** Korean display name, e.g. "비트코인" */
  name: string;
  /** Ticker, e.g. "BTC" */
  ticker: string;
  /** Currency symbol shown in the logo, e.g. "₿" */
  symbol: string;
}

export interface TrendSummary {
  direction: "up" | "down" | "flat";
  /** Percent change across the selected range, e.g. 12.4 */
  changePercent: number;
  current: number;
  high: number;
  low: number;
  rangeDays: number;
}
