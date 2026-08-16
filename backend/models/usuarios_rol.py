from database.bases import Base 
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
 
class UsuarioRol(Base): 
    __tablename__ = 'usuario_rol' 
 
    usuario = Column(String(100), ForeignKey("usuarios.usuario", ondelete="CASCADE"), primary_key=True, nullable=False) 
    id_rol = Column(Integer, ForeignKey("rol.id_rol", ondelete="CASCADE"), primary_key=True, nullable=False)
    
    # Relaciones - NO usar el mismo nombre para columna y relación
    usuario_rel = relationship("Usuario", back_populates="roles", foreign_keys=[usuario])
    rol = relationship("Rol", back_populates="usuarios")