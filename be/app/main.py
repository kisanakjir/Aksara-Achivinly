"""Aksara API — Main Application Entry Point.

FastAPI backend untuk platform EdTech Aksara.
"""

import sys
import os
import logging

# Force UTF-8 output untuk Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore

# Redam log SQLAlchemy yang sangat verbos (setiap query, ROLLBACK, dll)
# Biarkan hanya WARNING+ yang muncul
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db

# Import semua router
from app.routers import health, stats, graph, materials, progress, auth
from app.routers.settings import router as settings_router

# Buat FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API untuk platform gamifikasi EdTech Aksara",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — izinkan frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan semua router
app.include_router(health.router)
app.include_router(stats.router)
app.include_router(graph.router)
app.include_router(materials.router)
app.include_router(progress.router)
app.include_router(auth.router)
app.include_router(settings_router)


@app.on_event("startup")
def on_startup():
    """Inisialisasi saat server pertama kali jalan."""
    # Buat tabel database jika belum ada (development convenience)
    try:
        init_db()
        print("[OK] Database tables initialized")
    except Exception as e:
        print(f"[WARN] Database init skipped: {e}")
        print("  Pastikan MySQL sudah running dan database 'aksara_db' sudah dibuat.")

    print(f"[START] {settings.APP_NAME} started")
    print(f"[DOCS]  http://localhost:8000/docs")
