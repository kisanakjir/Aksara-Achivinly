"""Router untuk pengaturan user (settings)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from pydantic import BaseModel, Field
from typing import Optional


class SettingsResponse(BaseModel):
    success: bool = True
    data: dict


class UpdateSettingsRequest(BaseModel):
    daily_goal_minutes: int = Field(..., ge=5, le=480, description="Target belajar harian dalam menit")
    goal_name: Optional[str] = None
    goal_intensity: Optional[int] = None
    goal_subjects: Optional[str] = None


router = APIRouter(prefix="/api/settings", tags=["Pengaturan"])


@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
):
    """Dapatkan profil dan pengaturan user yang sedang login."""
    return SettingsResponse(
        success=True,
        data=current_user.to_dict(),
    )


@router.put("/goal")
def update_daily_goal(
    req: UpdateSettingsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update target belajar harian user."""
    current_user.daily_goal_minutes = req.daily_goal_minutes
    if req.goal_name is not None:
        current_user.goal_name = req.goal_name
    if req.goal_intensity is not None:
        current_user.goal_intensity = req.goal_intensity
    if req.goal_subjects is not None:
        current_user.goal_subjects = req.goal_subjects
    db.commit()
    db.refresh(current_user)

    return SettingsResponse(
        success=True,
        data=current_user.to_dict(),
    )
