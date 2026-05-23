from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Session as StudySession, BattleEvent, Character, InventoryItem
from datetime import date
import json

router = APIRouter()


@router.get("/{character_id}")
def get_progress(character_id: int, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == character_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    sessions = db.query(StudySession).filter(StudySession.character_id == character_id).all()
    total_minutes = sum(s.minutes_studied or 0 for s in sessions)
    total_sessions = len(sessions)

    today_sessions = [s for s in sessions if s.date == date.today().isoformat()]
    today_minutes = sum(s.minutes_studied or 0 for s in today_sessions)

    battle_events = (
        db.query(BattleEvent)
        .join(StudySession)
        .filter(StudySession.character_id == character_id)
        .all()
    )
    correct = sum(1 for e in battle_events if e.correct)
    total_questions = len(battle_events)
    accuracy = round(correct / total_questions * 100, 1) if total_questions > 0 else 0

    inventory = db.query(InventoryItem).filter(InventoryItem.character_id == character_id).all()

    return {
        "character_id": character_id,
        "total_minutes_studied": total_minutes,
        "total_sessions": total_sessions,
        "today_minutes": today_minutes,
        "boss_unlocked": today_minutes >= 300,
        "questions_answered": total_questions,
        "accuracy": accuracy,
        "inventory_count": len(inventory),
    }


@router.get("/{character_id}/inventory")
def get_inventory(character_id: int, db: Session = Depends(get_db)):
    items = db.query(InventoryItem).filter(InventoryItem.character_id == character_id).all()
    return [
        {
            "id": item.id,
            "name": item.item_name,
            "type": item.item_type,
            "rarity": item.rarity,
            "stats": json.loads(item.stats_json),
            "equipped": item.equipped,
        }
        for item in items
    ]
