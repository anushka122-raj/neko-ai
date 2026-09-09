from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.habit import (
    Habit,
    HabitCompletion,
)
from app.schemas.habit_schema import (
    HabitCreate,
    HabitUpdate,
)


DIFFICULTY_REWARDS = {
    "Easy": {
        "xp": 10,
        "coins": 2,
    },
    "Medium": {
        "xp": 20,
        "coins": 5,
    },
    "Hard": {
        "xp": 40,
        "coins": 10,
    },
}


def _today_key() -> str:
    return date.today().isoformat()


def _days_to_string(
    days: list[int] | None,
) -> str | None:
    if not days:
        return None

    return ",".join(
        str(day)
        for day in sorted(set(days))
    )


def _string_to_days(
    value: str | None,
) -> list[int]:
    if not value:
        return []

    days: list[int] = []

    for item in value.split(","):
        try:
            day = int(item)

            if 0 <= day <= 6:
                days.append(day)

        except ValueError:
            continue

    return sorted(set(days))


def _habit_runs_on_date(
    habit: Habit,
    target_date: date,
) -> bool:
    weekday = target_date.weekday()

    if habit.frequency == "Daily":
        return True

    if habit.frequency == "Weekdays":
        return weekday <= 4

    if habit.frequency == "Weekends":
        return weekday >= 5

    if habit.frequency == "Custom":
        return weekday in _string_to_days(
            habit.custom_days
        )

    return False


def _calculate_streak(
    db: Session,
    habit: Habit,
) -> tuple[int, int]:
    completion_dates = {
        date.fromisoformat(
            completion.completion_date
        )
        for completion in (
            db.query(HabitCompletion)
            .filter(
                HabitCompletion.habit_id
                == habit.id
            )
            .all()
        )
    }

    if not completion_dates:
        return 0, 0

    today = date.today()
    current_streak = 0
    cursor = today

    while True:
        if not _habit_runs_on_date(
            habit,
            cursor,
        ):
            cursor -= timedelta(days=1)
            continue

        if cursor in completion_dates:
            current_streak += 1
            cursor -= timedelta(days=1)
            continue

        if cursor == today:
            cursor -= timedelta(days=1)
            continue

        break

    sorted_dates = sorted(completion_dates)

    best_streak = 0
    running_streak = 0
    previous_date: date | None = None

    for completion_date in sorted_dates:
        if not _habit_runs_on_date(
            habit,
            completion_date,
        ):
            continue

        if previous_date is None:
            running_streak = 1

        else:
            cursor = previous_date + timedelta(
                days=1
            )

            while (
                cursor < completion_date
                and not _habit_runs_on_date(
                    habit,
                    cursor,
                )
            ):
                cursor += timedelta(days=1)

            if cursor == completion_date:
                running_streak += 1
            else:
                running_streak = 1

        best_streak = max(
            best_streak,
            running_streak,
        )

        previous_date = completion_date

    return current_streak, best_streak


def _update_streaks(
    db: Session,
    habit: Habit,
) -> None:
    current_streak, best_streak = (
        _calculate_streak(
            db,
            habit,
        )
    )

    habit.current_streak = current_streak
    habit.best_streak = max(
        habit.best_streak,
        best_streak,
    )

    db.add(habit)


def create_habit(
    db: Session,
    habit_data: HabitCreate,
    user_id: int = 1,
) -> Habit:
    rewards = DIFFICULTY_REWARDS[
        habit_data.difficulty
    ]

    habit = Habit(
        title=habit_data.title.strip(),
        description=(
            habit_data.description.strip()
            if habit_data.description
            else None
        ),
        category=habit_data.category,
        difficulty=habit_data.difficulty,
        frequency=habit_data.frequency,
        custom_days=_days_to_string(
            habit_data.custom_days
        ),
        target_count=habit_data.target_count,
        xp_reward=(
            habit_data.xp_reward
            if habit_data.xp_reward is not None
            else rewards["xp"]
        ),
        coin_reward=(
            habit_data.coin_reward
            if habit_data.coin_reward is not None
            else rewards["coins"]
        ),
        is_active=habit_data.is_active,
        user_id=user_id,
    )

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


def get_all_habits(
    db: Session,
    user_id: int = 1,
) -> list[Habit]:
    return (
        db.query(Habit)
        .filter(Habit.user_id == user_id)
        .order_by(
            Habit.is_active.desc(),
            Habit.created_at.desc(),
        )
        .all()
    )


def get_habit(
    db: Session,
    habit_id: int,
    user_id: int = 1,
) -> Habit | None:
    return (
        db.query(Habit)
        .filter(
            Habit.id == habit_id,
            Habit.user_id == user_id,
        )
        .first()
    )


def update_habit(
    db: Session,
    habit_id: int,
    habit_data: HabitUpdate,
    user_id: int = 1,
) -> Habit | None:
    habit = get_habit(
        db,
        habit_id,
        user_id,
    )

    if habit is None:
        return None

    updates = habit_data.model_dump(
        exclude_unset=True
    )

    if "custom_days" in updates:
        updates["custom_days"] = _days_to_string(
            updates["custom_days"]
        )

    if "title" in updates:
        updates["title"] = updates[
            "title"
        ].strip()

    if (
        "description" in updates
        and updates["description"]
    ):
        updates["description"] = updates[
            "description"
        ].strip()

    difficulty_changed = (
        "difficulty" in updates
        and updates["difficulty"]
        != habit.difficulty
    )

    for field, value in updates.items():
        setattr(
            habit,
            field,
            value,
        )

    if difficulty_changed:
        rewards = DIFFICULTY_REWARDS[
            habit.difficulty
        ]

        if habit_data.xp_reward is None:
            habit.xp_reward = rewards["xp"]

        if habit_data.coin_reward is None:
            habit.coin_reward = rewards[
                "coins"
            ]

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


def delete_habit(
    db: Session,
    habit_id: int,
    user_id: int = 1,
) -> Habit | None:
    habit = get_habit(
        db,
        habit_id,
        user_id,
    )

    if habit is None:
        return None

    db.delete(habit)
    db.commit()

    return habit


def complete_habit(
    db: Session,
    habit_id: int,
    count: int = 1,
    user_id: int = 1,
) -> HabitCompletion | None:
    habit = get_habit(
        db,
        habit_id,
        user_id,
    )

    if habit is None:
        return None

    today = _today_key()

    completion = (
        db.query(HabitCompletion)
        .filter(
            HabitCompletion.habit_id
            == habit.id,
            HabitCompletion.completion_date
            == today,
        )
        .first()
    )

    previous_count = (
        completion.completed_count
        if completion
        else 0
    )

    next_count = min(
        habit.target_count,
        previous_count + count,
    )

    newly_completed = (
        previous_count < habit.target_count
        and next_count >= habit.target_count
    )

    if completion is None:
        completion = HabitCompletion(
            habit_id=habit.id,
            completion_date=today,
            completed_count=next_count,
            xp_earned=0,
            coins_earned=0,
        )

        db.add(completion)

    else:
        completion.completed_count = next_count

    if newly_completed:
        completion.xp_earned = (
            habit.xp_reward
        )

        completion.coins_earned = (
            habit.coin_reward
        )

    db.commit()
    db.refresh(completion)

    _update_streaks(
        db,
        habit,
    )

    db.commit()
    db.refresh(habit)

    return completion


def undo_habit_completion(
    db: Session,
    habit_id: int,
    user_id: int = 1,
) -> Habit | None:
    habit = get_habit(
        db,
        habit_id,
        user_id,
    )

    if habit is None:
        return None

    completion = (
        db.query(HabitCompletion)
        .filter(
            HabitCompletion.habit_id
            == habit.id,
            HabitCompletion.completion_date
            == _today_key(),
        )
        .first()
    )

    if completion:
        db.delete(completion)
        db.commit()

    _update_streaks(
        db,
        habit,
    )

    db.commit()
    db.refresh(habit)

    return habit


def get_habit_dashboard(
    db: Session,
    user_id: int = 1,
) -> dict:
    habits = get_all_habits(
        db,
        user_id,
    )

    active_habits = [
        habit
        for habit in habits
        if habit.is_active
        and _habit_runs_on_date(
            habit,
            date.today(),
        )
    ]

    habit_ids = [
        habit.id
        for habit in active_habits
    ]

    completions = []

    if habit_ids:
        completions = (
            db.query(HabitCompletion)
            .filter(
                HabitCompletion.habit_id.in_(
                    habit_ids
                ),
                HabitCompletion.completion_date
                == _today_key(),
            )
            .all()
        )

    completion_map = {
        completion.habit_id: completion
        for completion in completions
    }

    completed_today = sum(
        1
        for habit in active_habits
        if (
            habit.id in completion_map
            and completion_map[
                habit.id
            ].completed_count
            >= habit.target_count
        )
    )

    pending_today = max(
        0,
        len(active_habits)
        - completed_today,
    )

    completion_rate = (
        round(
            completed_today
            / len(active_habits)
            * 100,
            2,
        )
        if active_habits
        else 0.0
    )

    all_completions = (
        db.query(HabitCompletion)
        .join(Habit)
        .filter(
            Habit.user_id == user_id
        )
        .all()
    )

    return {
        "total_habits": len(habits),
        "active_habits": len(
            active_habits
        ),
        "completed_today": completed_today,
        "pending_today": pending_today,
        "completion_rate": completion_rate,
        "current_streak": max(
            (
                habit.current_streak
                for habit in habits
            ),
            default=0,
        ),
        "best_streak": max(
            (
                habit.best_streak
                for habit in habits
            ),
            default=0,
        ),
        "total_xp": sum(
            completion.xp_earned
            for completion in all_completions
        ),
        "total_coins": sum(
            completion.coins_earned
            for completion in all_completions
        ),
        "today_completed": (
            bool(active_habits)
            and pending_today == 0
        ),
    }


def serialize_habit(
    db: Session,
    habit: Habit,
) -> dict:
    completion = (
        db.query(HabitCompletion)
        .filter(
            HabitCompletion.habit_id
            == habit.id,
            HabitCompletion.completion_date
            == _today_key(),
        )
        .first()
    )

    completed_count = (
        completion.completed_count
        if completion
        else 0
    )

    return {
        "id": habit.id,
        "title": habit.title,
        "description": habit.description,
        "category": habit.category,
        "difficulty": habit.difficulty,
        "frequency": habit.frequency,
        "custom_days": _string_to_days(
            habit.custom_days
        ),
        "target_count": habit.target_count,
        "xp_reward": habit.xp_reward,
        "coin_reward": habit.coin_reward,
        "current_streak": habit.current_streak,
        "best_streak": habit.best_streak,
        "is_active": habit.is_active,
        "completed_today": (
            completed_count
            >= habit.target_count
        ),
        "completed_count_today": (
            completed_count
        ),
        "created_at": habit.created_at,
        "updated_at": habit.updated_at,
        "user_id": habit.user_id,
    }