from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.memory_schema import MemoryCreate, MemoryResponse
from app.services.memory_service import (
    create_memory,
    get_all_memories,
    delete_memory,
)

router = APIRouter(
    prefix="/memories",
    tags=["Memories"],
)


@router.post(
    "/",
    response_model=MemoryResponse,
    summary="Create a new memory",
)
def add_memory(
    memory: MemoryCreate,
    db: Session = Depends(get_db),
):
    """
    Save a new long-term memory for NekoAI.
    """
    return create_memory(
        db,
        memory.title,
        memory.content,
        memory.category,
    )


@router.get(
    "/",
    response_model=list[MemoryResponse],
    summary="Get all memories",
)
def read_memories(
    db: Session = Depends(get_db),
):
    """
    Returns every stored memory.
    """
    return get_all_memories(db)


@router.delete(
    "/{memory_id}",
    response_model=dict,
    summary="Delete a memory",
)
def remove_memory(
    memory_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a memory by its ID.
    """
    success = delete_memory(db, memory_id)

    if success:
        return {
            "success": True,
            "message": "Memory deleted successfully",
        }

    raise HTTPException(
        status_code=404,
        detail="Memory not found",
    )
