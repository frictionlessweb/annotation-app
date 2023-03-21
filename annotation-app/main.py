from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENTS
from typing import Any
from database import SessionLocal
from sqlalchemy.orm import Session
from models import Sessions
from datetime import datetime

app = FastAPI(root_path="/api/v1")
app.mount("/static", StaticFiles(directory="assets"), name="static")


@app.get("/heartbeat")
def read_root():
    return {"message": "success"}


@app.get("/documents")
def another_route(week: str = "") -> dict[str, Any]:
    if week == "":
        return DOCUMENTS
    return DOCUMENTS


class SessionState(BaseModel):
    user_name: str
    annotations: dict


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def complete(document_map):
    """
    Determine if the document is finished or not.
    """
    for document in document_map:
        topics = document_map[document]
        if not isinstance(topics, dict):
            continue
        for topic_id in topics:
            annotations = topics[topic_id]
            if not isinstance(annotations, dict):
                continue
            for annotation_id in annotations:
                if not isinstance(annotations[annotation_id], bool):
                    return False
    return True


@app.get("/responses")
def current_database(day: str, db: Session = Depends(get_db)):
    time: datetime
    try:
        time = datetime.strptime(day, "%m-%d-%Y")
    except ValueError:
        return []
    greater_than = f"{time.year}-{time.month}-{time.day - 1}"
    less_than = f"{time.year}-{time.month}-{time.day + 1}"
    results = db.query(Sessions).filter(
        Sessions.created_at < less_than, Sessions.created_at > greater_than
    )
    return results.all()


@app.post("/save-session")
def save_session(state: SessionState, db: Session = Depends(get_db)):
    db_annotation = Sessions(
        user_name=state.user_name,
        annotations=state.annotations,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db.add(db_annotation)
    db.commit()
    return {"message": "success"}
