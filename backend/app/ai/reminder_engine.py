from datetime import datetime, timedelta

import random

from sqlalchemy.orm import Session

from app.models.task import Task


# Wellbeing messages shown when no pending task requires a reminder.
_WELLBEING_MESSAGES = [
    "No urgent tasks right now 🎉 Keep up the great work!",
    "All caught up! Take a deep breath and stay hydrated 💧",
    "Your task list is looking good. Keep the momentum going! 🐾",
    "Nothing overdue — you're on top of things! 😺",
    "Great time for a short stretch break! Your body will thank you 🙆",
]


def get_next_reminder(db: Session):
    """
    Returns the most important reminder for Neko.

    Priority:
    1. Overdue pending tasks  (urgency: "overdue")
    2. Due within 30 minutes  (urgency: "high")
    3. Due within 2 hours     (urgency: "medium")
    4. High-priority pending tasks with no due date (urgency: "high_priority")
    5. No urgent task — wellbeing motivational message (reminder: False)
    """

    now = datetime.utcnow()

    # Only consider pending tasks (never remind about completed/cancelled).
    tasks = (
        db.query(Task)
        .filter(Task.status == "Pending")
        .order_by(Task.due_date.asc())
        .all()
    )

    if not tasks:
        return {
            "reminder": False,
            "urgency": "none",
            "task_id": None,
            "title": "",
            "message": random.choice(_WELLBEING_MESSAGES),
            "minutes_left": None,
        }

    # ------------------------------------------------------------------
    # Pass 1: time-based urgency (overdue, high, medium)
    # ------------------------------------------------------------------

    for task in tasks:

        if task.due_date is None:
            continue

        time_left = task.due_date - now
        minutes = int(time_left.total_seconds() / 60)

        if minutes < 0:
            # Overdue
            overdue_mins = abs(minutes)
            if overdue_mins < 60:
                time_desc = f"{overdue_mins} minute(s) ago"
            else:
                time_desc = f"{overdue_mins // 60} hour(s) ago"

            return {
                "reminder": True,
                "urgency": "overdue",
                "task_id": task.id,
                "title": task.title,
                "message": (
                    f"'{task.title}' is overdue ({time_desc}). "
                    "Let's finish it together! 🐱"
                ),
                "minutes_left": minutes,
            }

        if minutes <= 30:
            return {
                "reminder": True,
                "urgency": "high",
                "task_id": task.id,
                "title": task.title,
                "message": (
                    f"'{task.title}' is due in {minutes} minute(s). "
                    "You've got this! 🔥"
                ),
                "minutes_left": minutes,
            }

        if minutes <= 120:
            return {
                "reminder": True,
                "urgency": "medium",
                "task_id": task.id,
                "title": task.title,
                "message": (
                    f"Heads up: '{task.title}' is due in "
                    f"{minutes} minute(s)."
                ),
                "minutes_left": minutes,
            }

    # ------------------------------------------------------------------
    # Pass 2: high-priority pending tasks with no (or far future) due date.
    # Only select tasks marked High priority that haven't been sorted above.
    # ------------------------------------------------------------------

    high_priority = [
        t for t in tasks
        if (t.priority or "").lower() == "high"
    ]

    if high_priority:
        task = high_priority[0]

        return {
            "reminder": True,
            "urgency": "high_priority",
            "task_id": task.id,
            "title": task.title,
            "message": (
                f"Don't forget your high-priority task: '{task.title}'. "
                "Ready to tackle it? 💪"
            ),
            "minutes_left": None,
        }

    # ------------------------------------------------------------------
    # Nothing urgent — wellbeing fallback.
    # ------------------------------------------------------------------

    return {
        "reminder": False,
        "urgency": "none",
        "task_id": None,
        "title": "",
        "message": random.choice(_WELLBEING_MESSAGES),
        "minutes_left": None,
    }
