from sqlalchemy.orm import Session

from app.models.task import Task


def calculate_habits(db: Session):
    """
    Calculates basic productivity and habit statistics.

    NOTE:
    Current streak uses completed tasks temporarily.
    Later this will be replaced with a dedicated Habit model.
    """

    completed = db.query(Task).filter(
        Task.status == "Completed"
    ).count()

    pending = db.query(Task).filter(
        Task.status == "Pending"
    ).count()

    total = completed + pending

    completion_rate = 0

    if total > 0:
        completion_rate = round(
            (completed / total) * 100,
            2
        )

    # -----------------------------
    # Temporary streak logic
    # -----------------------------
    current_streak = completed

    # Until a Habit table exists,
    # never fake the best streak.
    best_streak = completed

    # -----------------------------
    # Productivity Level
    # -----------------------------
    if completion_rate >= 90:
        level = "Excellent"

    elif completion_rate >= 70:
        level = "Great"

    elif completion_rate >= 50:
        level = "Good"

    elif completion_rate >= 30:
        level = "Needs Improvement"

    else:
        level = "Getting Started"

    return {

        "current_streak": current_streak,

        "best_streak": best_streak,

        "completion_rate": completion_rate,

        "total_completed": completed,

        "pending_tasks": pending,

        "productivity_level": level
    }