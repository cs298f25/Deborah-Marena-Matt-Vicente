# Progress Meeting Runbook

Shared script/checklist so we stay aligned during demos and status updates.

---

## 1. Project Snapshot
- **Bytepath front-end**: React + TypeScript (Vite) experience that recreates the Bytepath learning flow with topic navigation, quiz/learning modes, a Python runtime (Pyodide/MicroPython), and a Students roster page wired to the API.
- **Flask back-end**: Single `app.py` service that renders the student/professor portals, enforces roster-based access to Bytepath, exposes REST endpoints, and persists students through SQLAlchemy + SQLite (`students.db`).
- **Professor workflow**: `/professor` provides CSV upload + roster table for manual verification; `/clear` wipes the roster when needed.
- **Student access workflow**: `/student` email gate looks up students and redirects them to `BYTEPATH_URL` (defaults to the Vite dev server) with the verified email as a query param.

## 2. Launch Readiness (everyone can run it)
1. `python3 -m venv .venv && source .venv/bin/activate`
2. `pip install -r bytepath-backend/requirements.txt`
3. `python bytepath-backend/app.py`
   - Runs Flask on `http://127.0.0.1:5001`.
   - SQLite DB file (`bytepath-backend/students.db`) is created automatically; remove it to reset.
4. New terminal: `npm install && npm run dev`
   - Vite serves on `http://localhost:5173`.
   - Optional: create `.env` with `VITE_API_BASE=http://127.0.0.1:5001/api` if the API lives elsewhere.
5. Smoke checks:
   - Browser: `http://127.0.0.1:5001/professor` to confirm the admin portal and CSV upload form.
   - `curl http://127.0.0.1:5001/api/students` should return an empty paginated payload.
   - Browser: `http://localhost:5173` → Students page loads roster data through the API without CORS errors.

Each teammate should screen-record going from git clone → both servers running → roster fetch to prove fluency.

## 3. System Diagram (application vs delivery)
```
┌──────────────┐  fetch/json   ┌──────────────────┐   SQLAlchemy ORM   ┌───────────────┐
│ React/Vite   │ ─────────────▶│ Flask REST/Views │ ──────────────────▶│ SQLite DB     │
│ (Application │ ◀──────────── │ (Delivery: HTTP) │ ◀──────────────────│ (Delivery: DB)│
│  state, Py   │  redirects    │ Student lookup    │   file + migrations│               │
│  runtime)    │               │ CSV ingest views  │                    │               │
└──────────────┘               └──────────────────┘                    └───────────────┘
```
- Application layer: topic progression state machine, embedded Python interpreter, CSV upload UI (`src/`).
- Delivery: Flask blueprints/templates + JSON endpoints in `bytepath-backend/app.py` and persistence via `models.py`/`database.py`.

## 4. API Reference Snapshot
| Endpoint | Method | Description | Notes |
|----------|--------|-------------|-------|
| `/api/students` | GET | Paginated roster with optional case-insensitive search on first name, last name, or email. | Default `page=1`, `page_size=20`. |
| `/api/students/upload` | POST (multipart/form-data) | Ingest CSV rows, upserting by email and returning summary + validation errors. | Requires `file` field containing `.csv`. |
| `/api/students/template` | GET | Downloadable CSV template with sample rows. | Returns `text/csv` attachment. |

### GET `/api/students`
Query params: `page` (int), `page_size` (int), `search` (string).


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

>>>>>>> Refactored-Layout
```json
{
  "items": [
    {
      "id": 1,
      "email": "student@moravian.edu",
      "first_name": "Student",
      "last_name": "Example",
      "created_at": "2025-11-14T14:13:02.478213",
      "updated_at": "2025-11-14T14:13:02.478213",
      "email": "student@example.com",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "created_at": "2025-01-10T14:23:11.000Z",
      "updated_at": "2025-02-01T09:01:02.000Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "total_pages": 1
}
```

### POST `/api/students/upload`
Form-data field `file` must be a CSV with headers `first_name,last_name,email`. Unknown columns are normalized (spaces → `_`, case-insensitive) and `name` is split if separate first/last names are missing.

Returns:
```json
{
  "summary": {
    "inserted": 24,
    "updated": 2,
    "skipped": 0,
    "total_processed": 26
  },
  "errors": [
    { "line": 4, "reason": "Missing email" }
  ]
}
```
- `inserted`: new rows committed.
- `updated`: existing student records where names changed.
- `skipped`: currently unused (always `0` because duplicates count as `updated`), call this out during the meeting.
- `errors`: row-level validation failures; the upload still succeeds unless an unexpected exception is raised (500).

### GET `/api/students/template`
Returns the canonical CSV sample file (`students_template.csv`) so professors can align headers before uploading.

Complementary HTML endpoints to mention:
- `POST /upload`: identical CSV logic but triggered from the professor portal with flash messages.
- `POST /clear`: wipes the roster (no auth yet).
- `POST /student`: verifies an email then redirects to `BYTEPATH_URL`.

## 5. Demo & Test Checklist
- **API smoke**: `curl http://127.0.0.1:5001/api/students?page=1&page_size=5` after seeding the DB to prove pagination metadata updates.
- **CSV ingest happy path**: Upload a small CSV you create locally (first_name,last_name,email) via `/professor` and confirm the summary banner + Students page table refresh.
- **CSV validation**: Upload a file with missing email / wrong extension to show error responses and the `errors` array.
- **Student access flow**: Add yourself through CSV, visit `/student`, enter your email, and confirm redirect to the Vite front-end with `?email=...`.
- **Bytepath UI**: In the React app, switch between learning/quiz modes, run a code sample (verifies Pyodide), and open the Students page to prove fetch/upload features.
- **Regression note**: No automated Vitest/Pytest suites yet—flag this gap and mention manual testing cadence.

## 6. Challenges & Active Issues
- ⚠ **Auth gap**: Student access is still an email lookup plus redirect; OAuth with the Moravian IdP is pending credentials. Professor portal and API endpoints run without auth.
- ⚠ **Upload summary accuracy**: `skipped` is never incremented inside `/api/students/upload`, so duplicates show under `updated` and the skipped count is misleading.
- Separating all of the questions from the front-end as well as in general separate. 
- Scheduling meeting times
- Organizing the project and understanding


Confirm each section during the meeting so stakeholders hear a consistent status update.
