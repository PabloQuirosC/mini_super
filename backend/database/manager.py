"""Gestor centralizado de múltiples bases de datos"""

import os
import logging
from typing import Dict
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from .enums import DatabaseType
from .config import DatabaseConfig

logger = logging.getLogger(__name__)


class DatabaseManager:
    _engines: Dict[DatabaseType, any] = {}
    _session_makers: Dict[DatabaseType, any] = {}
    _bases: Dict[DatabaseType, any] = {}

    @classmethod
    def _ensure_url_conversion(cls, url: str) -> str:
        """GARANTIZAR que la URL tiene el dialecto postgresql+psycopg2
        Esto se ejecuta justo antes de crear el engine, como último recurso"""
        if not url:
            raise ValueError("DATABASE_URL vacía!")
        
        # Si viene sin driver, convertir inmediatamente
        if url.startswith("postgresql://") and "+" not in url.split("://")[0]:
            logger.warning(f"URL postgresql:// sin driver detectada. Reemplazando antes de create_engine()")
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            os.environ["DATABASE_URL"] = url
            logger.info(f"DATABASE_URL convertida a postgresql+psycopg2://...")
        
        # Validación final
        if not url.startswith("postgresql+"):
            raise ValueError(
                f"DATABASE_URL debe tener el formato 'postgresql+psycopg2://usuario:contraseña@host/db'. "
                f"URL actual: {url[:60]}..."
            )
        
        return url

    @classmethod
    def get_engine(cls, db_type: DatabaseType):
        """Obtener engine (lazy loading) con configuración para alta disponibilidad"""
        if db_type not in cls._engines:
            config = DatabaseConfig(db_type)
            # 🔴 CRÍTICO: Convertir URL aquí como último recurso antes de create_engine
            converted_url = cls._ensure_url_conversion(config.url)
            cls._engines[db_type] = create_engine(
                converted_url,
                connect_args=config.connect_args,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,  # Verifica conexión antes de usar
                pool_recycle=3600,  # Recicla conexiones cada hora
                echo=os.getenv("DB_ECHO", "False").lower() == "true",
            )
        return cls._engines[db_type]

    @classmethod
    def get_session_maker(cls, db_type: DatabaseType):
        """Obtener session maker (lazy loading)"""
        if db_type not in cls._session_makers:
            engine = cls.get_engine(db_type)
            cls._session_makers[db_type] = sessionmaker(
                autocommit=False, autoflush=False, bind=engine
            )
        return cls._session_makers[db_type]

    @classmethod
    def get_base(cls, db_type: DatabaseType):
        """Obtener Base declarativa (lazy loading)"""
        if db_type not in cls._bases:
            cls._bases[db_type] = declarative_base()
        return cls._bases[db_type]

    @classmethod
    def get_session(cls, db_type: DatabaseType) -> Session:
        """Obtener una sesión nueva"""
        SessionLocal = cls.get_session_maker(db_type)
        return SessionLocal()

    @classmethod
    def close_all(cls):
        """Cerrar todas las conexiones (útil para testing)"""
        for engine in cls._engines.values():
            engine.dispose()
        cls._engines.clear()
        cls._session_makers.clear()