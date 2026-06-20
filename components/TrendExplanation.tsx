import type { Coin, CoinStat, Direction } from "@/lib/types";
import { trendCopy, formatPercent } from "@/lib/analytics";

interface Props {
  coin: Coin;
  stat: CoinStat;
  rangeLabel: string;
}

const BADGE: Record<Direction, string> = {
  up: "▲ 상승",
  down: "▼ 하락",
  flat: "■ 횡보",
};

export default function TrendExplanation({ coin, stat, rangeLabel }: Props) {
  const copy = trendCopy(stat.direction);
  return (
    <section className="explain">
      <div className="explain-head">
        <span className={`badge ${stat.direction}`}>{BADGE[stat.direction]}</span>
        <h2>
          <span style={{ color: coin.color }}>{coin.symbol}</span> {coin.name} · {copy.headline}
        </h2>
      </div>
      <p className="explain-body">{copy.body}</p>
      <p className="explain-meta">
        최근 {rangeLabel} 기준 변동률{" "}
        <strong className={stat.direction}>{formatPercent(stat.changePercent)}</strong>
      </p>
    </section>
  );
}
