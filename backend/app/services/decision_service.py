from sqlalchemy.orm import Session

from app.ai.decision_engine import make_decision


def get_decision(db: Session) -> dict:
    """
    Returns NekoAI's current decision.

    This service acts as the bridge between the
    router and the AI decision engine.
    """

    return make_decision(db)