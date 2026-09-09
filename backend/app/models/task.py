from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from app.database.database import Base


class Task(Base):
    """
    Stores user tasks that Neko manages.

    These tasks power:
    - Dashboard
    - AI Suggestions
    - Habit Tracking
    - Productivity Score
    - Desktop Reminders
    """

    __tablename__ = "tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(150),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    # Low
    # Medium
    # High
    priority = Column(
        String(20),
        default="Medium",
        index=True,
    )

    # Pending
    # In Progress
    # Completed
    # Cancelled
    status = Column(
        String(20),
        default="Pending",
        index=True,
    )

    # Study
    # Coding
    # Workout
    # College
    # Personal
    category = Column(
        String(50),
        default="General",
        index=True,
    )

    due_date = Column(
        DateTime,
        nullable=True,
        index=True,
    )

    reminder_sent = Column(
        Boolean,
        default=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )