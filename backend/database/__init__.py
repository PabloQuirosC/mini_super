"""
Módulo de base de datos - Exports principales
"""
import os
import logging

logger = logging.getLogger(__name__)

# ✅ CONVERSIÓN CRÍTICA: Convertir DATABASE_URL antes de cualquier cosa
# Aiven entrega mysql:// pero SQLAlchemy necesita el driver especificado
database_url = os.getenv("DATABASE_URL", "")
if database_url.startswith("mysql://"):
    logger.info("🔄 Convirtiendo DATABASE_URL de mysql:// a mysql+pymysql://")
    database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
    os.environ["DATABASE_URL"] = database_url

from .enums import DatabaseType
from .config import DatabaseConfig
from .manager import DatabaseManager
from .bases import Base

# Funciones de dependencia para FastAPI
def get_db_inmocr():
    """Dependency para obtener sesión de base de datos INMOCR"""
    db = DatabaseManager.get_session(DatabaseType.INMOCR)
    try:
        yield db
    finally:
        db.close()

# Funciones para uso directo (sin FastAPI)
def get_db_session(db_type: DatabaseType = DatabaseType.INMOCR):
    """Obtener sesión de base de datos (para uso directo)"""
    return DatabaseManager.get_session(db_type)

__all__ = [
    # Enums
    "DatabaseType",
    # Config
    "DatabaseConfig",
    # Manager
    "DatabaseManager",
    # Dependencies FastAPI
    "get_db_inmocr",
    # Direct session
    "get_db_session",
    # Bases
    "Base",
]
