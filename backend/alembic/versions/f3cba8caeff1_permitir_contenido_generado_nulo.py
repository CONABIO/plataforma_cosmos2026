"""permitir contenido generado nulo

Revision ID: f3cba8caeff1
Revises: 0002_estado
Create Date: 2026-08-18 15:44:07.349312

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'f3cba8caeff1'
down_revision: Union[str, None] = '0002_estado'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "planeaciones",
        "contenido_generado",
        existing_type=sa.Text(),
        nullable=True,
    )


def downgrade() -> None:
     op.alter_column(
         "planeaciones",
         "contenido_generado",
         existing_type=sa.Text(),
         nullable=False,
     )
