# 🌸 KIZASHI
### Predicting Behavioural Drift Before It Becomes Burnout

KIZASHI is an AI-powered behavioural analytics platform designed to identify subtle changes in user habits, detect behavioural drift, and estimate the risk of productivity decline or burnout. By analyzing daily activity patterns, the system provides early insights and personalized recommendations to help users maintain healthy routines.

---

## 🚀 Features

- 📊 Track daily behavioural metrics
- 🧠 Detect behavioural drift using machine learning
- ⚡ Predict productivity decline risk
- 🎯 Generate personalized recommendations
- 🔐 User authentication and secure data storage
- 📈 Visualize trends and behavioural changes over time

---

## 🏗️ Tech Stack

| Component | Technology |
|----------|------------|
| Backend | FastAPI |
| Database | PostgreSQL |
| Machine Learning | Scikit-learn |
| ORM | SQLAlchemy |
| Data Processing | Pandas, NumPy |
| API Testing | Postman |
| Deployment | Docker *(optional)* |

---

## 📂 Project Structure

```text
KIZASHI/
│
├── main.py                  # FastAPI application
├── database.py              # Database connection setup
├── models.py                # SQLAlchemy models
├── create_tables.py         # Table initialization
├── kizashi_model.pkl        # Trained ML model
├── features.pkl             # Feature metadata
├── requirements.txt
├── README.md
│
├── routes/
│   ├── auth.py
│   ├── logs.py
│   └── prediction.py
│
├── utils/
│   ├── preprocessing.py
│   └── recommendations.py
│
└── datasets/
    └── sample_data.csv
