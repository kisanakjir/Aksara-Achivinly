"""Router untuk endpoint progres belajar."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.learning_session import LearningSession
from app.models.material import Material
from app.services.xp_service import (
    calculate_level_up,
    update_streak,
    update_daily_stats,
)
from app.schemas.stats import ProgressRequest, ProgressResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progres"])


@router.post("", response_model=ProgressResponse)
def save_progress(
    req: ProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Simpan progres belajar user (user_id dari token JWT)."""
    # Abaikan req.user_id — pakai user dari token
    user = current_user
    req.user_id = current_user.id

    # Cari materi jika ada
    material = None
    if req.material_id:
        material = db.query(Material).filter(Material.id == req.material_id).first()

    # Hitung XP & level up
    level_result = calculate_level_up(user.current_xp, user.xp_to_next_level, req.xp_earned)

    # Update user
    user.current_xp = level_result["new_xp"]
    user.total_minutes_studied += req.duration_minutes

    if level_result["did_level_up"]:
        user.level += level_result["levels_gained"]
        user.xp_to_next_level = level_result["new_xp_to_next"]

    # Update streak
    streak = update_streak(db, user)

    # Simpan learning session
    session = LearningSession(
        user_id=req.user_id,
        material_id=req.material_id,
        session_type=req.session_type,
        duration_minutes=req.duration_minutes,
        xp_earned=req.xp_earned,
        score=req.score,
        is_completed=req.is_completed,
    )
    db.add(session)

    # Update daily stats
    update_daily_stats(
        db=db,
        user_id=req.user_id,
        minutes=req.duration_minutes,
        xp=req.xp_earned,
        material_completed=(req.session_type == "material" and req.is_completed),
        quiz_taken=(req.session_type == "quiz"),
        score=req.score,
    )

    db.commit()

    return ProgressResponse(
        success=True,
        xp_earned=req.xp_earned,
        level_up=level_result["did_level_up"],
        new_level=user.level if level_result["did_level_up"] else None,
        streak_days=streak,
        message="Progress berhasil disimpan!",
    )
