"""enable pgvector and add embedding columns

Revision ID: 0001_pgvector
Revises:
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_pgvector"
down_revision = "0000_initial"
branch_labels = None
depends_on = None

DIMENSION = 1024


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.add_column("users",     sa.Column("embedding", sa.Text(), nullable=True))
    op.add_column("listings",  sa.Column("embedding", sa.Text(), nullable=True))
    op.add_column("portfolios", sa.Column("embedding", sa.Text(), nullable=True))

    # Cast to proper vector type after extension is enabled
    for table in ("users", "listings", "portfolios"):
        op.execute(f"ALTER TABLE {table} ALTER COLUMN embedding TYPE vector({DIMENSION}) USING embedding::vector({DIMENSION})")


def downgrade():
    for table in ("users", "listings", "portfolios"):
        op.drop_column(table, "embedding")
