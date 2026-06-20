"use client";

import { useMemo, useState, useEffect } from "react";
import { getPriceHistory } from "@/lib/mockData";
import { summarize, formatUsd, formatPercent } from "@/lib/analytics";
import type { RangeKey } from "@/lib/types";
import PriceChart from "@/components/PriceChart";
import IndicatorCards from "@/components/IndicatorCards";
import TrendExplanation from "@/components/TrendExplanation";
import Faq from "@/components/Faq";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "30", label: "30일" },
  { key: "90", label: "90일" },
];

export default function Home() {
  const [range, setRange] = useState<RangeKey>("30");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

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

  const data = useMemo(() => getPriceHistory(Number(range)), [range]);
  const summary = useMemo(() => summarize(data), [data]);

  return (
    <main className="page">
      <header className="topbar">
        <span className="logo">
          <span className="logo-mark">₿</span> BTC Trend
        </span>
        <button className="theme-btn" onClick={toggleTheme} aria-label="테마 전환">
          {theme === "dark" ? "☀︎" : "☾"}
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">학습용 · mock 데이터</p>
        <h1>비트코인, 지금 어디로 가고 있나</h1>
        <p className="hero-summary">
          최근 {summary.rangeDays}일 동안 비트코인은{" "}
          <strong className={summary.direction}>
            {summary.direction === "up" ? "오르는 중" : summary.direction === "down" ? "내리는 중" : "횡보 중"}
          </strong>
          이에요. 현재가 {formatUsd(summary.current)}, 변동률{" "}
          <strong className={summary.direction}>{formatPercent(summary.changePercent)}</strong>.
        </p>
      </section>

      <IndicatorCards summary={summary} />

      <section className="chart-section">
        <div className="chart-head">
          <h2 className="section-title">가격 차트</h2>
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
        <PriceChart data={data} direction={summary.direction} />
      </section>

      <TrendExplanation summary={summary} />

      <Faq />

      <section className="cta">
        <h2>이 흐름을 친구에게도 보여주세요</h2>
        <p>링크 하나면 누구나 바로 같은 차트와 해설을 볼 수 있어요.</p>
        <ShareButton />
      </section>

      <footer className="footer">
        <p>샘플(mock) 데이터로 만든 학습용 데모입니다. 투자 조언이 아닙니다.</p>
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
        await navigator.share({ title: "비트코인 추세", url });
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
