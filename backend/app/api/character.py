from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Character, InventoryItem
import json

router = APIRouter()


class CharacterCreate(BaseModel):
    name: str
    char_class: str


class CharacterResponse(BaseModel):
    id: int
    name: str
    char_class: str
    level: int
    exp: int
    exp_to_next: int
    hp: int
    max_hp: int
    stamina: int
    max_stamina: int
    equipment: dict

    class Config:
        from_attributes = True


CLASS_STATS = {
    "Ophthalmologist": {"hp": 90, "stamina": 150, "weapon": "Slit Lamp Staff"},
    "Internist": {"hp": 110, "stamina": 140, "weapon": "Stethoscope Blade"},
    "Surgeon": {"hp": 80, "stamina": 160, "weapon": "Scalpel Twin Blades"},
    "Pediatrician": {"hp": 130, "stamina": 130, "weapon": "Reflex Hammer"},
    "Neurologist": {"hp": 70, "stamina": 170, "weapon": "Neural Arc"},
}


@router.post("", response_model=CharacterResponse)
def create_character(data: CharacterCreate, db: Session = Depends(get_db)):
    stats = CLASS_STATS.get(data.char_class, CLASS_STATS["Ophthalmologist"])

    char = Character(
        name=data.name,
        char_class=data.char_class,
        hp=stats["hp"],
        max_hp=stats["hp"],
        stamina=stats["stamina"],
        max_stamina=stats["stamina"],
    )
    db.add(char)
    db.flush()

    # Give starting weapon
    weapon = InventoryItem(
        character_id=char.id,
        item_name=stats["weapon"],
        item_type="weapon",
        stats_json=json.dumps({"damage": 15, "speed": 10}),
        equipped=True,
        rarity="common",
    )
    db.add(weapon)
    db.commit()
    db.refresh(char)

    equipped = db.query(InventoryItem).filter(
        InventoryItem.character_id == char.id,
        InventoryItem.equipped == True,
    ).all()

    equipment = {}
    for item in equipped:
        equipment[item.item_type] = {
            "id": item.id,
            "name": item.item_name,
            "rarity": item.rarity,
            "stats": json.loads(item.stats_json),
        }

    return CharacterResponse(
        id=char.id,
        name=char.name,
        char_class=char.char_class,
        level=char.level,
        exp=char.exp,
        exp_to_next=char.exp_to_next,
        hp=char.hp,
        max_hp=char.max_hp,
        stamina=char.stamina,
        max_stamina=char.max_stamina,
        equipment=equipment,
    )


@router.get("/{character_id}", response_model=CharacterResponse)
def get_character(character_id: int, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == character_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    equipped = db.query(InventoryItem).filter(
        InventoryItem.character_id == char.id,
        InventoryItem.equipped == True,
    ).all()

    equipment = {}
    for item in equipped:
        equipment[item.item_type] = {
            "id": item.id,
            "name": item.item_name,
            "rarity": item.rarity,
            "stats": json.loads(item.stats_json),
        }

    return CharacterResponse(
        id=char.id,
        name=char.name,
        char_class=char.char_class,
        level=char.level,
        exp=char.exp,
        exp_to_next=char.exp_to_next,
        hp=char.hp,
        max_hp=char.max_hp,
        stamina=char.stamina,
        max_stamina=char.max_stamina,
        equipment=equipment,
    )


@router.put("/{character_id}/exp")
def add_exp(character_id: int, amount: int, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == character_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    char.exp += amount
    leveled_up = False
    while char.exp >= char.exp_to_next:
        char.exp -= char.exp_to_next
        char.level += 1
        char.exp_to_next = int(char.exp_to_next * 1.5)
        char.max_hp += 10
        char.hp = char.max_hp
        leveled_up = True

    db.commit()
    return {"level": char.level, "exp": char.exp, "exp_to_next": char.exp_to_next, "leveled_up": leveled_up}
