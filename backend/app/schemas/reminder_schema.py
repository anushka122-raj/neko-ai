from typing import List, Optional

from pydantic import BaseModel


class ReminderAction(BaseModel):
    """
    A single action button on the pet's reminder bubble
    (e.g. "Mark Done", "Later").
    """

    id: str
    label: str


class ReminderResponse(BaseModel):
    """
    Reminder returned by NekoAI.

    Used by:
    - Dashboard
    - Desktop Pet
    - Reminder Notifications
    """

    reminder: bool

    urgency: str

    # Numeric ID of the task being reminded about (None for wellbeing).
    task_id: Optional[int] = None

    title: str

    message: str

    minutes_left: Optional[int] = None

    # Added for the desktop pet's reminder lifecycle (walk in / talk /
    # wait / react / walk out). Optional so any existing consumer of
    # this endpoint that doesn't know about these fields is
    # unaffected.
    emotion: Optional[str] = None

    actions: Optional[List[ReminderAction]] = None
