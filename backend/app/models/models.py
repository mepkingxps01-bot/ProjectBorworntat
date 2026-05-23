from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    char_class = Column(String(50), nullable=False)
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    exp_to_next = Column(Integer, default=100)
    hp = Column(Integer, default=100)
    max_hp = Column(Integer, default=100)
    stamina = Column(Integer, default=150)
    max_stamina = Column(Integer, default=150)
    equipment_json = Column(Text, default='{}')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resources = relationship("Resource", back_populates="character", cascade="all, delete")
    study_plans = relationship("StudyPlan", back_populates="character", cascade="all, delete")
    sessions = relationship("Session", back_populates="character", cascade="all, delete")
    inventory = relationship("InventoryItem", back_populates="character", cascade="all, delete")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, ForeignKey("characters.id"))
    filename = Column(String(255))
    raw_text = Column(Text, default="")
    structured_json = Column(Text, default="{}")
    processed = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    character = relationship("Character", back_populates="resources")
    topics = relationship("Topic", back_populates="resource", cascade="all, delete")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    name = Column(String(255))
    subtopics_json = Column(Text, default="[]")
    difficulty = Column(Float, default=1.0)

    resource = relationship("Resource", back_populates="topics")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, ForeignKey("characters.id"))
    exam_date = Column(String(20))
    topics_json = Column(Text, default="[]")
    plan_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    character = relationship("Character", back_populates="study_plans")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, ForeignKey("characters.id"))
    date = Column(String(20))
    minutes_studied = Column(Float, default=0)
    stamina_used = Column(Float, default=0)
    completed = Column(Boolean, default=False)

    character = relationship("Character", back_populates="sessions")
    battle_events = relationship("BattleEvent", back_populates="session", cascade="all, delete")


class BattleEvent(Base):
    __tablename__ = "battle_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    enemy_name = Column(String(255))
    question = Column(Text)
    answer_chosen = Column(Text)
    correct = Column(Boolean)
    damage_dealt = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("Session", back_populates="battle_events")


class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, ForeignKey("characters.id"))
    item_name = Column(String(255))
    item_type = Column(String(50))
    stats_json = Column(Text, default="{}")
    equipped = Column(Boolean, default=False)
    rarity = Column(String(20), default="common")

    character = relationship("Character", back_populates="inventory")
