from database.bases import Base 
from sqlalchemy import Column, Integer, String, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

class TipoPermiso(enum.Enum):
    READ = "READ"
    WRITE = "WRITE"

class Permiso(Base): 
    __tablename__ = 'permiso' 
 
    id_permiso = Column(Integer, primary_key=True, autoincrement=True) 
    nombre = Column(String(100), nullable=False)  # Nombre descriptivo del permiso
    tipo = Column(SQLEnum(TipoPermiso), nullable=False, default=TipoPermiso.READ)
    modulos = Column(Text, nullable=False)  # CSV de IDs de módulos: "1,2,3"
    descripcion = Column(String(500))
    
    # Relación con roles
    roles = relationship("RolPermiso", back_populates="permiso", cascade="all, delete-orphan")
    
    def tiene_acceso_modulo(self, modulo_id: int, tipo_requerido: str = "read") -> bool:
        """
        Verifica si este permiso da acceso a un módulo específico
        
        Args:
            modulo_id: ID del módulo a verificar (ej: 4 para USUARIOS)
            tipo_requerido: 'read' o 'write'
        
        Returns:
            True si tiene acceso, False en caso contrario
        """
        # Verificar si el módulo está en la lista
        modulos_lista = [int(m.strip()) for m in self.modulos.split(',')]
        if modulo_id not in modulos_lista:
            return False
        
        # Si tiene write, también tiene read
        if self.tipo == TipoPermiso.WRITE:
            return True
        
        # Si solo tiene read, verificar que no se requiera write
        if self.tipo == TipoPermiso.READ and tipo_requerido == "read":
            return True
        
        return False
    
    def obtener_modulos(self) -> list:
        """Retorna la lista de IDs de módulos como enteros"""
        return [int(m.strip()) for m in self.modulos.split(',')]
    
    
    