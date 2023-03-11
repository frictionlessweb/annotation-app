from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_heartbeat():
    response = client.get("/heartbeat")
    assert response.status_code == 200
    assert response.json() == {"message": "success"}


def test_documents():
    response = client.get("/documents")
    assert response.status_code == 200
    assert response.json() is not None


def test_static_files():
    response = client.get("/documents")
    assert response.status_code == 200
    response_json = response.json()
    document_names: list[str] = [key for key in response_json]
    for name in document_names:
        expected_json = client.get(f"/static/{name}.json")
        assert expected_json.status_code == 200
        # Our API is mounted at /api/v1, so we need to replace this in the URL,
        # but the front-end can just read the key off the JSON without worrying.
        pdf_url = response_json[name]["pdf_url"].replace("/api/v1", "")
        expected_pdf = client.get(pdf_url)
        assert expected_pdf.status_code == 200
