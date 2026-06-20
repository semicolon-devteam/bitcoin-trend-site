"use client";

import { useEffect, useRef } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import type { Candle } from "@/lib/types";

interface Props {
  candles: Candle[];
  theme: "light" | "dark";
}

const THEMES = {
  dark: { bg: "#161b22", text: "#8b949e", grid: "#20262e", border: "#232a33" },
  light: { bg: "#ffffff", text: "#5b6573", grid: "#eaeef3", border: "#e3e8ef" },
};

const UP = "#16c784";
const DOWN = "#ea3943";

export default function CandleChart({ candles, theme }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastCountRef = useRef(0);

  // Create the chart once.
  useEffect(() => {
    let disposed = false;
    const el = containerRef.current;
    if (!el) return;

    import("lightweight-charts").then(({ createChart, CrosshairMode }) => {
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
        timeScale: { borderColor: THEMES[theme].border, timeVisible: false },
        crosshair: { mode: CrosshairMode.Normal },
        handleScale: false,
        handleScroll: false,
      });
      const series = chart.addCandlestickSeries({
        upColor: UP,
        downColor: DOWN,
        borderUpColor: UP,
        borderDownColor: DOWN,
        wickUpColor: UP,
        wickDownColor: DOWN,
      });

      chartRef.current = chart;
      seriesRef.current = series;

      if (candles.length) {
        series.setData(candles as never);
        chart.timeScale().fitContent();
        lastCountRef.current = candles.length;
      }

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
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push new data. Re-fit only when the candle count changes (coin/range switch),
  // not on every realtime tick.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !candles.length) return;
    series.setData(candles as never);
    if (candles.length !== lastCountRef.current) {
      chartRef.current?.timeScale().fitContent();
      lastCountRef.current = candles.length;
    }
  }, [candles]);

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

  return <div ref={containerRef} className="chart-wrap" aria-label="OHLC 캔들 차트" />;
}
