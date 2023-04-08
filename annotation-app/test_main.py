from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_heartbeat():
    response = client.get("/heartbeat")
    assert response.status_code == 200
    assert response.json() == {"message": "success"}


def test_documents():
    response = client.get("/documents?id=F46")
    assert response.status_code == 200
    assert response.json() is not None


def test_save_session():
    response = client.post(
        "/save-document-session",
        json={
            "document": "test",
            "user_responses": {"x": 3},
        },
    )
    assert response.status_code == 200
    assert response.json() is not None
