from sqlalchemy.orm import Session

from app.models.task import Task


def get_dashboard_stats(db: Session):
    """
    Calculate all statistics required by the dashboard.
    """

    total_tasks = db.query(Task).count()

    completed_tasks = (
        db.query(Task)
        .filter(Task.status == "Completed")
        .count()
    )

    pending_tasks = (
        db.query(Task)
        .filter(Task.status == "Pending")
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

    productivity_score = (
        round((completed_tasks / total_tasks) * 100, 2)
        if total_tasks > 0
        else 0.0
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "high_priority_tasks": high_priority_tasks,
        "productivity_score": productivity_score,
    }