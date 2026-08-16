# Exportar componentes principales
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