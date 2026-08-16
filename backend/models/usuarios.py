from database.bases import Base 
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
 
class Usuario(Base): 
    __tablename__ = 'usuarios'  # Cambiar a plural
 
    usuario = Column(String(100), primary_key=True)
    contraseña = Column(String(200), nullable=False)  # Hashed password
    correo_electronico = Column(String(500)) 
    nombre_completo = Column(String(200))
    status = Column(String(30))
    
    # Campos de perfil
    avatar = Column(Text, nullable=True)  # URL o base64 de la imagen
    descripcion = Column(Text, nullable=True)  # Bio/Descripción del usuario
    telefono = Column(String(20), nullable=True)  # Número de teléfono
    ubicacion = Column(String(200), nullable=True)  # Ubicación del usuario
    facebook = Column(String(500), nullable=True)  # URL de Facebook
    instagram = Column(String(500), nullable=True)  # URL de Instagram
    linkedin = Column(String(500), nullable=True)  # URL de LinkedIn
    whatsapp = Column(String(500), nullable=True)  # URL de WhatsApp
    
    # Relación con roles - cascade delete para eliminar registros en usuario_rol
    roles = relationship("UsuarioRol", back_populates="usuario_rel", cascade="all, delete-orphan", foreign_keys="UsuarioRol.usuario")
    
    def obtener_modulos_acceso(self, db) -> dict:
        """
        Retorna los módulos a los que tiene acceso con su tipo de permiso
        Similar a get_paginas_usuario pero retornando módulos
        
        Returns:
            {
                1: "write",
                2: "read",
                4: "write"
            }
        """
        try:
            from models.permiso import Permiso, TipoPermiso
            from models.rol import Rol
            from models.usuarios_rol import UsuarioRol
            from models.rol_permiso import RolPermiso
            
            # Obtener todos los permisos del usuario a través de sus roles
            permisos = db.query(Permiso).join(
                RolPermiso, Permiso.id_permiso == RolPermiso.id_permiso
            ).join(
                Rol, Rol.id_rol == RolPermiso.id_rol
            ).join(
                UsuarioRol, Rol.id_rol == UsuarioRol.id_rol
            ).filter(
                UsuarioRol.usuario == self.usuario
            ).all()
            
            modulos_acceso = {}
            for permiso in permisos:
                for modulo_id in permiso.obtener_modulos():
                    # Si ya existe, mantener el permiso más alto (write > read)
                    if modulo_id not in modulos_acceso:
                        modulos_acceso[modulo_id] = permiso.tipo.value
                    elif permiso.tipo.value == "write":
                        modulos_acceso[modulo_id] = "write"
            
            return modulos_acceso
        except Exception as e:
            print(f"⚠️ Error obteniendo módulos de acceso para {self.usuario}: {e}")
            # Retornar diccionario vacío si hay error - el usuario seguirá funcionando sin permisos específicos
            return {}
    
    def obtener_lista_modulos(self, db) -> list:
        """
        Retorna solo la lista de IDs de módulos (equivalente a paginas)
        Para compatibilidad con validaciones simples: if 2 in modulos
        """
        return list(self.obtener_modulos_acceso(db).keys())