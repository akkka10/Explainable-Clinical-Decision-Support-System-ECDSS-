import os
from groq import Groq # Plan B Library
from dotenv import load_dotenv

load_dotenv()
# Initialize Groq Client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_llm_interpretation(prediction, shap_info):
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # High-end Llama model
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical AI. Provide a 3-sentence narrative for a doctor."
                },
                {
                    "role": "user",
                    "content": f"Risk: {prediction['risk_level']}. SHAP factors: {shap_info['top_contributors']}."
                }
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Groq Error: {str(e)}"