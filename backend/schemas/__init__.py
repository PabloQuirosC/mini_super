from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TipoPermisoStr(str, Enum):
    READ = "READ"
    WRITE = "WRITE"


class UsuarioBase(BaseModel):
    usuario: str = Field(..., min_length=3, max_length=100)
    correo_electronico: Optional[EmailStr] = None
    nombre_completo: Optional[str] = Field(None, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    ubicacion: Optional[str] = Field(None, max_length=200)
    descripcion: Optional[str] = None
    avatar: Optional[str] = None
    facebook: Optional[str] = Field(None, max_length=500)
    instagram: Optional[str] = Field(None, max_length=500)
    linkedin: Optional[str] = Field(None, max_length=500)
    whatsapp: Optional[str] = Field(None, max_length=500)


class UsuarioCreate(UsuarioBase):
    contraseña: str = Field(..., min_length=6, max_length=100)


class UsuarioUpdate(BaseModel):
    correo_electronico: Optional[EmailStr] = None
    nombre_completo: Optional[str] = Field(None, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    ubicacion: Optional[str] = Field(None, max_length=200)
    descripcion: Optional[str] = None
    avatar: Optional[str] = None
    facebook: Optional[str] = Field(None, max_length=500)
    instagram: Optional[str] = Field(None, max_length=500)
    linkedin: Optional[str] = Field(None, max_length=500)
    whatsapp: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, max_length=30)


class UsuarioResponse(UsuarioBase):
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UsuarioLogin(BaseModel):
    usuario: str
    contraseña: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    sub: str
    usuario: str
    nombre_completo: Optional[str] = None
    correo_electronico: Optional[str] = None
    roles: List[str] = []
    modulos: List[int] = []
    permisos: dict = {}


class RolBase(BaseModel):
    rol: str = Field(..., min_length=2, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    descripcion: Optional[str] = Field(None, max_length=500)
    activo: Optional[bool] = None


class RolResponse(RolBase):
    id_rol: int

    class Config:
        from_attributes = True


class PermisoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    tipo: TipoPermisoStr
    modulos: str = Field(..., description="CSV de IDs de módulos: '1,2,3'")
    descripcion: Optional[str] = Field(None, max_length=500)


class PermisoCreate(PermisoBase):
    pass


class PermisoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    tipo: Optional[TipoPermisoStr] = None
    modulos: Optional[str] = None
    descripcion: Optional[str] = Field(None, max_length=500)


class PermisoResponse(PermisoBase):
    id_permiso: int

    class Config:
        from_attributes = True


class UsuarioRolAssign(BaseModel):
    usuario: str
    id_rol: int


class RolPermisoAssign(BaseModel):
    id_rol: int
    id_permiso: int


class Message(BaseModel):
    detail: str