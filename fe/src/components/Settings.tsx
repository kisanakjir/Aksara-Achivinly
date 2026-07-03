import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Target, User, ChevronRight, Edit3, Moon, LogOut, Clock, BookOpen
} from "lucide-react";
import { apiGet } from "../services/apiClient";
import { useAuth } from "../contexts/AuthContext";

interface ProfileData {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  current_xp: number;
  xp_to_next_level: number;
  daily_goal_minutes: number;
  streak_days: number;
}

interface SettingsProps {
  isDarkMode: boolean;
  onNavigate?: (tab: string) => void;
}

export default function Settings({ isDarkMode, onNavigate }: SettingsProps) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<{ success: boolean; data: ProfileData }>("/api/settings/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black">Pengaturan</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Atur profil dan preferensi akunmu</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              profile?.username?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{profile?.display_name || profile?.username}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-bold">
              <span className="text-blue-600 dark:text-blue-400">Level {profile?.level || 1}</span>
              <span className="text-cyan-500">{profile?.current_xp || 0} XP</span>
              <span className="text-orange-500">{profile?.streak_days || 0} hr streak</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`rounded-3xl border divide-y overflow-hidden ${
          isDarkMode ? "bg-zinc-900 border-zinc-800 divide-zinc-800" : "bg-white shadow-sm border-gray-200 divide-gray-100"
        }`}
      >
        {/* Target Belajar Harian → navigasi ke halaman form */}
        <button
          onClick={() => onNavigate?.("learning-goals")}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition text-left"
        >
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Target Belajar Harian</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.daily_goal_minutes || 30} menit per hari</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Edit Profil */}
        <button
          onClick={() => onNavigate?.("edit-profile")}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition text-left"
        >
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <Edit3 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Edit Profil</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.display_name || profile?.username}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Mode Gelap/Terang — toggle */}
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600">
            <Moon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Mode Gelap</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isDarkMode ? "Aktif" : "Nonaktif"}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={() => {
                const newMode = !isDarkMode;
                document.documentElement.classList.toggle("dark", newMode);
                localStorage.setItem("aksara_dark_mode", String(newMode));
                // Trigger event biar state di App.tsx kebaca
                window.dispatchEvent(new Event("storage"));
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition text-left"
        >
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-red-500">Keluar</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{profile?.username}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
      </motion.div>
    </div>
  );
}
