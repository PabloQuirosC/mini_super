from sqlalchemy.ext.declarative import declarative_base 

# Crear Base única para todos los modelos
Base = declarative_base()

# Exportar Base para uso en modelos y migraciones 
__all__ = ['Base']