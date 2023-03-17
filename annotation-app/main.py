from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENTS
from typing import Any
from database import SessionLocal, engine
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Sessions
from datetime import datetime

app = FastAPI(root_path="/api/v1")
app.mount("/static", StaticFiles(directory="assets"), name="static")


@app.get("/heartbeat")
def read_root():
    return {"message": "success"}


@app.get("/documents")
def another_route() -> dict[str, Any]:
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
                if annotations[annotation_id] is None:
                    return False
    return True


def day_matches(time: datetime, created_at: datetime | None):
    if created_at is None:
        return False
    return (
        time.day == created_at.day
        and time.year == created_at.year
        and time.month == created_at.month
    )


@app.get("/responses")
def current_database(day: str):
    time: datetime
    try:
        time = datetime.strptime(day, "%m-%d-%Y")
    except ValueError:
        return []
    with engine.connect() as con:
        result = list(con.execute(text("SELECT * FROM sessions")))
        return [
            {"user": row[1], "annotations": row[2]}
            for row in result
            if day_matches(time, row[3]) and complete(row[2])
        ]


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
