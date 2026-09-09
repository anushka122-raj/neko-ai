from pathlib import Path

# Project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ML Model directory
ML_MODEL_DIR = BASE_DIR / "ml_model" / "models"

# Trained models
MODEL_PATH = ML_MODEL_DIR / "random_forest.pkl"

SCALER_PATH = ML_MODEL_DIR / "scaler.pkl"

PIPELINE_PATH = ML_MODEL_DIR / "pipeline.pkl"

PRODUCTIVITY_MODEL_PATH = ML_MODEL_DIR / "productivity_model.pkl"


def verify_model_files():
    """
    Ensure all required ML files exist.
    Raises FileNotFoundError if any are missing.
    """

    required_files = [
        MODEL_PATH,
        SCALER_PATH,
    ]

    for file in required_files:

        if not file.exists():

            raise FileNotFoundError(
                f"Missing ML model file: {file}"
            )