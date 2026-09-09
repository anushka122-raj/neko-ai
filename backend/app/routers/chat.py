from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.ai_service import generate_response
from app.ai.prompt_builder import build_prompt
from app.database.database import get_db
from app.models.chat_message import ChatMessage

from app.services.decision_database import (
    format_task_summary,
    get_task_statistics,
)

from app.services.memory_service import (
    auto_save_memory,
    format_memories,
    get_recent_memories,
)


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"],
)


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=8000,
    )


def _recent_history(
    db: Session,
    limit: int = 100,
) -> list[dict]:
    """
    Return recent conversation history
    in chronological order.
    """

    messages = (
        db.query(ChatMessage)
        .order_by(
            ChatMessage.created_at.desc(),
            ChatMessage.id.desc(),
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "created_at": (
                message.created_at.isoformat()
                if message.created_at
                else None
            ),
        }
        for message in reversed(messages)
    ]


@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    Main NekoAI conversation endpoint.
    """

    message = request.message.strip()

    if not message:
        return {
            "success": False,
            "reply": "",
            "error": "Please enter a message.",
        }

    # Load history before saving the current user message.
    history = _recent_history(
        db,
        limit=20,
    )

    # Save useful information from the user message.
    try:
        auto_save_memory(db, message)
    except Exception as error:
        print(
            f"Memory save warning: "
            f"{type(error).__name__}: {error}"
        )

    # Save user message.
    user_chat_message = ChatMessage(
        role="user",
        content=message,
    )

    db.add(user_chat_message)
    db.commit()
    db.refresh(user_chat_message)

    # Build the full AI prompt.
    prompt = build_prompt(
        user_message=message,
        memories=format_memories(
            get_recent_memories(db)
        ),
        task_summary=format_task_summary(
            get_task_statistics(db)
        ),
        history=history,
    )

    try:
        reply = generate_response(prompt)

        if not reply or not reply.strip():
            raise ValueError(
                "Gemini returned an empty response."
            )

        reply = reply.strip()

    except Exception as error:
        print(
            f"Gemini error: "
            f"{type(error).__name__}: {error}"
        )

        return {
            "success": False,
            "reply": (
                "Sorry... I couldn't reach my AI brain "
                "right now 🐱 Please try again in a moment."
            ),
            "error": str(error),
        }

    # Save Neko's response.
    neko_chat_message = ChatMessage(
        role="neko",
        content=reply,
    )

    db.add(neko_chat_message)
    db.commit()
    db.refresh(neko_chat_message)

    # Save potentially useful information from AI response.
    try:
        auto_save_memory(db, reply)
    except Exception as error:
        print(
            f"Memory save warning: "
            f"{type(error).__name__}: {error}"
        )

    return {
        "success": True,
        "reply": reply,
        "user_message": {
            "id": user_chat_message.id,
            "role": user_chat_message.role,
            "content": user_chat_message.content,
            "created_at": (
                user_chat_message.created_at.isoformat()
                if user_chat_message.created_at
                else None
            ),
        },
        "ai_message": {
            "id": neko_chat_message.id,
            "role": neko_chat_message.role,
            "content": neko_chat_message.content,
            "created_at": (
                neko_chat_message.created_at.isoformat()
                if neko_chat_message.created_at
                else None
            ),
        },
    }


@router.get("/history")
def chat_history(
    db: Session = Depends(get_db),
):
    """
    Return the latest 100 chat messages,
    including IDs and timestamps.
    """

    return _recent_history(
        db,
        limit=100,
    )


@router.delete("/history")
def clear_chat_history(
    db: Session = Depends(get_db),
):
    """
    Delete all saved chat messages.
    """

    deleted_count = db.query(ChatMessage).delete()

    db.commit()

    return {
        "success": True,
        "message": "Chat history cleared.",
        "deleted_count": deleted_count,
    }


@router.get("/test")
def test_chat():
    return {
        "success": True,
        "reply": "Chat router is working!",
    }