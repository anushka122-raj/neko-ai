from sqlalchemy.orm import Session

from app.models.memory import Memory


# ---------------------------------------------------
# Create Memory
# ---------------------------------------------------

def add_memory(
    db: Session,
    title: str,
    content: str,
    category: str = "general",
):
    """
    Save a new memory.
    """

    title = title.strip()
    content = content.strip()

    if not title or not content:
        return None

    memory = Memory(
        title=title,
        content=content,
        category=category,
    )

    db.add(memory)
    db.commit()
    db.refresh(memory)

    return memory


# ---------------------------------------------------
# Get All Memories
# ---------------------------------------------------

def get_all_memories(db: Session):
    """
    Return every saved memory.
    """

    return (
        db.query(Memory)
        .order_by(Memory.id.desc())
        .all()
    )


# ---------------------------------------------------
# Category Filter
# ---------------------------------------------------

def get_memories_by_category(
    db: Session,
    category: str,
):
    """
    Return memories from one category.
    """

    return (
        db.query(Memory)
        .filter(Memory.category == category)
        .order_by(Memory.id.desc())
        .all()
    )


# ---------------------------------------------------
# Keyword Search
# ---------------------------------------------------

def search_memories(
    db: Session,
    keyword: str,
):
    """
    Search memories by title or content.
    """

    keyword = keyword.strip()

    return (
        db.query(Memory)
        .filter(
            (Memory.title.contains(keyword))
            | (Memory.content.contains(keyword))
        )
        .order_by(Memory.id.desc())
        .all()
    )