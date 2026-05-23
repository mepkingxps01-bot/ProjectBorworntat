from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Resource, Topic, Character
from app.services.pdf_service import extract_text_from_pdf, extract_chapters
from app.services.ai_service import extract_content_from_text
import json

router = APIRouter()


def process_resource_background(resource_id: int, file_bytes: bytes, filename: str):
    """Background task to extract and structure PDF content."""
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return

        raw_text = extract_text_from_pdf(file_bytes)
        resource.raw_text = raw_text

        structured = extract_content_from_text(raw_text, filename)
        resource.structured_json = json.dumps(structured)
        resource.processed = True

        for topic_data in structured.get("topics", []):
            topic = Topic(
                resource_id=resource.id,
                name=topic_data.get("name", "Unknown"),
                subtopics_json=json.dumps(topic_data.get("subtopics", [])),
                difficulty=sum(
                    q.get("difficulty", 3)
                    for st in topic_data.get("subtopics", [])
                    for q in st.get("mcq_questions", [])
                ) / max(1, sum(
                    len(st.get("mcq_questions", []))
                    for st in topic_data.get("subtopics", [])
                )),
            )
            db.add(topic)

        db.commit()
    except Exception as e:
        print(f"Error processing resource {resource_id}: {e}")
        db.rollback()
    finally:
        db.close()


@router.post("/upload")
async def upload_resource(
    background_tasks: BackgroundTasks,
    character_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    char = db.query(Character).filter(Character.id == character_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()

    resource = Resource(
        character_id=character_id,
        filename=file.filename,
        processed=False,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    background_tasks.add_task(process_resource_background, resource.id, file_bytes, file.filename)

    return {
        "id": resource.id,
        "filename": resource.filename,
        "status": "processing",
        "message": "Your textbook is being processed. This may take a minute.",
    }


@router.get("/{resource_id}/status")
def get_resource_status(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    topics = db.query(Topic).filter(Topic.resource_id == resource_id).all()

    return {
        "id": resource.id,
        "filename": resource.filename,
        "processed": resource.processed,
        "topics": [{"id": t.id, "name": t.name} for t in topics],
    }


@router.get("/character/{character_id}")
def get_character_resources(character_id: int, db: Session = Depends(get_db)):
    resources = db.query(Resource).filter(Resource.character_id == character_id).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "processed": r.processed,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
        }
        for r in resources
    ]
