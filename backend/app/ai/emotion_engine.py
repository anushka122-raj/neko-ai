from sqlalchemy.orm import Session

from app.models.task import Task


def get_pet_emotion(db: Session):
    """
    Determines Neko's current emotion based on task completion.
    Used by:
    - Dashboard
    - Desktop Pet
    - Notifications
    - Chat context
    """

    pending = db.query(Task).filter(Task.status == "Pending").count()
    completed = db.query(Task).filter(Task.status == "Completed").count()

    total = pending + completed

    # -----------------------------
    # Productivity Score
    # -----------------------------
    productivity = 0

    if total > 0:
        productivity = int((completed / total) * 100)

    # -----------------------------
    # No tasks
    # -----------------------------
    if total == 0:
        return {
            "emotion": "idle",
            "message": "Let's plan your day together!",
            "pending_tasks": pending,
            "completed_tasks": completed,
            "productivity": productivity
        }

    # -----------------------------
    # All completed
    # -----------------------------
    if pending == 0:
        return {
            "emotion": "happy",
            "message": "Amazing! You completed everything today! 🎉",
            "pending_tasks": pending,
            "completed_tasks": completed,
            "productivity": productivity
        }

    # -----------------------------
    # High productivity
    # -----------------------------
    if productivity >= 70:
        return {
            "emotion": "happy",
            "message": "You're doing amazing today. Keep going!",
            "pending_tasks": pending,
            "completed_tasks": completed,
            "productivity": productivity
        }

    # -----------------------------
    # Medium productivity
    # -----------------------------
    if productivity >= 40:
        return {
            "emotion": "motivating",
            "message": "Nice progress! Let's finish a few more tasks.",
            "pending_tasks": pending,
            "completed_tasks": completed,
            "productivity": productivity
        }

    # -----------------------------
    # Low productivity
    # -----------------------------
    return {
        "emotion": "sad",
        "message": "Let's complete one small task together. I know you can do it!",
        "pending_tasks": pending,
        "completed_tasks": completed,
        "productivity": productivity
    }