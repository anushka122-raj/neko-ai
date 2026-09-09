from pydantic import BaseModel


class DecisionResponse(BaseModel):
    emotion: str
    message: str
