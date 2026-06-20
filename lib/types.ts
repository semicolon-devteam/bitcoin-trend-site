export interface PricePoint {
  /** ISO date string, e.g. "2026-06-20" */
  date: string;
  /** Closing price in USD */
  price: number;
}

export type RangeKey = "30" | "90";

export interface TrendSummary {
  direction: "up" | "down" | "flat";
  /** Percent change across the selected range, e.g. 12.4 */
  changePercent: number;
  current: number;
  high: number;
  low: number;
  rangeDays: number;
}
