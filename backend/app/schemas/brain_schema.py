from typing import Optional

from pydantic import BaseModel


class BrainResponse(BaseModel):
    """
    Response returned by Neko's AI Brain.

    Shared between:
    - AI Engine
    - FastAPI
    - React Frontend
    - Desktop Pet (Electron)
    """

    # Current emotion
    emotion: str

    # What Neko says
    response: str

    # Animation to play
    animation: Optional[str] = None

    # Action for the desktop pet
    action: Optional[str] = None

    # Optional speech output for future TTS
    speak: bool = True