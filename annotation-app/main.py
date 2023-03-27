from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENT_MAP
from typing import Any
from database import SessionLocal
from sqlalchemy.orm import Session
from models import Sessions
from datetime import datetime
from uuid import UUID


def is_valid_uuid(uuid_to_test, version=4) -> bool:
    """
    Check if uuid_to_test is a valid UUID.

     Parameters
    ----------
    uuid_to_test : str
    version : {1, 2, 3, 4}

     Returns
    -------
    `True` if uuid_to_test is a valid UUID, otherwise `False`.

     Examples
    --------
    """
    try:
        uuid_obj = UUID(uuid_to_test, version=version)
        return True
    except ValueError:
        return False


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
    return None


def is_march_20(document_map) -> bool:
    return False


def march_13_complete(document_map) -> bool:
    return True


def march_20_complete(document_map) -> bool:
    return False


@app.get("/response-by-person")
def user_responses(name: str, db: Session = Depends(get_db)):
    output = []
    responses = db.query(Sessions).filter(Sessions.user_name == name).all()
    for response in responses:
        print(response.annotations)
        # if is_march_13(response.annotations) and march_13_complete(response.annotations):
        #     print("write something")
        # elif is_march_20(response.annotations):
        #     print("write something else")
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
