from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.analytics_schema import DashboardResponse
from app.services.analytics_service import get_dashboard_stats

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    summary="Get dashboard statistics",
)
def dashboard(db: Session = Depends(get_db)):
    """
    Returns all dashboard statistics used by the frontend.
    """
    return get_dashboard_stats(db)
