from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from database import SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import DocumentSessions
from datetime import datetime
import json

app = FastAPI(root_path="/api/v1")
app.mount("/static", StaticFiles(directory="assets"), name="static")


@app.get("/heartbeat")
def read_root():
    return {"message": "success"}


@app.get("/documents")
def get_document(id: str):
    try:
        with open(f"./assets/{id}.json") as the_file:
            result = json.load(the_file)
    except Exception:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        **{
            "pdf_url": f"/api/v1/static/{id}.pdf",
            "image_url": f"/api/v1/static/{id}_page-0.png",
        },
        "user_responses": {
            **result,
        },
    }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DocumentSessionState(BaseModel):
    user_responses: dict
    document: str


@app.post("/save-document-session")
def save_document_session(state: DocumentSessionState, db: Session = Depends(get_db)):
    db_annotation = DocumentSessions(
        document=state.document,
        user_responses=state.user_responses,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db.add(db_annotation)
    db.commit()
    return {"message": "success"}


@app.get("/latest")
def latest(document: str, db: Session = Depends(get_db)):
    return db.query(DocumentSessions).where(DocumentSessions.document == document).all()
