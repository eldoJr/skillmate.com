# Skillmate — Project Roadmap

**Version:** 1.0  
**Status:** Active Development  
**Last Updated:** 2025

---

## Overview

This roadmap is organized into four phases. Each phase must be completed before the next begins — the AI features in Phase 3 depend entirely on the data quality built in Phase 1 and the infrastructure built in Phase 2.

---

## Phase 1 — Core Platform

> Goal: Build the data foundation. Every AI feature depends on real student data existing first.

### 1.1 Authentication
- [x] Register with university email
- [x] Password hashing (bcrypt)
- [x] Email verification via token (Celery task)
- [x] Login and JWT issuance (access + refresh tokens)
- [x] Refresh token endpoint
- [x] Password reset flow (request + confirm)
- [x] Resend verification email

### 1.2 User Profiles
- [x] Get own profile (`/users/me`)
- [x] Update profile (headline, bio, university, role)
- [x] Avatar upload (Pillow + local storage)
- [x] Get public profile by ID
- [x] Skill tags on profile (many-to-many)
- [x] Profile completion score

### 1.3 Skills
- [x] Seed skill categories and tags
- [x] List all skills by category
- [x] Attach/detach skills from user profile

### 1.4 Listings
- [x] Create listing
- [x] List all active listings (paginated)
- [x] Filter by category, skill, price range, university, search, listing type
- [x] Get listing by ID
- [x] Update listing
- [x] Delete listing (soft delete)
- [x] Toggle listing active/inactive
- [x] Cover image upload

### 1.5 Reviews
- [x] Submit review after completed work (reliability, professionalism, growth scores)
- [x] Get reviews for a user
- [x] Calculate and store aggregate reputation scores
- [x] Prevent duplicate reviews per engagement

### 1.6 Messaging
- [x] Send message between users
- [x] Get conversation thread
- [x] List all conversations for current user
- [x] Mark messages as read
- [x] Unread message count
- [x] WebSocket real-time delivery

### 1.7 Notifications
- [x] Create notification on key events (new message, new review, listing inquiry)
- [x] List notifications for current user
- [x] Mark as read / mark all as read
- [x] WebSocket push for real-time notifications

### 1.8 Portfolio
- [x] Create portfolio entry manually
- [x] List portfolio entries for a user
- [x] Update / delete portfolio entry
- [x] Attach technologies and project URL

---

## Phase 2 — AI Infrastructure

> Goal: Set up the shared infrastructure all AI features depend on. Build once, reuse everywhere.

### 2.1 NVIDIA NIM Integration
- [ ] Configure NVIDIA NIM API client (single shared client)
- [ ] LLM completion wrapper (chat + instruction models)
- [ ] Embedding model wrapper (for vector generation)
- [ ] Rate limiting and retry logic
- [ ] Cost tracking per request (log tokens used)

### 2.2 Vector Database (pgvector on Neon)
- [ ] Enable pgvector extension on Neon PostgreSQL
- [ ] Add `embedding` column to `users`, `listings`, `portfolios` tables
- [ ] Alembic migration for vector columns
- [ ] Cosine similarity search utility function

### 2.3 Embedding Pipeline
- [ ] Auto-generate user profile embedding on profile update (Celery task)
- [ ] Auto-generate listing embedding on listing create/update (Celery task)
- [ ] Auto-generate portfolio embedding on entry create (Celery task)
- [ ] Batch re-embedding job for existing records

### 2.4 LangGraph Base Setup
- [ ] Install and configure LangGraph
- [ ] Define shared graph state schema
- [ ] Base graph runner utility (reused by Mentor + Career Roadmaps)
- [ ] Streaming response support (SSE)

### 2.5 Meilisearch Setup
- [ ] Deploy Meilisearch instance
- [ ] Index users, listings, skills
- [ ] Sync index on data changes (Celery task)
- [ ] Search API wrapper

---

## Phase 3 — AI Features

> Goal: Build each AI feature in dependency order. Each one feeds the next.

### 3.1 Skill Gap Analysis
- [ ] Analyze student profile vs target role
- [ ] Identify missing skills using LLM + knowledge graph (NetworkX)
- [ ] Return structured gap report (missing skills, priority order, estimated time)
- [ ] Store gap report per user (refreshed on profile update)

### 3.2 Career Roadmaps (LangGraph + RAG)
- [ ] Build RAG pipeline over skill gap reports + market data
- [ ] LangGraph graph: assess → plan → generate → refine
- [ ] Generate weekly study plan
- [ ] Recommend projects and certifications per milestone
- [ ] Store and version roadmaps per user

### 3.3 AI Career Mentor (LangGraph + NVIDIA NIM)
- [ ] Stateful conversation graph (LangGraph)
- [ ] Context injection: profile, skills, roadmap, reviews, goals
- [ ] Answer career questions with personalized context
- [ ] Streaming responses via SSE
- [ ] Conversation history persistence
- [ ] Proactive suggestions on login (new opportunities, next steps)

### 3.4 Project Matching (pgvector + Neon)
- [ ] Embed incoming listings on creation
- [ ] Match student profile embedding to listing embeddings (cosine similarity)
- [ ] Return ranked matches with compatibility score
- [ ] Explain match reasons (LLM-generated summary)
- [ ] Daily match refresh via Celery beat

### 3.5 Recommendation Engine
- [ ] Combine vector similarity + review scores + activity signals
- [ ] Recommend listings to students
- [ ] Recommend students to clients
- [ ] Personalized homepage feed
- [ ] A/B test recommendation strategies

### 3.6 Proposal Generator (NVIDIA NIM + Jinja2)
- [ ] Student selects a listing to apply to
- [ ] Inject listing details + student profile into prompt template
- [ ] Generate personalized proposal (intro, understanding, plan, timeline, pricing)
- [ ] Allow student to edit before sending
- [ ] Store generated proposals

### 3.7 Portfolio Analysis (OCR + embeddings + NVIDIA NIM)
- [ ] Accept uploaded project files / screenshots
- [ ] OCR extraction (pytesseract) for text from images
- [ ] LLM analysis: extract technologies, challenges, impact
- [ ] Auto-generate polished portfolio entry
- [ ] Embed portfolio entry for matching

### 3.8 Resume Builder (NVIDIA NIM + python-docx + WeasyPrint)
- [ ] Aggregate profile, skills, portfolio, reviews, certifications
- [ ] LLM-generated professional biography and summaries
- [ ] Generate DOCX (python-docx)
- [ ] Generate PDF (WeasyPrint)
- [ ] Multiple resume templates
- [ ] Auto-update on new project completion

### 3.9 Smart Search (Meilisearch)
- [ ] Full-text search across listings, users, skills
- [ ] Typo tolerance and fuzzy matching
- [ ] Filter by category, university, price, rating
- [ ] Search suggestions / autocomplete
- [ ] Hybrid search (keyword + vector similarity)

### 3.10 Company Matching (embeddings + ranking)
- [ ] Company posts talent requirements
- [ ] Embed requirements and match against student profiles
- [ ] Rank candidates by compatibility score
- [ ] Generate candidate summary for employer
- [ ] Student notified of company interest

---

## Phase 4 — Growth & Scale

> Goal: Polish, performance, and expansion features.

### 4.1 AI Pricing Advisor
- [ ] Estimate fair price using experience, location, market data, portfolio quality
- [ ] Real-time pricing suggestion on listing creation
- [ ] Market rate dashboard per skill category

### 4.2 Career Timeline
- [ ] Auto-generate milestone events (first client, first income, top rated, etc.)
- [ ] Visual timeline on public profile
- [ ] Shareable career timeline link

### 4.3 Community
- [ ] Study groups
- [ ] Project collaboration posts
- [ ] Hackathon listings
- [ ] Mentorship connections (alumni returning as mentors)

### 4.4 Analytics Dashboard
- [ ] Student: market value, learning progress, employability score, response rate
- [ ] Platform: top skills, active universities, revenue generated by students

### 4.5 Inter-University Collaboration
- [ ] Cross-university listings visibility
- [ ] University partnership program
- [ ] Campus ambassador system

### 4.6 Infrastructure & DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker + docker-compose for local dev
- [ ] Staging environment
- [ ] Error monitoring (Sentry)
- [ ] API rate limiting
- [ ] Database backups (automated)

---

## Tech Stack Reference

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Neon — serverless) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Vector Search | pgvector on Neon |
| Authentication | JWT + University email verification |
| Real-time | FastAPI WebSockets |
| Task Queue | Celery + Redis |
| Search | Meilisearch |
| LLM Provider | NVIDIA NIM |
| AI Orchestration | LangGraph |
| Embeddings | NVIDIA NIM embedding models |
| OCR | pytesseract |
| Resume Generation | python-docx + WeasyPrint |
| Knowledge Graph | NetworkX |
| Hosting | Railway / Vercel / Render |

---

## AI Feature Dependencies

```
Skill Gap Analysis
    └── Career Roadmaps (RAG)
            └── AI Career Mentor (LangGraph)

Project Matching (pgvector)
    └── Recommendation Engine
            └── Company Matching

Proposal Generator          ← needs listings + profile
Portfolio Analysis          ← needs portfolio entries
    └── Resume Builder      ← needs portfolio + reviews + skills
Smart Search                ← needs all data indexed
AI Pricing Advisor          ← needs market + listing data
```

---

## Current Status

| Phase | Status |
|---|---|
| Phase 1 — Core Platform | 🔄 In Progress |
| Phase 2 — AI Infrastructure | ⏳ Pending |
| Phase 3 — AI Features | ⏳ Pending |
| Phase 4 — Growth & Scale | ⏳ Pending |

---

## Next Steps

1. Complete auth email verification flow (Celery + SMTP)
2. Finish users, listings, reviews, messaging endpoints
3. Set up Neon PostgreSQL with pgvector extension
4. Configure NVIDIA NIM API client
5. Build embedding pipeline
6. Begin Skill Gap Analysis (first AI feature)
