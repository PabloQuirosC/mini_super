import os
import logging
from dotenv import load_dotenv
from .enums import DatabaseType

logger = logging.getLogger(__name__)

# Solo cargar .env si existe (para desarrollo local)
# En Vercel, las variables vienen de Settings → Environment Variables
if os.path.exists('.env'):
    load_dotenv()


class DatabaseConfig:
    """Configuración individual de cada base de datos"""

    def __init__(self, db_type: DatabaseType):
        # Usar DATABASE_URL desde variables de entorno (Vercel) o .env (local)
        database_url = os.getenv("DATABASE_URL", "").strip()
        
        # Validar que la URL esté configurada
        if not database_url:
            error_msg = (
                "❌ DATABASE_URL no está configurada. "
                "En local: crea un archivo .env con DATABASE_URL=... | "
                "En Vercel: configura en Settings → Environment Variables"
            )
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Detectar y normalizar dialecto PostgreSQL
        # Acepta postgresql://, postgresql+psycopg2://, postgresql+pg8000://, etc.
        if database_url.startswith("postgresql://") and "+" not in database_url.split("://")[0]:
            logger.warning(f"🟡 URL postgresql:// sin driver detectada. Convirtiendo a postgresql+psycopg2://")
            database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            os.environ["DATABASE_URL"] = database_url
            logger.info(f"✅ DATABASE_URL actualizada con dialecto psycopg2")
        
        # Validación final: Asegurar que es PostgreSQL
        if not database_url.startswith("postgresql+"):
            error_msg = (
                f"❌ DATABASE_URL debe usar dialecto PostgreSQL 'postgresql+psycopg2://'. "
                f"URL actual: {database_url[:60]}..."
            )
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        self.database_url = database_url

    @property
    def url(self) -> str:
        """Retorna la URL de conexión a PostgreSQL"""
        return self.database_url
    
    @property
    def connect_args(self) -> dict:
        """Argumentos adicionales para la conexión PostgreSQL"""
        return {
            "sslmode": "require",
        }