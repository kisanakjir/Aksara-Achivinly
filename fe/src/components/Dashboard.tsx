import React, { useEffect, useState } from "react";
import {
  Target, Clock, BookOpen
} from "lucide-react";
import { UserStats } from "../types";
import ActivityBarChart from "./charts/ActivityBarChart";
import ScoreLineChart from "./charts/ScoreLineChart";
import SubjectDonutChart from "./charts/SubjectDonutChart";
import { getDailyStats, getWeeklyStats, type DailyStatsData, type WeeklyStatsData } from "../services/statsApi";
import { getActivityGraph, getScoresGraph, getSubjectDistribution, type SubjectDistributionItem } from "../services/graphApi";

interface DashboardProps {
  stats: UserStats;
  onSetDailyGoal: (minutes: number) => void;
  onNavigate: (tab: string) => void;
  isDarkMode: boolean;
}

// Semua zona waktu global (UTC-12 sampai UTC+14)
const TIMEZONES = [
  { label: "UTC-12 (Baker Island)", value: "Etc/GMT+12", offset: -12 },
  { label: "UTC-11 (American Samoa)", value: "Pacific/Pago_Pago", offset: -11 },
  { label: "UTC-10 (Hawaii)", value: "Pacific/Honolulu", offset: -10 },
  { label: "UTC-9 (Alaska)", value: "America/Anchorage", offset: -9 },
  { label: "UTC-8 (Los Angeles)", value: "America/Los_Angeles", offset: -8 },
  { label: "UTC-7 (Denver)", value: "America/Denver", offset: -7 },
  { label: "UTC-6 (Chicago)", value: "America/Chicago", offset: -6 },
  { label: "UTC-5 (New York)", value: "America/New_York", offset: -5 },
  { label: "UTC-4 (Santiago)", value: "America/Santiago", offset: -4 },
  { label: "UTC-3 (Brasilia)", value: "America/Sao_Paulo", offset: -3 },
  { label: "UTC-2 (Fernando de Noronha)", value: "Etc/GMT+2", offset: -2 },
  { label: "UTC-1 (Azores)", value: "Atlantic/Azores", offset: -1 },
  { label: "UTC±0 (London)", value: "Europe/London", offset: 0 },
  { label: "UTC+1 (Paris/Berlin)", value: "Europe/Paris", offset: 1 },
  { label: "UTC+2 (Istanbul/Athens)", value: "Europe/Istanbul", offset: 2 },
  { label: "UTC+3 (Moscow)", value: "Europe/Moscow", offset: 3 },
  { label: "UTC+4 (Dubai)", value: "Asia/Dubai", offset: 4 },
  { label: "UTC+5 (Karachi)", value: "Asia/Karachi", offset: 5 },
  { label: "UTC+6 (Dhaka)", value: "Asia/Dhaka", offset: 6 },
  { label: "UTC+7 (WIB — Jakarta)", value: "Asia/Jakarta", offset: 7 },
  { label: "UTC+8 (WITA — Makassar)", value: "Asia/Makassar", offset: 8 },
  { label: "UTC+9 (WIT — Jayapura)", value: "Asia/Jayapura", offset: 9 },
  { label: "UTC+10 (Sydney)", value: "Australia/Sydney", offset: 10 },
  { label: "UTC+11 (Solomon Islands)", value: "Pacific/Guadalcanal", offset: 11 },
  { label: "UTC+12 (Auckland)", value: "Pacific/Auckland", offset: 12 },
  { label: "UTC+13 (Samoa)", value: "Pacific/Apia", offset: 13 },
  { label: "UTC+14 (Kiritimati)", value: "Pacific/Kiritimati", offset: 14 },
];

function getTimeInOffset(offset: number): { hours: string; minutes: string; seconds: string; dateStr: string } {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + offset * 3600000);
  return {
    hours: String(local.getHours()).padStart(2, "0"),
    minutes: String(local.getMinutes()).padStart(2, "0"),
    seconds: String(local.getSeconds()).padStart(2, "0"),
    dateStr: local.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

export default function Dashboard({ stats, onSetDailyGoal, onNavigate, isDarkMode }: DashboardProps) {
  const [dailyStats, setDailyStats] = useState<DailyStatsData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData | null>(null);
  const [activityChartData, setActivityChartData] = useState<{ day: string; minutes: number }[]>([]);
  const [scoreChartData, setScoreChartData] = useState<{ label: string; score: number }[]>([]);
  const [subjectDistribution, setSubjectDistribution] = useState<SubjectDistributionItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [tzOffset, setTzOffset] = useState(() => {
    const saved = localStorage.getItem("aksara_tz_offset");
    return saved ? Number(saved) : 7; // default WIB
  });
  const [clock, setClock] = useState(() => getTimeInOffset(7));

  // Jam digital real-time
  useEffect(() => {
    setClock(getTimeInOffset(tzOffset));
    const interval = setInterval(() => {
      setClock(getTimeInOffset(tzOffset));
    }, 1000);
    return () => clearInterval(interval);
  }, [tzOffset]);

  // Simpan preferensi zona waktu
  useEffect(() => {
    localStorage.setItem("aksara_tz_offset", String(tzOffset));
  }, [tzOffset]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoadingStats(true);
        setStatsError(null);

        const [dailyRes, weeklyRes, activityRes, scoreRes, distributionRes] = await Promise.all([
          getDailyStats(),
          getWeeklyStats(),
          getActivityGraph(),
          getScoresGraph(),
          getSubjectDistribution(),
        ]);

        if (!isMounted) return;

        setDailyStats(dailyRes.data);
        setWeeklyStats(weeklyRes.data);
        setActivityChartData(activityRes.data.labels.map((day, index) => ({
          day,
          minutes: activityRes.data.datasets[0]?.data[index] || 0,
        })));
        setScoreChartData(scoreRes.data.labels.map((label, index) => ({
          label,
          score: scoreRes.data.datasets[0]?.data[index] || 0,
        })));
        setSubjectDistribution(distributionRes.data);
      } catch (err) {
        if (!isMounted) return;
        setStatsError("Backend Python belum tersambung. Menampilkan data demo sementara.");
        setActivityChartData(stats.weeklyActivity.map(day => ({ day: day.day, minutes: day.minutes })));
        setScoreChartData(stats.weeklyActivity.map((day, index) => ({
          label: index === stats.weeklyActivity.length - 1 ? "Hari Ini" : `H-${stats.weeklyActivity.length - 1 - index}`,
          score: day.score,
        })));
        setSubjectDistribution([
          { subject: "Matematika", minutes: 45, percentage: 45, color: "#3b82f6" },
          { subject: "Fisika", minutes: 25, percentage: 25, color: "#ef4444" },
          { subject: "Biologi", minutes: 20, percentage: 20, color: "#22c55e" },
          { subject: "Kimia", minutes: 10, percentage: 10, color: "#a855f7" },
        ]);
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hitung progress dari userStats (accumulator — cuma nambah kalo fokus mapel)
  const intensityMaterials = [0, 2, 4, 7, 10]; // index = intensity level
  const targetMaterials = intensityMaterials[stats.goalIntensity] || 5;
  const completedMaterials = stats.dailyMaterialsCompleted;
  const materialProgress = Math.min(100, Math.round((completedMaterials / targetMaterials) * 100));

  const displayedDailyMinutes = stats.dailyMinutesCompleted;
  const displayedDailyGoal = stats.dailyGoalMinutes;
  const dailyGoalPercentage = Math.min(100, Math.round((displayedDailyMinutes / displayedDailyGoal) * 100));

  // Progress bulanan
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthlyTarget = targetMaterials * daysInMonth;
  const monthlyCompleted = stats.monthlyMaterialsCompleted;
  const monthlyProgress = monthlyTarget > 0 ? Math.min(100, Math.round((monthlyCompleted / monthlyTarget) * 100)) : 0;

  return (
    <div className="space-y-6" id="dashboard-container">

      {/* 1. Combined Stats Section */}
      <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border transition-all`}>
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left Column */}
          <div className="md:w-1/2 space-y-6">
             <h3 className="font-black text-xl mb-2">Statistik & Target Belajar</h3>

             {/* Nama Target */}
             <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                   <Target className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Belajar</p>
                   <p className="font-black text-base">{stats.goalName}</p>
                 </div>
               </div>
               <button
                 onClick={() => onNavigate("learning-goals")}
                 className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
               >
                 Ubah
               </button>
             </div>

             {/* Progress Materi + Durasi side by side */}
             <div className="grid grid-cols-2 gap-3">
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                 <div className="flex items-center gap-2 mb-2">
                   <BookOpen className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Materi</span>
                 </div>
                 <div className="text-2xl font-black">{completedMaterials} <span className="text-sm font-bold text-gray-400">/ {targetMaterials}</span></div>
                 <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${materialProgress}%` }} />
                 </div>
               </div>
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                 <div className="flex items-center gap-2 mb-2">
                   <Clock className="w-4 h-4 text-cyan-500" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Durasi</span>
                 </div>
                 <div className="text-2xl font-black">{displayedDailyMinutes} <span className="text-sm font-bold text-gray-400">/ {displayedDailyGoal} mnt</span></div>
                 <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${dailyGoalPercentage}%` }} />
                 </div>
               </div>
             </div>

             {/* Fokus Mata Pelajaran */}
             {stats.goalSubjects.length > 0 && (
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                 <div className="flex items-center gap-2 mb-2">
                   <BookOpen className="w-4 h-4 text-blue-500" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fokus Mapel</span>
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                   {stats.goalSubjects.map((s, i) => (
                     <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">{s}</span>
                   ))}
                 </div>
               </div>
             )}

             {/* Progress Bulanan — berdasarkan intensitas */}
             <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <BookOpen className="w-4 h-4 text-purple-500" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress Bulanan</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400">{monthlyTarget} materi/bulan</span>
               </div>
               <div className="flex items-end gap-3">
                 <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{monthlyProgress}%</div>
                 <div className="flex-1">
                   <div className="w-full h-2.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${monthlyProgress}%` }} />
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1">
                     {monthlyCompleted > 0
                       ? `${monthlyCompleted} dari ${monthlyTarget} materi terselesaikan`
                       : "Belum ada materi yang diselesaikan"}
                   </p>
                 </div>
               </div>
             </div>

             {/* Jam Digital — semua zona waktu global */}
             <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-gray-50 border-gray-100'}`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                     <Clock className="w-4 h-4" />
                   </div>
                   <div>
                     <div className="text-3xl font-black tracking-widest tabular-nums">
                       {clock.hours}:{clock.minutes}:{clock.seconds}
                     </div>
                     <p className="text-[10px] text-gray-400 font-medium mt-0.5">{clock.dateStr}</p>
                   </div>
                 </div>
                 {/* Selector zona waktu */}
                 <select
                   value={tzOffset}
                   onChange={(e) => setTzOffset(Number(e.target.value))}
                   className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                     isDarkMode ? "bg-zinc-700 border-zinc-600 text-gray-300" : "bg-white border-gray-200 text-gray-600"
                   }`}
                 >
                   {TIMEZONES.map((tz) => (
                     <option key={tz.value} value={tz.offset}>{tz.label}</option>
                   ))}
                 </select>
               </div>
             </div>

          </div>

          {/* Right Column: Weekly Chart */}
          <div className="md:w-1/2 flex flex-col justify-end">
            <ActivityBarChart data={activityChartData} isDarkMode={isDarkMode} />
          </div>

        </div>
      </div>

      {statsError && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-300">
          {statsError}
        </div>
      )}

      {isLoadingStats ? (
        <div className={`p-8 rounded-3xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-500">
            <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            Memuat statistik dari backend Python...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreLineChart data={scoreChartData} isDarkMode={isDarkMode} />
          <SubjectDonutChart data={subjectDistribution} isDarkMode={isDarkMode} />
        </div>
      )}

    </div>
  );
}
