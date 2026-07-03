import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create the express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini AI with safe key validation
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Simulated Database Storage (Persistent inside the container session)
let leaderboardData = [
  { id: "1", username: "IqbalMustafa", avatarSeed: "user1", xp: 4850, rank: 1, badgeCount: 8, level: 12 },
  { id: "2", username: "Budi_UTBK", avatarSeed: "user2", xp: 4200, rank: 2, badgeCount: 6, level: 10 },
  { id: "3", username: "Siti_Cerdas", avatarSeed: "user3", xp: 3950, rank: 3, badgeCount: 5, level: 9 },
  { id: "4", username: "RianAksara", avatarSeed: "user4", xp: 3400, rank: 4, badgeCount: 4, level: 8 },
  { id: "5", username: "PutriAmbisi", avatarSeed: "user5", xp: 2800, rank: 5, badgeCount: 3, level: 6 },
];

let forumPosts = [
  {
    id: "post_1",
    title: "Cara mudah paham konsep Fungsi Kuadrat di UTBK",
    content: "Halo pejuang UTBK! Buat materi matematika fungsi kuadrat, kuncinya ada di pemahaman koordinat titik puncak (xp, yp) dan diskriminan (D). Kalau D > 0 berarti memotong sumbu x di dua titik. Jangan cuma dihafal rumusnya ya, dicoba divisualisasikan grafiknya. Ada yang punya bank soal khusus materi ini?",
    author: "Budi_UTBK",
    authorLevel: 10,
    authorAvatar: "user2",
    category: "Math",
    tags: ["UTBK", "Fungsi Kuadrat", "Tips Matematika"],
    upvotes: 18,
    repliesCount: 2,
    createdAt: "2026-06-29T10:00:00.000Z",
    replies: [
      {
        id: "rep_1",
        author: "Siti_Cerdas",
        authorLevel: 9,
        authorAvatar: "user3",
        content: "Setuju kak! Diskriminan itu bener-bener penyelamat waktu ujian.",
        createdAt: "2026-06-29T11:30:00.000Z"
      },
      {
        id: "rep_2",
        author: "IqbalMustafa",
        authorLevel: 12,
        authorAvatar: "user1",
        content: "Mantap pembahasannya! Saya juga sering pakai trik subtitusi opsi jawaban kalau buntu.",
        createdAt: "2026-06-29T12:00:00.000Z"
      }
    ]
  },
  {
    id: "post_2",
    title: "Rekomendasi Video Youtube Stoikiometri Kimia",
    content: "Guys, ada yang punya rekomendasi channel youtube yang asyik buat belajar stoikiometri dari dasar banget gak? Sering pusing di konsep mol dan pembatas reaksi.",
    author: "RianAksara",
    authorLevel: 8,
    authorAvatar: "user4",
    category: "Chemistry",
    tags: ["Stoikiometri", "VideoBelajar", "KimiaDasar"],
    upvotes: 12,
    repliesCount: 1,
    createdAt: "2026-06-30T01:15:00.000Z",
    replies: [
      {
        id: "rep_3",
        author: "PutriAmbisi",
        authorLevel: 6,
        authorAvatar: "user5",
        content: "Coba tonton channelnya 'Aksara Sains' atau 'Kimia Asyik' kak. Penjelasannya pakai analogi masak kue jadi langsung nangkep!",
        createdAt: "2026-06-30T03:40:00.000Z"
      }
    ]
  }
];

let chatMessages = [
  { id: "c1", sender: "Budi_UTBK", senderLevel: 10, senderAvatar: "user2", message: "Halo semua! Hari ini target belajar apa nih?", timestamp: "06:00", channelId: "general" },
  { id: "c2", sender: "Siti_Cerdas", senderLevel: 9, senderAvatar: "user3", message: "Mau sikat kuis Penalaran Matematika tingkat Advanced!", timestamp: "06:05", channelId: "general" },
  { id: "c3", sender: "PutriAmbisi", senderLevel: 6, senderAvatar: "user5", message: "Ada yang lagi bahas soal Logika Matematika gak?", timestamp: "06:10", channelId: "discussion" }
];

// HEALTH ENDPOINT
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Aksara EdTech server is running perfectly!" });
});

// LEADERBOARD ENDPOINTS
app.get("/api/leaderboard", (req, res) => {
  res.json(leaderboardData);
});

app.post("/api/leaderboard/submit", (req, res) => {
  const { username, xp, level, badgeCount } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const existingIdx = leaderboardData.findIndex(u => u.username === username);
  if (existingIdx !== -1) {
    // Update existing user score if it's higher or just accumulate
    leaderboardData[existingIdx].xp = xp;
    leaderboardData[existingIdx].level = level;
    leaderboardData[existingIdx].badgeCount = Math.max(leaderboardData[existingIdx].badgeCount, badgeCount);
  } else {
    leaderboardData.push({
      id: `user_${Date.now()}`,
      username,
      avatarSeed: "user_default",
      xp,
      rank: 0,
      badgeCount,
      level
    });
  }

  // Recalculate ranks
  leaderboardData.sort((a, b) => b.xp - a.xp);
  leaderboardData = leaderboardData.map((u, index) => ({
    ...u,
    rank: index + 1
  }));

  res.json({ success: true, leaderboard: leaderboardData });
});

// FORUM DISCUSSION ENDPOINTS
app.get("/api/forum", (req, res) => {
  res.json(forumPosts);
});

app.post("/api/forum/post", (req, res) => {
  const { title, content, author, authorLevel, authorAvatar, category, tags } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newPost = {
    id: `post_${Date.now()}`,
    title,
    content,
    author,
    authorLevel: authorLevel || 1,
    authorAvatar: authorAvatar || "user1",
    category: category || "General",
    tags: tags || [],
    upvotes: 0,
    repliesCount: 0,
    createdAt: new Date().toISOString(),
    replies: []
  };

  forumPosts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.post("/api/forum/post/:id/reply", (req, res) => {
  const { id } = req.params;
  const { author, authorLevel, authorAvatar, content } = req.body;
  if (!content || !author) {
    return res.status(400).json({ error: "Missing author or content" });
  }

  const post = forumPosts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const newReply = {
    id: `rep_${Date.now()}`,
    author,
    authorLevel: authorLevel || 1,
    authorAvatar: authorAvatar || "user1",
    content,
    createdAt: new Date().toISOString()
  };

  post.replies.push(newReply);
  post.repliesCount = post.replies.length;

  res.json({ success: true, reply: newReply, post });
});

app.post("/api/forum/post/:id/upvote", (req, res) => {
  const { id } = req.params;
  const post = forumPosts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  post.upvotes += 1;
  res.json({ success: true, upvotes: post.upvotes });
});

// GROUP CHAT ENDPOINTS
app.get("/api/chat/:channel", (req, res) => {
  const { channel } = req.params;
  const filtered = chatMessages.filter(m => m.channelId === channel);
  res.json(filtered);
});

app.post("/api/chat/send", (req, res) => {
  const { sender, senderLevel, senderAvatar, message, channelId } = req.body;
  if (!message || !sender || !channelId) {
    return res.status(400).json({ error: "Missing message details" });
  }

  const timeStr = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  const newMsg = {
    id: `c_${Date.now()}`,
    sender,
    senderLevel: senderLevel || 1,
    senderAvatar: senderAvatar || "user1",
    message,
    timestamp: timeStr,
    channelId
  };

  chatMessages.push(newMsg);
  res.json({ success: true, message: newMsg });
});


// GEMINI AI INTEGRATION - DYNAMIC MATERIAL & QUIZ GENERATOR
app.post("/api/generate", async (req, res) => {
  const { type, subject, level, customTopic } = req.body;
  
  if (!type || !subject || !level) {
    return res.status(400).json({ error: "Missing type, subject, or level" });
  }

  const topicName = customTopic || `${subject} untuk tingkat ${level}`;
  const client = getGeminiClient();

  if (client) {
    try {
      if (type === "quiz") {
        const prompt = `Buatkan 3 soal kuis pilihan ganda yang interaktif dan menarik tentang topik "${topicName}" dengan tingkat kesulitan "${level}" dalam Bahasa Indonesia.
Format respon HARUS dalam format JSON murni berupa Array berisi objek-objek dengan struktur seperti schema ini:
[
  {
    "questionText": "Teks pertanyaan matematika/fisika/lainnya yang menantang...",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correctOptionIndex": 0,
    "explanation": "Penjelasan detail mengapa pilihan tersebut benar dengan langkah pengerjaan yang mendidik...",
    "points": 50,
    "timerSeconds": 60
  }
]
Buatlah soal yang bervariasi, menantang, mendidik, dan relevan dengan materi sekolah kurikulum nasional atau UTBK. Berikan nilai points 50-100 dan timer 45-90 detik. Jangan menyertakan tag markdown \`\`\`json atau karakter pembungkus lain di luar JSON murni.`;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                  timerSeconds: { type: Type.INTEGER }
                },
                required: ["questionText", "options", "correctOptionIndex", "explanation", "points", "timerSeconds"]
              }
            }
          }
        });

        const text = response.text?.trim() || "[]";
        const questions = JSON.parse(text);
        return res.json({ success: true, questions });
      } else {
        // Generate Text Material
        const prompt = `Buatlah ringkasan materi belajar yang informatif, modern, dan mudah dipahami dengan gaya bahasa anak muda / asyik tentang topik "${topicName}" dengan tingkat kesulitan "${level}" dalam Bahasa Indonesia.
Sertakan:
1. Pengantar Konseptual singkat.
2. 3 Poin Utama/Rumus penting yang mudah diingat.
3. Contoh Kasus nyata atau Analoginya.
4. Tips Kilat (Life Hack) pengerjaan soal.

Gunakan format Markdown yang estetik dengan pembagian sub-bab yang rapi.
Format respon harus JSON objek dengan struktur:
{
  "title": "Judul Materi Pembelajaran yang Menarik",
  "content": "Isi materi lengkap dalam format Markdown...",
  "youtubeSearchQuery": "pencarian video youtube yang cocok untuk topik ini",
  "durationMinutes": 8,
  "xpReward": 100
}
Jangan menyertakan tag markdown \`\`\`json di luar JSON murni.`;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                youtubeSearchQuery: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
                xpReward: { type: Type.INTEGER }
              },
              required: ["title", "content", "youtubeSearchQuery", "durationMinutes", "xpReward"]
            }
          }
        });

        const text = response.text?.trim() || "{}";
        const material = JSON.parse(text);
        return res.json({ success: true, material });
      }
    } catch (err: any) {
      console.error("Gemini AI API Error, falling back to smart offline templates:", err);
      // Fallback is handled below
    }
  }

  // --- RECONSTRUCT BEAUTIFUL OFFLINE FALLBACK MATERIAL & QUIZZES ---
  console.log("Serving high-quality offline education templates.");
  if (type === "quiz") {
    // Beautiful default question pool depending on Subject
    let fallbackQuestions = [
      {
        questionText: `Diberikan sebuah fungsi kuadrat f(x) = x² - 6x + 8. Manakah koordinat titik balik (puncak) dari fungsi tersebut?`,
        options: ["(3, -1)", "(3, 1)", "(-3, -1)", "(2, 4)"],
        correctOptionIndex: 0,
        explanation: `Sumbu simetri xp = -b / 2a = -(-6) / 2(1) = 3.\nSubtitusikan x = 3 ke fungsi f(3) = 3² - 6(3) + 8 = 9 - 18 + 8 = -1.\nJadi koordinat titik balik puncaknya adalah (3, -1).`,
        points: 60,
        timerSeconds: 60
      },
      {
        questionText: `Sebuah wadah berisi gas ideal bervolume 2 liter pada tekanan 1 atm. Jika gas ditekan secara isotermis hingga volumenya menjadi 0.5 liter, tentukan tekanan gas sekarang!`,
        options: ["0.25 atm", "2 atm", "4 atm", "8 atm"],
        correctOptionIndex: 2,
        explanation: `Pada proses isotermis (suhu konstan), berlaku Hukum Boyle: P1 * V1 = P2 * V2.\n1 atm * 2 liter = P2 * 0.5 liter\n2 = 0.5 * P2 => P2 = 4 atm.`,
        points: 75,
        timerSeconds: 75
      },
      {
        questionText: `Pada kalimat 'Pemerintah berkomitmen memberikan beasiswa pendidikan kepada anak berprestasi.', manakah yang berkedudukan sebagai subjek (S)?`,
        options: ["Pemerintah", "berkomitmen", "memberikan beasiswa", "pendidikan"],
        correctOptionIndex: 0,
        explanation: `Subjek kalimat di atas adalah 'Pemerintah' karena bertindak sebagai pelaku dari predikat 'berkomitmen'.`,
        points: 50,
        timerSeconds: 45
      }
    ];

    if (subject === "Math") {
      fallbackQuestions = [
        {
          questionText: `Jika log 2 = a dan log 3 = b, maka nilai dari log 18 adalah...`,
          options: ["a + 2b", "2a + b", "a + b²", "a² + b"],
          correctOptionIndex: 0,
          explanation: `log 18 = log (2 * 9) = log (2 * 3²) = log 2 + log 3² = log 2 + 2 log 3 = a + 2b.`,
          points: 80,
          timerSeconds: 60
        },
        {
          questionText: `Limit x mendekati 3 dari (x² - 9) / (x - 3) adalah...`,
          options: ["3", "6", "9", "0"],
          correctOptionIndex: 1,
          explanation: `Faktorkan pembilang: (x² - 9) = (x - 3)(x + 3).\nMaka limit x->3 ((x-3)(x+3)) / (x-3) = limit x->3 (x + 3) = 3 + 3 = 6.`,
          points: 70,
          timerSeconds: 50
        },
        {
          questionText: `Sebuah segitiga memiliki panjang sisi 6 cm, 8 cm, dan x cm. Agar membentuk segitiga siku-siku, berapakah nilai x yang mungkin?`,
          options: ["10 cm", "14 cm", "2 cm", "12 cm"],
          correctOptionIndex: 0,
          explanation: `Menggunakan teorema Pythagoras: x² = 6² + 8² = 36 + 64 = 100. Maka x = 10 cm. Sisi terpanjang hipotenusa.`,
          points: 50,
          timerSeconds: 45
        }
      ];
    } else if (subject === "Physics") {
      fallbackQuestions = [
        {
          questionText: `Sebuah balok bermassa 4 kg didorong dengan gaya horizontal 20 N di atas lantai licin. Percepatan balok tersebut adalah...`,
          options: ["2 m/s²", "5 m/s²", "10 m/s²", "80 m/s²"],
          correctOptionIndex: 1,
          explanation: `Hukum II Newton: F = m * a => a = F / m = 20 N / 4 kg = 5 m/s².`,
          points: 60,
          timerSeconds: 45
        },
        {
          questionText: `Cahaya monokromatik melewati celah tunggal yang lebarnya 0.2 mm. Jika layar diletakkan 1 meter di belakang celah dan pita gelap kedua berjarak 6 mm dari terang pusat, panjang gelombang cahaya tersebut adalah...`,
          options: ["400 nm", "500 nm", "600 nm", "700 nm"],
          correctOptionIndex: 2,
          explanation: `Rumus celah tunggal untuk pita gelap: d * sin(θ) = n * λ. Untuk sudut kecil, sin(θ) ≈ y / L.\nd * y / L = n * λ => 0.2 * 10^-3 m * 6 * 10^-3 m / 1 m = 2 * λ\n1.2 * 10^-6 = 2λ => λ = 6 * 10^-7 m = 600 nm.`,
          points: 90,
          timerSeconds: 90
        }
      ];
    }

    res.json({
      success: true,
      questions: fallbackQuestions,
      isOfflineFallback: true
    });
  } else {
    // Fallback Material
    const offlineMaterial = {
      title: `${subject} - Konsep Inti Level ${level}`,
      content: `### 🚀 Selamat Datang di Aksara AI Offline Study Guide!

Kami menyiapkan materi berkualitas tinggi untuk membantu Anda menaklukkan UTBK dan ujian akademis dengan cepat dan efektif.

---

### 💡 Konsep Utama & Fondasi
Setiap topik pendidikan membutuhkan pemahaman visual dan logis yang mendalam dibanding sekadar menghafal rumus.
1. **Analisis Masalah**: Selalu identifikasi variabel yang diketahui sebelum memulai perhitungan.
2. **Prinsip Eliminasi**: Di UTBK, mengeliminasi 2-3 jawaban yang tidak logis jauh lebih cepat dibanding menghitung hasil eksak dari nol.
3. **Peta Pikiran (Mindmapping)**: Menghubungkan konsep sains/soal teks dengan analogi sehari-hari akan memperkuat memori jangka panjang Anda hingga 80%.

---

### 📝 Contoh Kasus & Solusi Kreatif
*Kasus Matematika*: Menghitung luas di bawah kurva parabola.
*   **Cara Biasa**: Integralkan persamaan dari batas bawah ke batas atas (memakan waktu 2-3 menit).
*   **Trik Aksara**: Gunakan rumus cepat Archimedes jika parabola memotong sumbu x: **L = (D √D) / (6 * a²)**. Hasil langsung keluar dalam 15 detik!

---

### 🔥 Tips Kilat UTBK (Aksara Life Hack)
> **Jangan terjebak pada soal yang sulit!** Setiap soal memiliki bobot IRT yang dinamis. Jika Anda menemui kesulitan dalam 30 detik pertama, berikan tanda "ragu-ragu", lewati, dan selesaikan soal fundamental terlebih dahulu untuk mengamankan poin dasar Anda!`,
      youtubeSearchQuery: `${subject} UTBK pembahasan soal dan tips kuasai konsep dasar`,
      durationMinutes: 6,
      xpReward: 80,
      isOfflineFallback: true
    };

    res.json({
      success: true,
      material: offlineMaterial
    });
  }
});


// MAIN RUNTIME & VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aksara Server] Server running on http://localhost:${PORT}`);
  });
}

startServer();
