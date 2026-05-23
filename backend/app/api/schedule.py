from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import StudyPlan, Character
from app.services.schedule_service import build_schedule
import json

router = APIRouter()


class ScheduleCreate(BaseModel):
    character_id: int
    exam_date: str
    topics: list[str]


@router.post("/generate")
def generate_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == data.character_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    plan_data = build_schedule(data.exam_date, data.topics)
    if not plan_data:
        raise HTTPException(status_code=400, detail="Could not generate schedule. Check the exam date.")

    plan = StudyPlan(
        character_id=data.character_id,
        exam_date=data.exam_date,
        topics_json=json.dumps(data.topics),
        plan_json=json.dumps(plan_data),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {
        "id": plan.id,
        "exam_date": plan.exam_date,
        "topics": data.topics,
        "plan": plan_data,
        "total_days": len(plan_data),
    }


@router.get("/{character_id}/latest")
def get_latest_schedule(character_id: int, db: Session = Depends(get_db)):
    plan = (
        db.query(StudyPlan)
        .filter(StudyPlan.character_id == character_id)
        .order_by(StudyPlan.created_at.desc())
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="No study plan found")

    return {
        "id": plan.id,
        "exam_date": plan.exam_date,
        "topics": json.loads(plan.topics_json),
        "plan": json.loads(plan.plan_json),
    }
