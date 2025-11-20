def test_get_user_progress(client, student1_id):
    """Fetch overall progress for a user."""

    response = client.get(f"/api/progress/{student1_id}")
    assert response.status_code == 200

    data = response.get_json()
    assert "progress" in data
    assert isinstance(data["progress"], list)


def test_get_topic_progress(client, student1_id):
    """Fetch per-topic progress entry."""

    response = client.get(f"/api/progress/{student1_id}/test-topic-1")
    assert response.status_code == 200

    data = response.get_json()
    assert data["topic"] == "test-topic-1"


def test_update_progress(client, student1_id):
    """Updating progress should return the updated record."""

    response = client.put(
        f"/api/progress/{student1_id}/test-topic-1",
        json={"subtopics_completed": 5, "total_subtopics": 7},
    )
    assert response.status_code == 200

    data = response.get_json()
    assert data["progress"]["subtopics_completed"] == 5


def test_create_new_progress(client, student1_id):
    """Creating progress for a new topic should succeed."""

    response = client.put(
        f"/api/progress/{student1_id}/test-topic-2",
        json={"subtopics_completed": 1, "total_subtopics": 5},
    )
    assert response.status_code == 200


def test_update_progress_invalid_data(client, student1_id):
    """Invalid payloads are rejected."""

    response = client.put(
        f"/api/progress/{student1_id}/test-topic-1",
        json={"subtopics_completed": -1, "total_subtopics": 0},
    )
    assert response.status_code == 400

