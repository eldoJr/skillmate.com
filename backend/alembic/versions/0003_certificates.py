"""create certificates table

Revision ID: 0003_certificates
Revises: 0002_profile_activity
Create Date: 2025-08-03 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_certificates"
down_revision = "0002_profile_activity"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "certificates",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("issuer", sa.String(200), nullable=False),
        sa.Column("issue_date", sa.Date(), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=True),
        sa.Column("credential_id", sa.String(200), nullable=True),
        sa.Column("credential_url", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade():
    op.drop_table("certificates")
