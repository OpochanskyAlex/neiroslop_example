# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A note-taking application built to demonstrate and test a deployment flow. Users can register (email, password, name), create notes, view timestamped notes, and see their successful login attempt count.

## Stack

- **API**: FastAPI + SQLAlchemy (ORM) + Alembic (migrations)
- **Database**: PostgreSQL — local via Docker, production on Supabase
- **Frontend**: React (Vite)
- **Auth**: JWT tokens (Bearer, stored in localStorage)
- **Hosting**: Railway (API + frontend) + Supabase (database)

## Architecture

Monorepo with `backend/` and `frontend/` folders.

- React SPA → FastAPI REST API (`/auth/*`, `/notes`) → PostgreSQL
- JWT issued on login; all protected routes use `Authorization: Bearer <token>`
- `login_count` is incremented atomically in the DB on every successful login
- Alembic migrations run automatically on container startup (`CMD` in Dockerfile)
- Vite proxy rewrites `/api/*` → `http://localhost:8000/*` during local dev (eliminates CORS config for dev)

## Development Commands

```bash
# 1. Copy and configure environment
cp .env.example .env   # edit DATABASE_URL and SECRET_KEY

# 2. Start API + PostgreSQL (migrations run automatically)
docker-compose up --build

# 3. Frontend dev server (hot-reload, separate terminal)
cd frontend && npm install && npm run dev
```

- API: http://localhost:8000 — Swagger UI at http://localhost:8000/docs
- Frontend: http://localhost:5173

```bash
# Run migrations manually
docker-compose exec api alembic upgrade head

# Generate a new migration after model changes
docker-compose exec api alembic revision --autogenerate -m "description"
```

## Key Files

- `backend/app/config.py` — pydantic-settings reads all env vars (DATABASE_URL, SECRET_KEY, etc.)
- `backend/app/database.py` — SQLAlchemy engine, `SessionLocal`, `Base`, `get_db` dependency
- `backend/app/dependencies.py` — `get_current_user` JWT dependency used in all protected routes
- `backend/alembic/env.py` — Alembic config; imports models to populate `Base.metadata` for autogenerate
- `frontend/src/api/client.js` — axios instance with request interceptor (attaches JWT) and 401 handler
