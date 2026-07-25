"""initial tables

Revision ID: 0000_initial
Revises:
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0000_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("university", sa.String(200)),
        sa.Column("role", sa.String(50)),
        sa.Column("headline", sa.String(200)),
        sa.Column("bio", sa.Text()),
        sa.Column("avatar_url", sa.String()),
        sa.Column("portfolio_url", sa.String()),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("is_verified", sa.Boolean(), default=False),
        sa.Column("verification_token", sa.String(), index=True),
        sa.Column("verification_token_expires_at", sa.DateTime()),
        sa.Column("reset_token", sa.String(), index=True),
        sa.Column("reset_token_expires_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "skills",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False, index=True),
        sa.Column("category", sa.String(100), nullable=False, index=True),
    )

    op.create_table(
        "user_skills",
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("skill_id", sa.String(), sa.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "listings",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("owner_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(100), nullable=False, index=True),
        sa.Column("listing_type", sa.String(20), nullable=False, default="service"),
        sa.Column("price", sa.Float()),
        sa.Column("price_min", sa.Float()),
        sa.Column("price_max", sa.Float()),
        sa.Column("delivery_days", sa.Integer()),
        sa.Column("cover_image", sa.String()),
        sa.Column("is_active", sa.Boolean(), default=True, index=True),
        sa.Column("is_deleted", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "listing_skills",
        sa.Column("listing_id", sa.String(), sa.ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("skill_id", sa.String(), sa.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("sender_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("receiver_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("reviewer_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("reviewee_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("listing_id", sa.String(), sa.ForeignKey("listings.id", ondelete="SET NULL"), index=True),
        sa.Column("reliability_score", sa.Float(), nullable=False),
        sa.Column("professionalism_score", sa.Float(), nullable=False),
        sa.Column("growth_score", sa.Float(), nullable=False),
        sa.Column("comment", sa.Text()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("reviewer_id", "listing_id", name="uq_review_per_listing"),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("body", sa.Text()),
        sa.Column("is_read", sa.Boolean(), default=False, index=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "portfolios",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("summary", sa.Text()),
        sa.Column("impact_statement", sa.Text()),
        sa.Column("technologies", sa.Text()),
        sa.Column("project_url", sa.String()),
        sa.Column("image_url", sa.String()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "skill_gap_reports",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("target_role", sa.String(200), nullable=False),
        sa.Column("present_skills", sa.Text(), nullable=False),
        sa.Column("missing_skills", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("estimated_weeks", sa.Integer()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "career_roadmaps",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("target_role", sa.String(200), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, default=1),
        sa.Column("milestones", sa.Text(), nullable=False),
        sa.Column("weekly_plan", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("total_weeks", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "mentor_conversations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "mentor_messages",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("conversation_id", sa.String(), sa.ForeignKey("mentor_conversations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "proposals",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("owner_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("listing_id", sa.String(), sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("status", sa.String(20), nullable=False, default="draft"),
        sa.Column("intro", sa.Text(), nullable=False),
        sa.Column("understanding", sa.Text(), nullable=False),
        sa.Column("plan", sa.Text(), nullable=False),
        sa.Column("timeline", sa.Text(), nullable=False),
        sa.Column("pricing", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "company_requirements",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("posted_by", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("company_name", sa.String(200), nullable=False),
        sa.Column("role_title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("required_skills", sa.Text(), nullable=False),
        sa.Column("preferred_university", sa.String(200)),
        sa.Column("is_active", sa.Boolean(), default=True, index=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade():
    for table in [
        "company_requirements", "proposals",
        "mentor_messages", "mentor_conversations", "career_roadmaps",
        "skill_gap_reports", "portfolios", "notifications",
        "reviews", "messages", "listing_skills", "listings",
        "user_skills", "skills", "users",
    ]:
        op.drop_table(table)
