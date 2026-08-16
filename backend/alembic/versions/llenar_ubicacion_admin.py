"""llenar ubicacion admin

Revision ID: llenar_ubicacion_admin
Revises: agregar_campo_ubicacion
Create Date: 2026-03-16 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'llenar_ubicacion_admin'
down_revision: Union[str, Sequence[str], None] = 'agregar_campo_ubicacion'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Llenar ubicación de admin."""
    connection = op.get_bind()
    
    connection.execute(sa.text("""
        UPDATE usuarios SET 
            ubicacion = 'San José, Costa Rica'
        WHERE usuario = 'admin'
    """))


def downgrade() -> None:
    """Revertir cambios."""
    connection = op.get_bind()
    
    connection.execute(sa.text("""
        UPDATE usuarios SET 
            ubicacion = NULL
        WHERE usuario = 'admin'
    """))
