import numpy as np
from app import model_loader

def predict_productivity(data):
    if model_loader.scaler is None or model_loader.model is None:
        raise RuntimeError("Model or scaler not loaded. Did you call load_models()?")

    # Exclude student_id if it wasn't used in training
    features = [
        # data["student_id"],  <-- REMOVE this if not in training
        data["age"], data["gender"],
        data["study_hours_per_day"], data["sleep_hours"],
        data["phone_usage_hours"], data["social_media_hours"],
        data["youtube_hours"], data["gaming_hours"],
        data["breaks_per_day"], data["coffee_intake_mg"],
        data["exercise_minutes"], data["assignments_completed"],
        data["attendance_percentage"], data["stress_level"],
        data["focus_score"], data["final_grade"]
    ]

    X = np.array(features).reshape(1, -1)
    X_scaled = model_loader.scaler.transform(X)
    prediction = model_loader.model.predict(X_scaled)[0]
    return prediction
