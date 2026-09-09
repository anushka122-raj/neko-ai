from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database.database import Base


class User(Base):
    """
    Represents the owner of the NekoAI desktop companion.

    Currently the MVP supports a single user,
    but this model is ready for future expansion.
    """

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    username = Column(
        String(50),
        nullable=False,
        index=True,
    )

    email = Column(
        String(120),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    # User Preferences
    preferred_theme = Column(
        String(20),
        default="dark",
    )

    preferred_language = Column(
        String(20),
        default="en",
    )

    voice_enabled = Column(
        Boolean,
        default=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    last_login = Column(
        DateTime,
        nullable=True,
    )