"""Router untuk autentikasi: register, login, profil."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UpdateProfileRequest,
    UserProfileResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Autentikasi"])


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Daftarkan akun baru."""
    # Cek username sudah terdaftar
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username sudah terdaftar",
        )

    # Buat user baru
    user = User(
        username=req.username,
        display_name=req.display_name or req.username,
        password_hash=hash_password(req.password),
        level=1,
        current_xp=0,
        xp_to_next_level=1000,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(user.id, user.username)

    return AuthResponse(
        success=True,
        token=token,
        user=user.to_dict(),
    )


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login ke akun."""
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    token = create_access_token(user.id, user.username)

    return AuthResponse(
        success=True,
        token=token,
        user=user.to_dict(),
    )


@router.get("/me", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Dapatkan profil user yang sedang login (berdasarkan token)."""
    return UserProfileResponse(
        success=True,
        data=current_user.to_dict(),
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profil user yang sedang login."""
    if req.display_name is not None:
        current_user.display_name = req.display_name
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url

    db.commit()
    db.refresh(current_user)

    return UserProfileResponse(
        success=True,
        data=current_user.to_dict(),
    )
