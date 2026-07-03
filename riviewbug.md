# 🐛 Riview Bug — Aksara EdTech

> Dokumentasi **bug** (kesalahan logika yang menyebabkan fitur tidak berjalan benar).
> Bukan error startup/server — itu ada di `errorhandling.md`.

---

## 📋 Daftar Bug

| No | Bug | Level | Halaman Terkait | Status |
|----|-----|-------|----------------|--------|
| 1 | Data user lain masih nyangkut saat ganti akun | 🔴 Critical | Dashboard, Grafik, Materi | ✅ Selesai |
| 2 | Target harian hardcoded 30 menit, tidak bisa diubah | 🟠 High | Dashboard, Pengaturan | ✅ Selesai |
| 3 | `Text` tidak terimport — server gagal start | 🔴 Critical | — (server crash) | ✅ Selesai |
| 4 | Avatar profile tidak muncul di Settings & Nav Account | 🟠 High | Settings, Nav Header | ✅ Selesai |
| 5 | Target Belajar (nama, intensitas, mapel) tidak konek ke Dashboard | 🟠 High | Dashboard, LearningGoals | ✅ Selesai |
| 6 | Materi/Durasi nambah walau bukan fokus mapel + Statistik statis + Pengingat tidak berguna | 🟠 High | Dashboard, Learn | ✅ Selesai |

---

## 🔴 Bug #1: Data User Lain Masih Nyangkut (Multi-User)

### Masalah
Saat login dengan akun baru (hasil register), data yang muncul di Dashboard adalah data **IqbalMustafa** — bukan data kosong milik akun baru. Semua statistik, grafik, dan progres tercampur.

**Contoh:** Akun baru daftar → lihat Dashboard → muncul XP 4850, level 12, streak 4 hari (milik IqbalMustafa).

### Penyebab
Semua endpoint API backend menggunakan parameter `user_id: int = 1` secara hardcoded:

```python
# be/app/routers/stats.py — SEBELUM
@router.get("/daily")
def daily_stats(user_id: int = 1, db: Session = Depends(get_db)):
    data = get_daily_stats(db, user_id)  # ← selalu user_id=1
```

Frontend juga kirim `user_id=1`:
```typescript
// fe/src/services/statsApi.ts — SEBELUM
export async function getDailyStats(userId = 1) {
  return apiGet(`/api/stats/daily?user_id=${userId}`);
}
```

Artinya: **siapa pun yang login, backend selalu ambil data user ID 1 (IqbalMustafa)**.

### Fix (3 langkah)

#### Langkah 1: Ubah semua endpoint backend pakai JWT token
Ganti parameter `user_id: int = 1` dengan `current_user: User = Depends(get_current_user)`:

```python
# be/app/routers/stats.py — SESUDAH
from app.services.auth_service import get_current_user

@router.get("/daily")
def daily_stats(
    current_user: User = Depends(get_current_user),  # ← dari token JWT
    db: Session = Depends(get_db),
):
    data = get_daily_stats(db, current_user.id)  # ← pakai ID dari token
```

File yang diubah:
- `be/app/routers/stats.py` — 3 endpoint (daily, weekly, monthly)
- `be/app/routers/graph.py` — 3 endpoint (activity, scores, subject-distribution)
- `be/app/routers/progress.py` — 1 endpoint (save_progress)

#### Langkah 2: Hapus parameter user_id dari frontend
```typescript
// fe/src/services/statsApi.ts — SESUDAH
export async function getDailyStats() {  // ← tanpa parameter
  return apiGet("/api/stats/daily");     // ← tanpa query string
}
```

File yang diubah:
- `fe/src/services/statsApi.ts` — 4 fungsi
- `fe/src/services/graphApi.ts` — 3 fungsi

#### Langkah 3: Update apiClient untuk kirim token otomatis
```typescript
// fe/src/services/apiClient.ts
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("aksara_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
```

### Cara Menguji

#### Test 1: Register akun baru → data harus 0
```bash
# Register akun baru
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Test123","password":"test123"}'
# Simpan token dari response

# Cek daily stats pakai token di atas
curl -s http://localhost:8000/api/stats/daily \
  -H "Authorization: Bearer <token_dari_register>"
```
**Expected:** `minutes_studied: 0, xp_earned: 0, level: 1, streak_days: 0`

#### Test 2: Login sebagai IqbalMustafa → data lama tetap ada
```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"IqbalMustafa","password":"aksara123"}'

curl -s http://localhost:8000/api/stats/daily \
  -H "Authorization: Bearer <token_iqbal>"
```
**Expected:** `level: 13, current_xp: 350` (data asli IqbalMustafa)

#### Test 3: Frontend — ganti-ganti user
1. Buka http://localhost:3000
2. Login sebagai **Test123** (akun baru, password `test123`)
3. ✅ Dashboard kosong: XP 0, streak 0, grafik kosong
4. Logout → Login sebagai **IqbalMustafa** (password `aksara123`)
5. ✅ Dashboard penuh: XP 4850, streak 4 hari, grafik terisi

---

## 🟠 Bug #2: Target Harian Hardcoded 30 Menit

### Masalah
Target harian selalu 30 menit untuk semua user, tidak bisa diubah. Tidak ada UI untuk mengatur target.

**Akibat:** Progress bar target harian selalu "cepat penuh" karena patokannya 30 menit, padahal user mungkin ingin target lebih tinggi.

### Penyebab
```python
# be/app/services/stats_service.py — SEBELUM
daily_goal_minutes = 30  # ← hardcoded!
```

Tidak ada cara untuk user mengubah angka ini.

### Fix (3 langkah)

#### Langkah 1: Tambah kolom `daily_goal_minutes` di tabel users
```sql
ALTER TABLE users ADD COLUMN daily_goal_minutes INT DEFAULT 30 NOT NULL;
```

```python
# be/app/models/user.py
daily_goal_minutes = Column(Integer, default=30, nullable=False)
```

#### Langkah 2: Baca dari database, bukan hardcoded
```python
# be/app/services/stats_service.py — SESUDAH
daily_goal_minutes = user.daily_goal_minutes if user else 30
```

#### Langkah 3: Buat API settings + halaman Pengaturan
Backend:
- `GET /api/settings/profile` — ambil profil + target user
- `PUT /api/settings/goal` — update target (body: `{ "daily_goal_minutes": 45 }`)

Frontend:
- `fe/src/components/Settings.tsx` — halaman pengaturan dengan slider 5-480 menit
- Tab "Pengaturan" (icon Target) di navigasi utama

### Cara Menguji

#### Test API
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"IqbalMustafa","password":"aksara123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")

# Cek target saat ini
curl -s http://localhost:8000/api/settings/profile \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# Ganti target jadi 60 menit
curl -s -X PUT http://localhost:8000/api/settings/goal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"daily_goal_minutes": 60}' | python -m json.tool

# Verifikasi daily stats pakai target baru
curl -s http://localhost:8000/api/stats/daily \
  -H "Authorization: Bearer $TOKEN" | python -c "import sys,json;d=json.load(sys.stdin)['data'];print('Goal:', d['daily_goal_minutes'])"
```
**Expected:** `Goal: 60`

#### Test Frontend
1. Buka tab **Pengaturan** (icon Target di navbar)
2. ✅ Slider muncul dengan angka target saat ini
3. Geser slider ke angka yang diinginkan (misal 120)
4. Klik "Simpan Target"
5. ✅ Muncul centang hijau "Tersimpan!"
6. Buka tab **Beranda**
7. ✅ Progress bar target harian berubah sesuai slider

---

## 🟠 Bug #4: Avatar Profile Tidak Muncul di Settings & Nav Header

### Masalah
Setelah upload avatar di halaman Edit Profile, gambar tidak muncul di:
1. **Halaman Settings** (profile card) — cuma nampilin inisial lingkaran gradient
2. **Nav Header** (pojok kanan atas) — juga cuma inisial

### Penyebab
Ada **2 akar masalah**:

#### 1. Settings.tsx — tidak pernah render `<img>`
File `fe/src/components/Settings.tsx` baris 61-63:
```tsx
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ...">
  {profile?.username?.charAt(0).toUpperCase() || "?"}
</div>
```
Tidak ada pengecekan `profile?.avatar_url` — selalu fallback ke inisial.

#### 2. App.tsx — avatar_url tidak di-sync ke userStats + tidak render gambar
Di `fe/src/App.tsx`:
- **Sync (baris 179-191)**: field `avatar_url` dari `AuthContext.user` tidak dipindahkan ke `userStats`
- **Header (baris 480-483)**: render inisial saja, tidak ada `<img>` dan tidak punya akses ke `avatar_url`

#### 3. types.ts — UserStats tidak punya field avatar_url
```typescript
interface UserStats {
  username: string;
  // avatar_url: string | null;  ← field ini tidak ada!
  level: number;
  ...
}
```

### Fix (3 file)

#### File 1: `fe/src/types.ts` — tambah field
```diff
 export interface UserStats {
   username: string;
+  avatar_url: string | null;
```

#### File 2: `fe/src/App.tsx` — sync + header
**Initial state:**
```diff
 avatar_url: user?.avatar_url || null,
```
**Sync dari AuthContext:**
```diff
 avatar_url: user.avatar_url || null,
```
**Render header:**
```tsx
<div className="... overflow-hidden ...">
  {userStats.avatar_url ? (
    <img src={userStats.avatar_url} alt="" className="w-full h-full object-cover" />
  ) : (
    userStats.username.charAt(0)
  )}
</div>
```

#### File 3: `fe/src/components/Settings.tsx` — render gambar
```tsx
<div className="... overflow-hidden ...">
  {profile?.avatar_url ? (
    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
  ) : (
    profile?.username?.charAt(0).toUpperCase() || "?"
  )}
</div>
```

### Severity
🟠 **High** — fitur tidak berfungsi, tapi tidak block server.

### Root Cause
Developer hanya implement avatar di halaman EditProfile (upload + preview) tapi lupa update:
1. Halaman Settings yang nampilin profil user
2. Nav header yang selalu kelihatan
3. Interface `UserStats` — tidak punya field `avatar_url`

### Catatan
- `EditProfile.tsx` sudah benar — upload via FileReader → base64 → `PUT /api/auth/profile`
- Backend sudah benar — `avatar_url` tersimpan di DB dan dikembalikan via `GET /api/settings/profile` maupun `GET /api/auth/me`
- Cuma frontend rendering-nya yang kurang 2 tempat

---

## 🟠 Bug #5: Target Belajar Tidak Connect ke Dashboard

### Masalah
Setting target belajar di halaman Learning Goals (nama target, durasi, intensitas, fokus mapel) tidak muncul di Dashboard. Yang tampil cuma data statis default.

**Gejala:**
1. Nama target "UTBK 2026" tidak muncul di Dashboard
2. Progress materi tidak ada (masih progress menit)
3. Fokus mapel tidak tampil
4. Durasi belajar (menit) jadi card utama, bukan sekunder

### Penyebab
Ada **3 celah** yang bikin data putus:

#### 1. Backend — tidak ada kolom goal di database & API
Model `User` cuma punya `daily_goal_minutes`. Tidak ada kolom untuk `goal_name`, `goal_intensity`, `goal_subjects`. Endpoint `PUT /api/settings/goal` cuma nyimpen `daily_goal_minutes`.

#### 2. Frontend — LearningGoals tidak kirim data ke App.tsx
```typescript
// LearningGoals.tsx — SEBELUM
onGoalUpdated?: (minutes: number) => void;
...
onGoalUpdated?.(dailyGoal);  // cuma kirim menit doang!
```
Plus, props `onGoalUpdated` nggak di-destructure — jadi callback-nya ilang:
```typescript
// SEBELUM — nggak ada onGoalUpdated di destructure!
export default function LearningGoals({ isDarkMode, onBack }: LearningGoalsProps) {
```

#### 3. Frontend — Dashboard tidak render informasi target
Dashboard cuma nampilin progress menit (`0 / 30 mnt`) — tidak ada nama target, progress materi, atau fokus mapel.

### Fix

#### Backend — Model & DB
```sql
ALTER TABLE users ADD COLUMN goal_name VARCHAR(100) DEFAULT 'UTBK 2026' NULL;
ALTER TABLE users ADD COLUMN goal_intensity INT DEFAULT 3 NOT NULL;
ALTER TABLE users ADD COLUMN goal_subjects TEXT NULL; -- JSON array
```
```python
# be/app/models/user.py
goal_name = Column(String(100), default="UTBK 2026", nullable=True)
goal_intensity = Column(Integer, default=3, nullable=False)
goal_subjects = Column(Text, nullable=True)
```

#### Backend — API
```python
# be/app/routers/settings.py
class UpdateSettingsRequest(BaseModel):
    daily_goal_minutes: int = Field(..., ge=5, le=480)
    goal_name: Optional[str] = None
    goal_intensity: Optional[int] = None
    goal_subjects: Optional[str] = None  # JSON string
```

#### Frontend — types.ts
```typescript
// UserStats tambah:
goalName: string;
goalIntensity: number;
goalSubjects: string[];
```

#### Frontend — App.tsx
```typescript
// Sync dari AuthContext:
goalName: user.goal_name || "UTBK 2026",
goalIntensity: user.goal_intensity || 3,
goalSubjects: user.goal_subjects ? JSON.parse(user.goal_subjects) : ["Matematika", "Fisika"],

// Handler baru — nerima semua data sekaligus:
const handleGoalUpdated = (data: { daily_goal_minutes; goal_name; goal_intensity; goal_subjects }) => {
  setUserStats(prev => ({
    ...prev,
    dailyGoalMinutes: data.daily_goal_minutes,
    goalName: data.goal_name,
    goalIntensity: data.goal_intensity,
    goalSubjects: data.goal_subjects,
  }));
};
```

#### Frontend — LearningGoals.tsx
```typescript
// Destructure onGoalUpdated:
export default function LearningGoals({ isDarkMode, onBack, onGoalUpdated }: LearningGoalsProps) {

// Kirim semua data via callback:
onGoalUpdated?.({ daily_goal_minutes: dailyGoal, goal_name: goalName, goal_intensity: goalIntensity, goal_subjects: goalSubjects });

// API call kirim semua field:
await apiPut("/api/settings/goal", {
  daily_goal_minutes: dailyGoal,
  goal_name: goalName,
  goal_intensity: goalIntensity,
  goal_subjects: JSON.stringify(goalSubjects),
});
```

#### Frontend — Dashboard.tsx (tampilan baru)
| Komponen | Isi |
|----------|-----|
| **Nama Target** | Banner gradient biru + tombol "Ubah" navigasi ke LearningGoals |
| **Materi** (primary) | `0 / 4` + progress bar hijau (target materi dari intensitas) |
| **Durasi** (secondary) | `0 / 30 mnt` + progress bar cyan |
| **Fokus Mapel** | Chip biru per mata pelajaran |

### Severity
🟠 **High** — fitur tidak berfungsi sepenuhnya, data setting tidak tampil.

### Root Cause
Fitur target belajar dikerjain bertahap tapi tidak selesai:
1. Bug #2 dulu cuma handle `daily_goal_minutes` (target menit)
2. LearningGoals kemudian dikembangin dengan UI lebih detail (nama, intensitas, mapel)
3. Tapi backend & data flow untuk field baru itu nggak pernah dibikin
4. Dashboard juga nggak diupdate render-nya

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `be/app/models/user.py` | Tambah kolom `goal_name`, `goal_intensity`, `goal_subjects` + to_dict |
| `be/app/routers/settings.py` | UpdateSchema + simpan field baru |
| `be/seed_data.py` | Seed data konsisten |
| **DB** | `ALTER TABLE` 3 kolom baru |
| `fe/src/types.ts` | `UserStats` tambah `goalName`, `goalIntensity`, `goalSubjects` |
| `fe/src/services/authApi.ts` | `AuthUser` tambah field baru |
| `fe/src/App.tsx` | Sync + `handleGoalUpdated` handler |
| `fe/src/components/LearningGoals.tsx` | Destructure `onGoalUpdated`, kirim semua data via callback + API |
| `fe/src/components/Dashboard.tsx` | Tampilan baru: nama target, materi primary, durasi secondary, fokus mapel |

---

## 🟠 Bug #6: Materi/Durasi Nambah Tanpa Filter + Statistik Statis + Pengingat Tidak Berguna

### Masalah
Ada **3 masalah** dalam 1 sesi:

#### Bug 6a: Materi & durasi nambah meskipun bukan fokus mapel
Saat user nonton video materi apapun (misal "Kimia"), `dailyMinutesCompleted` dan progress tetap bertambah — padahal fokus mapel user cuma ["Matematika", "Fisika", "Biologi"].

#### Bug 6b: Statistik Harian/Mingguan/Bulanan statis (0, 0, 79)
3 card statistik di dashboard cuma nampilin `0%`, `0%`, `79%` untuk semua user karena:
- Rata-rata harian dan mingguan baca dari `dailyStats?.average_score` yang selalu 0 (belum ada data)
- Rata-rata bulanan hardcoded `79` di initial state
- Tidak ada kalkulasi progress bulanan berdasarkan intensitas

#### Bug 6c: Pengingat Harian jelek & gak berguna
- Hanya berupa input `time` + toggle switch
- Tidak ada fungsi alarm/guna apapun

### Penyebab

#### 6a — Tidak ada filter fokus mapel di App.tsx
```typescript
// App.tsx handleCompleteMaterial — SEBELUM
const handleCompleteMaterial = (xpReward: number, durationMinutes: number) => {
  ...
  dailyMinutesCompleted: prev.dailyMinutesCompleted + durationMinutes, // selalu nambah!
};
```
Learn.tsx juga cuma kirim `(xp, minutes)` — tidak ngasih tau kategori materinya.

#### 6b — Tidak ada kalkulasi progress bulanan
```typescript
// Dashboard.tsx — SEBELUM
<div className="grid grid-cols-3 gap-3 text-center">
  <div>Harian: 0%</div>  // statis
  <div>Mingguan: 0%</div> // statis
  <div>Bulanan: 79%</div> // hardcoded
</div>
```
3 card ini cuma menampilkan angka dari `displayedScores` yang sumbernya `averageScore` dari API yang belum ada datanya.

#### 6c — Pengingat tidak berfungsi
Hanya toggle + input time tanpa logic apapun.

### Fix

#### 6a — Filter fokus mapel

**App.tsx — handleCompleteMaterial:**
```typescript
// SESUDAH — terima parameter category
const handleCompleteMaterial = (xpReward: number, durationMinutes: number, materialCategory?: string) => {
  // Cek apakah materi ini masuk fokus mapel user
  const isFocusSubject = !materialCategory || prev.goalSubjects.includes(materialCategory);
  ...
  dailyMinutesCompleted: isFocusSubject ? prev.dailyMinutesCompleted + durationMinutes : prev.dailyMinutesCompleted,
  // ↑↑↑ cuma nambah kalo masuk fokus mapel!
};
```

**Learn.tsx — kirim kategori:**
```typescript
// SESUDAH
onCompleteMaterial(selectedMaterial.xpReward, selectedMaterial.durationMinutes, selectedMaterial.category);
```

#### 6b — Ganti jadi Progress Bulanan

Hapus 3 card rata-rata (harian/mingguan/bulanan) → ganti dengan **Progress Bulanan**:
```
Progress Bulanan                  [70%]
████████████████░░░░░░░░  70%
7 dari 300 materi terselesaikan
```

**Kalkulasi:**
```typescript
const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const monthlyTarget = targetMaterials * daysInMonth;  // intensitas × 30/31 hari
const monthlyCompleted = stats.monthlyMaterialsCompleted; // akumulasi real dari App.tsx
const monthlyProgress = Math.min(100, Math.round((monthlyCompleted / monthlyTarget) * 100));
```

**Progress bulanan menggunakan akumulasi real** (`monthlyMaterialsCompleted`) yang di-increment 1 setiap user selesai 1 materi fokus mapel. Bukan extrapolasi atau estimasi!

**Reset bulanan otomatis:**
```typescript
// App.tsx — handleCompleteMaterial
const nowMonth = new Date().toISOString().slice(0, 7); // "2026-07"
const isNewMonth = nowMonth !== prev.currentMonth;      // deteksi ganti bulan
const monthlyMaterials = isNewMonth ? 0 : prev.monthlyMaterialsCompleted; // reset ke 0
```

#### 6c — Ganti dengan Jam Digital Real-time

Hapus toggle alarm + input time → ganti dengan jam digital yang bisa diset zona waktu:
```
┌─────────────────────────────────────┐
│  🕐  14:32:47                       │
│      Kamis, 4 Juli 2026      [WIB ▼]│
└─────────────────────────────────────┘
```
- Berdetik real-time (interval 1 detik)
- Bisa pilih **SEMUA** zona waktu global (UTC-12 sampai UTC+14), bukan cuma Indonesia
- Zona waktu disimpan di localStorage

### Severity
🟠 **High** — progres tidak akurat & data statistik misleading.

### Poin Penting (jawaban untuk pertanyaan user)

1. **UTC Global** — ✅ Udah diganti. Dari cuma 3 zona Indonesia jadi **27 zona waktu global (UTC-12 sampai UTC+14)**.
2. **Aktivitas mingguan & tren skor & distribusi mapel** — Data dari backend (`DailyStat` + `LearningSession`), otomatis ngikut tanggal real-time. Setiap hari baru grafik slide sendiri karena query filter 7 hari terakhir. Gak perlu "reset" manual.
3. **Progress bulanan reset tiap bulan** — ✅ Udah. Deteksi via `currentMonth` string ("YYYY-MM"), kalo beda bulan → `monthlyMaterialsCompleted` dan `monthlyMinutesCompleted` balik ke 0.
4. **Progress bulanan nambah 1 per materi, bukan extrapolasi** — ✅ Udah. Sekarang pake `monthlyMaterialsCompleted` yang di-`++` tiap 1 materi fokus mapel selesai. Gak ada lagi formula `(1/4) * 4 * 7 = 7` yang bikin loncat banyak.
5. **Materi & durasi & progress bulanan cuma keisi kalo fokus mapel** — ✅ Udah. `isFocusSubject` ngecek `goalSubjects.includes()` sebelum nambahin apapun.

### File yang Diubah
| File | Perubahan |
|------|-----------|
| `fe/src/App.tsx` | `handleCompleteMaterial` tambah parameter `materialCategory` + filter `goalSubjects.includes()` + 2 accumulator monthly + deteksi reset bulanan via `currentMonth` |
| `fe/src/components/Learn.tsx` | Update interface `LearnProps` + kirim `selectedMaterial.category` |
| `fe/src/components/Dashboard.tsx` | Hapus 3 card rata-rata → tambah card Progress Bulanan (akumulasi real); hapus Pengingat → ganti jam digital global (UTC-12 sampai UTC+14) |
| `fe/src/types.ts` | `UserStats` tambah `monthlyMaterialsCompleted`, `monthlyMinutesCompleted`, `currentMonth` |

---

## 🔴 Bug #3: Missing Import — `Text` vs `text` di SQLAlchemy

### Masalah
Server FastAPI gagal start sama sekali dengan `NameError: name 'Text' is not defined`.

**Error:**
```
File "C:\...\app\models\user.py", line 11, in User
    avatar_url = Column(Text, nullable=True)
NameError: name 'Text' is not defined
```

### Penyebab
File `be/app/models/user.py` menggunakan `Text` (tipe kolom) di field `avatar_url` tapi lupa mengimportnya. Yang diimport adalah `text` (fungsi SQL literal), yang merupakan objek berbeda.

**Import yang salah:**
```python
from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text
#                                                               ^^^^
# Ini fungsi SQL literal — BUKAN tipe kolom!
```

### Fix
```diff
-from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text
+from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, Text, text
```

### Severity
🔴 **Critical** — blocking, server tidak bisa start.

### Root Cause
Developer keliru membedakan dua objek SQLAlchemy yang mirip:
- `text` (lowercase) → fungsi untuk SQL literal: `text("CURRENT_TIMESTAMP")`
- `Text` (capital T) → class untuk tipe kolom: `Column(Text, nullable=True)`

### Preventif
- Jalankan `mypy`/`pyright` di Python backend sebelum commit — NameError seperti ini langsung terdeteksi
- Perhatikan casing saat import dari paket besar seperti SQLAlchemy
- Review import statement saat menambah kolom dengan tipe data baru

---

## 🔍 Ringkasan Bug

| No | Bug | Akar Masalah | Fix Utama | File yang Diubah |
|----|-----|-------------|-----------|-----------------|
| 1 | Data user nyangkut | `user_id=1` hardcoded di semua endpoint | Ganti pakai JWT `get_current_user()` | stats.py, graph.py, progress.py, statsApi.ts, graphApi.ts, apiClient.ts |
| 2 | Target hardcoded 30 | Literal `30` di service layer | Simpan di DB + API settings + halaman Pengaturan | stats_service.py, user.py, settings.py, Settings.tsx |
| 3 | Text import error | Import `text` lowercase bukan `Text` capital | Tambah `Text` ke import sqlalchemy | user.py |
| 4 | Avatar tidak muncul | 3 titik: UserStats tanpa avatar_url, sync kurang, render inisial doang | Tambah field ke UserStats, sync dari AuthContext, render <img> | types.ts, App.tsx, Settings.tsx |
| 5 | Target Belajar tidak konek ke Dashboard | 3 celah: DB kurang kolom goal, callback ngga nyampe, Dashboard ngga render | Tambah 3 kolom DB/API, callback full data, redesign Dashboard cards | user.py, settings.py, types.ts, App.tsx, LearningGoals.tsx, Dashboard.tsx, seed_data.py |
| 6 | Materi/Durasi nambah tanpa filter + Statistik statis + Pengingat jelek | 3 bug jadi 1: (a) tidak ada filter fokus mapel, (b) rata-rata harian/mingguan/bulanan statis, (c) pengingat gak kepake | (a) filter fokus mapel di handleCompleteMaterial, (b) ganti jadi progress bulanan kalkulasi intensitas, (c) ganti jadi jam digital real-time + UTC selector | App.tsx, Learn.tsx, Dashboard.tsx |

### Checklist Verifikasi Cepat

```bash
# 1. Register user baru → data dari awal
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Coba123","password":"coba123"}' | python -c "import sys,json;d=json.load(sys.stdin);print('Level:', d['user']['level'], 'XP:', d['user']['current_xp'])"
# Expected: Level: 1 XP: 0

# 2. Login dengan user baru → statistik kosong
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"username":"Coba123","password":"coba123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s http://localhost:8000/api/stats/daily -H "Authorization: Bearer $TOKEN" | python -c "import sys,json;d=json.load(sys.stdin)['data'];print('Minutes:', d['minutes_studied'], 'XP:', d['xp_earned'])"
# Expected: Minutes: 0 XP: 0

# 3. Atur target harian
curl -s -X PUT http://localhost:8000/api/settings/goal -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"daily_goal_minutes":45}' | python -c "import sys,json;d=json.load(sys.stdin)['data'];print('Goal:', d['daily_goal_minutes'])"
# Expected: Goal: 45
```
