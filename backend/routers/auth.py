from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.dependencies import get_db
from services.auth import AuthService, UsuarioService, RolService, PermisoService
from schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse, UsuarioLogin, Token,
    RolCreate, RolUpdate, RolResponse,
    PermisoCreate, PermisoUpdate, PermisoResponse,
    UsuarioRolAssign, RolPermisoAssign, Message
)
from database.dependencies import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=Token)
def login(credentials: UsuarioLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    token = auth_service.login(credentials.usuario, credentials.contraseña)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    usuario_service = UsuarioService(db)
    user = usuario_service.get(current_user["usuario"])
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


router_usuarios = APIRouter(prefix="/usuarios", tags=["Usuarios"], dependencies=[Depends(require_role(["ADMIN"]))])


@router_usuarios.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    if service.get(data.usuario):
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    return service.create(data)


@router_usuarios.get("/", response_model=List[UsuarioResponse])
def list_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    return service.get_all(skip, limit)


@router_usuarios.get("/{usuario}", response_model=UsuarioResponse)
def get_usuario(usuario: str, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    user = service.get(usuario)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router_usuarios.put("/{usuario}", response_model=UsuarioResponse)
def update_usuario(usuario: str, data: UsuarioUpdate, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    user = service.update(usuario, data)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router_usuarios.delete("/{usuario}", response_model=Message)
def delete_usuario(usuario: str, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    if not service.delete(usuario):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return Message(detail="Usuario eliminado")


@router_usuarios.post("/{usuario}/roles", response_model=Message)
def assign_rol(usuario: str, data: UsuarioRolAssign, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    if not service.assign_rol(usuario, data.id_rol):
        raise HTTPException(status_code=404, detail="Usuario o rol no encontrado")
    return Message(detail="Rol asignado")


@router_usuarios.delete("/{usuario}/roles/{id_rol}", response_model=Message)
def remove_rol(usuario: str, id_rol: int, db: Session = Depends(get_db)):
    service = UsuarioService(db)
    if not service.remove_rol(usuario, id_rol):
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return Message(detail="Rol removido")


router_roles = APIRouter(prefix="/roles", tags=["Roles"], dependencies=[Depends(require_role(["ADMIN"]))])


@router_roles.post("/", response_model=RolResponse, status_code=status.HTTP_201_CREATED)
def create_rol(data: RolCreate, db: Session = Depends(get_db)):
    service = RolService(db)
    if service.get_by_nombre(data.rol):
        raise HTTPException(status_code=400, detail="Rol ya existe")
    return service.create(data)


@router_roles.get("/", response_model=List[RolResponse])
def list_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = RolService(db)
    return service.get_all(skip, limit)


@router_roles.get("/{id_rol}", response_model=RolResponse)
def get_rol(id_rol: int, db: Session = Depends(get_db)):
    service = RolService(db)
    rol = service.get(id_rol)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol


@router_roles.put("/{id_rol}", response_model=RolResponse)
def update_rol(id_rol: int, data: RolUpdate, db: Session = Depends(get_db)):
    service = RolService(db)
    rol = service.update(id_rol, data)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol


@router_roles.delete("/{id_rol}", response_model=Message)
def delete_rol(id_rol: int, db: Session = Depends(get_db)):
    service = RolService(db)
    if not service.delete(id_rol):
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return Message(detail="Rol eliminado")


@router_roles.post("/{id_rol}/permisos", response_model=Message)
def assign_permiso(id_rol: int, data: RolPermisoAssign, db: Session = Depends(get_db)):
    service = RolService(db)
    if not service.assign_permiso(id_rol, data.id_permiso):
        raise HTTPException(status_code=404, detail="Rol o permiso no encontrado")
    return Message(detail="Permiso asignado")


@router_roles.delete("/{id_rol}/permisos/{id_permiso}", response_model=Message)
def remove_permiso(id_rol: int, id_permiso: int, db: Session = Depends(get_db)):
    service = RolService(db)
    if not service.remove_permiso(id_rol, id_permiso):
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return Message(detail="Permiso removido")


router_permisos = APIRouter(prefix="/permisos", tags=["Permisos"], dependencies=[Depends(require_role(["ADMIN"]))])


@router_permisos.post("/", response_model=PermisoResponse, status_code=status.HTTP_201_CREATED)
def create_permiso(data: PermisoCreate, db: Session = Depends(get_db)):
    service = PermisoService(db)
    if service.get_by_nombre(data.nombre):
        raise HTTPException(status_code=400, detail="Permiso ya existe")
    return service.create(data)


@router_permisos.get("/", response_model=List[PermisoResponse])
def list_permisos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = PermisoService(db)
    return service.get_all(skip, limit)


@router_permisos.get("/{id_permiso}", response_model=PermisoResponse)
def get_permiso(id_permiso: int, db: Session = Depends(get_db)):
    service = PermisoService(db)
    permiso = service.get(id_permiso)
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    return permiso


@router_permisos.put("/{id_permiso}", response_model=PermisoResponse)
def update_permiso(id_permiso: int, data: PermisoUpdate, db: Session = Depends(get_db)):
    service = PermisoService(db)
    permiso = service.update(id_permiso, data)
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    return permiso


@router_permisos.delete("/{id_permiso}", response_model=Message)
def delete_permiso(id_permiso: int, db: Session = Depends(get_db)):
    service = PermisoService(db)
    if not service.delete(id_permiso):
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    return Message(detail="Permiso eliminado")