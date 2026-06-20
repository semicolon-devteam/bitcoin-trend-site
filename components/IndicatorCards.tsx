import type { TrendSummary } from "@/lib/types";
import { formatUsd, formatPercent } from "@/lib/analytics";

interface Props {
  summary: TrendSummary;
}

export default function IndicatorCards({ summary }: Props) {
  const changeClass =
    summary.direction === "up" ? "up" : summary.direction === "down" ? "down" : "flat";

  const cards = [
    { label: "현재가", value: formatUsd(summary.current), tone: "neutral" as const },
    {
      label: `${summary.rangeDays}일 변동률`,
      value: formatPercent(summary.changePercent),
      tone: changeClass,
    },
    { label: "기간 고점", value: formatUsd(summary.high), tone: "neutral" as const },
    { label: "기간 저점", value: formatUsd(summary.low), tone: "neutral" as const },
  ];

  return (
    <div className="cards">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <span className="card-label">{c.label}</span>
          <span className={`card-value ${c.tone}`}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}
