from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, Text, text
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(Text, nullable=True)  # VARCHAR(255) → TEXT untuk base64 image
    password_hash = Column(String(255), nullable=True)  # Untuk auth
    daily_goal_minutes = Column(Integer, default=30, nullable=False)  # Target harian
    goal_name = Column(String(100), default="UTBK 2026", nullable=True)
    goal_intensity = Column(Integer, default=3, nullable=False)
    goal_subjects = Column(Text, nullable=True)  # JSON array
    level = Column(Integer, default=1, nullable=False)
    current_xp = Column(Integer, default=0, nullable=False)
    xp_to_next_level = Column(Integer, default=1000, nullable=False)
    streak_days = Column(Integer, default=0, nullable=False)
    last_active_date = Column(Date, nullable=True)
    total_minutes_studied = Column(Integer, default=0, nullable=False)
    total_questions_solved = Column(Integer, default=0, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "display_name": self.display_name,
            "avatar_url": self.avatar_url,
            "level": self.level,
            "current_xp": self.current_xp,
            "xp_to_next_level": self.xp_to_next_level,
            "streak_days": self.streak_days,
            "last_active_date": str(self.last_active_date) if self.last_active_date else None,
            "daily_goal_minutes": self.daily_goal_minutes,
            "goal_name": self.goal_name,
            "goal_intensity": self.goal_intensity,
            "goal_subjects": self.goal_subjects,
            "total_minutes_studied": self.total_minutes_studied,
            "total_questions_solved": self.total_questions_solved,
        }
