"""Layanan untuk data statistik pengguna."""

from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.daily_stat import DailyStat
from app.models.learning_session import LearningSession
from app.services.xp_service import XP_PER_LEVEL_BASE


def get_daily_stats(db: Session, user_id: int) -> dict:
    """Dapatkan statistik harian user."""
    today = date.today()

    # Cari daily stat hari ini
    daily = (
        db.query(DailyStat)
        .filter(DailyStat.user_id == user_id, DailyStat.date == today)
        .first()
    )

    # Cari user
    user = db.query(User).filter(User.id == user_id).first()

    # Hitung persentase target harian dari user's setting
    daily_goal_minutes = user.daily_goal_minutes if user else 30
    minutes_today = daily.minutes_studied if daily else 0
    goal_progress = round((minutes_today / daily_goal_minutes) * 100, 1)

    return {
        "date": str(today),
        "minutes_studied": minutes_today,
        "materials_completed": daily.materials_completed if daily else 0,
        "quizzes_taken": daily.quizzes_taken if daily else 0,
        "average_score": float(daily.average_score) if daily and daily.average_score else 0,
        "xp_earned": daily.xp_earned if daily else 0,
        "streak_days": user.streak_days if user else 0,
        "level": user.level if user else 1,
        "current_xp": user.current_xp if user else 0,
        "xp_to_next_level": user.xp_to_next_level if user else 1000,
        "daily_goal_minutes": daily_goal_minutes,
        "goal_progress_percentage": goal_progress,
    }


def get_weekly_stats(db: Session, user_id: int) -> dict:
    """Dapatkan statistik mingguan user (7 hari terakhir)."""
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    # Ambil daily stats 7 hari terakhir
    daily_stats = (
        db.query(DailyStat)
        .filter(
            DailyStat.user_id == user_id,
            DailyStat.date >= seven_days_ago,
        )
        .order_by(DailyStat.date)
        .all()
    )

    # Map data per hari
    stats_by_date = {str(ds.date): ds for ds in daily_stats}

    day_names = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    day_by_day = []

    total_minutes = 0
    total_xp = 0
    total_score = 0
    score_count = 0
    active_days = 0

    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        date_str = str(d)
        ds = stats_by_date.get(date_str)

        minutes = ds.minutes_studied if ds else 0
        xp = ds.xp_earned if ds else 0
        score = float(ds.average_score) if ds and ds.average_score else 0

        total_minutes += minutes
        total_xp += xp
        if ds and ds.average_score:
            total_score += float(ds.average_score)
            score_count += 1
        if minutes > 0:
            active_days += 1

        day_by_day.append({
            "day": day_names[d.weekday()],
            "date": date_str,
            "minutes": minutes,
            "score": score,
            "xp": xp,
        })

    return {
        "total_minutes": total_minutes,
        "total_xp": total_xp,
        "average_score": round(total_score / score_count, 1) if score_count > 0 else 0,
        "active_days": active_days,
        "materials_completed": sum(ds.materials_completed for ds in daily_stats if ds),
        "day_by_day": day_by_day,
    }


def get_monthly_stats(db: Session, user_id: int) -> dict:
    """Dapatkan statistik bulanan user."""
    today = date.today()
    first_of_month = today.replace(day=1)

    daily_stats = (
        db.query(
            func.sum(DailyStat.minutes_studied),
            func.sum(DailyStat.xp_earned),
            func.sum(DailyStat.materials_completed),
            func.sum(DailyStat.quizzes_taken),
            func.avg(DailyStat.average_score),
            func.count(DailyStat.id),
        )
        .filter(
            DailyStat.user_id == user_id,
            DailyStat.date >= first_of_month,
        )
        .first()
    )

    total_minutes = daily_stats[0] or 0
    total_xp = daily_stats[1] or 0
    total_materials = daily_stats[2] or 0
    total_quizzes = daily_stats[3] or 0
    avg_score = float(daily_stats[4]) if daily_stats[4] else 0
    active_days = daily_stats[5] or 0

    return {
        "month": today.strftime("%B %Y"),
        "total_minutes": total_minutes,
        "total_xp": total_xp,
        "total_materials_completed": total_materials,
        "total_quizzes_taken": total_quizzes,
        "average_score": round(avg_score, 1),
        "active_days": active_days,
    }
