"""Router untuk health check."""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Aksara API is running!",
        "version": "1.0.0",
    }
