from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.database import Base


class ChatMessage(Base):
    """
    Stores every conversation between the user and Neko.

    This history is later used to:
    - provide conversation memory
    - build Gemini prompts
    - remember previous discussions
    """

    __tablename__ = "chat_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    role = Column(
        String(20),
        nullable=False,
    )  # user / neko / system

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )