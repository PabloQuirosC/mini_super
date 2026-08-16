"""aumentar tamaño campo avatar

Revision ID: aumentar_avatar_tamaño
Revises: llenar_ubicacion_admin
Create Date: 2026-03-16 20:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aumentar_avatar_tamaño'
down_revision: Union[str, Sequence[str], None] = 'llenar_ubicacion_admin'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Aumentar tamaño de campo avatar para imágenes base64."""
    # En PostgreSQL, TEXT ya es ilimitado (hasta 1GB), no necesita LONGTEXT
    # Esta migración es no-op en PostgreSQL


def downgrade() -> None:
    """Revertir cambios."""
    # En PostgreSQL, TEXT ya es ilimitado, no hay nada que revertir
    pass
