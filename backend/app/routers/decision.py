from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.decision_schema import DecisionResponse
from app.services.decision_service import get_decision

router = APIRouter(
    prefix="/decision",
    tags=["Decision"],
)


@router.get(
    "/",
    response_model=DecisionResponse,
    summary="Get Neko's current decision",
)
def decision(
    db: Session = Depends(get_db),
):
    """
    Returns Neko's current decision based on
    the user's task statistics.
    """
    return get_decision(db)
