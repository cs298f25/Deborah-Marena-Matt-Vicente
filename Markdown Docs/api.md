# BytePath Backend API Reference

This document summarizes the API surface provided by the Flask backend. All routes are prefixed by `http://localhost:5000` in development. The backend uses session-based auth for the MVP, so the browser automatically sends cookies on subsequent requests. For non-browser clients, maintain cookies between calls.

---

## Authentication

### `POST /api/auth/login`

Simple email-only login. Auto-creates a student record when the email is unknown. Stores `user_id` in the session.

**Request**

```json
{
  "email": "student@example.com"
}
```

**Response**

```json
{
  "user": {
    "id": 42,
    "email": "student@example.com",
    "name": "Student Example",
    "role": "student"
  }
}
```

### `GET /api/auth/profile`

Returns the logged-in user based on session cookie. Responds with `401` if no session.

**Response**

```json
{
  "id": 42,
  "email": "student@example.com",
  "name": "Student Example",
  "role": "student"
}
```

---

## Response Tracking

### `POST /api/responses`

Stores a single answer attempt. Automatically increments `questions_answered` for the relevant topic.

**Request**

```json
{
  "user_id": 42,
  "topic": "tuples",
  "subtopic_type": "TupleLength",
  "question_code": "x = (1, 2, 3)\nlen(x)",
  "student_answer": "3",
  "correct_answer": "3",
  "is_correct": true,
  "status": "correct",
  "time_spent": 45
}
```

**Response**

```json
{
  "message": "Response recorded successfully.",
  "response": {
    "id": 101,
    "user_id": 42,
    "topic": "tuples",
    "subtopic_type": "TupleLength",
    "question_code": "x = (1, 2, 3)\nlen(x)",
    "student_answer": "3",
    "correct_answer": "3",
    "is_correct": true,
    "status": "correct",
    "time_spent": 45,
    "attempted_at": "2025-11-12T14:30:01"
  }
}
```

### `GET /api/responses/student/{student_id}`

Lists all attempts for a student, newest first.

**Response**

```json
{
  "responses": [
    { "id": 101, "...": "..." }
  ]
}
```

---

## Progress

### `GET /api/progress/{student_id}`

Aggregated progress with topic metadata.

**Response**

```json
{
  "user_id": 42,
  "user_name": "Student Example",
  "progress": [
    {
      "topic": "tuples",
      "topic_name": "Tuples",
      "subtopics_completed": 3,
      "total_subtopics": 7,
      "completion_percentage": 42.86,
      "questions_answered": 15,
      "last_accessed": "2025-11-12T14:35:10"
    }
  ]
}
```

### `GET /api/progress/{student_id}/{topic}`

Returns a single topic record or 404.

### `PUT /api/progress/{student_id}/{topic}`

Creates or updates subtopic totals. Requires `subtopics_completed` (>=0) and `total_subtopics` (>0).

**Request**

```json
{
  "subtopics_completed": 5,
  "total_subtopics": 7
}
```

**Response**

```json
{
  "message": "Progress updated successfully",
  "progress": {
    "user_id": 42,
    "topic": "tuples",
    "subtopics_completed": 5,
    "...": "..."
  }
}
```

### `POST /api/progress/{student_id}/{topic}/increment`

Increments `questions_answered` and touches `last_accessed`. Used after recording a response.

---

## Topics

### `GET /api/topics`

Query param `role=student|instructor` (default student). Students only receive visible topics.

**Response**

```json
{
  "topics": [
    {
      "id": "basic-variables",
      "name": "Basic Variables",
      "is_visible": true,
      "order_index": 1
    }
  ]
}
```

### `GET /api/topics/{id}`

Returns full metadata including `created_at`. 404 if missing.

### `PATCH /api/topics/{id}/visibility`

Payload: `{ "is_visible": true }`. Responds with updated topic.

### `POST /api/topics`

Creates a topic. Required fields: `id`, `name`. Optional `is_visible`, `order_index`.

### `PUT /api/topics/{id}`

Updates `name`, `order_index`, `is_visible`. Rejects attempts to change `id`.

---

## Reports & Analytics

### `GET /api/reports/student/{id}`

Detailed performance for a single student, including overall stats, per-topic breakdown, trends, and struggling subtopics.

**Response (abridged)**

```json
{
  "student_id": 42,
  "overall_stats": { "...": "..." },
  "topic_breakdown": [],
  "performance_over_time": [],
  "struggling_subtopics": []
}
```

### `GET /api/reports/topic/{id}`

Difficulty analysis across students: completion rates, per-subtopic success, most-missed questions.

### `GET /api/reports/class/overview`

Class-wide dashboard metrics: total/active students, accuracy, topic stats, top performers, struggling students, recent activity.

### `GET /api/reports/question/{topic}/analytics?subtopic_type=...`

Question-level analytics for a topic (optional subtopic filter). Returns attempts, accuracy, timing, unique student counts per question.

---

## Students

### `GET /api/students`

Paginated roster listing. Query parameters: `page` (default `1`), `page_size` (default `20`), and optional `search` matched against first name, last name, or email (case-insensitive).

**Response**

```json
{
  "items": [
    {
      "id": 1,
      "email": "student@example.com",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "created_at": "2025-01-10T14:23:11.000Z",
      "updated_at": "2025-02-01T09:01:02.000Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 42,
  "total_pages": 3
}
```

### `POST /api/students/upload`

Bulk upsert via CSV (multipart form field `file`). Each row must include `first_name`, `last_name`, and `email`. The endpoint inserts new students and updates existing rows matched by email. Response includes a summary `{ inserted, updated, skipped, total_processed }` and per-line validation errors. Sample CSVs for demos live in `sample-data/students/`.

### `GET /api/students/template`

Downloads a starter CSV with the required headers and example rows so instructors can prepare uploads quickly.

---

## Running the Stack

Use `bytepath-backend/run_app.sh` to start both Flask and Vite dev servers. The script installs dependencies, boots the backend with `python -m backend.app`, and runs `npm run dev`. Frontend calls target `http://localhost:5000`.

---

## Notes & Tips

- Auth is session-based; use Axios `withCredentials=true` (already configured).
- Responses increment progress automatically via `POST /api/responses`.
- All analytics endpoints handle empty datasets gracefully.
- Tests are available under `backend/tests/` and can be executed with `pytest -q`.

# API.md 
