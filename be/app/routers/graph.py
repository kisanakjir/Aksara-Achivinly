"""Router untuk endpoint grafik dan visualisasi."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.graph_service import (
    get_activity_graph,
    get_scores_graph,
    get_subject_distribution,
)
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/graph", tags=["Grafik"])


@router.get("/activity")
def activity_graph(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Data untuk bar chart aktivitas mingguan (berdasarkan token JWT)."""
    data = get_activity_graph(db, current_user.id)
    return {"success": True, "data": data}


@router.get("/scores")
def scores_graph(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Data untuk line chart skor 7 hari terakhir (berdasarkan token JWT)."""
    data = get_scores_graph(db, current_user.id)
    return {"success": True, "data": data}


@router.get("/subject-distribution")
def subject_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Data untuk donut chart distribusi waktu per mapel (berdasarkan token JWT)."""
    data = get_subject_distribution(db, current_user.id)
    return {"success": True, "data": data}
