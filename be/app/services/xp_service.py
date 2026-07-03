"""Layanan untuk perhitungan XP, level, dan streak."""

from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.daily_stat import DailyStat
from app.models.learning_session import LearningSession

XP_PER_LEVEL_BASE = 1000
XP_MULTIPLIER = 1.2


def calculate_level_up(current_xp: int, xp_to_next: int, earned_xp: int) -> dict:
    """
    Hitung level up setelah mendapatkan XP.

    Returns:
        dict dengan keys: new_xp, levels_gained, new_xp_to_next, did_level_up
    """
    total = current_xp + earned_xp
    levels_gained = 0
    remaining = total
    current_threshold = xp_to_next

    while remaining >= current_threshold:
        remaining -= current_threshold
        levels_gained += 1
        current_threshold = int(current_threshold * XP_MULTIPLIER)

    return {
        "new_xp": remaining,
        "levels_gained": levels_gained,
        "new_xp_to_next": current_threshold,
        "did_level_up": levels_gained > 0,
    }


def update_streak(db: Session, user: User) -> int:
    """Update streak harian user. Kembalikan streak terbaru."""
    today = date.today()
    yesterday = today - timedelta(days=1)

    if user.last_active_date == today:
        # Sudah aktif hari ini, streak不变
        return user.streak_days
    elif user.last_active_date == yesterday:
        # Lanjut streak
        user.streak_days += 1
    else:
        # Streak putus
        user.streak_days = 1

    user.last_active_date = today
    db.commit()
    return user.streak_days


def update_daily_stats(
    db: Session,
    user_id: int,
    minutes: int = 0,
    xp: int = 0,
    material_completed: bool = False,
    quiz_taken: bool = False,
    score: int = None,
) -> DailyStat:
    """Update atau buat statistik harian user."""
    today = date.today()

    # Cari record hari ini
    daily = (
        db.query(DailyStat)
        .filter(DailyStat.user_id == user_id, DailyStat.date == today)
        .first()
    )

    if not daily:
        daily = DailyStat(
            user_id=user_id,
            date=today,
            minutes_studied=0,
            materials_completed=0,
            quizzes_taken=0,
            xp_earned=0,
        )
        db.add(daily)

    daily.minutes_studied += minutes
    daily.xp_earned += xp

    if material_completed:
        daily.materials_completed += 1

    if quiz_taken:
        daily.quizzes_taken += 1
        # Update rata-rata skor
        if score is not None:
            old_total = daily.average_score or 0
            daily.average_score = round(
                (old_total * (daily.quizzes_taken - 1) + score) / daily.quizzes_taken, 2
            )

    db.commit()
    db.refresh(daily)
    return daily
