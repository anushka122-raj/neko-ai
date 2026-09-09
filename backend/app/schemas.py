from pydantic import BaseModel

class StudentData(BaseModel):

    student_id: int
    age: int
    gender: int

    study_hours_per_day: float
    sleep_hours: float
    phone_usage_hours: float
    social_media_hours: float
    youtube_hours: float
    gaming_hours: float

    breaks_per_day: int
    coffee_intake_mg: int
    exercise_minutes: int

    assignments_completed: int
    attendance_percentage: int
    stress_level: int
    focus_score: int
    final_grade: float