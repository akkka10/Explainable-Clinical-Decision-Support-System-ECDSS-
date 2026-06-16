import shap
import numpy as np
import pandas as pd
from model_utils import get_background_data

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "Blood Pressure", "Skin Thickness", 
    "Insulin", "BMI", "Diabetes Pedigree", "Age"
]

def get_shap_explanation(model, processed_data):
    try:
        background_data = get_background_data()
        
        # Define a wrapper to ensure SHAP sees a single column of probabilities
        def model_predict(data):
            preds = model.predict(data)
            # If the model returns [[prob]], we flatten it to [prob]
            return preds.flatten()

        # Initialize Explainer with the wrapper
        explainer = shap.KernelExplainer(model_predict, background_data)
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(processed_data, nsamples=100)
        
        # Handle the output shape (SHAP can return a list or an array)
        if isinstance(shap_values, list):
            scores = np.array(shap_values[0]).flatten()
        else:
            scores = np.array(shap_values).flatten()

        impact_map = dict(zip(FEATURE_NAMES, [round(float(s), 4) for s in scores]))
        
        return {
            "impact_scores": impact_map,
            "top_contributors": sorted(impact_map, key=impact_map.get, reverse=True)[:3],
            "base_value": float(np.mean(explainer.expected_value))
        }
    except Exception as e:
        print(f"SHAP Error: {e}")
        # Return empty scores so the Frontend doesn't crash
        return {"impact_scores": {n: 0 for n in FEATURE_NAMES}, "top_contributors": []}