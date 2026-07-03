import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartShell from "./ChartShell";

interface ActivityPoint {
  day: string;
  minutes: number;
}

interface ActivityBarChartProps {
  data: ActivityPoint[];
  isDarkMode?: boolean;
}

export default function ActivityBarChart({ data, isDarkMode }: ActivityBarChartProps) {
  const axisColor = isDarkMode ? "#a1a1aa" : "#6b7280";
  const gridColor = isDarkMode ? "#27272a" : "#e5e7eb";

  return (
    <ChartShell
      title="Aktivitas Mingguan"
      subtitle="Menit belajar per hari selama 7 hari terakhir"
      isDarkMode={isDarkMode}
    >
      <div className="h-64" role="img" aria-label="Grafik batang aktivitas mingguan">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12, fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: isDarkMode ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.06)" }}
              contentStyle={{
                background: isDarkMode ? "#18181b" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#27272a" : "#e5e7eb"}`,
                borderRadius: 14,
                color: isDarkMode ? "#f4f4f5" : "#111827",
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              }}
              formatter={(value: number) => [`${value} menit`, "Durasi"]}
              labelFormatter={(label) => `Hari ${label}`}
            />
            <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
