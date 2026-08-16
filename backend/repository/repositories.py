from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.usuarios import Usuario
from models.rol import Rol
from models.permiso import Permiso
from models.usuarios_rol import UsuarioRol
from models.rol_permiso import RolPermiso
from repository.base import BaseRepository


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, db: Session):
        super().__init__(Usuario, db)

    def get_by_usuario(self, usuario: str) -> Optional[Usuario]:
        stmt = select(Usuario).where(Usuario.usuario == usuario)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        stmt = select(Usuario).where(Usuario.correo_electronico == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_with_roles(self, usuario: str) -> Optional[Usuario]:
        stmt = select(Usuario).where(Usuario.usuario == usuario)
        return self.db.execute(stmt).scalar_one_or_none()


class RolRepository(BaseRepository[Rol]):
    def __init__(self, db: Session):
        super().__init__(Rol, db)

    def get_by_nombre(self, rol: str) -> Optional[Rol]:
        stmt = select(Rol).where(Rol.rol == rol)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, id_rol: int) -> Optional[Rol]:
        return self.db.get(Rol, id_rol)


class PermisoRepository(BaseRepository[Permiso]):
    def __init__(self, db: Session):
        super().__init__(Permiso, db)

    def get_by_nombre(self, nombre: str) -> Optional[Permiso]:
        stmt = select(Permiso).where(Permiso.nombre == nombre)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, id_permiso: int) -> Optional[Permiso]:
        return self.db.get(Permiso, id_permiso)

    def get_by_modulo(self, modulo_id: int) -> List[Permiso]:
        stmt = select(Permiso).where(Permiso.modulos.like(f"%{modulo_id}%"))
        return self.db.execute(stmt).scalars().all()


class UsuarioRolRepository:
    def __init__(self, db: Session):
        self.db = db

    def assign(self, usuario: str, id_rol: int) -> UsuarioRol:
        ur = UsuarioRol(usuario=usuario, id_rol=id_rol)
        self.db.add(ur)
        self.db.flush()
        return ur

    def remove(self, usuario: str, id_rol: int) -> bool:
        ur = self.db.get(UsuarioRol, (usuario, id_rol))
        if ur:
            self.db.delete(ur)
            self.db.flush()
            return True
        return False

    def get_by_usuario(self, usuario: str) -> List[UsuarioRol]:
        stmt = select(UsuarioRol).where(UsuarioRol.usuario == usuario)
        return self.db.execute(stmt).scalars().all()

    def get_by_rol(self, id_rol: int) -> List[UsuarioRol]:
        stmt = select(UsuarioRol).where(UsuarioRol.id_rol == id_rol)
        return self.db.execute(stmt).scalars().all()

    def exists(self, usuario: str, id_rol: int) -> bool:
        return self.db.get(UsuarioRol, (usuario, id_rol)) is not None


class RolPermisoRepository:
    def __init__(self, db: Session):
        self.db = db

    def assign(self, id_rol: int, id_permiso: int) -> RolPermiso:
        rp = RolPermiso(id_rol=id_rol, id_permiso=id_permiso)
        self.db.add(rp)
        self.db.flush()
        return rp

    def remove(self, id_rol: int, id_permiso: int) -> bool:
        rp = self.db.get(RolPermiso, (id_rol, id_permiso))
        if rp:
            self.db.delete(rp)
            self.db.flush()
            return True
        return False

    def get_by_rol(self, id_rol: int) -> List[RolPermiso]:
        stmt = select(RolPermiso).where(RolPermiso.id_rol == id_rol)
        return self.db.execute(stmt).scalars().all()

    def get_by_permiso(self, id_permiso: int) -> List[RolPermiso]:
        stmt = select(RolPermiso).where(RolPermiso.id_permiso == id_permiso)
        return self.db.execute(stmt).scalars().all()

    def exists(self, id_rol: int, id_permiso: int) -> bool:
        return self.db.get(RolPermiso, (id_rol, id_permiso)) is not None