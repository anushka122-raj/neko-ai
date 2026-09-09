from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.reminder_schema import ReminderResponse
from app.ai.reminder_engine import get_next_reminder

router = APIRouter(
    prefix="/reminder",
    tags=["Reminder Engine"],
)


def _emotion_for_urgency(urgency):
    """
    Maps a reminder's urgency to a pet emotion/expression. Kept in the
    router (not in reminder_engine.py) so the existing engine's
    tested priority logic stays completely untouched.
    """

    return {
        "overdue": "urgent",
        "high": "concerned",
        "medium": "thinking",
        "high_priority": "concerned",
    }.get(urgency, "neutral")


def _actions_for_urgency(urgency):
    """
    Only urgent reminders get action buttons (Mark Done / Later) on
    the pet's bubble — informational ones just get talked through.
    """

    if urgency in ("overdue", "high", "high_priority"):
        return [
            {"id": "done", "label": "Mark Done"},
            {"id": "later", "label": "Later"},
        ]

    return None


@router.get(
    "/",
    response_model=ReminderResponse,
    summary="Get the next reminder",
)
def reminder(
    db: Session = Depends(get_db),
):
    """
    Returns the most important reminder for Neko.

    Priority:
    - Overdue tasks
    - Tasks due within 30 minutes
    - Upcoming tasks
    - High-priority tasks
    - Wellbeing message (no urgent task)
    """

    result = get_next_reminder(db)

    # Existing shape (reminder/urgency/title/message/minutes_left) is
    # untouched — emotion/actions are additive, for the pet's
    # walk-in/talk/wait/react/walk-out lifecycle.
    result["emotion"] = _emotion_for_urgency(
        result.get("urgency")
    )

    result["actions"] = _actions_for_urgency(
        result.get("urgency")
    )

    return result
