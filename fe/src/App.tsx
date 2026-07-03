import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, BookOpen, GraduationCap, Gamepad2, MessageSquare,
  Sun, Moon, LayoutDashboard, Brain, Flame, Bot, Settings, LogOut, Target, Zap
} from "lucide-react";

import { UserStats } from "./types";
import Dashboard from "./components/Dashboard";
import Learn from "./components/Learn";
import Quiz from "./components/Quiz";
import GameZone from "./components/GameZone";
import Forum from "./components/Forum";
import Leaderboard from "./components/Leaderboard";
import AiChat from "./components/AiChat";
import SettingsPage from "./components/Settings";
import LearningGoals from "./components/LearningGoals";
import EditProfile from "./components/EditProfile";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import { useAuth } from "./contexts/AuthContext";

function IqReportView({ stats, isDarkMode }: { stats: UserStats, isDarkMode: boolean }) {
  const subjects = [
    { name: "Logika Matematika", score: 92, type: "UTBK", icon: Brain, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800/50" },
    { name: "Pemahaman Literasi", score: 88, type: "Kuis", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50" },
    { name: "Kecepatan Analisis", score: 95, type: "Game", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800/50" },
    { name: "Penalaran Umum", score: 85, type: "UTBK", icon: Target, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800/50" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-4xl mx-auto p-6 sm:p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden mt-8 ${
        isDarkMode ? 'bg-zinc-900/80 border-zinc-800 shadow-black/50 backdrop-blur-xl' : 'bg-white/80 border-white shadow-indigo-100/50 backdrop-blur-xl'
      }`}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center relative z-10 mb-12">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6"
        >
          <Brain className="w-16 h-16 text-blue-600 dark:text-blue-400 drop-shadow-md" />
        </motion.div>
        <h2 className="text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Analitik Kognitif IQ</h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Laporan cerdas berbasis AI yang mengevaluasi performa Anda secara real-time dari Tryout UTBK, Kuis Latihan, dan Arena Game.
        </p>
        
        <div className="mt-8 inline-block relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm">
            {stats.iqScoreEstimate || "Menghitung..."}
          </div>
          <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">Estimasi IQ Kognitif</div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Distribusi Kemampuan</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((sub, i) => (
            <motion.div 
              key={sub.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-2xl border ${sub.bg} ${sub.border} flex items-center gap-5 transition-transform hover:-translate-y-1`}
            >
              <div className={`p-3 rounded-xl bg-white dark:bg-zinc-950 shadow-sm ${sub.color}`}>
                <sub.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{sub.type}</span>
                  <span className={`text-sm font-black ${sub.color}`}>{sub.score}/100</span>
                </div>
                <h4 className="font-bold text-base mb-2">{sub.name}</h4>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.score}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                    className={`h-full ${sub.color.replace('text-', 'bg-')}`}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("aksara_dark_mode");
    return saved !== null ? saved === "true" : true; // default dark mode
  });
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [navMode, setNavMode] = useState<"full" | "assistive">("full");
  const [isAssistiveOpen, setIsAssistiveOpen] = useState(false);
  const [accMode, setAccMode] = useState<"none" | "exp" | "streak">("none");

  const [userStats, setUserStats] = useState<UserStats>({
    username: user?.display_name || user?.username || "Pengguna",
    avatar_url: user?.avatar_url || null,
    level: user?.level || 1,
    currentXp: user?.current_xp || 0,
    xpToNextLevel: user?.xp_to_next_level || 1000,
    streakDays: user?.streak_days || 0,
    dailyGoalMinutes: 30,
    goalName: "UTBK 2026",
    goalIntensity: 3,
    goalSubjects: ["Matematika", "Fisika"],
    dailyMinutesCompleted: 0,
    dailyMaterialsCompleted: 0,
    monthlyMaterialsCompleted: 0,
    monthlyMinutesCompleted: 0,
    currentMonth: new Date().toISOString().slice(0, 7),
    totalQuestionsSolved: user?.total_questions_solved || 0,
    iqScoreEstimate: 128,
    averageScores: {
      daily: 85,
      weekly: 82,
      monthly: 79
    },
    weeklyActivity: [
      { day: "Sen", minutes: 20, score: 75 },
      { day: "Sel", minutes: 45, score: 85 },
      { day: "Rab", minutes: 15, score: 80 },
      { day: "Kam", minutes: 30, score: 90 },
      { day: "Jum", minutes: 0, score: 0 },
      { day: "Sab", minutes: 40, score: 88 },
      { day: "Min", minutes: 15, score: 85 }
    ],
    badges: [
      { id: "b_1", name: "Inisiasi Aksara", description: "Menyelesaikan pendaftaran dan kuis orientasi pertama.", icon: "GraduationCap", rarity: "Common", unlockedAt: "2026-06-25" },
      { id: "b_2", name: "Fokus Disiplin", description: "Belajar 3 hari berturut-turut tanpa jeda.", icon: "Flame", rarity: "Common", unlockedAt: "2026-06-28" },
      { id: "b_3", name: "Master Aljabar", description: "Menjawab kuis Matematika UTBK tingkat advanced dengan nilai 100%.", icon: "Award", rarity: "Rare", unlockedAt: "2026-06-29" },
      { id: "b_4", name: "Pejuang Militan", description: "Mencapai Level 10 di peta petualangan Aksara EdTech.", icon: "Trophy", rarity: "Epic" },
      { id: "b_5", name: "Otak Einstein", description: "Mencapai estimasi Cognitive Report di atas 130 IQ.", icon: "Sparkles", rarity: "Legendary" }
    ]
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("aksara_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  // Sinkronisasi dark mode dari Settings (localStorage berubah dari tab/komponen lain)
  useEffect(() => {
    const checkStorage = () => {
      const saved = localStorage.getItem("aksara_dark_mode");
      if (saved !== null) {
        const shouldBeDark = saved === "true";
        if (shouldBeDark !== isDarkMode) {
          setIsDarkMode(shouldBeDark);
        }
      }
    };
    window.addEventListener("focus", checkStorage);
    window.addEventListener("storage", checkStorage);
    return () => {
      window.removeEventListener("focus", checkStorage);
      window.removeEventListener("storage", checkStorage);
    };
  }, [isDarkMode]);

  // Sync user data from auth ke userStats
  useEffect(() => {
    if (user) {
      setUserStats(prev => ({
        ...prev,
        username: user.display_name || user.username,
        avatar_url: user.avatar_url || null,
        goalName: (user as any).goal_name || "UTBK 2026",
        goalIntensity: (user as any).goal_intensity || 3,
        goalSubjects: (user as any).goal_subjects ? JSON.parse((user as any).goal_subjects) : ["Matematika", "Fisika"],
        level: user.level,
        currentXp: user.current_xp,
        xpToNextLevel: user.xp_to_next_level,
        streakDays: user.streak_days,
        totalQuestionsSolved: user.total_questions_solved,
      }));
    }
  }, [user]);

  // Jika masih loading auth, tampilkan spinner
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-zinc-950" : "bg-gray-50"}`}>
        <div className="inline-flex items-center gap-3 text-sm font-bold text-gray-500">
          <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Memuat...
        </div>
      </div>
    );
  }

  // Jika belum login, tampilkan halaman auth
  if (!isAuthenticated) {
    document.documentElement.classList.toggle("dark", isDarkMode);
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-stars text-zinc-100" : "bg-golden-waves text-zinc-900"}`} id="app-container">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 shadow-lg text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        {authPage === "login" ? (
          <LoginPage onSwitchToRegister={() => setAuthPage("register")} isDarkMode={isDarkMode} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthPage("login")} isDarkMode={isDarkMode} />
        )}
      </div>
    );
  }

  const syncLeaderboard = async (updatedStats: UserStats) => {
    try {
      await fetch("/api/leaderboard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: updatedStats.username,
          xp: updatedStats.currentXp,
          level: updatedStats.level,
          badgeCount: updatedStats.badges.filter(b => b.unlockedAt).length
        })
      });
    } catch (err) {}
  };

  const handleCompleteMaterial = (xpReward: number, durationMinutes: number, materialCategory?: string) => {
    setUserStats(prev => {
      // Cek apakah materi ini masuk fokus mapel user
      const isFocusSubject = !materialCategory || prev.goalSubjects.includes(materialCategory);

      let nextXp = prev.currentXp + xpReward;
      let nextLevel = prev.level;
      let nextXpToNextLevel = prev.xpToNextLevel;

      if (nextXp >= nextXpToNextLevel) {
        nextLevel += 1;
        nextXp = nextXp - nextXpToNextLevel;
        nextXpToNextLevel = Math.round(nextXpToNextLevel * 1.2);
      }

      // Deteksi reset harian
      const today = new Date().toDateString();
      // Deteksi reset bulanan
      const nowMonth = new Date().toISOString().slice(0, 7);
      const isNewMonth = nowMonth !== prev.currentMonth;
      const monthlyMaterials = isNewMonth ? 0 : prev.monthlyMaterialsCompleted;
      const monthlyMinutes = isNewMonth ? 0 : prev.monthlyMinutesCompleted;
      const dailyMaterials = isNewMonth ? 0 : prev.dailyMaterialsCompleted;
      const dailyMinutes = isNewMonth ? 0 : prev.dailyMinutesCompleted;

      const updated = {
        ...prev,
        currentXp: nextXp,
        level: nextLevel,
        xpToNextLevel: nextXpToNextLevel,
        currentMonth: nowMonth,
        dailyMinutesCompleted: isFocusSubject ? dailyMinutes + durationMinutes : dailyMinutes,
        dailyMaterialsCompleted: isFocusSubject ? dailyMaterials + 1 : dailyMaterials,
        monthlyMaterialsCompleted: isFocusSubject ? monthlyMaterials + 1 : monthlyMaterials,
        monthlyMinutesCompleted: isFocusSubject ? monthlyMinutes + durationMinutes : monthlyMinutes,
      };
      syncLeaderboard(updated);
      return updated;
    });
  };

  const handleCompleteQuiz = (xpEarned: number, accuracyScore: number, solvedCount: number) => {
    setUserStats(prev => {
      let nextXp = prev.currentXp + xpEarned;
      let nextLevel = prev.level;
      let nextXpToNextLevel = prev.xpToNextLevel;

      if (nextXp >= nextXpToNextLevel) {
        nextLevel += 1;
        nextXp = nextXp - nextXpToNextLevel;
        nextXpToNextLevel = Math.round(nextXpToNextLevel * 1.2);
      }
      const updatedBadges = [...prev.badges];
      if (accuracyScore === 100 && !updatedBadges[4].unlockedAt) {
        updatedBadges[4].unlockedAt = new Date().toISOString().split("T")[0];
      }
      const updated = {
        ...prev,
        currentXp: nextXp,
        level: nextLevel,
        xpToNextLevel: nextXpToNextLevel,
        totalQuestionsSolved: prev.totalQuestionsSolved + solvedCount,
        averageScores: {
          ...prev.averageScores,
          daily: Math.round((prev.averageScores.daily + accuracyScore) / 2)
        },
        badges: updatedBadges
      };
      syncLeaderboard(updated);
      return updated;
    });
  };

  const handleEarnXp = (xpReward: number) => {
    setUserStats(prev => {
      let nextXp = prev.currentXp + xpReward;
      let nextLevel = prev.level;
      let nextXpToNextLevel = prev.xpToNextLevel;

      if (nextXp >= nextXpToNextLevel) {
        nextLevel += 1;
        nextXp = nextXp - nextXpToNextLevel;
        nextXpToNextLevel = Math.round(nextXpToNextLevel * 1.2);
      }
      const updatedBadges = [...prev.badges];
      if (nextLevel >= 13 && !updatedBadges[3].unlockedAt) {
        updatedBadges[3].unlockedAt = new Date().toISOString().split("T")[0];
      }
      const updated = {
        ...prev,
        currentXp: nextXp,
        level: nextLevel,
        xpToNextLevel: nextXpToNextLevel,
        badges: updatedBadges
      };
      syncLeaderboard(updated);
      return updated;
    });
  };

  const handleSetDailyGoal = (minutes: number) => {
    setUserStats(prev => ({ ...prev, dailyGoalMinutes: minutes }));
  };

  const handleGoalUpdated = (data: { daily_goal_minutes: number; goal_name: string; goal_intensity: number; goal_subjects: string[] }) => {
    setUserStats(prev => ({
      ...prev,
      dailyGoalMinutes: data.daily_goal_minutes,
      goalName: data.goal_name,
      goalIntensity: data.goal_intensity,
      goalSubjects: data.goal_subjects,
    }));
  };

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Beranda" },
    { id: "learn", icon: BookOpen, label: "Materi" },
    { id: "quiz", icon: GraduationCap, label: "Kuis" },
    { id: "game", icon: Gamepad2, label: "Petualangan" },
    { id: "forum", icon: MessageSquare, label: "Diskusi" },
    { id: "leaderboard", icon: Trophy, label: "Peringkat" },
    { id: "ai_chat", icon: Bot, label: "AI Pribadi" }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 overflow-x-hidden ${
      isDarkMode ? "bg-stars text-zinc-100" : "bg-golden-waves text-zinc-900"
    }`} id="app-container">
      
      {/* ASSISTIVE TOUCH (Floating Interactive Logo) */}
      <AnimatePresence>
        {navMode === "assistive" && (
          <motion.div
            drag
            dragConstraints={{ top: 0, left: 0, right: window.innerWidth - 60, bottom: window.innerHeight - 60 }}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-24 left-4 z-[70] flex flex-col items-center gap-2"
          >
            <div className="relative">
              <button 
                onClick={() => setIsAssistiveOpen(!isAssistiveOpen)}
                onContextMenu={(e) => { e.preventDefault(); setNavMode("full"); setIsAssistiveOpen(false); }}
                className="w-14 h-14 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-700 shadow-2xl rounded-full flex items-center justify-center cursor-move"
                title="Tahan/Klik Kanan untuk kembali"
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </button>

              <AnimatePresence>
                {isAssistiveOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute top-16 left-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-zinc-700/50 shadow-2xl rounded-2xl p-2 w-48 flex flex-col gap-1 z-[80]"
                  >
                    {tabs.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsAssistiveOpen(false); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          activeTab === item.id 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                    <div className="h-px w-full bg-gray-200 dark:bg-zinc-800 my-1"></div>
                    <p className="text-[9px] text-center text-gray-400 p-1">Tahan/Klik Kanan Logo u/ Normal</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL HEADER (Brand, Dynamic Island, Profile) */}
      <AnimatePresence>
        {navMode === "full" && (
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-0 right-0 z-50 flex items-start justify-between px-4 sm:px-8 pointer-events-none"
          >
            
            {/* Left: Brand (Click to enter Assistive Mode) */}
            <div 
              onClick={() => setNavMode("assistive")}
              className="pointer-events-auto flex items-center gap-2 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 shadow-lg rounded-full p-2 pr-4 cursor-pointer hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Aktifkan Mode Floating (Tombol)"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-black text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 hidden sm:block">
                Aksara
              </span>
            </div>

            {/* Center: Dynamic Island Carousel (Desktop Only) */}
            <nav className="pointer-events-auto mx-auto bg-white/80 dark:bg-zinc-800/80 backdrop-blur-2xl border border-gray-200/50 dark:border-zinc-700/50 shadow-2xl rounded-full p-1.5 hidden md:flex items-center gap-1 max-w-[50vw] overflow-x-auto hide-scrollbar">
              {tabs.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    activeTab === item.id 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                      : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                  }`}
                  title={item.label}
                >
                  <item.icon className="w-4 h-4" />
                  <span className={activeTab === item.id ? "block" : "hidden lg:block whitespace-nowrap"}>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right: Profile & Toggles */}
            <div className="pointer-events-auto flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 shadow-lg rounded-full p-1.5 pl-3">
              
              {/* Acc Section Inline Animation */}
              <div className="relative flex items-center gap-2">
                <div 
                  onClick={() => setAccMode(accMode === "exp" ? "none" : "exp")}
                  className={`flex-col items-end relative flex mr-1 cursor-pointer transition-all p-1.5 rounded-xl ${accMode === 'exp' ? 'bg-cyan-500/10 border border-cyan-500/50 animate-frost' : 'hover:opacity-80'}`}
                >
                    {accMode === "exp" ? (
                      <div className="flex flex-col items-end whitespace-nowrap min-w-[70px]">
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest leading-none mb-0.5">{Math.round((userStats.currentXp / userStats.xpToNextLevel) * 100)}% XP</span>
                        <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 leading-none">{userStats.currentXp} / {userStats.xpToNextLevel}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold hidden sm:block">{userStats.username}</span>
                        <div className="w-12 sm:w-16 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mt-0.5 overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${(userStats.currentXp / userStats.xpToNextLevel) * 100}%` }} />
                        </div>
                      </div>
                    )}
                </div>
                
                <div 
                  onClick={() => setAccMode(accMode === "streak" ? "none" : "streak")}
                  className={`relative flex items-center gap-2 cursor-pointer transition-all p-1 rounded-full ${accMode === 'streak' ? 'bg-orange-500/10 border border-orange-500/50 animate-fire pr-3 overflow-hidden' : 'hover:scale-105'}`}
                >
                  {accMode === "streak" && (
                    <div className="real-fire-container">
                      <div className="real-flame" style={{ left: '0%', animationDelay: '0s', width: '20px', height: '20px' }}></div>
                      <div className="real-flame" style={{ left: '20%', animationDelay: '0.4s' }}></div>
                      <div className="real-flame" style={{ left: '40%', animationDelay: '0.2s', width: '30px', height: '30px' }}></div>
                      <div className="real-flame" style={{ left: '60%', animationDelay: '0.7s' }}></div>
                      <div className="real-flame" style={{ left: '80%', animationDelay: '0.1s', width: '15px', height: '15px' }}></div>
                    </div>
                  )}
                  <div className={`relative w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white z-10 overflow-hidden ${userStats.streakDays >= 3 ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]' : 'bg-blue-600'}`}>
                    {userStats.streakDays >= 3 && <Flame className="absolute -top-2 -right-2 w-4 h-4 text-orange-400 animate-bounce pointer-events-none" />}
                    {userStats.avatar_url ? (
                      <img src={userStats.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userStats.username.charAt(0)
                    )}
                  </div>
                  {accMode === "streak" && (
                    <span className="text-xs font-black text-orange-500 drop-shadow-sm whitespace-nowrap z-10">🔥 {userStats.streakDays} Hr</span>
                  )}
                </div>
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1 hidden sm:block"></div>

              <button
                onClick={() => setActiveTab("iq_report")}
                className={`p-2 rounded-full hidden sm:block transition ${activeTab === 'iq_report' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400'}`}
                title="Laporan IQ"
              >
                <Brain className="w-4.5 h-4.5" />
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400 transition"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`p-2 rounded-full transition ${activeTab === 'settings' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400'}`}
                title="Pengaturan"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400 transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {navMode === "full" && (
          <motion.nav 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 shadow-2xl rounded-2xl p-2 flex items-center justify-between overflow-x-auto hide-scrollbar"
          >
              {tabs.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all shrink-0 ${
                    activeTab === item.id 
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
                </button>
              ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* BODY CONTENT (Padding Top for fixed header) */}
      <main className="pt-28 pb-24 md:pb-12 max-w-7xl mx-auto px-4 sm:px-8" id="app-body">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <Dashboard stats={userStats} onSetDailyGoal={handleSetDailyGoal} isDarkMode={isDarkMode} onNavigate={setActiveTab} />
            </motion.div>
          )}

          {activeTab === "learn" && (
            <motion.div key="learn" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <Learn onCompleteMaterial={handleCompleteMaterial} isDarkMode={isDarkMode} userLevel={userStats.level} />
            </motion.div>
          )}

          {activeTab === "quiz" && (
            <motion.div key="quiz" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <Quiz onCompleteQuiz={handleCompleteQuiz} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === "game" && (
            <motion.div key="game" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <GameZone onEarnXp={handleEarnXp} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === "forum" && (
            <motion.div key="forum" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <Forum username={userStats.username} userLevel={userStats.level} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <Leaderboard stats={userStats} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === "ai_chat" && (
            <motion.div key="ai_chat" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="h-[75vh]">
              <AiChat />
            </motion.div>
          )}

          {activeTab === "iq_report" && (
            <motion.div key="iq_report" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}>
              <IqReportView stats={userStats} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <SettingsPage isDarkMode={isDarkMode} onNavigate={setActiveTab} />
            </motion.div>
          )}

          {activeTab === "learning-goals" && (
            <motion.div key="learning-goals" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <LearningGoals isDarkMode={isDarkMode} onBack={() => setActiveTab("settings")} onGoalUpdated={handleGoalUpdated} />
            </motion.div>
          )}

          {activeTab === "edit-profile" && (
            <motion.div key="edit-profile" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              <EditProfile isDarkMode={isDarkMode} onBack={() => setActiveTab("settings")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
