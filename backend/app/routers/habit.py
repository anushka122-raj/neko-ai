from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.habit_schema import (
    HabitCompleteRequest,
    HabitCompletionResponse,
    HabitCreate,
    HabitDashboardResponse,
    HabitResponse,
    HabitUpdate,
)
from app.services.habit_service import (
    complete_habit,
    create_habit,
    delete_habit,
    get_all_habits,
    get_habit,
    get_habit_dashboard,
    serialize_habit,
    undo_habit_completion,
    update_habit,
)


router = APIRouter(
    prefix="/habit",
    tags=["Habit Tracker"],
)


@router.get(
    "/",
    response_model=list[HabitResponse],
    summary="Get all habits",
)
def read_habits(
    db: Session = Depends(get_db),
):
    habits = get_all_habits(
        db,
        user_id=1,
    )

    return [
        serialize_habit(
            db,
            habit,
        )
        for habit in habits
    ]


@router.post(
    "/",
    response_model=HabitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a habit",
)
def add_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db),
):
    habit = create_habit(
        db=db,
        habit_data=habit_data,
        user_id=1,
    )

    return serialize_habit(
        db,
        habit,
    )


@router.get(
    "/dashboard",
    response_model=HabitDashboardResponse,
    summary="Get habit dashboard statistics",
)
def habit_dashboard(
    db: Session = Depends(get_db),
):
    return get_habit_dashboard(
        db,
        user_id=1,
    )


@router.get(
    "/{habit_id}",
    response_model=HabitResponse,
    summary="Get one habit",
)
def read_habit(
    habit_id: int,
    db: Session = Depends(get_db),
):
    habit = get_habit(
        db,
        habit_id,
        user_id=1,
    )

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found.",
        )

    return serialize_habit(
        db,
        habit,
    )


@router.put(
    "/{habit_id}",
    response_model=HabitResponse,
    summary="Update a habit",
)
def edit_habit(
    habit_id: int,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db),
):
    habit = update_habit(
        db=db,
        habit_id=habit_id,
        habit_data=habit_data,
        user_id=1,
    )

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found.",
        )

    return serialize_habit(
        db,
        habit,
    )


@router.delete(
    "/{habit_id}",
    summary="Delete a habit",
)
def remove_habit(
    habit_id: int,
    db: Session = Depends(get_db),
):
    habit = delete_habit(
        db=db,
        habit_id=habit_id,
        user_id=1,
    )

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found.",
        )

    return {
        "success": True,
        "message": "Habit deleted successfully.",
    }


@router.post(
    "/{habit_id}/complete",
    response_model=HabitCompletionResponse,
    summary="Complete or progress a habit",
)
def mark_habit_complete(
    habit_id: int,
    request: HabitCompleteRequest,
    db: Session = Depends(get_db),
):
    completion = complete_habit(
        db=db,
        habit_id=habit_id,
        count=request.count,
        user_id=1,
    )

    if completion is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found.",
        )

    return completion


@router.delete(
    "/{habit_id}/complete",
    response_model=HabitResponse,
    summary="Undo today's habit completion",
)
def undo_completion(
    habit_id: int,
    db: Session = Depends(get_db),
):
    habit = undo_habit_completion(
        db=db,
        habit_id=habit_id,
        user_id=1,
    )

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found.",
        )

    return serialize_habit(
        db,
        habit,
    )