# 🏥 Explainable Clinical Decision Support System (ECDSS)

### 🎓 Final Year Major Project
An intelligent, full-stack healthcare application that predicts diabetes risk factors using the **Pima Indians Diabetes Dataset** and provides natural language medical insights powered by the **Llama API**.

<img src="assests\GIF x-ai.gif" alt="Application Demo" width="100%" />

---

## 📌 Project Overview

This system bridges the gap between raw predictive accuracy and clinical interpretability. By evaluating patient physiological metrics, the system not only classifies diabetes risk but also leverages Large Language Models (LLMs) to translate complex statistical vectors into readable, actionable medical explanations for healthcare professionals.

### 🌟 Key Features
* **Risk Prediction Engine:** Optimized classification pipeline trained on historical clinical metrics.
* **GenAI Interpretability:** Automated generation of diagnostic summaries and clinical explanations using the **Llama API**.
* **Interactive Dashboard:** Modern responsive user interface for entering diagnostics and visualizing risk breakdowns.
* **Secure Asynchronous Backend:** Decoupled RESTful API microservices architecture built with Flask.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js, TailwindCSS, Axios | Responsive UI & State Management |
| **Backend** | Flask (Python), Flask-CORS | Core REST API Architecture |
| **AI / Core** | Llama API, Scikit-Learn,TensorFlow, Pandas | LLM Interpretation & ML Inference Pipeline |
| **Dataset** | Pima Indians Diabetes Dataset | Clinical Data Source (NIH/UCI Repository) |

---

## 🧬 System Architecture

```text
[React Frontend] <---> [Flask API Backend] <---> [TensorFlow ML Model]
                                    ^
                                    |
                                    v
                            [Llama API Engine]