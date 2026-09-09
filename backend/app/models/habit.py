from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(150),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    category = Column(
        String(50),
        nullable=False,
        default="General",
    )

    difficulty = Column(
        String(20),
        nullable=False,
        default="Medium",
    )

    frequency = Column(
        String(20),
        nullable=False,
        default="Daily",
    )

    custom_days = Column(
        String(30),
        nullable=True,
    )

    target_count = Column(
        Integer,
        nullable=False,
        default=1,
    )

    xp_reward = Column(
        Integer,
        nullable=False,
        default=20,
    )

    coin_reward = Column(
        Integer,
        nullable=False,
        default=5,
    )

    current_streak = Column(
        Integer,
        nullable=False,
        default=0,
    )

    best_streak = Column(
        Integer,
        nullable=False,
        default=0,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user_id = Column(
        Integer,
        nullable=True,
        default=1,
    )

    completions = relationship(
        "HabitCompletion",
        back_populates="habit",
        cascade="all, delete-orphan",
    )


class HabitCompletion(Base):
    __tablename__ = "habit_completions"

    __table_args__ = (
        UniqueConstraint(
            "habit_id",
            "completion_date",
            name="uq_habit_completion_date",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    habit_id = Column(
        Integer,
        ForeignKey(
            "habits.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    completion_date = Column(
        String(10),
        nullable=False,
        index=True,
    )

    completed_count = Column(
        Integer,
        nullable=False,
        default=1,
    )

    xp_earned = Column(
        Integer,
        nullable=False,
        default=0,
    )

    coins_earned = Column(
        Integer,
        nullable=False,
        default=0,
    )

    completed_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    habit = relationship(
        "Habit",
        back_populates="completions",
    )