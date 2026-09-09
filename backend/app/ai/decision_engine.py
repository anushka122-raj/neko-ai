from app.services.decision_database import get_task_statistics


def make_decision(db):
    """
    Decide Neko's current emotional state based on the user's task progress.
    Returns:
        emotion -> animation/state for the pet
        message -> short message for dashboard or notification
    """

    stats = get_task_statistics(db)

    pending = stats["pending"]
    completed = stats["completed"]
    total = stats["total"]
    high = stats["high_priority"]

    # --------------------------------------------------
    # No tasks
    # --------------------------------------------------
    if total == 0:
        return {
            "emotion": "idle",
            "message": "You don't have any tasks yet. Let's plan today's goals together."
        }

    # --------------------------------------------------
    # All tasks completed
    # --------------------------------------------------
    if completed == total:
        return {
            "emotion": "happy",
            "message": "Fantastic! You completed every task today! 🎉"
        }

    # --------------------------------------------------
    # Too many pending tasks
    # --------------------------------------------------
    if pending >= 5:
        return {
            "emotion": "sad",
            "message": f"You have {pending} pending tasks. Let's finish one together."
        }

    # --------------------------------------------------
    # High priority exists
    # --------------------------------------------------
    if high > 0:
        return {
            "emotion": "motivating",
            "message": f"You still have {high} high-priority task(s). Let's start there."
        }

    # --------------------------------------------------
    # Nearly finished
    # --------------------------------------------------
    if completed >= pending:
        return {
            "emotion": "happy",
            "message": "You're making great progress. Keep the momentum going!"
        }

    # --------------------------------------------------
    # Default
    # --------------------------------------------------
    return {
        "emotion": "motivating",
        "message": f"{pending} task(s) remaining. One step at a time—you've got this!"
    }