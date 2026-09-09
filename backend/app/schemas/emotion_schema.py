from typing import Optional

from pydantic import BaseModel


class EmotionResponse(BaseModel):
    """
    Current emotional state of Neko.

    This response is shared between:

    - FastAPI Backend
    - React Frontend
    - Electron Desktop Pet
    """

    # Current emotion
    emotion: str

    # Message shown to the user
    message: str

    # Dashboard statistics
    pending_tasks: int

    completed_tasks: int

    # Animation for the desktop pet
    animation: Optional[str] = None

    # Emotion intensity (0-100)
    mood_level: Optional[int] = None

    # Whether a popup notification should appear
    notification: bool = False

    # Whether Neko should speak this message
    speak: bool = False