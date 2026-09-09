import joblib

model = joblib.load("ml_model/models/random_forest.pkl")
scaler = joblib.load("ml_model/models/scaler.pkl")

print("Model:", type(model))
print("Scaler:", type(scaler))
