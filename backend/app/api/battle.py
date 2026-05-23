from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Session as StudySession, BattleEvent, Character, InventoryItem
from app.services.ai_service import generate_battle_questions
from datetime import date
import json
import random

router = APIRouter()

ENEMY_NAMES = {
    "Glaucoma": ["Glaucoma Goblin", "Pressure Phantom", "IOP Wraith"],
    "Retina": ["Retinal Raider", "Macular Marauder", "Vitreous Vampire"],
    "Cornea": ["Corneal Crusher", "Keratitis Knight", "Ulcer Ogre"],
    "Cataract": ["Lens Lich", "Opacity Ogre", "Cataract Colossus"],
    "default": ["Knowledge Demon", "Recall Raider", "Quiz Quetzal"],
}

LOOT_TABLE = {
    "common": [
        {"name": "Iron Ophthalmoscope", "type": "weapon", "stats": {"damage": 5}},
        {"name": "Cotton Bandage Armor", "type": "armor", "stats": {"hp": 10}},
    ],
    "uncommon": [
        {"name": "Silver Slit Lamp", "type": "weapon", "stats": {"damage": 15}},
        {"name": "Resident's White Coat", "type": "armor", "stats": {"hp": 25}},
        {"name": "Focus Ring", "type": "accessory", "stats": {"exp_boost": 10}},
    ],
    "rare": [
        {"name": "Golden Retinoscope", "type": "weapon", "stats": {"damage": 30}},
        {"name": "Surgical Gown of Precision", "type": "armor", "stats": {"hp": 50}},
        {"name": "Amulet of Recall", "type": "accessory", "stats": {"exp_boost": 25}},
    ],
    "epic": [
        {"name": "Legendary Fundoscope", "type": "weapon", "stats": {"damage": 55}},
        {"name": "Attending's Armor", "type": "armor", "stats": {"hp": 80}},
    ],
}


class BattleStartRequest(BaseModel):
    character_id: int
    topic: str
    subtopic: str = ""


class BattleAnswerRequest(BaseModel):
    session_id: int
    enemy_name: str
    question: str
    answer_chosen: str
    correct: bool
    difficulty: int


@router.post("/start")
def start_battle(data: BattleStartRequest, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == data.character_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    session = StudySession(
        character_id=data.character_id,
        date=date.today().isoformat(),
        completed=False,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    enemy_pool = ENEMY_NAMES.get(data.topic, ENEMY_NAMES["default"])
    enemy_name = random.choice(enemy_pool)
    enemy_hp = random.randint(80, 120)

    questions = generate_battle_questions(data.topic, data.subtopic or data.topic, count=5)

    return {
        "session_id": session.id,
        "enemy": {
            "name": enemy_name,
            "hp": enemy_hp,
            "max_hp": enemy_hp,
            "topic": data.topic,
            "is_boss": False,
        },
        "questions": questions,
    }


@router.post("/answer")
def record_answer(data: BattleAnswerRequest, db: Session = Depends(get_db)):
    session = db.query(StudySession).filter(StudySession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    damage = 0
    if data.correct:
        damage = data.difficulty * 10 + random.randint(5, 15)

    event = BattleEvent(
        session_id=data.session_id,
        enemy_name=data.enemy_name,
        question=data.question,
        answer_chosen=data.answer_chosen,
        correct=data.correct,
        damage_dealt=damage,
    )
    db.add(event)

    session.minutes_studied = (session.minutes_studied or 0) + 5
    session.stamina_used = (session.stamina_used or 0) + 5

    loot = None
    if data.correct and random.random() < 0.3:
        rarity = random.choices(
            ["common", "uncommon", "rare", "epic"],
            weights=[50, 30, 15, 5],
        )[0]
        loot_options = LOOT_TABLE.get(rarity, LOOT_TABLE["common"])
        loot_data = random.choice(loot_options)

        new_item = InventoryItem(
            character_id=session.character_id,
            item_name=loot_data["name"],
            item_type=loot_data["type"],
            stats_json=json.dumps(loot_data["stats"]),
            equipped=False,
            rarity=rarity,
        )
        db.add(new_item)
        loot = {"name": loot_data["name"], "type": loot_data["type"], "rarity": rarity}

    db.commit()

    return {
        "damage_dealt": damage,
        "correct": data.correct,
        "loot": loot,
        "session_minutes": session.minutes_studied,
    }
