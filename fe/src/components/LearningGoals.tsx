import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Save, Loader2, CheckCircle2, AlertCircle, Target, BookOpen, BarChart3 } from "lucide-react";
import { apiGet, apiPut } from "../services/apiClient";

interface ProfileData {
  id: number;
  username: string;
  daily_goal_minutes: number;
  goal_name: string | null;
  goal_intensity: number | null;
  goal_subjects: string | null;
}

interface LearningGoalsProps {
  isDarkMode: boolean;
  onBack: () => void;
  onGoalUpdated?: (data: { daily_goal_minutes: number; goal_name: string; goal_intensity: number; goal_subjects: string[] }) => void;
}

export default function LearningGoals({ isDarkMode, onBack, onGoalUpdated }: LearningGoalsProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [goalName, setGoalName] = useState("UTBK 2026");
  const [goalIntensity, setGoalIntensity] = useState(3);
  const [goalSubjects, setGoalSubjects] = useState<string[]>(["Matematika", "Fisika"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ success: boolean; data: ProfileData }>("/api/settings/profile")
      .then((res) => {
        setProfile(res.data);
        setDailyGoal(res.data.daily_goal_minutes);
        if (res.data.goal_name) setGoalName(res.data.goal_name);
        if (res.data.goal_intensity) setGoalIntensity(res.data.goal_intensity);
        if (res.data.goal_subjects) {
          try { setGoalSubjects(JSON.parse(res.data.goal_subjects)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      await apiPut("/api/settings/goal", {
        daily_goal_minutes: dailyGoal,
        goal_name: goalName,
        goal_intensity: goalIntensity,
        goal_subjects: JSON.stringify(goalSubjects),
      });
      onGoalUpdated?.({ daily_goal_minutes: dailyGoal, goal_name: goalName, goal_intensity: goalIntensity, goal_subjects: goalSubjects });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setError("Gagal menyimpan target");
    } finally {
      setIsSaving(false);
    }
  };

  const intensities = [
    { value: 1, label: "Santai", desc: "1-2 materi per hari", emoji: "🌱" },
    { value: 2, label: "Sedang", desc: "3-4 materi per hari", emoji: "🌿" },
    { value: 3, label: "Intensif", desc: "5-7 materi per hari", emoji: "🔥" },
    { value: 4, label: "Super Intensif", desc: "8+ materi per hari", emoji: "⚡" },
  ];

  const allSubjects = ["Matematika", "Fisika", "Biologi", "Kimia", "Bahasa Indonesia", "Bahasa Inggris", "UTBK / SNBT"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with back */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl transition ${
            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black">Target Belajar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Atur target belajarmu secara detail</p>
        </div>
      </div>

      {/* Nama Target */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Nama Target</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Beri nama target belajarmu</p>
          </div>
        </div>
        <input
          type="text"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          placeholder="Contoh: UTBK 2026, Persiapan SNBT, dll"
          className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
            isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
          }`}
        />
      </motion.div>

      {/* Durasi per Hari */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Durasi Belajar per Hari</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Berapa menit kamu akan belajar setiap hari</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={480}
            step={5}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={5}
              max={480}
              value={dailyGoal}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 5 && v <= 480) setDailyGoal(v);
              }}
              className={`w-16 text-center text-xl font-black bg-transparent border-b-2 outline-none ${
                isDarkMode ? "text-blue-400 border-zinc-600 focus:border-blue-400" : "text-blue-600 border-gray-300 focus:border-blue-600"
              }`}
            />
            <span className="text-sm font-bold text-gray-500">menit</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>5 menit</span>
          <span>480 menit</span>
        </div>
      </motion.div>

      {/* Intensitas (Goals Materi) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Intensitas Belajar</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Seberapa banyak target materi yang ingin kamu selesaikan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {intensities.map((item) => (
            <button
              key={item.value}
              onClick={() => setGoalIntensity(item.value)}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                goalIntensity === item.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                  : "border-transparent bg-gray-50 dark:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600"
              }`}
            >
              <span className="text-2xl block mb-1">{item.emoji}</span>
              <p className="font-bold text-xs">{item.label}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Fokus Mapel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Fokus Mata Pelajaran</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pilih mapel yang ingin kamu prioritaskan</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allSubjects.map((subject) => {
            const isSelected = goalSubjects.includes(subject);
            return (
              <button
                key={subject}
                onClick={() => {
                  if (isSelected) {
                    setGoalSubjects(goalSubjects.filter((s) => s !== subject));
                  } else {
                    setGoalSubjects([...goalSubjects, subject]);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                    : "bg-transparent text-gray-500 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tombol Simpan */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
        ) : saveSuccess ? (
          <><CheckCircle2 className="w-4 h-4" /> Tersimpan!</>
        ) : (
          <><Save className="w-4 h-4" /> Simpan Target</>
        )}
      </button>
    </div>
  );
}
