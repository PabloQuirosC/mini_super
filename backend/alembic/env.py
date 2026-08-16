from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Agregar el directorio del proyecto al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cargar variables de entorno (si dotenv está disponible)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Importar Base y todos los modelos
from database.bases import Base
from models.usuarios import Usuario
from models.rol import Rol
from models.permiso import Permiso
from models.usuarios_rol import UsuarioRol
from models.rol_permiso import RolPermiso

# Modelos opcionales: algunos entornos no incluyen estos módulos.
try:
    from models.modulo import Modulo  # noqa: F401
except ModuleNotFoundError:
    Modulo = None  # noqa: N816

try:
    from models.propiedades import Propiedades  # noqa: F401
except ModuleNotFoundError:
    Propiedades = None  # noqa: N816

config = context.config

# Usar DATABASE_URL (session pooler puerto 6543) para migraciones - más confiable en Supabase.
database_url = os.getenv("DATABASE_URL")
if database_url:
    # configparser usa '%' para interpolación; hay que escaparlo para URLs encoded.
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))

# logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# metadata de los modelos
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in offline mode."""

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        include_schemas=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in online mode."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_schemas=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()