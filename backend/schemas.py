from pydantic import BaseModel
from datetime import date


class DailyLogCreate(BaseModel):
    user_id: int
    date: date

    study_hours: float
    screen_time: float
    focus_sessions: int

    mood_score: int
    stress_level: int
    motivation_level: int

    sleep_hours: float
    energy_level: int

    routine_score: int

    tasks_completed: int
    tasks_planned: int