# 🐛 Error Handling Dokumentasi — Aksara Backend Python

> Dokumentasi ini mencatat error terbaru yang muncul saat development,
> lengkap dengan analisis, langkah penyelesaian, dan solusi akhir.

---

## 📋 Daftar Error

| No | Error | Tanggal | Status |
|----|-------|---------|--------|
| 1 | `GET /api/graph/subject-distribution` → `500 Internal Server Error` | 03 Jul 2026 | ✅ Selesai |
| 2 | `NameError: name 'Text' is not defined` — server FastAPI gagal start | 04 Jul 2026 | ✅ Selesai |

---

## ❌ Error #1: AttributeError — 'Material' object has no attribute 'subject'

### 1.1 Error Output (di Terminal)

```
INFO:     127.0.0.1:57058 - "GET /api/graph/subject-distribution?user_id=1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  ...
  File "C:\...\app\routers\graph.py", line 32, in subject_distribution
    data = get_subject_distribution(db, user_id)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\...\app\services\graph_service.py", line 110, in get_subject_distribution
    if session.material and session.material.subject:
                            ^^^^^^^^^^^^^^^^^^^^^^^^
AttributeError: 'Material' object has no attribute 'subject'
```

**Ketika:** Browser/Postman memanggil `GET /api/graph/subject-distribution?user_id=1`

### 1.2 Analisis

**Akar masalah:** Ada kode di `graph_service.py` yang mencoba mengakses `session.material.subject`, tapi model `Material` tidak memiliki attribute/relationship bernama `subject`.

**Detail:**

1. `LearningSession` punya `material_id` (foreign key ke tabel `materials`)
2. `LearningSession` punya relationship `material = relationship("Material")` → jadi `session.material` bisa diakses
3. `Material` punya `subject_id` (foreign key ke tabel `subjects`)
4. Tapi `Material` **tidak punya relationship** ke `Subject` → jadi `session.material.subject` gagal

**Kode yang bermasalah** (`graph_service.py` line ~109-110):
```python
if session.material and session.material.subject:
    subject_name = session.material.subject.name
```

`session.material` → ✅ bisa (karena ada relationship di `LearningSession`)
`session.material.subject` → ❌ ERROR! Tidak ada relationship `subject` di model `Material`

### 1.3 Langkah Penyelesaian (Step-by-Step)

#### Langkah 1: Baca pesan error dengan teliti
```
AttributeError: 'Material' object has no attribute 'subject'
```
Ini memberitahu: objek `Material` tidak punya atribut `subject`.

#### Langkah 2: Cari lokasi error
Dari traceback:
- File: `be/app/services/graph_service.py`
- Baris: 110
- Fungsi: `get_subject_distribution`

#### Langkah 3: Buka file model Material
```bash
cat be/app/models/material.py
```
Terlihat bahwa `Material` punya kolom `subject_id` tapi **tidak ada** `subject = relationship(...)`.

#### Langkah 4: Tambahkan relationship di Material
```python
from sqlalchemy.orm import relationship

class Material(Base):
    # ... kolom existing ...
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"))
    
    subject = relationship("Subject", backref="materials")  # ← TAMBAHKAN INI
```

**Penjelasan:**
- `relationship("Subject")` — memberitahu SQLAlchemy bahwa `Material` berelasi ke `Subject`
- `backref="materials"` — membalik relasi, jadi `Subject` bisa akses `subject.materials`
- Dengan ini, `session.material.subject` akan otomatis melakukan JOIN ambil data Subject

#### Langkah 5: Verifikasi tidak ada error serupa di tempat lain
Cari semua penggunaan `.subject` di service:
```bash
grep -rn "\.material\.subject\|\.subject\." app/services/
```
Hanya satu lokasi — di `graph_service.py` line 110. Sudah teratasi.

### 1.4 Perubahan Akhir

#### File: `be/app/models/material.py`
```diff
+ from sqlalchemy.orm import relationship

  class Material(Base):
      __tablename__ = "materials"

      id = Column(Integer, primary_key=True, autoincrement=True)
      subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
      title = Column(String(255), nullable=False)
      # ... kolom lain ...

+     subject = relationship("Subject", backref="materials")
```

Kode di `graph_service.py` **tidak perlu diubah** — karena setelah relationship ditambahkan, `session.material.subject` sudah benar secara otomatis.

### 1.5 Verifikasi

#### Test langsung dengan curl:
```bash
curl http://127.0.0.1:8000/api/graph/subject-distribution?user_id=1
```

**Sebelum perbaikan:**
```
500 Internal Server Error
AttributeError: 'Material' object has no attribute 'subject'
```

**Sesudah perbaikan:**
```json
{
  "success": true,
  "data": [
    { "subject": "Matematika", "minutes": 10, "percentage": 100.0, "color": "#3b82f6" }
  ]
}
```

#### Test via Swagger UI:
1. Buka http://localhost:8000/docs
2. Cari endpoint `GET /api/graph/subject-distribution`
3. Klik "Try it out" → masukkan `user_id=1` → Execute
4. **Expected:** Response 200 dengan array distribusi mapel

#### Test lewat frontend:
1. Backend jalan: `cd be && venv\Scripts\uvicorn app.main:app --port 8000`
2. Frontend jalan: `cd fe && npm run dev`
3. Buka Dashboard (tab Beranda)
4. **Expected:** Donut chart distribusi mapel muncul (tidak error)

---

## 🧠 Ringkasan Root Cause

| Layer | Masalah | Perbaikan |
|-------|---------|-----------|
| **Model** | `Material` punya `subject_id` (FK) tapi tidak punya `relationship("Subject")` | Tambah `subject = relationship("Subject", backref="materials")` |
| **Service** | `graph_service.py` akses `session.material.subject` — error karena relasi tidak ada | Tidak perlu diubah — model fix sudah cukup |
| **API** | Endpoint subject-distribution return 500 | Sekarang return 200 OK dengan data |

### Kenapa ini terjadi?

Kesalahan developer: **lupa menambahkan relationship** di model `Material`.

Saat initial coding, saya membuat `Material` dengan kolom `subject_id` (foreign key) tapi lupa mendefinisikan `relationship("Subject")`. SQLAlchemy membutuhkan relationship eksplisit untuk melakukan lazy loading antar tabel.

**Pelajaran:**
- Setiap ForeignKey harus selalu diikuti oleh `relationship()` yang sesuai
- `backref` membuat relasi dua arah (Material → Subject dan Subject → materials)
- Error `has no attribute` sering berarti relationship yang lupa di-definisikan, bukan kolom yang hilang

### Checklist Preventif

Sebelum deploy/commit:
- [ ] Setiap `ForeignKey` diikuti `relationship()` yang sesuai
- [ ] Service layer yang akses relasi antar tabel sudah di-test dengan data nyata
- [ ] Endpoint yang return 500 di-log dan dianalisis

### Tips: Debug 500 Error

1. Cari `ERROR:` di terminal — FastAPI selalu mencetak full traceback
2. Baca baris terakhir traceback — cari `AttributeError` atau `TypeError`
3. Cek model: apakah relasi/atribut yang diakses benar-benar ada?
4. Cek kode: apakah ada typo di nama atribut?

---

## ❌ Error #2: NameError — `Text` Tidak Terdefinisi di Model User

### 2.1 Error Output (di Terminal)

```
Process SpawnProcess-2:
Traceback (most recent call last):
  ...
  File "C:\...\app\models\user.py", line 11, in User
    avatar_url = Column(Text, nullable=True)  # VARCHAR(255) → TEXT untuk base64 image
NameError: name 'Text' is not defined
```

**Ketika:** Server FastAPI dijalankan via `venv\Scripts\uvicorn app.main:app --port 8000`

### 2.2 Analisis

**Akar masalah:** Kolom `avatar_url` menggunakan tipe `Text` dari SQLAlchemy, tapi hanya `text` (fungsi SQL lowercase) yang diimport — bukan `Text` (tipe kolom capital-T).

SQLAlchemy punya dua objek dengan nama mirip:

| Nama | Type | Fungsi |
|------|------|--------|
| `text` | function | SQL literal expression, e.g. `text("CURRENT_TIMESTAMP")` |
| `Text` | class | Column type, menghasilkan `TEXT` di database |

**Kode yang bermasalah** (`user.py` line 1):
```python
from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text
#                                                                ^^^^ ini fungsi, bukan tipe kolom
```

**Kode yang pakai `Text`** (`user.py` line 11):
```python
avatar_url = Column(Text, nullable=True)
#                  ^^^^ ini refer ke tipe kolom, tapi nggak diimport
```

### 2.3 Langkah Penyelesaian

1. Buka `be/app/models/user.py`
2. Lihat baris import — hanya `text` (lowercase) yang ada
3. Tambahkan `Text` (capital T) ke import statement
4. Simpan file

```diff
-from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text
+from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, Text, text
```

### 2.4 Perubahan Akhir

#### File: `be/app/models/user.py`
```diff
-from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text
+from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, Text, text
```

### 2.5 Verifikasi

Jalankan ulang server:
```bash
cd be && venv\Scripts\uvicorn app.main:app --port 8000
```

**Sebelum:**
```
NameError: name 'Text' is not defined
```

**Sesudah:**
```
[OK] Database tables initialized
[START] Aksara API started
[DOCS]  http://localhost:8000/docs
```

### Root Cause

Developer salah membedakan `Text` (capital T = tipe kolom SQLAlchemy) dengan `text` (lowercase = fungsi SQL expression). Keduanya adalah objek berbeda dari paket `sqlalchemy` yang sama.

### Pelajaran

- Perhatikan casing nama import — `Text` dan `text` adalah dua hal berbeda
- `text()` → untuk SQL literal seperti `text("CURRENT_TIMESTAMP")`
- `Text` → untuk tipe kolom TEXT di database
- Saat menambah kolom dengan tipe baru, pastikan tipenya sudah diimport
