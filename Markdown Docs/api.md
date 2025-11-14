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

Response shape:
```json
{
  "items": [
    {
      "id": 1,
      "email": "student@moravian.edu",
      "first_name": "Student",
      "last_name": "Example",
      "created_at": "2025-11-14T14:13:02.478213",
      "updated_at": "2025-11-14T14:13:02.478213"
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
