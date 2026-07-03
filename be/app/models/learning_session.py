from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, TIMESTAMP, text
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="SET NULL"), nullable=True)
    session_type = Column(
        String(20), nullable=False, default="material",
        comment="material / quiz / game",
    )
    duration_minutes = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    score = Column(Integer, nullable=True, comment="0-100 untuk quiz")
    is_completed = Column(Boolean, default=False)
    completed_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    user = relationship("User", backref="learning_sessions")
    material = relationship("Material", backref="learning_sessions")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "material_id": self.material_id,
            "session_type": self.session_type,
            "duration_minutes": self.duration_minutes,
            "xp_earned": self.xp_earned,
            "score": self.score,
            "is_completed": self.is_completed,
            "completed_at": str(self.completed_at) if self.completed_at else None,
            "created_at": str(self.created_at) if self.created_at else None,
        }
