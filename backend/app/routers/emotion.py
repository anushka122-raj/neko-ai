from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.emotion_schema import EmotionResponse
from app.ai.emotion_engine import get_pet_emotion

router = APIRouter(
    prefix="/emotion",
    tags=["Emotion Engine"],
)


@router.get(
    "/",
    response_model=EmotionResponse,
    summary="Get Neko's current emotion",
)
def pet_emotion(
    db: Session = Depends(get_db),
):
    """
    Returns Neko's current emotional state based on
    the user's productivity and pending tasks.
    """

    return get_pet_emotion(db)