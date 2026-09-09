from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.memory import Memory
from app.services.memory_detector import should_save_memory


def create_memory(
    db: Session,
    title: str,
    content: str,
    category: str,
) -> Memory:
    """
    Create and store a new memory.
    """

    title = title.strip()
    content = content.strip()
    category = category.strip() or "General"

    memory = Memory(
        title=title,
        content=content,
        category=category,
    )

    try:
        db.add(memory)
        db.commit()
        db.refresh(memory)
    except Exception:
        db.rollback()
        raise

    return memory


def get_all_memories(db: Session) -> list[Memory]:
    """
    Return all saved memories, newest first.
    """

    return (
        db.query(Memory)
        .order_by(
            Memory.created_at.desc(),
            Memory.id.desc(),
        )
        .all()
    )


def get_recent_memories(
    db: Session,
    limit: int = 5,
) -> list[Memory]:
    """
    Return the most recent saved memories.
    """

    safe_limit = max(1, min(limit, 50))

    return (
        db.query(Memory)
        .order_by(
            Memory.created_at.desc(),
            Memory.id.desc(),
        )
        .limit(safe_limit)
        .all()
    )


def delete_memory(
    db: Session,
    memory_id: int,
) -> bool:
    """
    Delete one memory by its ID.
    """

    memory = (
        db.query(Memory)
        .filter(Memory.id == memory_id)
        .first()
    )

    if memory is None:
        return False

    try:
        db.delete(memory)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return True


def format_memories(
    memories: list[Memory],
) -> list[str]:
    """
    Convert database memories into prompt-friendly text.
    """

    return [
        f"{memory.category} — {memory.title}: {memory.content}"
        for memory in memories
    ]


def _detect_category(message: str) -> str:
    """
    Select a memory category from the message content.
    """

    text = message.lower()

    if any(
        keyword in text
        for keyword in (
            "exam",
            "study",
            "assignment",
            "college",
            "semester",
        )
    ):
        return "Study"

    if any(
        keyword in text
        for keyword in (
            "project",
            "coding",
            "python",
            "java",
            "machine learning",
            "deep learning",
        )
    ):
        return "Project"

    if any(
        keyword in text
        for keyword in (
            "goal",
            "dream",
            "want to",
            "learn",
            "career",
            "job",
            "internship",
            "placement",
        )
    ):
        return "Goal"

    if any(
        keyword in text
        for keyword in (
            "meeting",
            "interview",
            "deadline",
        )
    ):
        return "Work"

    if any(
        keyword in text
        for keyword in (
            "birthday",
            "friend",
            "family",
            "favorite",
            "i like",
            "i love",
        )
    ):
        return "Personal"

    if any(
        keyword in text
        for keyword in (
            "habit",
            "routine",
            "sleep",
            "water",
            "workout",
            "exercise",
            "health",
        )
    ):
        return "Habit"

    if any(
        keyword in text
        for keyword in (
            "schedule",
            "remind",
            "appointment",
        )
    ):
        return "Schedule"

    return "General"


def auto_save_memory(
    db: Session,
    message: str,
):
    """
    Automatically save an important user message.

    Duplicate messages are not stored again.
    """

    message = message.strip()

    if not should_save_memory(message):
        return None

    existing = (
        db.query(Memory)
        .filter(
            func.lower(Memory.content)
            == message.lower()
        )
        .first()
    )

    if existing:
        return existing

    return create_memory(
        db=db,
        title="Conversation",
        content=message,
        category=_detect_category(message),
    )