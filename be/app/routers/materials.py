"""Router untuk endpoint materi belajar."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services.material_service import (
    get_subjects,
    get_materials,
    get_material_by_id,
    create_material,
)
from app.services.gemini_service import generate_material
from app.schemas.material import (
    SubjectListResponse,
    SubjectResponse,
    MaterialListResponse,
    MaterialDetailResponse,
    MaterialGenerateRequest,
    MaterialGenerateResponse,
)

router = APIRouter(prefix="/api", tags=["Materi"])


@router.get("/subjects", response_model=SubjectListResponse)
def list_subjects(db: Session = Depends(get_db)):
    """Dapatkan daftar semua mata pelajaran."""
    subjects = get_subjects(db)
    return {"success": True, "data": [SubjectResponse.from_orm(s) for s in subjects]}


@router.get("/materials", response_model=MaterialListResponse)
def list_materials(
    subject_id: Optional[int] = Query(None),
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Dapatkan daftar materi dengan filter opsional."""
    materials = get_materials(db, subject_id, level)
    return {
        "success": True,
        "data": materials,
        "total": len(materials),
    }


@router.get("/materials/{material_id}", response_model=MaterialDetailResponse)
def detail_material(material_id: int, db: Session = Depends(get_db)):
    """Dapatkan detail materi berdasarkan ID."""
    material = get_material_by_id(db, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Materi tidak ditemukan")
    return {"success": True, "data": material}


@router.post("/materials/generate", response_model=MaterialGenerateResponse)
async def generate_material_ai(req: MaterialGenerateRequest):
    """Generate materi baru menggunakan Gemini AI."""
    result = await generate_material(
        subject=f"subject_{req.subject_id}",
        level=req.level,
        topic=req.topic,
    )
    return result
