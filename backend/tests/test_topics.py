def test_get_all_topics_student(client):
    """Students should only see visible topics."""

    response = client.get("/api/topics?role=student")
    assert response.status_code == 200

    data = response.get_json()
    assert "topics" in data
    assert all(topic["is_visible"] for topic in data["topics"])


def test_get_all_topics_instructor(client):
    """Instructors see all topics, including hidden ones."""

    response = client.get("/api/topics?role=instructor")
    assert response.status_code == 200

    data = response.get_json()
    assert len(data["topics"]) >= 2


def test_get_single_topic(client):
    """Fetch a single topic's metadata."""

    response = client.get("/api/topics/test-topic-1")
    assert response.status_code == 200

    data = response.get_json()
    assert data["id"] == "test-topic-1"
    assert data["name"] == "Test Topic 1"


def test_update_topic_visibility(client):
    """Toggling visibility updates the record."""

    response = client.patch(
        "/api/topics/test-topic-1/visibility", json={"is_visible": False}
    )
    assert response.status_code == 200

    verify = client.get("/api/topics/test-topic-1")
    assert verify.get_json()["is_visible"] is False


def test_get_nonexistent_topic(client):
    """Unknown topics return 404."""

    response = client.get("/api/topics/nonexistent-topic")
    assert response.status_code == 404


def test_create_topic_and_conflict(client):
    """Creating a topic succeeds once and conflicts on duplicate."""

    payload = {"id": "new-topic", "name": "New Topic", "is_visible": True, "order_index": 5}
    created = client.post("/api/topics", json=payload)
    assert created.status_code == 201

    conflict = client.post("/api/topics", json=payload)
    assert conflict.status_code == 409


def test_update_topic_visibility_invalid_payload(client):
    """Visibility endpoint requires boolean."""

    response = client.patch("/api/topics/test-topic-1/visibility", json={"is_visible": "yes"})
    assert response.status_code == 400


def test_create_topic_shows_in_instructor_list(client):
    """Newly created topics appear in instructor listing."""

    payload = {"id": "fresh-topic", "name": "Fresh Topic", "is_visible": True}
    created = client.post("/api/topics", json=payload)
    assert created.status_code == 201

    topics = client.get("/api/topics?role=instructor").get_json()["topics"]
    assert any(t["id"] == "fresh-topic" for t in topics)
