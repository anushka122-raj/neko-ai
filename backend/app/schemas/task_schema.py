from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TaskPriority = Literal["Low", "Medium", "High"]
TaskStatus = Literal[
    "Pending",
    "In Progress",
    "Completed",
    "Cancelled",
]


class TaskCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    description: str | None = None

    priority: TaskPriority = "Medium"

    category: str = Field(
        default="General",
        min_length=1,
        max_length=50,
    )

    due_date: datetime | None = None


class TaskResponse(BaseModel):
    id: int

    title: str

    description: str | None = None

    priority: TaskPriority

    status: TaskStatus

    category: str

    due_date: datetime | None = None

    reminder_sent: bool

    created_at: datetime

    completed_at: datetime | None = None

    user_id: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    description: str | None = None

    priority: TaskPriority | None = None

    status: TaskStatus | None = None

    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    due_date: datetime | None = None