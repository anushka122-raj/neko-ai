from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


HabitDifficulty = Literal[
    "Easy",
    "Medium",
    "Hard",
]

HabitFrequency = Literal[
    "Daily",
    "Weekdays",
    "Weekends",
    "Custom",
]

HabitCategory = Literal[
    "General",
    "Study",
    "Health",
    "Fitness",
    "Work",
    "Sleep",
    "Mindfulness",
    "Personal",
]


class HabitCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    category: HabitCategory = "General"
    difficulty: HabitDifficulty = "Medium"
    frequency: HabitFrequency = "Daily"

    custom_days: list[int] = Field(
        default_factory=list,
    )

    target_count: int = Field(
        default=1,
        ge=1,
        le=100,
    )

    xp_reward: int | None = Field(
        default=None,
        ge=1,
        le=1000,
    )

    coin_reward: int | None = Field(
        default=None,
        ge=0,
        le=500,
    )

    is_active: bool = True

    @field_validator("custom_days")
    @classmethod
    def validate_custom_days(
        cls,
        days: list[int],
    ) -> list[int]:
        invalid_days = [
            day
            for day in days
            if day < 0 or day > 6
        ]

        if invalid_days:
            raise ValueError(
                "Custom days must be between 0 and 6."
            )

        return sorted(set(days))


class HabitUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    category: HabitCategory | None = None
    difficulty: HabitDifficulty | None = None
    frequency: HabitFrequency | None = None

    custom_days: list[int] | None = None

    target_count: int | None = Field(
        default=None,
        ge=1,
        le=100,
    )

    xp_reward: int | None = Field(
        default=None,
        ge=1,
        le=1000,
    )

    coin_reward: int | None = Field(
        default=None,
        ge=0,
        le=500,
    )

    is_active: bool | None = None

    @field_validator("custom_days")
    @classmethod
    def validate_custom_days(
        cls,
        days: list[int] | None,
    ) -> list[int] | None:
        if days is None:
            return None

        invalid_days = [
            day
            for day in days
            if day < 0 or day > 6
        ]

        if invalid_days:
            raise ValueError(
                "Custom days must be between 0 and 6."
            )

        return sorted(set(days))


class HabitCompletionResponse(BaseModel):
    id: int
    habit_id: int
    completion_date: str
    completed_count: int
    xp_earned: int
    coins_earned: int
    completed_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class HabitResponse(BaseModel):
    id: int
    title: str
    description: str | None = None

    category: str
    difficulty: str
    frequency: str
    custom_days: list[int]

    target_count: int
    xp_reward: int
    coin_reward: int

    current_streak: int
    best_streak: int

    is_active: bool
    completed_today: bool
    completed_count_today: int

    created_at: datetime
    updated_at: datetime

    user_id: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class HabitDashboardResponse(BaseModel):
    total_habits: int
    active_habits: int

    completed_today: int
    pending_today: int

    completion_rate: float

    current_streak: int
    best_streak: int

    total_xp: int
    total_coins: int

    today_completed: bool


class HabitCompleteRequest(BaseModel):
    count: int = Field(
        default=1,
        ge=1,
        le=100,
    )