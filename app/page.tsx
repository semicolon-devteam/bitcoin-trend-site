"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { summarize, formatUsd, formatPercent } from "@/lib/analytics";
import { COINS, COIN_LIST } from "@/lib/coins";
import { fetchCandles, openCandleStream, mockCandles } from "@/lib/binance";
import type { Candle, CoinId, DataSource, PricePoint, RangeKey } from "@/lib/types";
import CandleChart from "@/components/CandleChart";
import IndicatorCards from "@/components/IndicatorCards";
import TrendExplanation from "@/components/TrendExplanation";
import Faq from "@/components/Faq";

function candlesToPoints(candles: Candle[]): PricePoint[] {
  return candles.map((c) => ({ date: c.time, price: c.close }));
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "30", label: "30일" },
  { key: "90", label: "90일" },
];

export default function Home() {
  const [coinId, setCoinId] = useState<CoinId>("btc");
  const [range, setRange] = useState<RangeKey>("30");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [source, setSource] = useState<DataSource>("live");
  const tickRef = useRef(0);

  const coin = COINS[coinId];
  const days = Number(range);

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

  // Load historical candles from Binance; fall back to mock if unreachable.
  useEffect(() => {
    let cancelled = false;
    setCandles([]);
    fetchCandles(coinId, days)
      .then((c) => {
        if (cancelled) return;
        setCandles(c);
        setSource("live");
      })
      .catch(() => {
        if (cancelled) return;
        setCandles(mockCandles(coinId, days));
        setSource("mock");
      });
    return () => {
      cancelled = true;
    };
  }, [coinId, days]);

  // Realtime: update the most recent candle as new trades stream in.
  useEffect(() => {
    if (source !== "live") return;
    const stop = openCandleStream(coinId, (live) => {
      const now = Date.now();
      if (now - tickRef.current < 800) return; // throttle UI updates
      tickRef.current = now;
      setCandles((prev) => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        if (live.time === last.time) {
          return [...prev.slice(0, -1), live];
        }
        if (live.time > last.time) {
          return [...prev.slice(1), live];
        }
        return prev;
      });
    });
    return stop;
  }, [coinId, source]);

  const points = useMemo(() => candlesToPoints(candles), [candles]);
  const summary = useMemo(
    () => (points.length ? summarize(points) : null),
    [points]
  );

  return (
    <main className="page">
      <header className="topbar">
        <span className="logo">
          <span className="logo-mark">{coin.symbol}</span> Crypto Trend
        </span>
        <button className="theme-btn" onClick={toggleTheme} aria-label="테마 전환">
          {theme === "dark" ? "☀︎" : "☾"}
        </button>
      </header>

      <div className="coin-tabs" role="group" aria-label="코인 선택">
        {COIN_LIST.map((c) => (
          <button
            key={c.id}
            className={`coin-tab ${coinId === c.id ? "active" : ""}`}
            onClick={() => setCoinId(c.id)}
            aria-pressed={coinId === c.id}
          >
            <span className="coin-tab-mark">{c.symbol}</span>
            {c.name}
            <span className="coin-tab-ticker">{c.ticker}</span>
          </button>
        ))}
      </div>

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
        <h1>{coin.name}, 지금 어디로 가고 있나</h1>
        {summary ? (
          <p className="hero-summary">
            최근 {summary.rangeDays}일 동안 {coin.name}은{" "}
            <strong className={summary.direction}>
              {summary.direction === "up" ? "오르는 중" : summary.direction === "down" ? "내리는 중" : "횡보 중"}
            </strong>
            이에요. 현재가 {formatUsd(summary.current)}, 변동률{" "}
            <strong className={summary.direction}>{formatPercent(summary.changePercent)}</strong>.
          </p>
        ) : (
          <p className="hero-summary">시세를 불러오는 중…</p>
        )}
      </section>

      {summary && <IndicatorCards summary={summary} />}

      <section className="chart-section">
        <div className="chart-head">
          <h2 className="section-title">
            가격 차트 <span className="chart-sub">OHLC 캔들</span>
          </h2>
          <div className="toggle" role="group" aria-label="기간 선택">
            {RANGES.map((r) => (
              <button
                key={r.key}
                className={`toggle-btn ${range === r.key ? "active" : ""}`}
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {candles.length ? (
          <CandleChart candles={candles} theme={theme} />
        ) : (
          <div className="chart-wrap chart-loading">차트를 불러오는 중…</div>
        )}
      </section>

      {summary && <TrendExplanation summary={summary} />}

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
