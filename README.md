# Deborah-Marena-Matt-Vicente
# Contributors: 
- **Deborah Rabinovich**
- **Marena Abboud**
- **Matthew Krauss**
- **Vicente Rivera**


## Running 
- Create virtual environment: `python3 -m venv .venv`
- Activate virtual environment: `source .venv/bin/activate`
- Install dependencies: `pip install -r bytepath-backend/requirements.txt`
- Run server: `python bytepath-backend/app.py`
- Open new terminal
- Install npm: `npm install`
- Run frontend: `npm run dev`

OR:
- Create virtual environment: `python3 -m venv .venv`
- Activate virtual environment: `source .venv/bin/activate`
- Install dependencies: `pip install -r bytepath-backend/requirements.txt`
- run ./bytepath-backend/run_app.sh


## System Diagram
```text
┌─────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│  Frontend       │     │  Backend             │     │  Database         │
│  (TypeScript/   │◄───►│  (Python/Flask)      │◄───►│  (SQLite)         │
│   React)        │     │  - REST API          │     │  - students table │
└─────────────────┘     │  - Authentication    │     └───────────────────┘
                        │  - File Processing   │
                        └──────────────────────┘
```


