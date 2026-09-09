from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    high_priority_tasks: int
    productivity_score: float
