"""drop_propiedades_modulo_email_tokens

Revision ID: b5e234b35707
Revises: email_tokens_001
Create Date: 2026-08-15 23:16:47.540443

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5e234b35707'
down_revision: Union[str, Sequence[str], None] = 'email_tokens_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Eliminar tablas no necesarias."""
    op.drop_table('propiedades')
    op.drop_table('modulo')
    op.drop_table('email_tokens')


def downgrade() -> None:
    """Recrear tablas si se revierte."""
    op.create_table(
        'email_tokens',
        sa.Column('id_token', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('token', sa.String(length=6), nullable=False),
        sa.Column('intentos', sa.Integer(), nullable=True),
        sa.Column('creado_en', sa.DateTime(), nullable=True),
        sa.Column('expira_en', sa.DateTime(), nullable=False),
        sa.Column('usado', sa.String(length=1), nullable=True),
        sa.PrimaryKeyConstraint('id_token')
    )
    op.create_index(op.f('ix_email_tokens_email'), 'email_tokens', ['email'], unique=False)

    op.create_table(
        'modulo',
        sa.Column('id_modulo', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('activo', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id_modulo'),
        sa.UniqueConstraint('nombre')
    )

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