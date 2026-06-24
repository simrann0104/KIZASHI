from database import SessionLocal
from models import DailyLog
from datetime import date

db = SessionLocal()

log = DailyLog(
    user_id=1,
    date=date.today(),

    study_hours=4,
    screen_time=6,
    focus_sessions=3,

    mood_score=5,
    stress_level=4,
    motivation_level=6,

    sleep_hours=7,
    energy_level=5,

    routine_score=75,

    tasks_completed=6,
    tasks_planned=8
)

db.add(log)
db.commit()

print("Data inserted successfully!")