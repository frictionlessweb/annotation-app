from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENTS
from typing import Any
from database import SessionLocal
from sqlalchemy.orm import Session
from models import Sessions

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
    responses: dict


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/save-session")
def save_session(state: SessionState, db: Session = Depends(get_db)):
    db_annotation = Sessions(user_name=state.user_name, annotations=state.responses)
    db.add(db_annotation)
    db.commit()
    return {"message": "success"}
