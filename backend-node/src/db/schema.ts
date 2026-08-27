import { pgTable, text, boolean, timestamp, integer, real, date, unique, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// ─── Skills ──────────────────────────────────────────────────────────────────

export const skills = pgTable('skills', {
  id:       text('id').primaryKey().$defaultFn(() => uuidv4()),
  name:     text('name').notNull().unique(),
  category: text('category').notNull(),
})

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills:    many(userSkills),
  listingSkills: many(listingSkills),
}))

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:                          text('id').primaryKey().$defaultFn(() => uuidv4()),
  email:                       text('email').notNull().unique(),
  hashedPassword:              text('hashed_password').notNull(),
  firstName:                   text('first_name').notNull(),
  lastName:                    text('last_name').notNull(),
  university:                  text('university'),
  role:                        text('role'),
  headline:                    text('headline'),
  bio:                         text('bio'),
  avatarUrl:                   text('avatar_url'),
  coverUrl:                    text('cover_url'),
  portfolioUrl:                text('portfolio_url'),
  githubUsername:              text('github_username'),
  location:                    text('location'),
  profileViews:                integer('profile_views').notNull().default(0),
  isActive:                    boolean('is_active').notNull().default(true),
  isVerified:                  boolean('is_verified').notNull().default(false),
  verificationToken:           text('verification_token'),
  verificationTokenExpiresAt:  timestamp('verification_token_expires_at'),
  resetToken:                  text('reset_token'),
  resetTokenExpiresAt:         timestamp('reset_token_expires_at'),
  createdAt:                   timestamp('created_at').notNull().defaultNow(),
  updatedAt:                   timestamp('updated_at').notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  userSkills:    many(userSkills),
  listings:      many(listings),
  reviewsGiven:  many(reviews, { relationName: 'reviewer' }),
  reviewsGot:    many(reviews, { relationName: 'reviewee' }),
  messagesSent:  many(messages, { relationName: 'sender' }),
  messagesGot:   many(messages, { relationName: 'receiver' }),
  notifications: many(notifications),
  portfolios:    many(portfolios),
  activities:    many(userActivities),
  certificates:  many(certificates),
  proposals:     many(proposals),
}))

// ─── Junction: user_skills ────────────────────────────────────────────────────

export const userSkills = pgTable('user_skills', {
  userId:  text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, t => ({ pk: primaryKey({ columns: [t.userId, t.skillId] }) }))

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user:  one(users,  { fields: [userSkills.userId],  references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}))

// ─── Listings ─────────────────────────────────────────────────────────────────

export const listings = pgTable('listings', {
  id:           text('id').primaryKey().$defaultFn(() => uuidv4()),
  ownerId:      text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:        text('title').notNull(),
  description:  text('description').notNull(),
  category:     text('category').notNull(),
  listingType:  text('listing_type').notNull().default('service'),
  price:        real('price'),
  priceMin:     real('price_min'),
  priceMax:     real('price_max'),
  deliveryDays: integer('delivery_days'),
  coverImage:   text('cover_image'),
  isActive:     boolean('is_active').notNull().default(true),
  isDeleted:    boolean('is_deleted').notNull().default(false),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

export const listingsRelations = relations(listings, ({ one, many }) => ({
  owner:         one(users,    { fields: [listings.ownerId], references: [users.id] }),
  listingSkills: many(listingSkills),
  reviews:       many(reviews),
  proposals:     many(proposals),
}))

// ─── Junction: listing_skills ─────────────────────────────────────────────────

export const listingSkills = pgTable('listing_skills', {
  listingId: text('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  skillId:   text('skill_id').notNull().references(() => skills.id,    { onDelete: 'cascade' }),
}, t => ({ pk: primaryKey({ columns: [t.listingId, t.skillId] }) }))

export const listingSkillsRelations = relations(listingSkills, ({ one }) => ({
  listing: one(listings, { fields: [listingSkills.listingId], references: [listings.id] }),
  skill:   one(skills,   { fields: [listingSkills.skillId],   references: [skills.id] }),
}))

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = pgTable('messages', {
  id:         text('id').primaryKey().$defaultFn(() => uuidv4()),
  senderId:   text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  isRead:     boolean('is_read').notNull().default(false),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
})

export const messagesRelations = relations(messages, ({ one }) => ({
  sender:   one(users, { fields: [messages.senderId],   references: [users.id], relationName: 'sender' }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: 'receiver' }),
}))

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable('reviews', {
  id:                   text('id').primaryKey().$defaultFn(() => uuidv4()),
  reviewerId:           text('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  revieweeId:           text('reviewee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId:            text('listing_id').references(() => listings.id, { onDelete: 'set null' }),
  reliabilityScore:     real('reliability_score').notNull(),
  professionalismScore: real('professionalism_score').notNull(),
  growthScore:          real('growth_score').notNull(),
  comment:              text('comment'),
  createdAt:            timestamp('created_at').notNull().defaultNow(),
}, t => ({ uq: unique('uq_review_per_listing').on(t.reviewerId, t.listingId) }))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users,    { fields: [reviews.reviewerId], references: [users.id], relationName: 'reviewer' }),
  reviewee: one(users,    { fields: [reviews.revieweeId], references: [users.id], relationName: 'reviewee' }),
  listing:  one(listings, { fields: [reviews.listingId],  references: [listings.id] }),
}))

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id:        text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      text('type').notNull(),
  title:     text('title').notNull(),
  body:      text('body'),
  isRead:    boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

// ─── Portfolios ───────────────────────────────────────────────────────────────

export const portfolios = pgTable('portfolios', {
  id:              text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:          text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:           text('title').notNull(),
  summary:         text('summary'),
  impactStatement: text('impact_statement'),
  technologies:    text('technologies'), // JSON-encoded string[]
  projectUrl:      text('project_url'),
  imageUrl:        text('image_url'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  updatedAt:       timestamp('updated_at').notNull().defaultNow(),
})

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  user: one(users, { fields: [portfolios.userId], references: [users.id] }),
}))

// ─── Certificates ─────────────────────────────────────────────────────────────

export const certificates = pgTable('certificates', {
  id:            text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:        text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:         text('title').notNull(),
  issuer:        text('issuer').notNull(),
  issueDate:     date('issue_date').notNull(),
  expiryDate:    date('expiry_date'),
  credentialId:  text('credential_id'),
  credentialUrl: text('credential_url'),
  description:   text('description'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, { fields: [certificates.userId], references: [users.id] }),
}))

// ─── Proposals ────────────────────────────────────────────────────────────────

export const proposals = pgTable('proposals', {
  id:            text('id').primaryKey().$defaultFn(() => uuidv4()),
  ownerId:       text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId:     text('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  status:        text('status').notNull().default('draft'),
  intro:         text('intro').notNull(),
  understanding: text('understanding').notNull(),
  plan:          text('plan').notNull(),
  timeline:      text('timeline').notNull(),
  pricing:       text('pricing').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})

export const proposalsRelations = relations(proposals, ({ one }) => ({
  owner:   one(users,    { fields: [proposals.ownerId],   references: [users.id] }),
  listing: one(listings, { fields: [proposals.listingId], references: [listings.id] }),
}))

// ─── User Activities ──────────────────────────────────────────────────────────

export const userActivities = pgTable('user_activities', {
  id:           text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityDate: date('activity_date').notNull(),
  count:        integer('count').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
}, t => ({ uq: unique('uq_user_activity_date').on(t.userId, t.activityDate) }))

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, { fields: [userActivities.userId], references: [users.id] }),
}))

// ─── Skill Gap Reports ────────────────────────────────────────────────────────

export const skillGapReports = pgTable('skill_gap_reports', {
  id:             text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:         text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetRole:     text('target_role').notNull(),
  presentSkills:  text('present_skills').notNull().default('[]'),  // JSON
  missingSkills:  text('missing_skills').notNull().default('[]'),  // JSON
  summary:        text('summary').notNull().default(''),
  estimatedWeeks: integer('estimated_weeks'),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  updatedAt:      timestamp('updated_at').notNull().defaultNow(),
}, t => ({ uq: unique('uq_skill_gap_user_role').on(t.userId, t.targetRole) }))

export const skillGapReportsRelations = relations(skillGapReports, ({ one }) => ({
  user: one(users, { fields: [skillGapReports.userId], references: [users.id] }),
}))

// ─── Career Roadmaps ──────────────────────────────────────────────────────────

export const careerRoadmaps = pgTable('career_roadmaps', {
  id:         text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetRole: text('target_role').notNull(),
  version:    integer('version').notNull().default(1),
  milestones: text('milestones').notNull().default('[]'),   // JSON
  weeklyPlan: text('weekly_plan').notNull().default('[]'),  // JSON
  summary:    text('summary').notNull().default(''),
  totalWeeks: integer('total_weeks').notNull().default(0),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
  updatedAt:  timestamp('updated_at').notNull().defaultNow(),
})

export const careerRoadmapsRelations = relations(careerRoadmaps, ({ one }) => ({
  user: one(users, { fields: [careerRoadmaps.userId], references: [users.id] }),
}))

// ─── Mentor Conversations ─────────────────────────────────────────────────────

export const mentorConversations = pgTable('mentor_conversations', {
  id:        text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:     text('title').notNull().default('New conversation'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const mentorConversationsRelations = relations(mentorConversations, ({ one, many }) => ({
  user:     one(users, { fields: [mentorConversations.userId], references: [users.id] }),
  messages: many(mentorMessages),
}))

export const mentorMessages = pgTable('mentor_messages', {
  id:             text('id').primaryKey().$defaultFn(() => uuidv4()),
  conversationId: text('conversation_id').notNull().references(() => mentorConversations.id, { onDelete: 'cascade' }),
  role:           text('role').notNull(), // 'user' | 'assistant'
  content:        text('content').notNull(),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
})

export const mentorMessagesRelations = relations(mentorMessages, ({ one }) => ({
  conversation: one(mentorConversations, { fields: [mentorMessages.conversationId], references: [mentorConversations.id] }),
}))
