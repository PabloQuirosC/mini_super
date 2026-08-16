from database.bases import Base 
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
 
class Rol(Base): 
    __tablename__ = 'rol' 
 
    id_rol = Column(Integer, primary_key=True, autoincrement=True) 
    rol = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(500))
    
    # Relaciones
    usuarios = relationship("UsuarioRol", back_populates="rol", cascade="all, delete-orphan")
    permisos = relationship("RolPermiso", back_populates="rol", cascade="all, delete-orphan")