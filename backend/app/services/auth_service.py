from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserLogin, UserRegister
from app.utils.jwt_handler import create_access_token
from app.utils.password import hash_password, verify_password


def register_user(
    db: Session,
    user: UserRegister,
):
    """
    Register a new user account.
    """

    email = str(user.email).strip().lower()
    username = user.username.strip()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise ValueError("Email already registered")

    new_user = User(
        username=username,
        email=email,
        password_hash=hash_password(user.password),
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except Exception:
        db.rollback()
        raise

    return new_user


def login_user(
    db: Session,
    user: UserLogin,
):
    """
    Authenticate a user and return an access token.
    """

    email = str(user.email).strip().lower()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not existing_user:
        raise ValueError("Invalid email or password")

    if not verify_password(
        user.password,
        existing_user.password_hash,
    ):
        raise ValueError("Invalid email or password")

    token = create_access_token(
        {
            "sub": existing_user.email,
            "user_id": existing_user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }