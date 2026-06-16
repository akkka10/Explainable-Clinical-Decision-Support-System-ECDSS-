from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os 
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Hides info/warning logs
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# 1. Import the REAL functions from the files we created
from model_utils import load_diabetes_model, preprocess_input, get_prediction
from explain_utils import get_shap_explanation
from narriative_utils import get_llm_interpretation

app = FastAPI(title="Explainable Clinical Decision Support System API")

# --- CONNECTION LOGIC: CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the model once at startup (Global Variable)
# This prevents the server from slowing down by reloading the model every time
diabetes_model = load_diabetes_model()

class PatientMetrics(BaseModel):
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    dpf: float 
    age: int

@app.get("/")
def read_root():
    return {"status": "Online", "model_loaded": diabetes_model is not None}

@app.post("/predict")
async def analyze_patient(metrics: PatientMetrics):
    """
    The REAL AI Pipeline: 
    1. Preprocess -> 2. Predict -> 3. Explain (SHAP) -> 4. Narrate (Gemini)
    """
    try:
        # Convert Pydantic model to dictionary
        input_data = metrics.model_dump()
        
        # STEP 1: Preprocess the data for TensorFlow
        processed_data = preprocess_input(input_data)
        
        # STEP 2: Predict using the loaded .h5 model
        prediction = get_prediction(diabetes_model, processed_data)
        
        # STEP 3: Generate SHAP explanations
        # This will return the feature impacts and top contributors
        shap_info = get_shap_explanation(diabetes_model, processed_data)
        
        # STEP 4: Generate Human-readable Narrative using Gemini
        # We pass the prediction and the SHAP data to the LLM
        explanation = get_llm_interpretation(prediction, shap_info)

        # Return the final consolidated package to your React Frontend
        return {
            "prediction": prediction,
            "explanation_data": shap_info,
            "clinical_narrative": explanation
        }

    except Exception as e:
        # Detailed error for debugging during development
        raise HTTPException(status_code=500, detail=f"AI Pipeline Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)