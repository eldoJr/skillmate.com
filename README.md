# skillmate.com

A student-focused AI-powered career ecosystem that helps university students discover opportunities, earn income, and build a professional identity before graduation.

---

## Overview

Students acquire diverse skills throughout their academic journey — programming, design, writing, tutoring, digital marketing, and more — yet these skills rarely extend beyond the classroom. **Skillmate** bridges that gap by providing a structured, verified platform for peer-to-peer skill exchange and monetization.

---

## Features

- **Verified Accounts** — Student identity verified via institutional email
- **Skill Listings** — Create and browse service listings by category, skill, or location
- **Direct Messaging** — In-app real-time communication between students
- **Ratings & Reviews** — Trust-building reputation system
- **Portfolio Showcase** — Students can display their work and experience
- **Task Requests** — Post requests for specific skills or services

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Authentication | JWT + University email verification |
| Real-time | FastAPI WebSockets |
| Task Queue | Celery + Redis |
| Hosting | Railway / Vercel / Render |

---

## Project Structure

```
skillmate.com/
├── backend/
│   ├── alembic/                  # migrations
│   │   └── versions/
│   ├── src/
│   │   ├── api/v1/
│   │   │   ├── endpoints/        # auth, users, listings, skills, messages, reviews, notifications, portfolio
│   │   │   └── router.py
│   │   ├── core/                 # config, security, deps
│   │   ├── db/                   # session, base
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # business logic
│   │   ├── tasks/                # Celery tasks
│   │   └── websockets/           # real-time handlers
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── database/
├── docs/
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/           # atoms, molecules, organisms, templates, layout
        ├── pages/                # home, auth, explore, listings, messages, profile, settings
        ├── contexts/
        ├── hooks/
        ├── services/
        └── styles/
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/skillmate.com.git
cd skillmate.com

# Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # fill in your values
alembic upgrade head
uvicorn main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

> Environment variable setup and database migration instructions will be added as development progresses.

---

## Roadmap

- [x] Project structure setup
- [x] Backend scaffolded (FastAPI + SQLAlchemy + Alembic)
- [ ] Authentication (register, login, email verification)
- [ ] Skill listings (create, browse, filter)
- [ ] User profiles & portfolios
- [ ] Messaging system
- [ ] Ratings & reviews
- [ ] Notifications
- [ ] AI career companion
- [ ] AI opportunity matching
- [ ] AI portfolio & resume builder
- [ ] Inter-university collaboration *(future)*

---

## License

This project is currently under development. License to be determined.
