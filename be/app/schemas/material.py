from pydantic import BaseModel
from typing import Optional, List


class MaterialResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    sub_category: Optional[str] = None
    level: str
    type: str
    content: Optional[str] = None
    youtube_id: Optional[str] = None
    duration_minutes: int
    xp_reward: int
    is_active: bool

    class Config:
        from_attributes = True


class MaterialListResponse(BaseModel):
    success: bool = True
    data: List[MaterialResponse]
    total: int


class MaterialDetailResponse(BaseModel):
    success: bool = True
    data: MaterialResponse


class MaterialGenerateRequest(BaseModel):
    subject_id: int
    level: str
    topic: str


class MaterialGenerateResponse(BaseModel):
    success: bool = True
    data: dict
    is_offline_fallback: bool = False


class SubjectResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    success: bool = True
    data: List[SubjectResponse]
