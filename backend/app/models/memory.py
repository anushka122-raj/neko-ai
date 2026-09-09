from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.database import Base


class Memory(Base):
    """
    Stores NekoAI's long-term memories about the user.
    """

    __tablename__ = "memories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(100),
        nullable=False,
        index=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    category = Column(
        String(50),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )