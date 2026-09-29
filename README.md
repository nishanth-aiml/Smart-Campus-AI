# Smart Campus 🎓
> An AI-assisted campus facility allocation and resource optimization platform.

---

## 🏛️ System Overview

**Smart Campus** automates campus space management through a multi-stage allocation pipeline:
1. **User Request Intake**: Captures event details, headcount, time window (08:00–20:00), venue classification, and equipment requirements.
2. **SQL Constraint Engine**: Evaluates strict capacity fit, venue classification, required equipment subset matching, time window validity, and non-overlapping confirmed allocations.
3. **AI Allocation Suggestion Engine (FastAPI)**: Evaluates filtered candidates using a deterministic 4-factor scoring algorithm:
   - **Capacity Fit (35%)**: Prioritizes snug fits; penalizes venues > 2x student headcount.
   - **Equipment Match (30%)**: Matches required equipment chips against venue inventory.
   - **Facility Type Match (15%)**: Ensures strict classification alignment.
   - **Utilization Balancing (20%)**: Distributes campus venue load based on historical allocations.
4. **Interactive Confirmation**: Provides 1 primary recommendation with score breakdown and 2–3 alternatives with clear tradeoff callouts, protected by a transactional booking lock with `409 Conflict` detection.
5. **Real-time Operations & Analytics**: Live facility availability matrix, today's schedule, hourly occupancy curves, and weekly demand trends.

---

## 📁 Repository Structure

```
smart-campus/
├── db/
│   ├── schema.sql              # Relational schema (5 tables, indexes, cascades)
│   └── seed.sql                # 12 Indian campus venues, 6 equipment categories, 20 allocations
├── ai-engine/
│   ├── main.py                 # FastAPI service (/suggest, /health)
│   ├── scoring.py              # Deterministic weighted scorer & template reasoner
│   ├── models.py               # Pydantic schemas
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # AI Engine environment config
│   └── tests/                  # Pytest test suite
├── backend/
│   ├── server.js               # Express app entry point
│   ├── db.js                   # MySQL pool with relational fallback store
│   ├── constraintEngine.js     # 5-stage SQL constraint validation pipeline
│   ├── routes/                 # Modular API routes (facilities, dashboard, requests, allocations, analytics)
│   ├── package.json            # Node.js dependencies
│   ├── .env.example            # Backend environment variables
│   └── tests/                  # Backend integration tests
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, New Request, AI Suggestions, Analytics
│   │   ├── components/         # Sidebar, Header, StatCard, LoadingSkeleton
│   │   ├── api.js              # API client
│   │   └── App.jsx             # Main layout & navigation
│   ├── package.json            # React, Vite, Tailwind CSS, Recharts, Lucide
│   └── .env.example            # Frontend environment variables
├── .env.example                # Root environment template
└── README.md                   # Complete system documentation
```

---

## 🚀 Quickstart Guide

### 1. Database Setup (MySQL)

Create the database and load the schema and seed scripts:

```bash
# Log in to MySQL
mysql -u root -p

# Inside MySQL or terminal:
mysql -u root -p < smart-campus/db/schema.sql
mysql -u root -p < smart-campus/db/seed.sql
```

*(Note: The Express backend also includes an automatic preloaded relational memory fallback store if MySQL is not running locally).*

---

### 2. AI Engine Setup (FastAPI)

```bash
cd smart-campus/ai-engine

# Install Python dependencies
pip install -r requirements.txt

# Run unit and API tests
pytest tests/ -v

# Start FastAPI server on port 8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Health check: `http://127.0.0.1:8000/health`

---

### 3. Backend Setup (Node.js + Express)

```bash
cd smart-campus/backend

# Install Node dependencies
npm install

# Run integration tests
node tests/run_tests.js

# Start Express server on port 5000
npm start
```

Health check: `http://localhost:5000/api/health`

---

### 4. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd smart-campus/frontend

# Install dependencies
npm install

# Start development server on port 5173
npm run dev
```

Open browser at `http://localhost:5173`.

---

## ⚙️ Environment Variables

| Variable | Service | Description | Default |
| :--- | :--- | :--- | :--- |
| `DB_HOST` | Backend | MySQL host | `127.0.0.1` |
| `DB_PORT` | Backend | MySQL port | `3306` |
| `DB_USER` | Backend | MySQL username | `root` |
| `DB_PASSWORD` | Backend | MySQL password | `""` |
| `DB_NAME` | Backend | Database name | `smart_campus` |
| `PORT` | Backend | Express port | `5000` |
| `AI_ENGINE_URL` | Backend | FastAPI suggestion endpoint | `http://127.0.0.1:8000/suggest` |
| `VITE_API_URL` | Frontend | Backend API base URL | `http://localhost:5000/api` |

---

## 🧪 Verification & Testing Commands

- **AI Engine**: `pytest smart-campus/ai-engine/tests -v`
- **Backend API & Constraints**: `node smart-campus/backend/tests/run_tests.js`
- **Frontend Production Build**: `cd smart-campus/frontend && npm run build`
