"""Router untuk endpoint statistik pengguna."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.stats_service import get_daily_stats, get_weekly_stats, get_monthly_stats
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/stats", tags=["Statistik"])


@router.get("/daily")
def daily_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dapatkan statistik harian user (berdasarkan token JWT)."""
    data = get_daily_stats(db, current_user.id)
    data["username"] = current_user.username
    data["display_name"] = current_user.display_name
    return {"success": True, "data": data}


@router.get("/weekly")
def weekly_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dapatkan statistik mingguan user (berdasarkan token JWT)."""
    data = get_weekly_stats(db, current_user.id)
    return {"success": True, "data": data}


@router.get("/monthly")
def monthly_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dapatkan statistik bulanan user (berdasarkan token JWT)."""
    data = get_monthly_stats(db, current_user.id)
    return {"success": True, "data": data}
