from sqlalchemy.orm import Session

from app.models.task import Task


def get_task_statistics(db: Session) -> dict:
    """
    Collect task statistics used by Neko's AI.
    """

    total_tasks = db.query(Task).count()

    pending_tasks = (
        db.query(Task)
        .filter(Task.status == "Pending")
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(Task.status == "Completed")
        .count()
    )

    high_priority_tasks = (
        db.query(Task)
        .filter(
            Task.priority == "High",
            Task.status == "Pending",
        )
        .count()
    )

    return {
        "total": total_tasks,
        "pending": pending_tasks,
        "completed": completed_tasks,
        "high_priority": high_priority_tasks,
    }


def format_task_summary(stats: dict) -> str:
    """
    Converts task statistics into a prompt-friendly summary
    for NekoAI.
    """

    return (
        f"Task Summary:\n"
        f"- Total Tasks: {stats['total']}\n"
        f"- Pending Tasks: {stats['pending']}\n"
        f"- Completed Tasks: {stats['completed']}\n"
        f"- High Priority Tasks: {stats['high_priority']}"
    )