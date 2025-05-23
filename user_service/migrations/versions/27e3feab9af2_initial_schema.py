"""initial schema

Revision ID: 27e3feab9af2
Revises: 
Create Date: 2025-05-21 07:28:06.445940

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '27e3feab9af2'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # добавляем колонку role с дефолтом 'user' для существующих записей
    op.add_column('users', sa.Column(
        'role',
        sa.String(length=20),
        nullable=False,
        server_default=sa.text("'user'")
    ))

    # сразу убираем серверный default, чтобы модель управляла значением
    op.alter_column('users', 'role', server_default=None)


def downgrade():
    op.drop_column('users', 'role')
