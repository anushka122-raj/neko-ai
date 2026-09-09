import joblib
from app.config import MODEL_PATH, SCALER_PATH

model = None
scaler = None

def load_models():
    global model, scaler
    try:
        model = joblib.load(MODEL_PATH)
        print("✅ ML Model Loaded Successfully")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

    try:
        scaler = joblib.load(SCALER_PATH)
        print("✅ Scaler Loaded Successfully")
    except Exception as e:
        print(f"❌ Failed to load scaler: {e}")
