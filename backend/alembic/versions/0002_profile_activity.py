"""add profile_views, github_username, location to users; create user_activities table

Revision ID: 0002_profile_activity
Revises: 0001_pgvector
Create Date: 2025-07-27 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_profile_activity"
down_revision = "0001_pgvector"
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to users table
    op.add_column("users", sa.Column("github_username", sa.String(100), nullable=True))
    op.add_column("users", sa.Column("location", sa.String(200), nullable=True))
    op.add_column("users", sa.Column("profile_views", sa.Integer(), nullable=False, server_default="0"))

    # Create user_activities table for heatmap
    op.create_table(
        "user_activities",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("activity_date", sa.Date(), nullable=False, index=True),
        sa.Column("count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "activity_date", name="uq_user_activity_date"),
    )


def downgrade():
    op.drop_table("user_activities")
    op.drop_column("users", "profile_views")
    op.drop_column("users", "location")
    op.drop_column("users", "github_username")
