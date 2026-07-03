"""Layanan untuk data grafik dan visualisasi."""

from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.daily_stat import DailyStat
from app.models.learning_session import LearningSession
from app.models.subject import Subject


def get_activity_graph(db: Session, user_id: int) -> dict:
    """Data untuk bar chart aktivitas mingguan (menit belajar per hari)."""
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    daily_stats = (
        db.query(DailyStat)
        .filter(
            DailyStat.user_id == user_id,
            DailyStat.date >= seven_days_ago,
        )
        .order_by(DailyStat.date)
        .all()
    )

    stats_by_date = {str(ds.date): ds for ds in daily_stats}
    day_names = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

    labels = []
    data = []

    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        date_str = str(d)
        ds = stats_by_date.get(date_str)
        labels.append(day_names[d.weekday()])
        data.append(ds.minutes_studied if ds else 0)

    return {
        "type": "bar",
        "labels": labels,
        "datasets": [
            {
                "label": "Menit Belajar",
                "data": data,
                "backgroundColor": "#3b82f6",
            }
        ],
    }


def get_scores_graph(db: Session, user_id: int) -> dict:
    """Data untuk line chart skor 7 hari terakhir."""
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    daily_stats = (
        db.query(DailyStat)
        .filter(
            DailyStat.user_id == user_id,
            DailyStat.date >= seven_days_ago,
        )
        .order_by(DailyStat.date)
        .all()
    )

    stats_by_date = {str(ds.date): ds for ds in daily_stats}

    labels = []
    data = []

    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        date_str = str(d)
        ds = stats_by_date.get(date_str)
        # Label: "H-6", "H-5", ..., "Hari Ini"
        if i == 6:
            labels.append("Hari Ini")
        else:
            labels.append(f"H-{6 - i}")
        data.append(float(ds.average_score) if ds and ds.average_score else 0)

    return {
        "type": "line",
        "labels": labels,
        "datasets": [
            {
                "label": "Rata-rata Skor",
                "data": data,
                "borderColor": "#3b82f6",
                "backgroundColor": "rgba(59, 130, 246, 0.1)",
                "fill": True,
                "tension": 0.4,
            }
        ],
    }


def get_subject_distribution(db: Session, user_id: int) -> list:
    """Data untuk donut chart distribusi waktu per mapel."""
    # Ambil semua learning sessions untuk user
    sessions = (
        db.query(LearningSession)
        .filter(LearningSession.user_id == user_id)
        .all()
    )

    # Kumpulkan minutes per subject
    subject_minutes = {}
    for session in sessions:
        if session.material and session.material.subject:
            subject_name = session.material.subject.name
            subject_minutes[subject_name] = (
                subject_minutes.get(subject_name, 0) + session.duration_minutes
            )

    # Warna per subject
    subject_colors = {
        "Matematika": "#3b82f6",
        "Fisika": "#ef4444",
        "Biologi": "#22c55e",
        "Kimia": "#a855f7",
        "Bahasa Indonesia": "#f59e0b",
        "Bahasa Inggris": "#ec4899",
    }

    total_minutes = sum(subject_minutes.values())
    distribution = []

    for subj, minutes in sorted(subject_minutes.items(), key=lambda x: x[1], reverse=True):
        percentage = round((minutes / total_minutes) * 100, 1) if total_minutes > 0 else 0
        distribution.append({
            "subject": subj,
            "minutes": minutes,
            "percentage": percentage,
            "color": subject_colors.get(subj, "#6b7280"),
        })

    return distribution
