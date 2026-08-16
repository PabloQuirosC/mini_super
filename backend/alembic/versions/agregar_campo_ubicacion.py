"""agregar campo ubicacion a usuarios

Revision ID: agregar_campo_ubicacion
Revises: actualizar_perfil_admin
Create Date: 2026-03-16 20:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'agregar_campo_ubicacion'
down_revision: Union[str, Sequence[str], None] = 'actualizar_perfil_admin'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agregar campo ubicación a la tabla usuarios."""
    op.add_column('usuarios', sa.Column('ubicacion', sa.String(length=200), nullable=True))


def downgrade() -> None:
    """Revertir cambios."""
    op.drop_column('usuarios', 'ubicacion')
