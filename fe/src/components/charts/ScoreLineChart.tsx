import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartShell from "./ChartShell";

interface ScorePoint {
  label: string;
  score: number;
}

interface ScoreLineChartProps {
  data: ScorePoint[];
  isDarkMode?: boolean;
}

export default function ScoreLineChart({ data, isDarkMode }: ScoreLineChartProps) {
  const axisColor = isDarkMode ? "#a1a1aa" : "#6b7280";
  const gridColor = isDarkMode ? "#27272a" : "#e5e7eb";

  return (
    <ChartShell
      title="Tren Skor Harian"
      subtitle="Rata-rata skor kuis 7 hari terakhir"
      isDarkMode={isDarkMode}
    >
      <div className="h-64" role="img" aria-label="Grafik garis rata-rata skor harian">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12, fontWeight: 700 }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: isDarkMode ? "#18181b" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#27272a" : "#e5e7eb"}`,
                borderRadius: 14,
                color: isDarkMode ? "#f4f4f5" : "#111827",
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              }}
              formatter={(value: number) => [`${value}%`, "Skor"]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: isDarkMode ? "#09090b" : "#ffffff" }}
              activeDot={{ r: 7, strokeWidth: 3, stroke: isDarkMode ? "#09090b" : "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
