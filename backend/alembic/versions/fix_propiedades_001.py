"""Fix:crear tabla propiedades correctamente

Revision ID: fix_propiedades_001
Revises: aumentar_avatar_tamaño
Create Date: 2026-04-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'fix_propiedades_001'
down_revision: Union[str, Sequence[str], None] = 'aumentar_avatar_tamaño'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'propiedades',
        sa.Column('id_propiedad', sa.String(100), nullable=False),
        sa.Column('titulo', sa.String(200), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('precio', sa.String(50), nullable=False),
        sa.Column('metros_cuadrados', sa.String(200), nullable=True),
        sa.Column('provincia', sa.String(200), nullable=True),
        sa.Column('canton', sa.String(200), nullable=True),
        sa.Column('habitaciones', sa.String(200), nullable=True),
        sa.Column('banos', sa.String(200), nullable=True),
        sa.Column('tipo', sa.String(200), nullable=True),
        sa.Column('cerca_playa', sa.String(30), nullable=True),
        sa.Column('imagen', sa.Text(), nullable=True),
        sa.Column('estado', sa.String(30), nullable=False),
        sa.PrimaryKeyConstraint('id_propiedad')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('propiedades')
