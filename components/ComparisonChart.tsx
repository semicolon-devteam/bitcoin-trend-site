"use client";

import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import type { LinePoint } from "@/lib/types";
import { COINS } from "@/lib/coins";

interface Props {
  btc: LinePoint[];
  eth: LinePoint[];
  intraday: boolean;
  theme: "light" | "dark";
}

const THEMES = {
  dark: { text: "#8b949e", grid: "#20262e", border: "#232a33" },
  light: { text: "#5b6573", grid: "#eaeef3", border: "#e3e8ef" },
};

function pct(v: number | undefined): string {
  if (v === undefined || Number.isNaN(v)) return "–";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export default function ComparisonChart({ btc, eth, intraday, theme }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const btcSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ethSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastCountRef = useRef(0);

  // Legend values follow the crosshair; default to the latest point.
  const [hover, setHover] = useState<{ btc?: number; eth?: number }>({});

  useEffect(() => {
    let disposed = false;
    const el = containerRef.current;
    if (!el) return;

    import("lightweight-charts").then(({ createChart, CrosshairMode, LineStyle }) => {
      if (disposed || !el) return;
      const chart = createChart(el, {
        width: el.clientWidth,
        height: el.clientHeight,
        layout: { background: { color: "transparent" }, textColor: THEMES[theme].text },
        grid: {
          vertLines: { color: THEMES[theme].grid },
          horzLines: { color: THEMES[theme].grid },
        },
        rightPriceScale: { borderColor: THEMES[theme].border },
        timeScale: {
          borderColor: THEMES[theme].border,
          timeVisible: intraday,
          secondsVisible: false,
        },
        crosshair: { mode: CrosshairMode.Magnet },
        localization: {
          priceFormatter: (p: number) => `${p > 0 ? "+" : ""}${p.toFixed(1)}%`,
        },
        handleScale: false,
        handleScroll: false,
      });

      const mkLine = (color: string) =>
        chart.addLineSeries({
          color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          baseLineStyle: LineStyle.Dotted,
        });

      const btcSeries = mkLine(COINS.btc.color);
      const ethSeries = mkLine(COINS.eth.color);

      chartRef.current = chart;
      btcSeriesRef.current = btcSeries;
      ethSeriesRef.current = ethSeries;

      if (btc.length) btcSeries.setData(btc as never);
      if (eth.length) ethSeries.setData(eth as never);
      chart.timeScale().fitContent();
      lastCountRef.current = btc.length;

      chart.subscribeCrosshairMove((param) => {
        if (!param.time) {
          setHover({});
          return;
        }
        const b = param.seriesData.get(btcSeries) as { value: number } | undefined;
        const e = param.seriesData.get(ethSeries) as { value: number } | undefined;
        setHover({ btc: b?.value, eth: e?.value });
      });

      const ro = new ResizeObserver(() => {
        if (el) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
      });
      ro.observe(el);
      (chart as unknown as { _ro?: ResizeObserver })._ro = ro;
    });

    return () => {
      disposed = true;
      const chart = chartRef.current as unknown as { _ro?: ResizeObserver } | null;
      chart?._ro?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      btcSeriesRef.current = null;
      ethSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data; re-fit only when the point count changes (range switch).
  useEffect(() => {
    const bs = btcSeriesRef.current;
    const es = ethSeriesRef.current;
    if (!bs || !es) return;
    if (btc.length) bs.setData(btc as never);
    if (eth.length) es.setData(eth as never);
    chartRef.current?.applyOptions({
      timeScale: { timeVisible: intraday, secondsVisible: false },
    });
    if (btc.length !== lastCountRef.current) {
      chartRef.current?.timeScale().fitContent();
      lastCountRef.current = btc.length;
    }
  }, [btc, eth, intraday]);

  // Re-theme without recreating the chart.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const t = THEMES[theme];
    chart.applyOptions({
      layout: { textColor: t.text },
      grid: { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
      rightPriceScale: { borderColor: t.border },
      timeScale: { borderColor: t.border },
    });
  }, [theme]);

  const btcVal = hover.btc ?? btc[btc.length - 1]?.value;
  const ethVal = hover.eth ?? eth[eth.length - 1]?.value;

  return (
    <div className="cmp-chart">
      <div className="cmp-legend">
        <span className="cmp-legend-item">
          <span className="cmp-dot" style={{ background: COINS.btc.color }} />
          비트코인 <strong>{pct(btcVal)}</strong>
        </span>
        <span className="cmp-legend-item">
          <span className="cmp-dot" style={{ background: COINS.eth.color }} />
          이더리움 <strong>{pct(ethVal)}</strong>
        </span>
      </div>
      <div ref={containerRef} className="chart-wrap" aria-label="비트코인·이더리움 비교 차트" />
    </div>
  );
}
