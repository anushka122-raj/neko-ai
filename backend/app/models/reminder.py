from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String

from app.database.database import Base


class Reminder(Base):
    """
    Stores reminders created by the user or automatically by Neko.
    """

    __tablename__ = "reminders"

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
        String(500),
        nullable=True,
    )

    remind_at = Column(
        DateTime,
        nullable=False,
    )

    is_completed = Column(
        Boolean,
        default=False,
    )

    is_recurring = Column(
        Boolean,
        default=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    task_id = Column(
        Integer,
        ForeignKey("tasks.id"),
        nullable=True,
    )