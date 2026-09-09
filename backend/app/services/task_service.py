from datetime import datetime

from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task_schema import TaskCreate, TaskUpdate


def create_task(
    db: Session,
    task: TaskCreate,
    user_id: int,
) -> Task:
    """
    Create and store a new task.
    """

    new_task = Task(
        title=task.title.strip(),
        description=task.description,
        priority=task.priority,
        category=task.category,
        due_date=task.due_date,
        user_id=user_id,
    )

    try:
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
    except Exception:
        db.rollback()
        raise

    return new_task


def get_all_tasks(db: Session) -> list[Task]:
    """
    Return all tasks, newest first.
    """

    return (
        db.query(Task)
        .order_by(
            Task.created_at.desc(),
            Task.id.desc(),
        )
        .all()
    )


def update_task(
    db: Session,
    task_id: int,
    updated_task: TaskUpdate,
) -> Task | None:
    """
    Update only the fields provided by the frontend.
    """

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if task is None:
        return None

    changes = updated_task.model_dump(
        exclude_unset=True,
    )

    for field, value in changes.items():
        setattr(task, field, value)

    if "status" in changes:
        if changes["status"] == "Completed":
            task.completed_at = task.completed_at or datetime.utcnow()
        else:
            task.completed_at = None

    try:
        db.commit()
        db.refresh(task)
    except Exception:
        db.rollback()
        raise

    return task


def delete_task(
    db: Session,
    task_id: int,
) -> Task | None:
    """
    Delete a task by ID.
    """

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if task is None:
        return None

    try:
        db.delete(task)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return task


def complete_task(
    db: Session,
    task_id: int,
) -> Task | None:
    """
    Mark a task as completed.
    """

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if task is None:
        return None

    task.status = "Completed"
    task.completed_at = datetime.utcnow()
    task.reminder_sent = False

    try:
        db.commit()
        db.refresh(task)
    except Exception:
        db.rollback()
        raise

    return task