from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MemoryCreate(BaseModel):
    """
    Schema used to create a new memory.
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    content: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )

    category: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )


class MemoryResponse(MemoryCreate):
    """
    Memory returned by the API.
    """

    id: int

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True