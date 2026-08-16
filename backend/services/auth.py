from datetime import datetime, timedelta
from typing import Optional, List, Dict
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.usuarios import Usuario
from models.rol import Rol
from models.permiso import Permiso, TipoPermiso
from models.usuarios_rol import UsuarioRol
from models.rol_permiso import RolPermiso
from repository.repositories import (
    UsuarioRepository, RolRepository, PermisoRepository,
    UsuarioRolRepository, RolPermisoRepository
)
from schemas import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    RolCreate, RolUpdate, RolResponse,
    PermisoCreate, PermisoUpdate, PermisoResponse,
    Token, TokenData, UsuarioRolAssign, RolPermisoAssign
)

SECRET_KEY = "inmocr-secret-key-super-mega-segura-2025-pro"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.usuario_repo = UsuarioRepository(db)
        self.rol_repo = RolRepository(db)
        self.permiso_repo = PermisoRepository(db)
        self.usuario_rol_repo = UsuarioRolRepository(db)
        self.rol_permiso_repo = RolPermisoRepository(db)

    def verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def verify_token(self, token: str) -> TokenData:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return TokenData(**payload)
        except jwt.JWTError:
            raise ValueError("Token inválido")

    def authenticate(self, usuario: str, contraseña: str) -> Optional[Usuario]:
        user = self.usuario_repo.get_by_usuario(usuario)
        if not user or not self.verify_password(contraseña, user.contraseña):
            return None
        return user

    def login(self, usuario: str, contraseña: str) -> Optional[Token]:
        user = self.authenticate(usuario, contraseña)
        if not user:
            return None
        
        modulos = user.obtener_lista_modulos(self.db)
        permisos = user.obtener_modulos_acceso(self.db)
        roles = [ur.rol.rol for ur in user.roles] if user.roles else []
        
        token_data = {
            "sub": user.usuario,
            "usuario": user.usuario,
            "nombre_completo": user.nombre_completo,
            "correo_electronico": user.correo_electronico,
            "roles": roles,
            "modulos": modulos,
            "permisos": permisos
        }
        
        access_token = self.create_token(token_data)
        return Token(access_token=access_token, expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60)


class UsuarioService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UsuarioRepository(db)
        self.rol_repo = UsuarioRolRepository(db)

    def create(self, data: UsuarioCreate) -> Usuario:
        hashed = pwd_context.hash(data.contraseña)
        usuario = Usuario(
            usuario=data.usuario,
            contraseña=hashed,
            correo_electronico=data.correo_electronico,
            nombre_completo=data.nombre_completo,
            telefono=data.telefono,
            ubicacion=data.ubicacion,
            descripcion=data.descripcion,
            avatar=data.avatar,
            facebook=data.facebook,
            instagram=data.instagram,
            linkedin=data.linkedin,
            whatsapp=data.whatsapp,
            status="activo"
        )
        self.db.add(usuario)
        self.db.flush()
        return usuario

    def get(self, usuario: str) -> Optional[Usuario]:
        return self.repo.get_by_usuario(usuario)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Usuario]:
        return self.repo.get_all(skip, limit)

    def update(self, usuario: str, data: UsuarioUpdate) -> Optional[Usuario]:
        user = self.repo.get_by_usuario(usuario)
        if not user:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.flush()
        return user

    def delete(self, usuario: str) -> bool:
        user = self.repo.get_by_usuario(usuario)
        if not user:
            return False
        self.db.delete(user)
        self.db.flush()
        return True

    def assign_rol(self, usuario: str, id_rol: int) -> bool:
        user = self.repo.get_by_usuario(usuario)
        rol = self.db.get(Rol, id_rol)
        if not user or not rol:
            return False
        
        if not self.rol_repo.exists(usuario, id_rol):
            self.rol_repo.assign(usuario, id_rol)
        return True

    def remove_rol(self, usuario: str, id_rol: int) -> bool:
        return self.rol_repo.remove(usuario, id_rol)

    def get_roles(self, usuario: str) -> List[Rol]:
        user = self.repo.get_by_usuario(usuario)
        if not user:
            return []
        return [ur.rol for ur in user.roles]


class RolService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RolRepository(db)
        self.permiso_repo = RolPermisoRepository(db)

    def create(self, data: RolCreate) -> Rol:
        rol = Rol(rol=data.rol, descripcion=data.descripcion)
        self.db.add(rol)
        self.db.flush()
        return rol

    def get(self, id_rol: int) -> Optional[Rol]:
        return self.repo.get_by_id(id_rol)

    def get_by_nombre(self, rol: str) -> Optional[Rol]:
        return self.repo.get_by_nombre(rol)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Rol]:
        return self.repo.get_all(skip, limit)

    def update(self, id_rol: int, data: RolUpdate) -> Optional[Rol]:
        rol = self.repo.get_by_id(id_rol)
        if not rol:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(rol, field, value)
        
        self.db.flush()
        return rol

    def delete(self, id_rol: int) -> bool:
        rol = self.repo.get_by_id(id_rol)
        if not rol:
            return False
        self.db.delete(rol)
        self.db.flush()
        return True

    def assign_permiso(self, id_rol: int, id_permiso: int) -> bool:
        rol = self.repo.get_by_id(id_rol)
        permiso = self.db.get(Permiso, id_permiso)
        if not rol or not permiso:
            return False
        
        if not self.permiso_repo.exists(id_rol, id_permiso):
            self.permiso_repo.assign(id_rol, id_permiso)
        return True

    def remove_permiso(self, id_rol: int, id_permiso: int) -> bool:
        return self.permiso_repo.remove(id_rol, id_permiso)

    def get_permisos(self, id_rol: int) -> List[Permiso]:
        rol = self.repo.get_by_id(id_rol)
        if not rol:
            return []
        return [rp.permiso for rp in rol.permisos]


class PermisoService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PermisoRepository(db)

    def create(self, data: PermisoCreate) -> Permiso:
        permiso = Permiso(
            nombre=data.nombre,
            tipo=TipoPermiso(data.tipo.value),
            modulos=data.modulos,
            descripcion=data.descripcion
        )
        self.db.add(permiso)
        self.db.flush()
        return permiso

    def get(self, id_permiso: int) -> Optional[Permiso]:
        return self.repo.get_by_id(id_permiso)

    def get_by_nombre(self, nombre: str) -> Optional[Permiso]:
        return self.repo.get_by_nombre(nombre)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Permiso]:
        return self.repo.get_all(skip, limit)

    def update(self, id_permiso: int, data: PermisoUpdate) -> Optional[Permiso]:
        permiso = self.repo.get_by_id(id_permiso)
        if not permiso:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "tipo" and value:
                value = TipoPermiso(value.value)
            setattr(permiso, field, value)
        
        self.db.flush()
        return permiso

    def delete(self, id_permiso: int) -> bool:
        permiso = self.repo.get_by_id(id_permiso)
        if not permiso:
            return False
        self.db.delete(permiso)
        self.db.flush()
        return True