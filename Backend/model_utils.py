import tensorflow as tf
import pandas as pd
import numpy as np
import os
import joblib

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "models", "diabetes_model.h5")
SCALER_PATH = os.path.join(BASE_DIR, "models", "scaler.pkl")

# Load globally
scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None

def load_diabetes_model():
    if not os.path.exists(MODEL_PATH):
        return None
    try:
        return tf.keras.models.load_model(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def preprocess_input(data_dict):
    # EXTRACT IN THE EXACT SAME ORDER AS THE NOTEBOOK
    try:
        feature_values = [
            float(data_dict.get('pregnancies', 0)),
            float(data_dict.get('glucose', 0)),
            float(data_dict.get('blood_pressure', 0)),
            float(data_dict.get('skin_thickness', 0)),
            float(data_dict.get('insulin', 0)),
            float(data_dict.get('bmi', 0)),
            float(data_dict.get('dpf', 0)),
            float(data_dict.get('age', 0))
        ]
    except ValueError:
        return None

    raw_array = np.array(feature_values).reshape(1, -1)
    
    # SCALE THE DATA
    if scaler:
        return scaler.transform(raw_array)
    return raw_array

def get_prediction(model, processed_data):
    if model is None or processed_data is None:
        return {"risk_level": "Error", "confidence": 0.0}

    prediction_prob = model.predict(processed_data, verbose=0)[0][0]
    
    # Adjust threshold if needed (e.g., 0.4 to be more sensitive)
    risk_level = "High" if prediction_prob > 0.5 else "Low"
    confidence = float(prediction_prob) if risk_level == "High" else float(1 - prediction_prob)
    
    return {
        "risk_level": risk_level,
        "confidence": round(confidence, 4)
    }

def get_background_data():
    data_path = os.path.join(BASE_DIR, "..", "data", "pima-indians-diabetes.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        # Drop the outcome column
        X = df.drop('Outcome', axis=1, errors='ignore').values
        sample = X[np.random.choice(X.shape[0], min(50, X.shape[0]), replace=False)]
        
        # SHAP BASELINE MUST BE SCALED
        if scaler:
            return scaler.transform(sample)
        return sample
    return np.zeros((1, 8))