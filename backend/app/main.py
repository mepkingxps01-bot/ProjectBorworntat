from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from app.api import character, resources, schedule, battle, progress

app = FastAPI(
    title="ProjectBorworntat API",
    description="Gamified medical learning platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    create_tables()


@app.get("/")
def root():
    return {"status": "online", "app": "ProjectBorworntat", "version": "1.0.0"}


app.include_router(character.router, prefix="/api/character", tags=["Character"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule"])
app.include_router(battle.router, prefix="/api/battle", tags=["Battle"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
