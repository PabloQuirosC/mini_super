from database.bases import Base 
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
 
class RolPermiso(Base): 
    __tablename__ = 'rol_permiso' 
 
    id_rol = Column(Integer, ForeignKey("rol.id_rol", ondelete="CASCADE"), primary_key=True, nullable=False) 
    id_permiso = Column(Integer, ForeignKey("permiso.id_permiso", ondelete="CASCADE"), primary_key=True, nullable=False)
    
    # Relaciones
    rol = relationship("Rol", back_populates="permisos")
    permiso = relationship("Permiso", back_populates="roles")