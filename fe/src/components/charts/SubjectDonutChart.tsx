import React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ChartShell from "./ChartShell";

interface SubjectDistributionPoint {
  subject: string;
  minutes: number;
  percentage: number;
  color: string;
}

interface SubjectDonutChartProps {
  data: SubjectDistributionPoint[];
  isDarkMode?: boolean;
}

const fallbackColors = ["#3b82f6", "#a855f7", "#22c55e", "#f59e0b", "#ec4899", "#ef4444"];

export default function SubjectDonutChart({ data, isDarkMode }: SubjectDonutChartProps) {
  const chartData = data.length > 0 ? data : [{ subject: "Belum ada data", minutes: 1, percentage: 100, color: "#94a3b8" }];
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <ChartShell
      title="Distribusi Mapel"
      subtitle="Persentase waktu belajar per mata pelajaran"
      isDarkMode={isDarkMode}
      rightSlot={
        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
          {totalMinutes} mnt
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-56" role="img" aria-label="Grafik donat distribusi waktu belajar per mata pelajaran">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="minutes"
                nameKey="subject"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                stroke={isDarkMode ? "#18181b" : "#ffffff"}
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.subject}`} fill={entry.color || fallbackColors[index % fallbackColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: isDarkMode ? "#18181b" : "#ffffff",
                  border: `1px solid ${isDarkMode ? "#27272a" : "#e5e7eb"}`,
                  borderRadius: 14,
                  color: isDarkMode ? "#f4f4f5" : "#111827",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                }}
                formatter={(value: number, _name, item: any) => [`${value} menit (${item.payload.percentage}%)`, item.payload.subject]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat belajar. Selesaikan materi untuk melihat distribusi mapel.</p>
          ) : (
            data.map((item, index) => (
              <div key={item.subject} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || fallbackColors[index % fallbackColors.length] }}
                  />
                  <span className="font-bold truncate">{item.subject}</span>
                </div>
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 shrink-0">
                  {item.percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </ChartShell>
  );
}
