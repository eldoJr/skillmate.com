# skillmate.com

A student-focused skill marketplace that connects university students to offer, discover, and exchange services within a trusted academic ecosystem.

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
| Backend | Node.js / NestJS |
| Database | PostgreSQL + Prisma ORM |
| Authentication | JWT + University email verification |
| Real-time | Socket.io |
| Hosting | Railway / Vercel / Render |

---

## Project Structure

```
skillmate.com/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── modules/        # auth, users, skills, listings, messages, reviews, notifications
│       ├── routes/
│       └── utils/
├── database/
├── docs/
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/     # atoms, molecules, organisms, templates, layout
        ├── pages/          # home, auth, explore, listings, messages, profile, settings
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

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

> Environment variable setup and database migration instructions will be added as development progresses.

---

## Roadmap

- [x] Project structure setup
- [ ] Authentication (register, login, email verification)
- [ ] Skill listings (create, browse, filter)
- [ ] User profiles & portfolios
- [ ] Messaging system
- [ ] Ratings & reviews
- [ ] Notifications
- [ ] Inter-university collaboration *(future)*
- [ ] AI-based skill recommendations *(future)*

---

## License

This project is currently under development. License to be determined.
