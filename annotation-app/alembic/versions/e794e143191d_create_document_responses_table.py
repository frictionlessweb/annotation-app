"""create document_responses table

Revision ID: e794e143191d
Revises: 09fa80096e10
Create Date: 2023-04-07 15:10:24.709320

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e794e143191d'
down_revision = '09fa80096e10'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "document_sessions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("document", sa.Text, nullable=False),
        sa.Column("user_responses", sa.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("document_sessions")
