"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { statFromCloses, toNormalizedLine, formatPercent } from "@/lib/analytics";
import { COINS } from "@/lib/coins";
import { RANGES, rangeByKey, fetchCloses, openCloseStream, mockCloses } from "@/lib/binance";
import type { ClosePoint, CoinId, DataSource, Direction, RangeKey } from "@/lib/types";
import ComparisonChart from "@/components/ComparisonChart";
import CoinSummary from "@/components/CoinSummary";
import TrendExplanation from "@/components/TrendExplanation";
import History from "@/components/History";
import MacroOutlook from "@/components/MacroOutlook";
import Faq from "@/components/Faq";

function directionWord(d: Direction): string {
  return d === "up" ? "오르는 중" : d === "down" ? "내리는 중" : "횡보 중";
}

function mergeTick(prev: ClosePoint[], tick: ClosePoint): ClosePoint[] {
  if (!prev.length) return prev;
  const last = prev[prev.length - 1];
  if (tick.time === last.time) return [...prev.slice(0, -1), tick];
  if (tick.time > last.time) return [...prev.slice(1), tick];
  return prev;
}

export default function Home() {
  const [rangeKey, setRangeKey] = useState<RangeKey>("1q");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [btcCloses, setBtcCloses] = useState<ClosePoint[]>([]);
  const [ethCloses, setEthCloses] = useState<ClosePoint[]>([]);
  const [source, setSource] = useState<DataSource>("live");
  const tickRef = useRef<Record<CoinId, number>>({ btc: 0, eth: 0 });

  const range = rangeByKey(rangeKey);

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as "light" | "dark") || "dark";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  }

  // Load both coins for the selected range; fall back to mock if unreachable.
  useEffect(() => {
    let cancelled = false;
    setBtcCloses([]);
    setEthCloses([]);
    Promise.all([fetchCloses("btc", range), fetchCloses("eth", range)])
      .then(([b, e]) => {
        if (cancelled) return;
        setBtcCloses(b);
        setEthCloses(e);
        setSource("live");
      })
      .catch(() => {
        if (cancelled) return;
        setBtcCloses(mockCloses("btc", range));
        setEthCloses(mockCloses("eth", range));
        setSource("mock");
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  // Realtime: update the latest point of each coin as trades stream in.
  useEffect(() => {
    if (source !== "live") return;
    const apply = (coin: CoinId, setter: typeof setBtcCloses) =>
      openCloseStream(coin, range, (tick) => {
        const now = Date.now();
        if (now - tickRef.current[coin] < 800) return;
        tickRef.current[coin] = now;
        setter((prev) => mergeTick(prev, tick));
      });
    const stopBtc = apply("btc", setBtcCloses);
    const stopEth = apply("eth", setEthCloses);
    return () => {
      stopBtc();
      stopEth();
    };
  }, [range, source]);

  const btcLine = useMemo(() => toNormalizedLine(btcCloses), [btcCloses]);
  const ethLine = useMemo(() => toNormalizedLine(ethCloses), [ethCloses]);
  const btcStat = useMemo(
    () => (btcCloses.length ? statFromCloses(btcCloses.map((c) => c.close)) : null),
    [btcCloses]
  );
  const ethStat = useMemo(
    () => (ethCloses.length ? statFromCloses(ethCloses.map((c) => c.close)) : null),
    [ethCloses]
  );

  const ready = btcStat && ethStat && btcLine.length > 0;

  return (
    <main className="page">
      <header className="topbar">
        <span className="logo">
          <span className="logo-mark">◎</span> Crypto Trend
        </span>
        <button className="theme-btn" onClick={toggleTheme} aria-label="테마 전환">
          {theme === "dark" ? "☀︎" : "☾"}
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">
          {source === "live" ? (
            <>
              <span className="live-dot" /> 실시간 · 바이낸스
            </>
          ) : (
            "샘플 데이터 (실시간 연결 실패)"
          )}
        </p>
        <h1>비트코인과 이더리움, 지금 어디로 가고 있나</h1>
        {ready ? (
          <p className="hero-summary">
            최근 {range.label} 동안 비트코인은{" "}
            <strong className={btcStat.direction}>{directionWord(btcStat.direction)}</strong>(
            {formatPercent(btcStat.changePercent)}), 이더리움은{" "}
            <strong className={ethStat.direction}>{directionWord(ethStat.direction)}</strong>(
            {formatPercent(ethStat.changePercent)})이에요.
          </p>
        ) : (
          <p className="hero-summary">시세를 불러오는 중…</p>
        )}
      </section>

      <div className="range-toggle" role="group" aria-label="기간 선택">
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={`range-btn ${rangeKey === r.key ? "active" : ""}`}
            onClick={() => setRangeKey(r.key)}
            aria-pressed={rangeKey === r.key}
          >
            {r.label}
          </button>
        ))}
      </div>

      <section className="chart-section">
        <div className="chart-head">
          <h2 className="section-title">
            가격 비교 차트 <span className="chart-sub">기간 시작=0% 기준 상대 변동</span>
          </h2>
        </div>
        {ready ? (
          <ComparisonChart btc={btcLine} eth={ethLine} intraday={range.intraday} theme={theme} />
        ) : (
          <div className="chart-wrap chart-loading">차트를 불러오는 중…</div>
        )}
        <p className="chart-caption">
          두 코인의 가격대가 크게 달라, 같은 출발선(0%)에서 얼마나 움직였는지를 비교해요.
        </p>
      </section>

      {ready && (
        <div className="summary-grid">
          <CoinSummary coin={COINS.btc} stat={btcStat} rangeLabel={range.label} />
          <CoinSummary coin={COINS.eth} stat={ethStat} rangeLabel={range.label} />
        </div>
      )}

      {ready && (
        <>
          <TrendExplanation coin={COINS.btc} stat={btcStat} rangeLabel={range.label} />
          <TrendExplanation coin={COINS.eth} stat={ethStat} rangeLabel={range.label} />
        </>
      )}

      <History />

      <MacroOutlook />

      <Faq />

      <section className="cta">
        <h2>이 흐름을 친구에게도 보여주세요</h2>
        <p>링크 하나면 누구나 바로 같은 차트와 해설을 볼 수 있어요.</p>
        <ShareButton />
      </section>

      <footer className="footer">
        <p>
          {source === "live"
            ? "시세 데이터: 바이낸스 공개 API. 학습용 데모이며 투자 조언이 아닙니다."
            : "샘플(mock) 데이터로 만든 학습용 데모입니다. 투자 조언이 아닙니다."}
        </p>
      </footer>
    </main>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "암호화폐 추세", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <button className="share-btn" onClick={share}>
      {copied ? "링크 복사됨 ✓" : "공유하기"}
    </button>
  );
}
