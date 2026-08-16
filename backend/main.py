from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import get_db_inmocr
from routers.auth import router as auth_router, router_usuarios, router_roles, router_permisos

app = FastAPI(
    title="Mini Super API",
    description="API para gestión de usuarios, roles y permisos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(router_usuarios)
app.include_router(router_roles)
app.include_router(router_permisos)


@app.get("/")
def root():
    return {"message": "Mini Super API - Auth Service", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}