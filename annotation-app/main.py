from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENT_MAP
from typing import Any
from database import SessionLocal
from sqlalchemy.orm import Session
from models import Sessions
from datetime import datetime
import json

app = FastAPI(root_path="/api/v1")
app.mount("/static", StaticFiles(directory="assets"), name="static")


@app.get("/heartbeat")
def read_root():
    return {"message": "success"}


@app.get("/documents")
def get_document(id: str):
    with open(f"./assets/{id}.json") as the_file:
        result = json.load(the_file)
    return {
        **{
            "pdf_url": f"/api/v1/static/{id}.pdf",
            "image_url": f"/api/v1/static/{id}_page-0.png",
        },
        "user_responses": {
            **result,
        },
    }


class SessionState(BaseModel):
    user_name: str
    annotations: dict


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
