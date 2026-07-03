import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Heart, Share2, PlusCircle, Send,
  Users, Image as ImageIcon, Flame, MoreHorizontal
} from "lucide-react";

export default function Forum({ username, isDarkMode }: any) {
  const [activeTab, setActiveTab] = useState("feed");
  
  // Dummy stories
  const stories = [
    { id: 1, user: "Anda", img: "", color: "bg-gradient-to-tr from-blue-500 to-indigo-500", isAdd: true },
    { id: 2, user: "Rara99", img: "", color: "bg-gradient-to-tr from-pink-500 to-orange-400" },
    { id: 3, user: "DimasT", img: "", color: "bg-gradient-to-tr from-emerald-500 to-teal-500" },
    { id: 4, user: "UTBK_Master", img: "", color: "bg-gradient-to-tr from-purple-500 to-blue-500" }
  ];

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Nabila",
      time: "2 jam lalu",
      content: "Ada yang punya ringkasan rumus cepat PK untuk peluang? Aku suka stuck kalau udah ada syarat tambahannya. 😭",
      likes: 42,
      comments: 12,
      isLiked: false
    },
    {
      id: 2,
      author: "Dwiki21",
      time: "5 jam lalu",
      content: "Alhamdulillah dapet hijau di SNBP! Makasih banget buat semua yang udah support di grup ini. Semangat buat yang masih berjuang di SNBT! 🔥🔥🔥",
      likes: 890,
      comments: 156,
      isLiked: true
    }
  ]);

  const toggleLike = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="forum-root">
      
      {/* HEADER TABS */}
      <div className="flex items-center justify-between">
         <h2 className="font-black text-2xl">Komunitas</h2>
         <div className="flex bg-gray-200 dark:bg-zinc-800 p-1 rounded-full">
            <button onClick={()=>setActiveTab("feed")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'feed' ? 'bg-white dark:bg-zinc-700 shadow' : 'text-gray-500'}`}>Feed</button>
            <button onClick={()=>setActiveTab("groups")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'groups' ? 'bg-white dark:bg-zinc-700 shadow' : 'text-gray-500'}`}>Grup Belajar</button>
         </div>
      </div>

      {activeTab === "feed" && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
            
            {/* STORIES ROW */}
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
               {stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                     <div className={`w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr ${story.isAdd ? 'from-gray-300 to-gray-400 dark:from-zinc-700 dark:to-zinc-600' : 'from-blue-500 to-pink-500'}`}>
                        <div className={`w-full h-full rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-white font-bold text-xl relative ${story.color}`}>
                           {story.isAdd ? <PlusCircle className="w-6 h-6" /> : story.user.charAt(0)}
                        </div>
                     </div>
                     <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{story.user}</span>
                  </div>
               ))}
            </div>

            {/* CREATE POST (Threads style) */}
            <div className={`p-4 sm:p-6 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border flex gap-4`}>
               <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                  {username.charAt(0)}
               </div>
               <div className="flex-1">
                  <p className="font-bold text-sm mb-1">{username}</p>
                  <input type="text" placeholder="Mulai utas atau tanya sesuatu..." className="w-full bg-transparent border-none focus:outline-none text-sm mb-4 placeholder-gray-400" />
                  <div className="flex items-center justify-between">
                     <div className="flex gap-3 text-gray-400">
                        <ImageIcon className="w-4 h-4 cursor-pointer hover:text-blue-500" />
                        <Users className="w-4 h-4 cursor-pointer hover:text-blue-500" />
                     </div>
                     <button className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-full hover:bg-blue-700 transition">
                        Posting
                     </button>
                  </div>
               </div>
            </div>

            {/* POSTS FEED */}
            <div className="space-y-4">
               {posts.map(post => (
                  <div key={post.id} className={`p-4 sm:p-6 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border`}>
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center shrink-0">
                              {post.author.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-sm">{post.author}</p>
                              <p className="text-[10px] text-gray-500">{post.time}</p>
                           </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
                     </div>
                     
                     <p className="text-sm leading-relaxed mb-4">{post.content}</p>
                     
                     <div className="flex gap-6 text-gray-500">
                        <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-bold transition ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                           <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-pink-500' : ''}`} /> {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-500 transition">
                           <MessageSquare className="w-4 h-4" /> {post.comments}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-bold hover:text-green-500 transition ml-auto">
                           <Share2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </motion.div>
      )}

      {activeTab === "groups" && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Grup Belajar (Segera Hadir)</h3>
            <p className="text-sm text-gray-500">Fitur untuk membuat kelompok belajar privat dengan temanmu sedang dikembangkan.</p>
         </motion.div>
      )}

    </div>
  );
}
