from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.task_schema import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from app.services.task_service import (
    complete_task,
    create_task,
    delete_task,
    get_all_tasks,
    update_task,
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.post(
    "/",
    response_model=TaskResponse,
    summary="Create a task",
)
def add_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
):
    """
    Create and store a new task.

    The desktop MVP currently uses user ID 1.
    This will later be replaced by the authenticated user's ID.
    """

    return create_task(
        db=db,
        task=task,
        user_id=1,
    )


@router.get(
    "/",
    response_model=list[TaskResponse],
    summary="Get all tasks",
)
def read_tasks(
    db: Session = Depends(get_db),
):
    """
    Return all stored tasks.
    """

    return get_all_tasks(db)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
)
def edit_task(
    task_id: int,
    updated_task: TaskUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing task using its ID.
    """

    task = update_task(
        db=db,
        task_id=task_id,
        updated_task=updated_task,
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.delete(
    "/{task_id}",
    summary="Delete a task",
)
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a task using its ID.
    """

    deleted_task = delete_task(
        db=db,
        task_id=task_id,
    )

    if deleted_task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return {
        "success": True,
        "message": "Task deleted successfully",
    }


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
    summary="Complete a task",
)
def mark_completed(
    task_id: int,
    db: Session = Depends(get_db),
):
    """
    Mark an existing task as completed.
    """

    task = complete_task(
        db=db,
        task_id=task_id,
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task