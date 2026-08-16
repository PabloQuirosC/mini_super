# Mini Super

Sistema de gestión para mini supermercado con autenticación, roles y permisos.

## Stack

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (Supabase) + Alembic
- **Frontend:** React + Vite + TailwindCSS

## Arquitectura

```
mini_super/
├── backend/          # API REST
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── repository/   # Data access layer
│   ├── services/     # Business logic
│   ├── routers/      # API endpoints
│   └── database/     # DB config & connections
└── frontend/         # React app
```

## Endpoints principales

| Módulo | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Usuarios | `CRUD /usuarios/`, roles assignment |
| Roles | `CRUD /roles/`, permisos assignment |
| Permisos | `CRUD /permisos/` |

## Levantar el proyecto

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Frontend: http://localhost:8443