import type { Coin, CoinStat } from "@/lib/types";
import { formatUsd, formatPercent } from "@/lib/analytics";

interface Props {
  coin: Coin;
  stat: CoinStat;
  rangeLabel: string;
}

export default function CoinSummary({ coin, stat, rangeLabel }: Props) {
  return (
    <article className="coin-summary">
      <header className="coin-summary-head">
        <span className="coin-summary-mark" style={{ color: coin.color }}>
          {coin.symbol}
        </span>
        <span className="coin-summary-name">{coin.name}</span>
        <span className="coin-summary-ticker">{coin.ticker}</span>
      </header>
      <div className="coin-summary-price">{formatUsd(stat.current)}</div>
      <div className={`coin-summary-change ${stat.direction}`}>
        {formatPercent(stat.changePercent)}
        <span className="coin-summary-range">({rangeLabel})</span>
      </div>
      <div className="coin-summary-hl">
        <span>고점 {formatUsd(stat.high)}</span>
        <span>저점 {formatUsd(stat.low)}</span>
      </div>
    </article>
  );
}
