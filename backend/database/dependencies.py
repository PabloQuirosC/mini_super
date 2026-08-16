from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .enums import DatabaseType
from .connection import (
    get_db_inmocr
)

security = HTTPBearer()


# Dependency principal para la base de datos REC (la más común)
def get_db():
    """Dependency para obtener sesión de base de datos REC"""
    db = None
    try:
        from .connection import get_db_inmocr
        gen = get_db_inmocr()
        db = next(gen)
        yield db
    finally:
        if db:
            try:
                next(gen, None)
            except StopIteration:
                pass


# Dependencies para cada base de datos específica (si se necesitan)
def get_db_by_type(db_type: DatabaseType = DatabaseType.INMOCR):
    """Dependency genérico para obtener sesión de cualquier base de datos"""
    dependencies_map = {
        DatabaseType.INMOCR: get_db_inmocr
    }
    
    dependency = dependencies_map.get(db_type)
    if not dependency:
        raise ValueError(f"No existe dependency para {db_type.value}")
    
    return Depends(dependency)


def get_current_user_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Dependency para obtener el payload completo del token"""
    from services.auth import AuthService
    from database.connection import get_db_inmocr
    db = next(get_db_inmocr())
    auth_service = AuthService(db)
    token = credentials.credentials
    return auth_service.verify_token(token).model_dump()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Dependency para obtener el payload completo del usuario del token"""
    from services.auth import AuthService
    from database.connection import get_db_inmocr
    db = next(get_db_inmocr())
    auth_service = AuthService(db)
    token = credentials.credentials
    return auth_service.verify_token(token).model_dump()


def require_role(required_roles: list):
    """Dependency factory para verificar roles específicos"""
    def role_checker(current_user: dict = Depends(get_current_user_payload)) -> dict:
        user_roles = current_user.get("roles", [])
        
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos suficientes para realizar esta acción"
            )
        
        return current_user
    
    return role_checker


# Aliases específicos para cada base de datos
db_inmocr_dependency = Depends(get_db_inmocr)