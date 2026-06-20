"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatUsd } from "@/lib/analytics";

interface Props {
  data: PricePoint[];
  direction: "up" | "down" | "flat";
}

const COLORS = {
  up: "#16c784",
  down: "#ea3943",
  flat: "#f0b90b",
};

function formatTick(date: string): string {
  const d = new Date(date);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PricePoint;
  return (
    <div className="tooltip">
      <span className="tooltip-date">{point.date}</span>
      <span className="tooltip-price">{formatUsd(point.price)}</span>
    </div>
  );
}

export default function PriceChart({ data, direction }: Props) {
  const color = COLORS[direction];
  const prices = data.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.12 || max * 0.05;

  return (
    <div className="chart-wrap" aria-label="비트코인 가격 라인 차트">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            minTickGap={36}
            tickMargin={10}
            stroke="var(--axis)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
            width={48}
            stroke="var(--axis)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#priceFill)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
