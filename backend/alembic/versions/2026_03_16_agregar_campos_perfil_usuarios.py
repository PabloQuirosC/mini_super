"""agregar campos de perfil a usuarios

Revision ID: agregar_campos_perfil
Revises: 9698e4eb06fd
Create Date: 2026-03-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'agregar_campos_perfil'
down_revision: Union[str, Sequence[str], None] = '9698e4eb06fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agregar campos de perfil a la tabla usuarios."""
    op.add_column('usuarios', sa.Column('avatar', sa.Text(), nullable=True))
    op.add_column('usuarios', sa.Column('descripcion', sa.Text(), nullable=True))
    op.add_column('usuarios', sa.Column('telefono', sa.String(length=20), nullable=True))
    op.add_column('usuarios', sa.Column('facebook', sa.String(length=500), nullable=True))
    op.add_column('usuarios', sa.Column('instagram', sa.String(length=500), nullable=True))
    op.add_column('usuarios', sa.Column('linkedin', sa.String(length=500), nullable=True))
    op.add_column('usuarios', sa.Column('whatsapp', sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Revertir cambios."""
    op.drop_column('usuarios', 'whatsapp')
    op.drop_column('usuarios', 'linkedin')
    op.drop_column('usuarios', 'instagram')
    op.drop_column('usuarios', 'facebook')
    op.drop_column('usuarios', 'telefono')
    op.drop_column('usuarios', 'descripcion')
    op.drop_column('usuarios', 'avatar')
