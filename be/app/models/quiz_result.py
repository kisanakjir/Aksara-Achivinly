from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP, text
)
from app.core.database import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    question_text = Column(Text, nullable=False)
    user_answer = Column(String(255), nullable=True)
    correct_answer = Column(String(255), nullable=True)
    is_correct = Column(Boolean, nullable=True)
    points = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subject_id": self.subject_id,
            "question_text": self.question_text,
            "user_answer": self.user_answer,
            "correct_answer": self.correct_answer,
            "is_correct": self.is_correct,
            "points": self.points,
            "time_spent_seconds": self.time_spent_seconds,
            "created_at": str(self.created_at) if self.created_at else None,
        }
