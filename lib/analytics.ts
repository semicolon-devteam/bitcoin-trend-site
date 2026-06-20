import type { CoinStat, Direction, LinePoint } from "./types";

const FLAT_THRESHOLD = 1.5; // percent — below this we call it sideways

function directionFor(changePercent: number): Direction {
  if (changePercent > FLAT_THRESHOLD) return "up";
  if (changePercent < -FLAT_THRESHOLD) return "down";
  return "flat";
}

/** Snapshot of a coin over the selected range, from its closing prices. */
export function statFromCloses(closes: number[]): CoinStat {
  const first = closes[0];
  const current = closes[closes.length - 1];
  const changePercent = ((current - first) / first) * 100;
  return {
    direction: directionFor(changePercent),
    changePercent,
    current,
    high: Math.max(...closes),
    low: Math.min(...closes),
  };
}

/** Normalize closes to percent change from the first point (for charting). */
export function toNormalizedLine(points: { time: number; close: number }[]): LinePoint[] {
  if (!points.length) return [];
  const base = points[0].close;
  return points.map((p) => ({ time: p.time, value: (p.close / base - 1) * 100 }));
}

const COPY: Record<Direction, { headline: string; body: string }> = {
  up: {
    headline: "지금은 상승 추세예요",
    body:
      "선택한 기간 동안 가격이 전반적으로 오르고 있어요. 매수세가 강하다는 신호일 수 있지만, 짧은 기간의 상승이 계속된다는 보장은 없어요. 고점 근처에서는 변동성이 커질 수 있다는 점을 기억하세요.",
  },
  down: {
    headline: "지금은 하락 추세예요",
    body:
      "선택한 기간 동안 가격이 전반적으로 내려가고 있어요. 매도세가 우세하다는 의미일 수 있어요. 다만 하락이 항상 나쁜 신호는 아니며, 시장이 쉬어가는 구간일 수도 있습니다.",
  },
  flat: {
    headline: "지금은 횡보(보합) 구간이에요",
    body:
      "선택한 기간 동안 가격이 크게 오르내리지 않고 비슷한 수준을 유지하고 있어요. 시장이 방향을 정하기 전에 힘을 모으는 구간일 수 있어요. 다음 움직임을 기다려보는 사람이 많은 상태예요.",
  },
};

export function trendCopy(direction: Direction) {
  return COPY[direction];
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
