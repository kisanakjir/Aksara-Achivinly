import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Video, Play, ChevronRight, Clock, Award, CheckCircle2, ArrowLeft, RefreshCw, FileText
} from "lucide-react";
import { Material, LearnLevel } from "../types";
import { getMaterials, getSubjects, type BackendMaterial, type BackendSubject } from "../services/materialsApi";
import { saveProgress } from "../services/statsApi";

interface LearnProps {
  onCompleteMaterial: (xp: number, minutes: number, category?: string) => void;
  isDarkMode: boolean;
  userLevel: number;
}

const mapelList = ["Matematika", "Fisika", "Biologi", "Kimia", "UTBK / SNBT"];
const utbkSubtests = ["Penalaran Umum", "Pengetahuan Kuantitatif", "Pemahaman Bacaan & Menulis", "Pengetahuan & Pemahaman Umum", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris", "Penalaran Matematika"];

const initialMaterials: Material[] = [
  {
    id: "mat_1",
    title: "Konsep Dasar Turunan Fungsi Aljabar",
    category: "Matematika",
    level: LearnLevel.BASIC,
    type: "text",
    content: `### Pengantar Turunan Fungsi Aljabar\n\nTurunan fungsi aljabar adalah konsep pengukuran bagaimana suatu fungsi berubah seiring perubahan nilai masukannya.\n\n#### Rumus Utama\nUntuk setiap fungsi aljabar berbentuk f(x) = ax^n, turunan pertamanya adalah:\nf'(x) = a * n * x^(n-1)\n\n#### Tips Kilat\nJika f(x) berbentuk pecahan linear (ax+b)/(cx+d), turunan pertamanya bisa langsung menggunakan rumus cepat: f'(x) = (ad - bc) / (cx+d)^2`,
    videoUrl: "https://www.youtube.com/watch?v=F77v6PzXW84",
    youtubeId: "F77v6PzXW84",
    durationMinutes: 10,
    xpReward: 100
  },
  {
    id: "mat_2",
    title: "TPS Penalaran Umum Taktis",
    category: "UTBK / SNBT",
    subCategory: "Penalaran Umum",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Video ini membahas trik jitu menganalisis teks panjang dan menarik kesimpulan logis secara instan pada soal TPS Penalaran Umum UTBK.",
    youtubeId: "Xh0mG2V8-K4",
    durationMinutes: 15,
    xpReward: 150
  },
  {
    id: "mat_3",
    title: "Gaya Sentripetal & Melingkar",
    category: "Fisika",
    level: LearnLevel.INTERMEDIATE,
    type: "text",
    content: `Gerak Melingkar Beraturan (GMB) adalah gerak suatu benda pada lintasan melingkar dengan kelajuan linear konstan, namun arah kecepatannya selalu berubah sepanjang waktu.`,
    youtubeId: "30t041-h0QY",
    durationMinutes: 12,
    xpReward: 120
  }
];

function mapBackendMaterial(material: BackendMaterial, subjects: BackendSubject[]): Material {
  const subject = subjects.find(s => s.id === material.subject_id);

  return {
    id: String(material.id),
    subjectId: material.subject_id,
    title: material.title,
    category: (subject?.name || "General") as Material["category"],
    subCategory: material.sub_category || undefined,
    level: material.level as LearnLevel,
    type: material.type,
    content: material.content || "",
    youtubeId: material.youtube_id || undefined,
    durationMinutes: material.duration_minutes,
    xpReward: material.xp_reward,
  };
}

export default function Learn({ onCompleteMaterial, isDarkMode, userLevel }: LearnProps) {
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [subjects, setSubjects] = useState<BackendSubject[]>([]);
  const [selectedMapel, setSelectedMapel] = useState<string>("Matematika");
  const [selectedSubtest, setSelectedSubtest] = useState<string>("Penalaran Umum");
  const [selectedLevel, setSelectedLevel] = useState<LearnLevel>(LearnLevel.BASIC);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [materialError, setMaterialError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMaterials() {
      try {
        setIsLoadingMaterials(true);
        setMaterialError(null);

        const subjectRes = await getSubjects();
        const materialsRes = await getMaterials();

        if (!isMounted) return;

        setSubjects(subjectRes.data);
        setMaterials(materialsRes.data.map(material => mapBackendMaterial(material, subjectRes.data)));

        if (subjectRes.data.length > 0) {
          setSelectedMapel(subjectRes.data[0].name);
        }
      } catch (err) {
        if (!isMounted) return;
        setMaterialError("Backend Python belum tersambung. Menampilkan materi demo sementara.");
        setSubjects([]);
        setMaterials(initialMaterials);
      } finally {
        if (isMounted) setIsLoadingMaterials(false);
      }
    }

    loadMaterials();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedMapelList = subjects.length > 0 ? subjects.map(subject => subject.name) : mapelList;

  // Filter for list view
  const filteredMaterials = materials.filter(m => {
     if (selectedMapel === "UTBK / SNBT") {
        return m.category === selectedMapel && m.subCategory === selectedSubtest && m.level === selectedLevel;
     }
     return m.category === selectedMapel && m.level === selectedLevel;
  });

  const handleOpenDetail = (mat: Material) => {
    setSelectedMaterial(mat);
    setViewMode("detail");
  };

  const handleComplete = async () => {
    if (!selectedMaterial || selectedMaterial.isCompleted) return;

    onCompleteMaterial(selectedMaterial.xpReward, selectedMaterial.durationMinutes, selectedMaterial.category);

    try {
      await saveProgress({
        user_id: 0,
        material_id: selectedMaterial.subjectId ? Number(selectedMaterial.id) : null,
        session_type: "material",
        duration_minutes: selectedMaterial.durationMinutes,
        xp_earned: selectedMaterial.xpReward,
        score: null,
        is_completed: true,
      });
    } catch (err) {
      // Tetap update UI secara optimistis agar user tidak kehilangan progres di sesi berjalan.
      console.warn("Gagal menyimpan progress ke backend Python:", err);
    }

    const updated = materials.map(m => m.id === selectedMaterial.id ? { ...m, isCompleted: true } : m);
    setMaterials(updated);
    setSelectedMaterial({ ...selectedMaterial, isCompleted: true });
  };

  return (
    <div className="w-full" id="learn-root">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: SELECT MAPEL & DIFFICULTY & LIST */}
        {viewMode === "list" && (
          <motion.div key="list" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-8">
            
            {/* Mapel & Level Selection */}
            <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border`}>
              
              <div className="mb-6 text-center">
                 <h2 className="text-xl font-black mb-3">Pilih Mata Pelajaran</h2>
                 <div className="flex flex-wrap justify-center gap-2">
                   {displayedMapelList.map(mapel => (
                     <button
                       key={mapel}
                       onClick={() => setSelectedMapel(mapel)}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                         selectedMapel === mapel 
                           ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                           : 'bg-transparent text-gray-500 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                       }`}
                     >
                       {mapel}
                     </button>
                   ))}
                 </div>
              </div>

              {selectedMapel === "UTBK / SNBT" && (
                 <div className="mb-6 text-center animate-in fade-in slide-in-from-top-2">
                   <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Subtes UTBK</h3>
                   <div className="flex flex-wrap justify-center gap-2">
                     {utbkSubtests.map(sub => (
                       <button
                         key={sub}
                         onClick={() => setSelectedSubtest(sub)}
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                           selectedSubtest === sub 
                             ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 border-indigo-200 dark:border-indigo-800'
                             : 'bg-transparent text-gray-400 border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                         }`}
                       >
                         {sub}
                       </button>
                     ))}
                   </div>
                 </div>
              )}

              <div className="text-center pt-6 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Tingkat Kesulitan</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.values(LearnLevel).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedLevel === lvl 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-105'
                          : 'bg-transparent text-gray-500 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {materialError && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                {materialError}
              </div>
            )}

            {isLoadingMaterials ? (
              <div className={`p-8 rounded-3xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-500">
                  <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  Memuat materi dari backend Python...
                </div>
              </div>
            ) : null}

            {!isLoadingMaterials && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-gray-50 dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                  <div className="text-4xl mb-2">📚</div>
                  Materi belum tersedia untuk filter ini. Coba pilih yang lain!
                </div>
              ) : (
                filteredMaterials.map(mat => (
                  <div
                    key={mat.id}
                    onClick={() => handleOpenDetail(mat)}
                    className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer border transition-all hover:shadow-xl hover:-translate-y-1 ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                        mat.type === 'video' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {mat.type === 'video' ? <Video className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      {mat.isCompleted && (
                        <div className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selesai
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">{mat.title}</h3>

                    <div className="flex items-center gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {mat.durationMinutes} mnt
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-orange-500" />
                        {mat.xpReward} XP
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            )}

          </motion.div>
        )}

        {/* VIEW 2: DETAIL (YOUTUBE PLAYLIST STYLE) */}
        {viewMode === "detail" && selectedMaterial && (
          <motion.div key="detail" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
            
            <button 
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Materi
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT: PLAYLIST / STRUKTUR */}
              <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-4">
                 <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border`}>
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-blue-500" /> Playlist Belajar
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                       {materials.filter(m => m.category === selectedMaterial.category && m.level === selectedMaterial.level).map((m, idx) => (
                          <div 
                            key={m.id} 
                            onClick={() => setSelectedMaterial(m)}
                            className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                              m.id === selectedMaterial.id 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                             <div className="text-gray-400 font-mono text-xs pt-1">{idx + 1}</div>
                             <div className="flex-1">
                                <h4 className={`text-sm font-bold line-clamp-2 leading-snug ${m.id === selectedMaterial.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                   {m.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                   <span className="flex items-center gap-0.5"><Clock className="w-3 h-3"/> {m.durationMinutes}m</span>
                                   {m.isCompleted && <span className="text-emerald-500 font-bold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3"/> Selesai</span>}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* RIGHT: MAIN CONTENT (VIDEO/TEXT) */}
              <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col">
                 <div className="w-full bg-black rounded-3xl overflow-hidden aspect-video relative shadow-2xl">
                    {selectedMaterial.youtubeId ? (
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedMaterial.youtubeId}?autoplay=0&rel=0`}
                        title={selectedMaterial.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                         <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                         <p className="font-medium">Materi ini berbasis teks interaktif.</p>
                      </div>
                    )}
                 </div>

                 <div className={`mt-6 p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border`}>
                    <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-bold uppercase tracking-wider">
                       <span className="bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{selectedMaterial.category}</span>
                       <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full">{selectedMaterial.level}</span>
                       {selectedMaterial.subCategory && (
                         <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-full">{selectedMaterial.subCategory}</span>
                       )}
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">
                       {selectedMaterial.title}
                    </h2>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-8 text-gray-600 dark:text-gray-300">
                       {selectedMaterial.content.split('\n').map((para, i) => {
                         if (para.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{para.replace('### ', '')}</h3>;
                         if (para.startsWith('#### ')) return <h4 key={i} className="text-base font-bold mt-3 mb-1 text-gray-900 dark:text-gray-100">{para.replace('#### ', '')}</h4>;
                         return para ? <p key={i} className="mb-2 leading-relaxed">{para}</p> : <br key={i}/>;
                       })}
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                       <div className="flex items-center gap-2 font-bold text-orange-500">
                          <Award className="w-5 h-5" />
                          <span>+{selectedMaterial.xpReward} XP</span>
                       </div>
                       
                       <button 
                          onClick={handleComplete}
                          disabled={selectedMaterial.isCompleted}
                          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                            selectedMaterial.isCompleted 
                              ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:-translate-y-0.5'
                          }`}
                       >
                          {selectedMaterial.isCompleted ? (
                             <><CheckCircle2 className="w-5 h-5" /> Selesai</>
                          ) : (
                             <><CheckCircle2 className="w-5 h-5" /> Tandai Selesai</>
                          )}
                       </button>
                    </div>
                 </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
