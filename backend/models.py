from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    DateTime
)

from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer)

    date = Column(Date)

    study_hours = Column(Float)
    screen_time = Column(Float)
    focus_sessions = Column(Integer)

    mood_score = Column(Integer)
    stress_level = Column(Integer)
    motivation_level = Column(Integer)

    sleep_hours = Column(Float)
    energy_level = Column(Integer)

    routine_score = Column(Integer)

    tasks_completed = Column(Integer)
    tasks_planned = Column(Integer)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer)

    prediction_date = Column(Date)

    bdi = Column(Float)

    risk_level = Column(String)

    ml_prediction = Column(String)

    insight = Column(String)

    recommendation = Column(String)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )