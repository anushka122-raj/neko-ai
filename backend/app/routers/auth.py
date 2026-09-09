from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.user_schema import (
    UserRegister,
    UserResponse,
    UserLogin,
    Token,
)

from app.services.auth_service import (
    register_user,
    login_user,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    summary="Register a new user",
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Create a new user account.
    """

    try:
        return register_user(db, user)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=Token,
    summary="Login user",
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate an existing user.
    """

    try:
        return login_user(
            db,
            user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )