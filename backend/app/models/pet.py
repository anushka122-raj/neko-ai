from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from app.database.database import Base


class Pet(Base):
    """
    Stores Neko's current state.

    There should only be one row in this table for the current pet.
    """

    __tablename__ = "pet"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, default="Neko")

    level = Column(Integer, default=1)

    xp = Column(Integer, default=0)

    mood = Column(String, default="happy")

    energy = Column(Integer, default=100)

    hunger = Column(Integer, default=0)

    happiness = Column(Integer, default=100)

    affection = Column(Integer, default=50)

    is_sleeping = Column(Boolean, default=False)

    last_interaction = Column(DateTime, default=datetime.utcnow)

    pos_x = Column(Float, default=200)

    pos_y = Column(Float, default=200)