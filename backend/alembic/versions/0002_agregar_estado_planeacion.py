"""Agregar campo estado a planeaciones

Revision ID: 0002_estado
Revises: 0001_inicial
Create Date: 2026-07-12
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_estado"
down_revision = "0001_inicial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("planeaciones", sa.Column("estado", sa.String(20), server_default="listo"))
    op.add_column("planeaciones", sa.Column("error_mensaje", sa.Text(), nullable=True))
    # Marcar registros existentes como listos
    op.execute("UPDATE planeaciones SET estado = 'listo' WHERE contenido_generado IS NOT NULL")


def downgrade() -> None:
    op.drop_column("planeaciones", "error_mensaje")
    op.drop_column("planeaciones", "estado")
