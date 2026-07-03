import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Trophy, Award, Medal, Users, ArrowUp, Star, ShieldCheck, 
  HelpCircle, Sparkles, CheckCircle2, Flame, Leaf, Zap, Moon, Wind, Snowflake, Sun, Mountain, Droplet, Crown
} from "lucide-react";
import { LeaderboardUser, Badge, UserStats } from "../types";

interface LeaderboardProps {
  stats: UserStats;
  isDarkMode: boolean;
}

export default function Leaderboard({ stats, isDarkMode }: LeaderboardProps) {
  const [ranks, setRanks] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();
      setRanks(data);
    } catch (err) {
      console.error("Error fetching leaderboard ranks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="leaderboard-root">
      
      {/* Kolom Kiri: Leaderboard Rankings (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-4" id="leaderboard-panel">
        
        <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border transition-all`}>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Trophy className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">Papan Peringkat Nasional</h3>
                <p className="text-[10px] text-gray-400">Peringkat mingguan pejuang UTBK seluruh Indonesia</p>
              </div>
            </div>

            <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-wide">
              Update Real-Time
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="text-xs text-gray-400 italic">Memuat peringkat pejuang...</span>
            </div>
          ) : (
            <div className="space-y-3" id="leaderboard-list">
              {ranks.map((rankUser, index) => {
                const isMe = rankUser.username === stats.username;
                const rank = index + 1;
                
                // Determine styling based on rank
                let rowStyles = "";
                let nameStyles = "";
                let badge = null;
                let particles = null;
                let avatarColor = "bg-blue-500";

                if (rank === 1) {
                   rowStyles = "bg-gradient-to-r from-orange-500/20 to-yellow-400/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] transform scale-[1.03] z-10 relative overflow-hidden animate-fire";
                   nameStyles = "text-orange-600 dark:text-orange-400 font-black text-lg";
                   badge = <Crown className="w-7 h-7 text-orange-500 drop-shadow-md" />;
                   avatarColor = "bg-orange-500 shadow-lg";
                   particles = (
                     <div className="real-fire-container">
                       <div className="real-flame" style={{ left: '5%', animationDelay: '0s', width: '25px', height: '25px' }}></div>
                       <div className="real-flame" style={{ left: '25%', animationDelay: '0.4s' }}></div>
                       <div className="real-flame" style={{ left: '45%', animationDelay: '0.2s', width: '35px', height: '35px' }}></div>
                       <div className="real-flame" style={{ left: '65%', animationDelay: '0.8s' }}></div>
                       <div className="real-flame" style={{ left: '85%', animationDelay: '1.2s', width: '20px', height: '20px' }}></div>
                     </div>
                   );
                } else if (rank === 2) {
                   rowStyles = "bg-gradient-to-r from-emerald-500/20 to-teal-400/10 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform scale-[1.01] relative overflow-hidden";
                   nameStyles = "text-emerald-600 dark:text-emerald-400 font-black text-base";
                   badge = <Leaf className="w-6 h-6 text-emerald-500" />;
                   avatarColor = "bg-emerald-500";
                   particles = (
                     <>
                        <div className="particle-leaf text-emerald-500/50" style={{ left: '20%', animationDelay: '0s' }}>🍃</div>
                        <div className="particle-leaf text-teal-400/50" style={{ left: '70%', animationDelay: '1.5s' }}>🍃</div>
                     </>
                   );
                } else if (rank === 3) {
                   rowStyles = "bg-gradient-to-r from-cyan-500/20 to-blue-400/10 border-cyan-400 shadow-sm relative overflow-hidden animate-frost";
                   nameStyles = "text-cyan-600 dark:text-cyan-400 font-bold text-base";
                   badge = <Zap className="w-6 h-6 text-cyan-500" />;
                   avatarColor = "bg-cyan-500";
                   particles = (
                     <>
                        <div className="particle-zap text-cyan-400/50" style={{ left: '15%', top: '30%', animationDelay: '0s' }}>⚡</div>
                        <div className="particle-zap text-cyan-400/50" style={{ left: '85%', top: '50%', animationDelay: '0.4s' }}>⚡</div>
                     </>
                   );
                } else if (rank === 4) {
                   rowStyles = "bg-purple-500/10 border-purple-400 relative overflow-hidden";
                   nameStyles = "text-purple-600 dark:text-purple-400 font-bold";
                   badge = <Star className="w-5 h-5 text-purple-500" />;
                   avatarColor = "bg-purple-500";
                   particles = <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>;
                } else if (rank === 5) {
                   rowStyles = "bg-indigo-500/10 border-indigo-400 relative overflow-hidden";
                   nameStyles = "text-indigo-600 dark:text-indigo-400 font-bold";
                   badge = <Moon className="w-5 h-5 text-indigo-500" />;
                   avatarColor = "bg-indigo-500";
                } else if (rank === 6) {
                   rowStyles = "bg-sky-500/10 border-sky-400 relative overflow-hidden";
                   nameStyles = "text-sky-600 dark:text-sky-400 font-bold";
                   badge = <Wind className="w-5 h-5 text-sky-500" />;
                   avatarColor = "bg-sky-500";
                } else if (rank === 7) {
                   rowStyles = "bg-blue-300/10 border-blue-300 relative overflow-hidden";
                   nameStyles = "text-blue-500 dark:text-blue-300 font-bold";
                   badge = <Snowflake className="w-5 h-5 text-blue-300" />;
                   avatarColor = "bg-blue-400";
                } else if (rank === 8) {
                   rowStyles = "bg-yellow-500/10 border-yellow-400 relative overflow-hidden";
                   nameStyles = "text-yellow-600 dark:text-yellow-400 font-bold";
                   badge = <Sun className="w-5 h-5 text-yellow-500" />;
                   avatarColor = "bg-yellow-500";
                } else if (rank === 9) {
                   rowStyles = "bg-amber-700/10 border-amber-600 relative overflow-hidden";
                   nameStyles = "text-amber-700 dark:text-amber-500 font-bold";
                   badge = <Mountain className="w-5 h-5 text-amber-600" />;
                   avatarColor = "bg-amber-600";
                } else if (rank === 10) {
                   rowStyles = "bg-blue-600/10 border-blue-500 relative overflow-hidden";
                   nameStyles = "text-blue-600 dark:text-blue-400 font-bold";
                   badge = <Droplet className="w-5 h-5 text-blue-500" />;
                   avatarColor = "bg-blue-500";
                } else {
                   rowStyles = isMe ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 font-bold" : "bg-gray-50/50 dark:bg-slate-900/30 border-gray-100 dark:border-slate-800/40 hover:bg-gray-50";
                   badge = <span className="text-xs font-bold text-gray-400">{rank}</span>;
                }

                return (
                  <motion.div
                    key={rankUser.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${rowStyles}`}
                  >
                    {particles}
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Rank Number / Podium Badge */}
                      <div className="w-10 flex justify-center items-center shrink-0">
                         {badge}
                      </div>

                      {/* Profile Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black uppercase text-sm text-white ${avatarColor}`}>
                        {rankUser.username.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm tracking-tight ${nameStyles}`}>
                            {rankUser.username}
                          </span>
                          {isMe && <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md font-bold ml-1">ANDA</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 font-medium">Lvl. {rankUser.level}</span>
                          <span className="flex items-center gap-1 text-[10px] text-orange-500/80 font-bold">
                             <Award className="w-3 h-3" /> {rankUser.badgeCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right relative z-10">
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                        {rankUser.xp.toLocaleString("id-ID")} XP
                      </div>
                      <span className="text-[9px] text-gray-400 block font-medium">Akumulasi Skor</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Kolom Kanan: Gamified Achievement Badges Collection (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-4" id="badges-panel">
        
        <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm border-gray-100'} border transition-all`}>
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-700 pb-3">
            <h4 className="font-extrabold text-sm sm:text-base">Museum Lencana Anda</h4>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 leading-relaxed">
            Dapatkan lencana spesial dengan cara aktif mempelajari materi teks/video, meraih streak belajar harian, serta menaklukan kuis di tingkat UTBK.
          </p>

          <div className="space-y-2.5" id="full-badges-list">
            {stats.badges.map(badge => {
              const isUnlocked = !!badge.unlockedAt;
              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
                      : 'bg-gray-50/50 dark:bg-slate-900/30 border-dashed border-gray-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isUnlocked
                      ? badge.rarity === 'Legendary' ? 'bg-amber-100 text-amber-600 border border-amber-300'
                        : badge.rarity === 'Epic' ? 'bg-purple-100 text-purple-600 border border-purple-300'
                        : 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-300'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h5 className="font-extrabold text-xs truncate">{badge.name}</h5>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        badge.rarity === 'Legendary' ? 'bg-amber-100 text-amber-700'
                          : badge.rarity === 'Epic' ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{badge.description}</p>
                    {isUnlocked ? (
                      <span className="text-[9px] text-emerald-600 font-semibold block mt-1">✓ Diperoleh: {badge.unlockedAt}</span>
                    ) : (
                      <span className="text-[9px] text-gray-400 italic block mt-1">Terkunci</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
