"""Migracion inicial: tabla planeaciones

Revision ID: 0001_inicial
Revises:
Create Date: 2026-06-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_inicial"
down_revision = None
branch_labels = None
depends_on = None

tema_enum = postgresql.ENUM(
    "prevencion_incendios_forestales",
    "fauna_silvestre_convivencia_responsable",
    "importancia_cuidado_agua",
    "servicios_ecosistemicos",
    "especies_invasoras",
    "turismo_responsable",
    "restauracion_ecologica",
    name="temaambiental",
    create_type=False,
)
rango_edad_enum = postgresql.ENUM(
    "infantil_4_7", "ninez_8_12", "adolescentes_13_17", "adultos_18_mas", "todas_las_edades",
    name="rangoedad",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    tema_enum.create(bind, checkfirst=True)
    rango_edad_enum.create(bind, checkfirst=True)

    op.create_table(
        "planeaciones",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("titulo", sa.String(200), nullable=False),
        sa.Column("tema", tema_enum, nullable=False, index=True),
        sa.Column("rango_edad", rango_edad_enum, nullable=False),
        sa.Column("duracion_minutos", sa.Integer(), server_default="60"),
        sa.Column("numero_participantes", sa.Integer(), nullable=True),
        sa.Column("prompt_utilizado", sa.Text(), nullable=True),
        sa.Column("contenido_generado", sa.Text(), nullable=False),
        sa.Column("pdf_generado_url", sa.String(500), nullable=True),
        sa.Column("creado_en", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("planeaciones")
    bind = op.get_bind()
    rango_edad_enum.drop(bind, checkfirst=True)
    tema_enum.drop(bind, checkfirst=True)
