from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENT_MAP
from typing import Any
from database import SessionLocal
from sqlalchemy.orm import Session
from models import Sessions
from datetime import datetime
from itertools import groupby

app = FastAPI(root_path="/api/v1")
app.mount("/static", StaticFiles(directory="assets"), name="static")


@app.get("/heartbeat")
def read_root():
    return {"message": "success"}


@app.get("/documents")
def another_route(week: str = "") -> dict[str, Any]:
    return DOCUMENT_MAP.get(week, DOCUMENT_MAP["MARCH_13"])


class SessionState(BaseModel):
    user_name: str
    annotations: dict


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def march_13_complete(document_map):
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


def is_march_13(document_map) -> bool:
    for doc_id in document_map:
        a_map = document_map[doc_id]
        if not isinstance(a_map, dict):
            return False
    return True


def annotation_week(document_map) -> str | None:
    for doc_id in document_map:
        a_map = document_map[doc_id]
        if not isinstance(a_map, dict):
            return None
        return "MARCH_13" if "questionTask" in a_map else "MARCH_20"


def march_20_complete(document_map) -> bool:
    return False


@app.get("/response-by-person")
def user_responses(name: str, db: Session = Depends(get_db)):
    buf = []
    responses = db.query(Sessions).filter(Sessions.user_name == name).all()
    for response in responses:
        week = annotation_week(response.annotations)
        if week == "MARCH_13":
            buf.append(
                {
                    "complete": march_13_complete(response.annotations),
                    "json": response.annotations,
                    "week": "March 13th",
                    "created_at": response.created_at,
                }
            )
        elif week == "MARCH_20":
            buf.append(
                {
                    "complete": march_20_complete(response.annotations),
                    "json": response.annotations,
                    "week": "March 20th",
                    "created_at": response.created_at,
                }
            )
    output = []
    groups = groupby(buf, lambda x: x["week"])
    for _, group in groups:
        ordered = sorted(group, key=lambda x: x["created_at"], reverse=True)
        output.append(ordered[0])
    return output


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
