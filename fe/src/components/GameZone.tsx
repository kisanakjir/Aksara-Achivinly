import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, Heart, RefreshCw, Check, Sword, Zap, ArrowRight, Skull, Shield, Coins, Sparkles 
} from "lucide-react";

export default function GameZone({ onEarnXp, isDarkMode }: any) {
  const [nodes, setNodes] = useState([
    { id: 1, title: "Hutan Fundamental", category: "Math", unlocked: true, completed: false, question: "Berapa akar dari 144?", options:["12","14", "16", "24"], correctIdx:0, xpReward: 50, enemy: "Slime Angka", hp: 100 },
    { id: 2, title: "Kastil Logika", category: "General", unlocked: false, completed: false, question: "Semua A adalah B. Beberapa B adalah C. Kesimpulan?", options:["Semua C adalah A","Beberapa A adalah C", "Tidak dapat disimpulkan", "Semua B adalah A"], correctIdx:2, xpReward: 100, enemy: "Golem Silogisme", hp: 150 }
  ]);
  const [activeNode, setActiveNode] = useState<any>(null);
  
  // Fight State
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [fightState, setFightState] = useState<"idle" | "attacking" | "damaged" | "victory" | "defeat">("idle");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);

  const handleSelectNode = (node: any) => { 
     if(node.unlocked && !node.completed) {
        setActiveNode(node);
        setEnemyHp(node.hp);
        setPlayerHp(100);
        setFightState("idle");
        setFeedback(null);
     }
  };

  const handleAnswerSubmit = (idx: number) => {
     if (fightState !== "idle") return;

     if(idx === activeNode.correctIdx) {
        setFightState("attacking");
        setTimeout(() => {
           setEnemyHp(0);
           setFightState("victory");
           setFeedback("correct");
           setScore(s=>s+activeNode.xpReward);
           setCoins(c=>c+10);
           onEarnXp(activeNode.xpReward);
           
           // Unlock next
           setNodes(nodes.map(n => n.id === activeNode.id ? {...n, completed: true} : (n.id === activeNode.id+1 ? {...n, unlocked: true} : n)));
        }, 800);
     } else {
        setFightState("damaged");
        setTimeout(() => {
           setPlayerHp(p => Math.max(0, p - 34));
           setFightState(playerHp - 34 <= 0 ? "defeat" : "idle");
           setFeedback("incorrect");
           setTimeout(() => setFeedback(null), 1500); // Reset for next try
        }, 800);
     }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="game-root">
      
      {/* HEADER HUD */}
      <div className="flex items-center justify-between">
         <div>
            <h2 className="font-black text-xl flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-blue-500" /> Petualangan 2D</h2>
            <p className="text-xs text-gray-500">Kalahkan monster dengan jawaban benarmu!</p>
         </div>
         <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center gap-1.5 font-bold text-orange-500 text-sm">
               <Coins className="w-4 h-4" /> {coins}
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700"></div>
            <div className="flex items-center gap-1.5 font-bold text-blue-600 text-sm">
               <Sparkles className="w-4 h-4" /> {score} XP
            </div>
         </div>
      </div>

      {!activeNode ? (
         /* MAP PANEL */
         <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border relative overflow-hidden flex flex-col min-h-[400px]`}>
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            <div className="relative z-10 flex justify-center items-center gap-8 md:gap-16 my-auto flex-wrap">
               {nodes.map((node, i) => (
                  <button key={node.id} disabled={!node.unlocked || node.completed} onClick={() => handleSelectNode(node)} className={`relative flex flex-col items-center group transition-transform ${!node.unlocked ? 'opacity-50' : 'hover:scale-110'}`}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg border-4 shadow-xl transition-all ${
                        node.completed ? 'bg-emerald-500 border-emerald-300 text-white' : node.unlocked ? 'bg-orange-500 border-orange-300 text-white animate-bounce' : 'bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-400'
                     }`}>
                        {node.completed ? <Check className="w-8 h-8" /> : <Sword className="w-6 h-6" />}
                     </div>
                     <div className="mt-4 text-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <p className="font-bold text-xs">{node.title}</p>
                     </div>
                  </button>
               ))}
            </div>
         </div>
      ) : (
         /* BATTLE ARENA */
         <div className="flex flex-col gap-6">
            
            {/* Arena View */}
            <div className={`relative h-64 sm:h-80 rounded-3xl overflow-hidden border-4 ${isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-blue-50'} shadow-2xl flex items-end justify-between px-8 sm:px-24 pb-8`}>
               
               {/* Background Elements */}
               <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
               
               {/* Player Character */}
               <motion.div 
                 animate={{ 
                    x: fightState === "attacking" ? [0, 150, 0] : 0,
                    opacity: fightState === "defeat" ? 0.5 : 1
                 }}
                 transition={{ duration: 0.5 }}
                 className="relative flex flex-col items-center"
               >
                  <div className="w-24 h-24 mb-2 bg-blue-500 rounded-xl border-4 border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center relative overflow-hidden">
                     {/* Pixel Art Mockup (Blocks) */}
                     <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white"></div>
                     <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white"></div>
                     {fightState === "damaged" && <div className="absolute inset-0 bg-red-500/50 animate-pulse"></div>}
                  </div>
                  
                  {/* Player HP */}
                  <div className="w-32 bg-gray-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800">
                     <motion.div animate={{ width: `${playerHp}%` }} className="h-full bg-emerald-500"></motion.div>
                  </div>
                  <span className="text-[10px] font-bold mt-1 bg-white dark:bg-zinc-800 px-2 rounded">Pemain ({playerHp}%)</span>
               </motion.div>

               {/* Enemy Character */}
               <motion.div 
                 animate={{ 
                    x: fightState === "damaged" ? [0, -50, 0] : 0,
                    opacity: fightState === "victory" ? 0 : 1,
                    scale: fightState === "victory" ? 0 : 1
                 }}
                 transition={{ duration: 0.5 }}
                 className="relative flex flex-col items-center"
               >
                  <div className="w-24 h-24 mb-2 bg-purple-600 rounded-full border-4 border-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.5)] flex items-center justify-center relative overflow-hidden">
                     <div className="absolute top-1/3 left-1/3 w-8 h-2 bg-black"></div>
                     {fightState === "attacking" && <div className="absolute inset-0 bg-white/50 animate-flash"></div>}
                  </div>
                  
                  {/* Enemy HP */}
                  <div className="w-32 bg-gray-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800">
                     <motion.div animate={{ width: `${(enemyHp / activeNode.hp) * 100}%` }} className="h-full bg-red-500"></motion.div>
                  </div>
                  <span className="text-[10px] font-bold mt-1 bg-white dark:bg-zinc-800 px-2 rounded text-red-500">{activeNode.enemy}</span>
               </motion.div>

            </div>

            {/* Action / Question Panel */}
            <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border`}>
               {fightState === "victory" ? (
                  <div className="text-center py-8">
                     <h3 className="text-2xl font-black text-emerald-500 mb-2">Monster Dikalahkan!</h3>
                     <p className="text-sm font-bold text-gray-500 mb-6">+{activeNode.xpReward} XP & +10 Koin diperoleh.</p>
                     <button onClick={() => setActiveNode(null)} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                        Kembali ke Peta
                     </button>
                  </div>
               ) : fightState === "defeat" ? (
                  <div className="text-center py-8">
                     <h3 className="text-2xl font-black text-red-500 mb-2">Kamu Terkalahkan...</h3>
                     <p className="text-sm font-bold text-gray-500 mb-6">Jangan menyerah, coba pelajari materinya lagi.</p>
                     <button onClick={() => setActiveNode(null)} className="px-8 py-3 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                        Mundur
                     </button>
                  </div>
               ) : (
                  <div>
                     <h4 className="font-black text-lg mb-6 text-center">{activeNode.question}</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeNode.options.map((opt:string, idx:number) => (
                           <button 
                             key={idx} 
                             disabled={fightState !== "idle"} 
                             onClick={() => handleAnswerSubmit(idx)} 
                             className="w-full text-center p-4 rounded-xl border-2 border-gray-200 dark:border-zinc-700 font-bold text-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:-translate-y-1"
                           >
                              {opt}
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>

         </div>
      )}

    </div>
  );
}
