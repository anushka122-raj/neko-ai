from app.database.database import Base, engine

from app.models.user import User

from app.models.task import Task

from app.models.memory import Memory


Base.metadata.create_all(bind=engine)

Base.metadata.create_all(bind=engine)

print("Database Created Successfully!")