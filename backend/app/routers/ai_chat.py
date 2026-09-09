from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.ai.decision_engine import make_decision
from app.ai.brain import generate_response

from app.schemas.brain_schema import BrainResponse

router = APIRouter(
    prefix="/brain",
    tags=["AI Brain"]
)


@router.get(
    "/state",
    response_model=BrainResponse
)
def brain_state(
    db: Session = Depends(get_db)
):
    """
    Returns Neko's current emotional state and message.

    Emotion is decided from the database,
    not from the frontend.
    """

    decision = make_decision(db)

    return BrainResponse(
        emotion=decision["emotion"],
        response=generate_response(decision["emotion"])
    )