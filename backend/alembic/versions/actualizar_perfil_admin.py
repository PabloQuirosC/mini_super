"""actualizar perfil admin con datos profesionales

Revision ID: actualizar_perfil_admin
Revises: agregar_campos_perfil
Create Date: 2026-03-16 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'actualizar_perfil_admin'
down_revision: Union[str, Sequence[str], None] = 'agregar_campos_perfil'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Actualizar perfil del admin con datos profesionales."""
    connection = op.get_bind()
    
    # Actualizar datos del usuario admin
    connection.execute(sa.text("""
        UPDATE usuarios SET 
            avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            descripcion = 'Agente Inmobiliario Profesional | 12+ años de experiencia | Especialista en propiedades residenciales y comerciales | Asesoramiento integral en inversión inmobiliaria',
            telefono = '+506 8765-4321',
            facebook = 'https://facebook.com/carlosorozco',
            instagram = 'https://instagram.com/carlos.orozco.cr',
            linkedin = 'https://linkedin.com/in/carlos-orozco-inmobiliario',
            whatsapp = 'https://wa.me/50687654321?text=Hola%20Carlos,%20me%20interesa%20conocer%20más%20sobre%20propiedades'
        WHERE usuario = 'admin'
    """))


def downgrade() -> None:
    """Revertir cambios - limpiar datos del admin."""
    connection = op.get_bind()
    
    connection.execute(sa.text("""
        UPDATE usuarios SET 
            avatar = NULL,
            descripcion = NULL,
            telefono = NULL,
            facebook = NULL,
            instagram = NULL,
            linkedin = NULL,
            whatsapp = NULL
        WHERE usuario = 'admin'
    """))
