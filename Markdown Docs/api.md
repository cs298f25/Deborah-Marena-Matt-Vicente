# Progress Meeting Runbook

This document walks through every item we must cover during the standing progress meetings. Use it as the shared script/checklist so each teammate can confidently present their portion.

---

## 2. Launch Readiness (everyone can run it)
1. `python3 -m venv .venv && source .venv/bin/activate`
2. `pip install -r bytepath-backend/requirements.txt`
3. `python bytepath-backend/app.py` (Flask + SQLite provisional DB)
4. New terminal: `npm install && npm run dev`
5. Verify `http://localhost:5173` loads the instructor dashboard, and API hits `http://127.0.0.1:5000`.

Each teammate must screen-record themselves going from git clone → dual servers running to prove fluency.

## 3. System Diagram (application vs delivery)
```
┌──────────────┐      HTTPS       ┌──────────────────┐       SQLAlchemy       ┌──────────────┐
│ Vite/React   │ ───────────────▶ │ Flask REST API   │ ─────────────────────▶ │ SQLite / PG  │
│ (Application │ ◀─────────────── │ (Delivery: HTTP) │ ◀───────────────────── │ (Delivery: DB│
│   Logic)     │                  │ Business services │                        │   driver)    │
└──────────────┘                  └──────────────────┘                        └──────────────┘
```
- **Application layer**: question progression state machine, CSV parsing helpers, analytics reducers (lives in `src/` and `bytepath-backend/models.py`).
- **Delivery mechanisms**: HTTP transport handled by Flask blueprints (`app.py`), persistence handled by SQLAlchemy ORM in `database.py`.

## 4. API Reference Snapshot
| Endpoint | Method | Description | Primary Owner |
|----------|--------|-------------|---------------|
| `/api/students` | GET | Paginated roster with search on name/email; query params `page`, `page_size`, `search`. | Marena |
| `/api/students/upload` | POST (multipart) | CSV ingest; returns counts + error rows. | Matt |
| `/api/students/template` | GET | Downloads canonical CSV template. | Vicente |

Full OpenAPI spec lives in `Markdown Docs/openapi.yaml`; link it during the meeting and show Swagger UI mock.

## 5. Tests To Run During Meeting
- **Manual acceptance (current)**: Upload malformed CSV (expect 400), upload valid CSV (expect success), full student question flow.
- **Automated backlog**: Vitest suite (`npm run test -- --runInBand`) for roster UI and CSV preview plus Pytest (`pytest bytepath-backend/tests`) for analytics queries. These suites are being authored now; once merged, add them to the live meeting checklist.
- Responsible tester rotates weekly opposite the demo owner; they report pass/fail plus any regressions.

## 6. Challenges & Active Issues
- ✅ CSV upload validation without blocking UI (solved via streaming parser + progress modal).
- ✅ Paginated roster caching bug fixed by normalizing `page` query params on the client.
- ⚠ Student analytics graphs still rely on mocked data; real aggregation pending DB migrations.
- ⚠ OAuth handoff with Moravian IdP waiting on client secret paperwork; currently using stub login.

## 7. Work Distribution Snapshot
- **Deborah**: Frontend scaffolding, topic navigation UI, meeting facilitator.
- **Marena**: Instructor dashboard UX, `/api/students` pagination, QA checklist ownership.
- **Matt**: CSV upload endpoint, deployment automation.
- **Vicente**: Database schema, ORM models, analytics aggregation draft + infra diagram.

