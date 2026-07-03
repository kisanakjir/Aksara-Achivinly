from sqlalchemy import (
    Column, Integer, Date, DECIMAL, ForeignKey, TIMESTAMP, text, UniqueConstraint
)
from app.core.database import Base


class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    minutes_studied = Column(Integer, default=0)
    materials_completed = Column(Integer, default=0)
    quizzes_taken = Column(Integer, default=0)
    average_score = Column(DECIMAL(5, 2), nullable=True)
    xp_earned = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="unique_user_date"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": str(self.date) if self.date else None,
            "minutes_studied": self.minutes_studied,
            "materials_completed": self.materials_completed,
            "quizzes_taken": self.quizzes_taken,
            "average_score": float(self.average_score) if self.average_score else None,
            "xp_earned": self.xp_earned,
        }
