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

