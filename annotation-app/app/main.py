from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
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
