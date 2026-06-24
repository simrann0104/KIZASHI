from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
from fastapi import Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
from database import get_db
from models import DailyLog, Prediction
from schemas import DailyLogCreate
app = FastAPI()

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Load Dataset
# =========================

df = pd.read_csv("kizashi_dataset.csv")
df["date"] = pd.to_datetime(df["date"])

# =========================
# Load Model
# =========================

model = joblib.load("kizashi_model.pkl")
features = joblib.load("features.pkl")

# =========================
# Core Prediction Function
# =========================


def predict_behavior(input_data, user_history_df, model, feature_list):

    try:

        # -------------------------
        # Validation
        # -------------------------

        required_fields = [
            "user_id",
            "date",
            "study_hours",
            "screen_time",
            "focus_sessions",
            "mood_score",
            "stress_level",
            "sleep_hours",
            "tasks_completed",
            "tasks_planned"
        ]

        for field in required_fields:
            if field not in input_data:
                return {
                    "error": f"Missing field: {field}"
                }

        # -------------------------
        # Convert Input
        # -------------------------

        new_df = pd.DataFrame([input_data])

        # -------------------------
        # Negative Value Check
        # -------------------------

        numeric_cols = [
            "study_hours",
            "screen_time",
            "focus_sessions",
            "mood_score",
            "stress_level",
            "sleep_hours",
            "tasks_completed",
            "tasks_planned"
        ]

        for col in numeric_cols:
            if new_df[col].iloc[0] < 0:
                return {
                    "error": f"{col} cannot be negative"
                }

        # -------------------------
        # Empty History Handling
        # -------------------------

        if user_history_df is None or user_history_df.empty:
            user_history_df = pd.DataFrame(columns=new_df.columns)

        # -------------------------
        # Merge History + New Row
        # -------------------------

        df_all = pd.concat(
            [user_history_df, new_df],
            ignore_index=True
        )

        df_all["date"] = pd.to_datetime(df_all["date"])

        df_all = df_all.sort_values(
            by=["user_id", "date"]
        )

        # =========================
        # Feature Engineering
        # =========================

        df_all["completion_rate"] = (
            df_all["tasks_completed"]
            /
            df_all["tasks_planned"].replace(0, 1)
        )

        df_all["avg_session_duration"] = (
            (df_all["study_hours"] * 60)
            /
            df_all["focus_sessions"].replace(0, 1)
        )

        df_all["focus_density"] = (
            df_all["focus_sessions"]
            /
            df_all["study_hours"].replace(0, 1)
        )

        # =========================
        # Baselines
        # =========================

        df_all["baseline_study"] = (
            df_all.groupby("user_id")["study_hours"]
            .transform(
                lambda x: x.rolling(
                    7,
                    min_periods=1
                ).mean()
            )
        )

        df_all["baseline_screen"] = (
            df_all.groupby("user_id")["screen_time"]
            .transform(
                lambda x: x.rolling(
                    7,
                    min_periods=1
                ).mean()
            )
        )

        df_all["baseline_mood"] = (
            df_all.groupby("user_id")["mood_score"]
            .transform(
                lambda x: x.rolling(
                    7,
                    min_periods=1
                ).mean()
            )
        )

        # =========================
        # Drift
        # =========================

        df_all["drift_study"] = (
            df_all["study_hours"]
            - df_all["baseline_study"]
        )

        df_all["drift_screen"] = (
            df_all["screen_time"]
            - df_all["baseline_screen"]
        )

        df_all["drift_mood"] = (
            df_all["mood_score"]
            - df_all["baseline_mood"]
        )

        # =========================
        # Normalized Drift
        # =========================

        df_all["abs_drift_study"] = (
            df_all["drift_study"]
            /
            (df_all["baseline_study"] + 1e-5)
        ).abs()

        df_all["abs_drift_screen"] = (
            df_all["drift_screen"]
            /
            (df_all["baseline_screen"] + 1e-5)
        ).abs()

        df_all["abs_drift_mood"] = (
            df_all["drift_mood"]
            /
            (df_all["baseline_mood"] + 1e-5)
        ).abs()

        # =========================
        # Clean NaN / Inf
        # =========================

        df_all.replace(
            [np.inf, -np.inf],
            0,
            inplace=True
        )

        df_all.fillna(0, inplace=True)

        # =========================
        # BDI
        # =========================

        df_all["BDI"] = (
            0.4 * df_all["abs_drift_study"]
            + 0.3 * df_all["abs_drift_screen"]
            + 0.3 * df_all["abs_drift_mood"]
        )

        # =========================
        # Risk Classification
        # =========================

        def risk_level(bdi):
            if bdi < 0.2:
                return "Low"
            elif bdi < 0.5:
                return "Moderate"
            else:
                return "High"

        df_all["risk_level"] = (
            df_all["BDI"]
            .apply(risk_level)
        )

        # =========================
        # Insight
        # =========================

        def generate_insight(row):

            if row["drift_study"] < -1:
                return (
                    "Your study time has dropped "
                    "below your normal pattern."
                )

            elif row["drift_screen"] > 1:
                return (
                    "Your screen time is higher "
                    "than usual."
                )

            elif row["drift_mood"] < -1:
                return (
                    "Your mood is declining."
                )

            return "Your behavior is stable."

        df_all["insight"] = (
            df_all.apply(
                generate_insight,
                axis=1
            )
        )

        # =========================
        # Recommendation
        # =========================

        def generate_recommendation(row):

            suggestions = []

            if row["drift_study"] < -1:
                suggestions.append(
                    f"Increase study time by ~{round(abs(row['drift_study']),1)} hours."
                )

            if row["drift_screen"] > 1:
                suggestions.append(
                    f"Reduce screen time by ~{round(row['drift_screen'],1)} hours."
                )

            if row["drift_mood"] < -1:
                suggestions.append(
                    "Take breaks or reduce workload to improve mood."
                )

            if not suggestions:
                return (
                    "You are on track. "
                    "Maintain your current routine."
                )

            return " | ".join(suggestions)

        df_all["recommendation"] = (
            df_all.apply(
                generate_recommendation,
                axis=1
            )
        )

        latest = df_all.iloc[-1]

        # =========================
        # ML Prediction
        # =========================

        try:

            ml_input = [
                latest[feature]
                for feature in feature_list
            ]

        except KeyError as e:

            return {
                "error":
                f"Model feature missing: {e}"
            }

        try:

            ml_prediction = (
                model.predict([ml_input])[0]
            )

        except Exception as e:

            return {
                "error":
                f"Prediction failed: {str(e)}"
            }

        # =========================
        # Output
        # =========================
        # =========================
        # Output
        # =========================

        score = (latest["study_hours"] * 4 + latest["mood_score"] * 5 + latest["sleep_hours"] * 4 + latest["motivation_level"] * 3 + latest["energy_level"] * 3- latest["screen_time"] * 3 - latest["stress_level"] * 4)

        score = round(max(0, min(100, score)))

        return {
            "BDI": round(float(latest["BDI"]), 3),

            "behavior_score": score,

            "risk_level": latest["risk_level"],

            "ml_prediction": str(ml_prediction),

            "insight": latest["insight"],

            "recommendation": latest["recommendation"]
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# API Routes
# =========================
@app.post("/predict")
def predict(
    data: dict,
    db: Session = Depends(get_db)
):

    history = db.query(DailyLog)\
        .filter(
            DailyLog.user_id == data["user_id"]
        )\
        .order_by(DailyLog.date)\
        .all()

    history_df = pd.DataFrame([
        {
            "user_id": row.user_id,
            "date": row.date,
            "study_hours": row.study_hours,
            "screen_time": row.screen_time,
            "focus_sessions": row.focus_sessions,
            "mood_score": row.mood_score,
            "stress_level": row.stress_level,
            "motivation_level": row.motivation_level,
            "sleep_hours": row.sleep_hours,
            "energy_level": row.energy_level,
            "routine_score": row.routine_score,
            "tasks_completed": row.tasks_completed,
            "tasks_planned": row.tasks_planned
        }
        for row in history
    ])

    result = predict_behavior(
        data,
        history_df,
        model,
        features
    )

    prediction = Prediction(
        user_id=data["user_id"],
        prediction_date=pd.to_datetime(
            data["date"]
        ).date(),

        bdi=result["BDI"],
        risk_level=result["risk_level"],

        ml_prediction=result["ml_prediction"],

        insight=result["insight"],
        recommendation=result["recommendation"]
    )

    db.add(prediction)
    db.commit()

    return result


@app.get("/")
def home():
    return {
        "message": "KIZASHI API is running"
    }
@app.post("/daily-log")
def create_daily_log(
    data: DailyLogCreate,
    db: Session = Depends(get_db)
):

    log = DailyLog(
        user_id=data.user_id,
        date=data.date,

        study_hours=data.study_hours,
        screen_time=data.screen_time,
        focus_sessions=data.focus_sessions,

        mood_score=data.mood_score,
        stress_level=data.stress_level,
        motivation_level=data.motivation_level,

        sleep_hours=data.sleep_hours,
        energy_level=data.energy_level,

        routine_score=data.routine_score,

        tasks_completed=data.tasks_completed,
        tasks_planned=data.tasks_planned
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "message": "Daily log saved",
        "id": log.id
    }
@app.get("/predictions/{user_id}")
def get_predictions(
    user_id: int,
    db: Session = Depends(get_db)
):

    predictions = db.query(Prediction)\
        .filter(
            Prediction.user_id == user_id
        )\
        .order_by(
            Prediction.prediction_date
        )\
        .all()

    return [
        {
            "date": p.prediction_date,
            "bdi": p.bdi,
            "risk_level": p.risk_level,
            "ml_prediction": p.ml_prediction,
            "insight": p.insight,
            "recommendation": p.recommendation
        }
        for p in predictions
    ]
@app.get("/history/{user_id}")
def get_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    logs = db.query(DailyLog)\
        .filter(
            DailyLog.user_id == user_id
        )\
        .order_by(
            DailyLog.date
        )\
        .all()

    return [
        {
            "date": log.date,
            "study_hours": log.study_hours,
            "screen_time": log.screen_time,
            "mood_score": log.mood_score,
            "sleep_hours": log.sleep_hours,
            "tasks_completed": log.tasks_completed,
            "tasks_planned": log.tasks_planned
        }
        for log in logs
    ]
@app.get("/dashboard/{user_id}")
def dashboard(
    user_id:int,
    db:Session=Depends(get_db)
):

    logs=db.query(DailyLog)\
        .filter(DailyLog.user_id==user_id)\
        .order_by(DailyLog.date)\
        .all()


    predictions=db.query(Prediction)\
        .filter(Prediction.user_id==user_id)\
        .order_by(Prediction.prediction_date)\
        .all()



    latest=predictions[-1] if predictions else None



    streak=0

    if logs:

        dates=[pd.to_datetime(l.date).date()
               for l in logs]


        current=dates[-1]


        for d in reversed(dates):

            if (current-d).days==0:

                streak+=1

                current=current-pd.Timedelta(days=1)

            else:
                break




    avg_study=round(

        np.mean([l.study_hours for l in logs]),1

    ) if logs else 0



    avg_sleep=round(

        np.mean([l.sleep_hours for l in logs]),1

    ) if logs else 0



    avg_screen=round(

        np.mean([l.screen_time for l in logs]),1

    ) if logs else 0

    weekly_insight=[]


    if avg_study>=4:

        weekly_insight.append(

        "📚 Study habits remain consistent"

    )

    else:

        weekly_insight.append(

        "📚 Try increasing study hours"

    )



    if avg_sleep>=7:

        weekly_insight.append(

        "😴 Sleep patterns appear stable"

    )

    else:

        weekly_insight.append(
 
        "😴 Aim for at least 7 hours of sleep"

    )



    if avg_screen>5:

        weekly_insight.append(

        "📱 Screen time is above average"

    )

    else:

        weekly_insight.append(

        "☕ Short breaks seem to help focus"

    )



    if avg_stress>6:

        weekly_insight.append(

        "😌 Stress levels were elevated this week"

    )

    avg_mood = round(

    np.mean([l.mood_score for l in logs]),1

    ) if logs else 0



    avg_stress = round(

np.mean([l.stress_level for l in logs]),1

) if logs else 0



    return{


        "total_logs":len(logs),


        "latest_bdi":

        latest.bdi if latest else 0,


        "latest_risk":

        latest.risk_level if latest else "Low",



        "recommendation":

        latest.recommendation
        if latest else "",



        "streak":streak,


        "avg_study":avg_study,


        "avg_sleep":avg_sleep,


        "avg_screen":avg_screen,

        
        "weekly_insight":weekly_insight,


    }
@app.get("/report/{user_id}")
def download_report(
    user_id: int,
    db: Session = Depends(get_db)
):

    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .all()
    )

    if not predictions:
        return {"error": "No predictions found"}

    latest = predictions[-1]

    pdf_file = "kizashi_report.pdf"

    c = canvas.Canvas(pdf_file)

    c.drawString(
        100,
        800,
        "KIZASHI Behavioral Report"
    )

    c.drawString(
        100,
        760,
        f"BDI: {latest.bdi}"
    )

    c.drawString(
        100,
        740,
        f"Risk Level: {latest.risk_level}"
    )

    c.drawString(
        100,
        720,
        f"Prediction: {latest.ml_prediction}"
    )

    c.drawString(
        100,
        700,
        f"Insight: {latest.insight}"
    )

    c.drawString(
        100,
        680,
        f"Recommendation: {latest.recommendation}"
    )

    c.save()

    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        filename="KIZASHI_Report.pdf"
    )