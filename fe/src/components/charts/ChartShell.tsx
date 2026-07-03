import React from "react";

interface ChartShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
  rightSlot?: React.ReactNode;
}

export default function ChartShell({ title, subtitle, children, isDarkMode, rightSlot }: ChartShellProps) {
  return (
    <section
      className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"
      }`}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-black text-base sm:text-lg">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}
