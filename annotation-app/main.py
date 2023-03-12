from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from documents import DOCUMENTS
from typing import Any

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


@app.post("/save-session")
def save_session():
    return {"message": "success"}
