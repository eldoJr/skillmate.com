import type { users, skills } from '../db/schema.js'

type UserRow  = typeof users.$inferSelect
type SkillRow = typeof skills.$inferSelect

/** Serialize a Drizzle user row to the snake_case shape the frontend expects. */
export function serializeUser(u: UserRow, userSkills: SkillRow[] = []) {
  return {
    id:               u.id,
    email:            u.email,
    first_name:       u.firstName,
    last_name:        u.lastName,
    full_name:        `${u.firstName} ${u.lastName}`.trim(),
    avatar_url:       u.avatarUrl,
    university:       u.university,
    role:             u.role,
    headline:         u.headline,
    bio:              u.bio,
    portfolio_url:    u.portfolioUrl,
    github_username:  u.githubUsername,
    location:         u.location,
    profile_views:    u.profileViews,
    is_active:        u.isActive,
    is_verified:      u.isVerified,
    created_at:       u.createdAt,
    updated_at:       u.updatedAt,
    skills:           userSkills,
  }
}
