import type { TrendSummary } from "@/lib/types";
import { trendCopy, formatPercent } from "@/lib/analytics";

interface Props {
  summary: TrendSummary;
}

const BADGE: Record<TrendSummary["direction"], string> = {
  up: "▲ 상승",
  down: "▼ 하락",
  flat: "■ 횡보",
};

export default function TrendExplanation({ summary }: Props) {
  const copy = trendCopy(summary.direction);
  return (
    <section className="explain">
      <div className="explain-head">
        <span className={`badge ${summary.direction}`}>{BADGE[summary.direction]}</span>
        <h2>{copy.headline}</h2>
      </div>
      <p className="explain-body">{copy.body}</p>
      <p className="explain-meta">
        최근 {summary.rangeDays}일 기준 변동률{" "}
        <strong className={summary.direction}>{formatPercent(summary.changePercent)}</strong>
      </p>
    </section>
  );
}
