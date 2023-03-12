"""create sessions table

Revision ID: 09fa80096e10
Revises: 
Create Date: 2023-03-12 12:07:29.999389

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "09fa80096e10"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_name", sa.Text, nullable=False),
        sa.Column("annotations", sa.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("account")
