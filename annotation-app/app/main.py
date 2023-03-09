from fastapi import FastAPI

app = FastAPI(root_path="/api/v1")


@app.get("/heartbeat")
def read_root():
    return {"message": "success"}


@app.get("/another_route")
def another_route():
    return {"message": "this is really cool"}
