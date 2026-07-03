from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class DailyStatResponse(BaseModel):
    success: bool = True
    data: dict


class DayActivity(BaseModel):
    day: str
    date: str
    minutes: int
    score: float
    xp: int


class WeeklyStatResponse(BaseModel):
    success: bool = True
    data: dict


class MonthlyStatResponse(BaseModel):
    success: bool = True
    data: dict


class ProgressRequest(BaseModel):
    user_id: int
    material_id: Optional[int] = None
    session_type: str = "material"  # material / quiz / game
    duration_minutes: int = 0
    xp_earned: int = 0
    score: Optional[int] = None
    is_completed: bool = True


class ProgressResponse(BaseModel):
    success: bool = True
    xp_earned: int
    level_up: bool = False
    new_level: Optional[int] = None
    streak_days: int
    message: str = "Progress berhasil disimpan!"
