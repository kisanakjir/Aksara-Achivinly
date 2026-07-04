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

const mapelGroups: { group: string; items: string[] }[] = [
  {
    group: "Wajib (Nasional)",
    items: ["Pendidikan Agama & Budi Pekerti", "Pendidikan Pancasila", "Bahasa Indonesia", "Matematika", "Bahasa Inggris", "PJOK", "Informatika", "Sejarah", "Seni & Budaya"]
  },
  {
    group: "MIPA",
    items: ["Fisika", "Kimia", "Biologi", "Matematika Tingkat Lanjut"]
  },
  {
    group: "IPS",
    items: ["Ekonomi", "Sosiologi", "Geografi", "Antropologi"]
  },
  {
    group: "Bahasa & Budaya",
    items: ["Bahasa Indonesia Tingkat Lanjut", "Bahasa Inggris Tingkat Lanjut", "Bahasa Asing"]
  },
  {
    group: "Vokasi",
    items: ["Prakarya & Kewirausahaan"]
  },
  {
    group: "Seleksi Masuk PT",
    items: ["UTBK / SNBT"]
  }
];

const mapelList = mapelGroups.flatMap(g => g.items);
const utbkSubtests = ["Penalaran Umum", "Pengetahuan Kuantitatif", "Pemahaman Bacaan & Menulis", "Pengetahuan & Pemahaman Umum", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris", "Penalaran Matematika"];

const initialMaterials: Material[] = [
  // ============ WAJIB (NASIONAL) ============
  {
    id: "mat_pai_1",
    title: "Konsep Iman, Islam, dan Ihsan",
    category: "Pendidikan Agama & Budi Pekerti",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Materi ini membahas tiga pilar utama dalam ajaran Islam: Iman (percaya), Islam (tunduk), dan Ihsan (kesempurnaan). Dipelajari hubungan antara ketiganya serta implementasi dalam kehidupan sehari-hari.",
    youtubeId: "1qyIiJ2Z9KA",
    durationMinutes: 15,
    xpReward: 100
  },
  {
    id: "mat_pp_1",
    title: "Makna Bhinneka Tunggal Ika",
    category: "Pendidikan Pancasila",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Pembahasan mendalam tentang asal-usul, makna, dan implementasi semboyan Bhinneka Tunggal Ika dalam kehidupan berbangsa dan bernegara di Indonesia.",
    youtubeId: "9Eu733Q7PhU",
    durationMinutes: 12,
    xpReward: 100
  },
  {
    id: "mat_bi_1",
    title: "Teks Argumentasi: Struktur dan Kebahasaan",
    category: "Bahasa Indonesia",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Belajar mengenali, menganalisis, dan menulis teks argumentasi. Mencakup pengertian, struktur (pendahuluan, argumen, penegasan ulang), dan kaidah kebahasaan teks argumentasi.",
    youtubeId: "0fAXtsReT64",
    durationMinutes: 15,
    xpReward: 100
  },
  {
    id: "mat_mtk_1",
    title: "Konsep Dasar Turunan Fungsi Aljabar",
    category: "Matematika",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Materi ini membahas konsep turunan fungsi aljabar secara fundamental — mulai dari definisi limit hingga rumus utama turunan. Dibahas juga aplikasi sederhana turunan dalam kehidupan sehari-hari.",
    youtubeId: "AVhhqQABddk",
    durationMinutes: 18,
    xpReward: 120
  },
  {
    id: "mat_mtk_2",
    title: "Cara Mudah Turunan Fungsi Aljabar",
    category: "Matematika",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Pembahasan step-by-step menyelesaikan soal turunan fungsi aljabar dengan cara cepat dan mudah dipahami. Cocok untuk pemula yang baru belajar turunan.",
    youtubeId: "2HwfsBqqrHE",
    durationMinutes: 12,
    xpReward: 100
  },
  {
    id: "mat_bing_1",
    title: "Narrative Text: Structure & Language Features",
    category: "Bahasa Inggris",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Materi lengkap tentang Narrative Text dalam Bahasa Inggris — mencakup pengertian, generic structure (orientation, complication, resolution), dan language features yang digunakan.",
    youtubeId: "3XC3-67vQGI",
    durationMinutes: 14,
    xpReward: 100
  },
  {
    id: "mat_pjok_1",
    title: "Komponen Kebugaran Jasmani",
    category: "PJOK",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Materi tentang komponen-komponen kebugaran jasmani, jenis latihan untuk masing-masing komponen, serta cara mengukur tingkat kebugaran jasmani secara mandiri.",
    youtubeId: "0EJQtK_wxxM",
    durationMinutes: 12,
    xpReward: 80
  },
  {
    id: "mat_tik_1",
    title: "Algoritma: Dasar Berpikir Komputasional",
    category: "Informatika",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Mengenal konsep algoritma sebagai fondasi berpikir komputasional. Dibahas pengertian, ciri-ciri, dan contoh algoritma dalam kehidupan sehari-hari serta dalam pemrograman sederhana.",
    youtubeId: "3hPnxPTbR0o",
    durationMinutes: 10,
    xpReward: 80
  },
  {
    id: "mat_sjrh_1",
    title: "Perkembangan Hindu-Buddha di Indonesia",
    category: "Sejarah",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Membahas proses masuknya agama Hindu dan Buddha ke Indonesia, pengaruhnya terhadap kebudayaan lokal, serta kerajaan-kerajaan Hindu-Buddha pertama di Nusantara.",
    youtubeId: "_WsMFuKKFoE",
    durationMinutes: 16,
    xpReward: 110
  },
  {
    id: "mat_sjrh_2",
    title: "Kerajaan Hindu-Buddha di Indonesia",
    category: "Sejarah",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Penjelasan detail tentang kerajaan-kerajaan Hindu-Buddha di Indonesia — Kerajaan Kutai, Tarumanegara, Sriwijaya, Mataram Kuno, dan Majapahit. Mencakup aspek politik, ekonomi, dan budaya.",
    youtubeId: "0QaIEa06TrE",
    durationMinutes: 18,
    xpReward: 120
  },
  {
    id: "mat_senbud_1",
    title: "Menggambar 2 Dimensi",
    category: "Seni & Budaya",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Memahami konsep seni rupa dua dimensi: unsur-unsur visual (garis, bentuk, warna, tekstur), prinsip-prinsip komposisi, serta teknik dasar menggambar 2D.",
    youtubeId: "_QS-67CtL3E",
    durationMinutes: 14,
    xpReward: 80
  },

  // ============ MIPA ============
  {
    id: "mat_fis_1",
    title: "Hukum Newton tentang Gerak",
    category: "Fisika",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Pembahasan lengkap Hukum I, II, dan III Newton — konsep kelembaman, hubungan gaya-massa-percepatan, dan aksi-reaksi. Dilengkapi contoh soal dan aplikasi dalam kehidupan.",
    youtubeId: "0B_oCGTh-54",
    durationMinutes: 15,
    xpReward: 120
  },
  {
    id: "mat_fis_2",
    title: "Aplikasi Hukum Newton dalam Soal",
    category: "Fisika",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Latihan soal aplikasi Hukum Newton. Mulai dari soal sederhana hingga soal cerita yang sering muncul di ujian. Dibahas dengan metode step-by-step yang mudah diikuti.",
    youtubeId: "1scecjMJwq8",
    durationMinutes: 20,
    xpReward: 130
  },
  {
    id: "mat_kim_1",
    title: "Konsep Mol dan Stoikiometri",
    category: "Kimia",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Materi fundamental kimia tentang konsep mol — bilangan Avogadro, hubungan mol-massa-jumlah partikel-volume gas, dan perhitungan stoikiometri sederhana.",
    youtubeId: "3zHWfZ16fVo",
    durationMinutes: 16,
    xpReward: 120
  },
  {
    id: "mat_kim_2",
    title: "Hukum Dasar Kimia & Stoikiometri",
    category: "Kimia",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Pembahasan hukum-hukum dasar kimia (Lavoisier, Proust, Gay-Lussac) dan aplikasinya dalam perhitungan stoikiometri. Disertai tips menyelesaikan soal hitungan kimia.",
    youtubeId: "3XMbIHKQ6WY",
    durationMinutes: 20,
    xpReward: 140
  },
  {
    id: "mat_bio_1",
    title: "Struktur dan Fungsi Sel",
    category: "Biologi",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Mempelajari struktur dan fungsi organel-organel sel hewan dan tumbuhan, perbedaan antara keduanya, serta kaitan struktur sel dengan fungsinya dalam kehidupan.",
    youtubeId: "_JV38mH82F0",
    durationMinutes: 14,
    xpReward: 100
  },
  {
    id: "mat_mtk_lanjut_1",
    title: "Fungsi Trigonometri dan Pemodelannya",
    category: "Matematika Tingkat Lanjut",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Mempelajari fungsi trigonometri dari konsep dasar hingga pemodelan fenomena periodik. Dibahas grafik fungsi sinus, kosinus, dan tangen serta aplikasinya.",
    youtubeId: "_ycgBH7nIQE",
    durationMinutes: 18,
    xpReward: 130
  },
  {
    id: "mat_mtk_lanjut_2",
    title: "Fungsi Polinomial",
    category: "Matematika Tingkat Lanjut",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Pembahasan fungsi polinomial: operasi aljabar, pembagian polinomial, teorema sisa, teorema faktor, dan aplikasi dalam pemodelan matematika.",
    youtubeId: "02MK6br3940",
    durationMinutes: 16,
    xpReward: 120
  },

  // ============ IPS ============
  {
    id: "mat_eko_1",
    title: "Permintaan dan Penawaran",
    category: "Ekonomi",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Memahami konsep dasar permintaan (demand) dan penawaran (supply), faktor-faktor yang mempengaruhinya, serta pembentukan harga keseimbangan di pasar.",
    youtubeId: "_TsyUrSkRqU",
    durationMinutes: 15,
    xpReward: 110
  },
  {
    id: "mat_eko_2",
    title: "Kelangkaan dan Kebutuhan Manusia",
    category: "Ekonomi",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Membahas konsep kelangkaan sebagai inti dari ilmu ekonomi, jenis-jenis kebutuhan manusia, dan sistem ekonomi sebagai solusi dari masalah kelangkaan.",
    youtubeId: "_jmDxQc48jw",
    durationMinutes: 12,
    xpReward: 90
  },
  {
    id: "mat_sos_1",
    title: "Tindakan dan Interaksi Sosial",
    category: "Sosiologi",
    level: LearnLevel.BASIC,
    type: "video",
    content: "Materi tentang tindakan sosial, interaksi sosial, dan proses sosial. Dibahas syarat-syarat terjadinya interaksi sosial serta bentuk-bentuk interksi di masyarakat.",
    youtubeId: "5TdQMBgy1e4",
    durationMinutes: 16,
    xpReward: 110
  },
  {
    id: "mat_sos_2",
    title: "Pengertian dan Jenis Interaksi Sosial",
    category: "Sosiologi",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Belajar tentang pengertian interaksi sosial, syarat-syaratnya (kontak dan komunikasi), serta jenis-jenis interaksi sosial baik asosiatif maupun disosiatif.",
    youtubeId: "6jWVxEgh1b8",
    durationMinutes: 13,
    xpReward: 100
  },
  {
    id: "mat_geo_1",
    title: "Prinsip-Prinsip Ilmu Geografi",
    category: "Geografi",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Mengenal prinsip-prinsip dasar ilmu geografi — prinsip persebaran, interelasi, deskripsi, dan korologi. Serta ruang lingkup dan objek studi geografi.",
    youtubeId: "5Agxr3tljLI",
    durationMinutes: 14,
    xpReward: 100
  },
  {
    id: "mat_antro_1",
    title: "Pengertian dan Ruang Lingkup Antropologi",
    category: "Antropologi",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Mengenal antropologi sebagai ilmu tentang manusia dan kebudayaan. Dibahas ruang lingkup, cabang-cabang antropologi, serta metode penelitian antropologi.",
    youtubeId: "aTDA7Io1oEg",
    durationMinutes: 14,
    xpReward: 100
  },

  // ============ BAHASA & BUDAYA ============
  {
    id: "mat_bi_lanjut_1",
    title: "Karya Tulis Ilmiah",
    category: "Bahasa Indonesia Tingkat Lanjut",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Panduan menyusun karya tulis ilmiah: sistematika penulisan, teknik pengumpulan data, kutipan dan daftar pustaka, serta kaidah bahasa Indonesia ilmiah yang baku.",
    youtubeId: "1YnfRM7_8uo",
    durationMinutes: 15,
    xpReward: 110
  },
  {
    id: "mat_bing_lanjut_1",
    title: "Analytical Exposition Text",
    category: "Bahasa Inggris Tingkat Lanjut",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Mempelajari Analytical Exposition Text — teks yang menyajikan argumen untuk meyakinkan pembaca. Dibahas struktur, ciri kebahasaan, dan cara menulis teks eksposisi analitis.",
    youtubeId: "_k75vxX4cRk",
    durationMinutes: 14,
    xpReward: 100
  },
  {
    id: "mat_basa_1",
    title: "Perkenalan Diri Bahasa Mandarin",
    category: "Bahasa Asing",
    level: LearnLevel.FUNDAMENTAL,
    type: "video",
    content: "Belajar perkenalan dasar dalam bahasa Mandarin — menyebutkan nama, asal, umur, dan hobi. Dilengkapi dengan pelafalan dan karakter Hanzi sederhana.",
    youtubeId: "_S00iW5DrAE",
    durationMinutes: 10,
    xpReward: 80
  },

  // ============ VOKASI ============
  {
    id: "mat_prakarya_1",
    title: "Sistem Produksi Usaha Kerajinan",
    category: "Prakarya & Kewirausahaan",
    level: LearnLevel.INTERMEDIATE,
    type: "video",
    content: "Materi tentang sistem produksi dalam usaha kerajinan — mulai dari perencanaan, pengadaan bahan baku, proses produksi, hingga distribusi. Juga dibahas aspek wirausaha dan pemasaran.",
    youtubeId: "_jDQQJtXWVg",
    durationMinutes: 18,
    xpReward: 110
  },

  // ============ SELEKSI MASUK PT ============
  {
    id: "mat_utbk_pu_1",
    title: "Penalaran Umum — Pernyataan Pasti Salah",
    category: "UTBK / SNBT",
    subCategory: "Penalaran Umum",
    level: LearnLevel.UTBK,
    type: "video",
    content: "Strategi mengerjakan soal Penalaran Umum UTBK — terutama tipe soal pernyataan pasti salah. Dibahas pola soal, cara identifikasi, dan trik cepat menjawab.",
    youtubeId: "3q1q2UVTkUk",
    durationMinutes: 14,
    xpReward: 150
  },
  {
    id: "mat_utbk_pk_1",
    title: "Pengetahuan Kuantitatif — Akar Berulang",
    category: "UTBK / SNBT",
    subCategory: "Pengetahuan Kuantitatif",
    level: LearnLevel.UTBK,
    type: "video",
    content: "Rumus cepat menyelesaikan soal akar berulang yang sering muncul di subtes Pengetahuan Kuantitatif UTBK. Dilengkapi latihan soal dan pembahasan.",
    youtubeId: "1g_bLjuvp2Y",
    durationMinutes: 12,
    xpReward: 150
  },
  {
    id: "mat_utbk_pm_1",
    title: "Penalaran Matematika — Soal & Pembahasan",
    category: "UTBK / SNBT",
    subCategory: "Penalaran Matematika",
    level: LearnLevel.UTBK,
    type: "video",
    content: "Pembahasan soal Penalaran Matematika UTBK. Tips dan trik mengerjakan soal berbasis konteks dengan cepat dan tepat tanpa kalkulator.",
    youtubeId: "1Pwt89OI50g",
    durationMinutes: 16,
    xpReward: 150
  },
];

function mapBackendMaterial(material: BackendMaterial, subjects: BackendSubject[]): Material {
  const subject = subjects.find(s => s.id === material.subject_id);

  return {
    id: String(material.id),
    subjectId: material.subject_id,
    title: material.title,
    category: subject?.name || "General",
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


  // Filter for list view
  const filteredMaterials = materials.filter(m => {
     if (selectedMapel === "UTBK / SNBT") {
        return m.category === selectedMapel && m.subCategory === selectedSubtest;
     }
     return m.category === selectedMapel;
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
        
        {/* VIEW 1: SELECT MAPEL & LIST */}
        {viewMode === "list" && (
          <motion.div key="list" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-8">
            
            {/* Mapel Selection — native dropdown */}
            <div className={`p-6 sm:p-8 rounded-3xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white shadow-sm border-gray-200'} border`}>

              <div className="mb-4">
                 <h2 className="text-xl font-black mb-4 text-center">Pilih Mata Pelajaran</h2>

                 <select
                   value={selectedMapel}
                   onChange={(e) => setSelectedMapel(e.target.value)}
                   className={`w-full px-4 py-3 rounded-xl text-sm font-bold border appearance-none cursor-pointer transition-all ${
                     isDarkMode
                       ? 'bg-zinc-800 text-white border-zinc-700 focus:border-blue-500'
                       : 'bg-gray-50 text-gray-900 border-gray-200 focus:border-blue-500'
                   }`}
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right 16px center',
                     backgroundSize: '12px',
                   }}
                 >
                   {mapelGroups.map(group => (
                     <optgroup key={group.group} label={group.group}>
                       {group.items.map(mapel => (
                         <option key={mapel} value={mapel}>{mapel}</option>
                       ))}
                     </optgroup>
                   ))}
                 </select>
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
                       {materials.filter(m => m.category === selectedMaterial.category).map((m, idx) => (
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
