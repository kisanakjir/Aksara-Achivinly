from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP, text
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    sub_category = Column(String(100), nullable=True)
    level = Column(
        String(20),
        nullable=False,
        default="Basic",
        comment="Fundamental, Basic, Intermediate, Advanced, UTBK Level",
    )
    type = Column(String(10), nullable=False, default="text", comment="text / video")
    content = Column(Text, nullable=True)
    youtube_id = Column(String(50), nullable=True)
    duration_minutes = Column(Integer, default=10)
    xp_reward = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    subject = relationship("Subject", backref="materials")

    def to_dict(self):
        return {
            "id": self.id,
            "subject_id": self.subject_id,
            "title": self.title,
            "sub_category": self.sub_category,
            "level": self.level,
            "type": self.type,
            "content": self.content,
            "youtube_id": self.youtube_id,
            "duration_minutes": self.duration_minutes,
            "xp_reward": self.xp_reward,
            "is_active": self.is_active,
        }
