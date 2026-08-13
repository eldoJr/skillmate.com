import { Hono } from 'hono'
import type { AppEnv } from '../lib/types.js'
import { eq, and, or, ilike, sql, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { listings, skills, listingSkills, users } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { writeFile, unlink } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono<AppEnv>()
const COVER_DIR  = 'media/listings'
const ALLOWED    = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE   = 8 * 1024 * 1024

async function withDetails(listing: typeof listings.$inferSelect) {
  const skillRows = await db.select({ skill: skills }).from(listingSkills)
    .innerJoin(skills, eq(listingSkills.skillId, skills.id))
    .where(eq(listingSkills.listingId, listing.id))
  const [owner] = await db.select().from(users).where(eq(users.id, listing.ownerId)).limit(1)
  return {
    id:            listing.id,
    owner_id:      listing.ownerId,
    title:         listing.title,
    description:   listing.description,
    category:      listing.category,
    listing_type:  listing.listingType,
    price:         listing.price,
    price_min:     listing.priceMin,
    price_max:     listing.priceMax,
    delivery_days: listing.deliveryDays,
    cover_image:   listing.coverImage,
    is_active:     listing.isActive,
    created_at:    listing.createdAt,
    updated_at:    listing.updatedAt,
    skills:        skillRows.map(r => r.skill),
    owner: owner ? {
      id:            owner.id,
      first_name:    owner.firstName,
      last_name:     owner.lastName,
      avatar_url:    owner.avatarUrl,
      university:    owner.university,
      headline:      owner.headline,
      portfolio_url: owner.portfolioUrl,
      is_verified:   owner.isVerified,
    } : null,
  }
}

app.get('/', async c => {
  const { category, listing_type, skill_id, min_price, max_price, university, search, page = '1', page_size = '20' } = c.req.query()
  const pg = Math.max(1, Number(page))
  const ps = Math.min(100, Math.max(1, Number(page_size)))

  let query = db.select().from(listings)
    .where(and(eq(listings.isDeleted, false), eq(listings.isActive, true)))
    .$dynamic()

  const conditions = [eq(listings.isDeleted, false), eq(listings.isActive, true)]
  if (category)     conditions.push(ilike(listings.category, category))
  if (listing_type) conditions.push(eq(listings.listingType, listing_type))
  if (min_price)    conditions.push(sql`${listings.price} >= ${Number(min_price)}`)
  if (max_price)    conditions.push(sql`${listings.price} <= ${Number(max_price)}`)
  if (search)       conditions.push(or(ilike(listings.title, `%${search}%`), ilike(listings.description, `%${search}%`))!)

  const rows = await db.select().from(listings).where(and(...conditions))
    .orderBy(sql`${listings.createdAt} desc`).limit(ps).offset((pg - 1) * ps)

  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(listings).where(and(...conditions))

  const items = await Promise.all(rows.map(withDetails))
  return c.json({ items, total: Number(total), page: pg, page_size: ps, pages: Math.ceil(Number(total) / ps) })
})

app.get('/mine', requireAuth, async c => {
  const user = c.get('user')
  const rows = await db.select().from(listings)
    .where(and(eq(listings.ownerId, user.id), eq(listings.isDeleted, false)))
    .orderBy(sql`${listings.createdAt} desc`)
  return c.json(await Promise.all(rows.map(withDetails)))
})

app.get('/:id', async c => {
  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, c.req.param('id')), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  return c.json(await withDetails(listing))
})

app.post('/', requireAuth, async c => {
  const user = c.get('user')
  const body = await c.req.json()
  const { skill_ids = [], title, description, category, listing_type, price, price_min, price_max, delivery_days } = body

  const [listing] = await db.insert(listings).values({
    ownerId:      user.id,
    title,
    description,
    category,
    listingType:  listing_type ?? 'service',
    price:        price ?? null,
    priceMin:     price_min ?? null,
    priceMax:     price_max ?? null,
    deliveryDays: delivery_days ?? null,
  }).returning()

  if (skill_ids.length) {
    const found = await db.select().from(skills).where(
      or(inArray(skills.id, skill_ids), inArray(skills.name, skill_ids))!
    )
    if (found.length) await db.insert(listingSkills).values(found.map(s => ({ listingId: listing.id, skillId: s.id })))
  }

  return c.json(await withDetails(listing), 201)
})

app.patch('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, c.req.param('id')), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  if (listing.ownerId !== user.id) return c.json({ detail: 'Not your listing' }, 403)

  const { skill_ids, title, description, category, listing_type, price, price_min, price_max, delivery_days } = await c.req.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }
  if (title         !== undefined) update.title        = title
  if (description   !== undefined) update.description  = description
  if (category      !== undefined) update.category     = category
  if (listing_type  !== undefined) update.listingType  = listing_type
  if (price         !== undefined) update.price        = price
  if (price_min     !== undefined) update.priceMin     = price_min
  if (price_max     !== undefined) update.priceMax     = price_max
  if (delivery_days !== undefined) update.deliveryDays = delivery_days
  const [updated] = await db.update(listings).set(update).where(eq(listings.id, listing.id)).returning()

  if (skill_ids !== undefined) {
    await db.delete(listingSkills).where(eq(listingSkills.listingId, listing.id))
    if (skill_ids.length) {
      const found = await db.select().from(skills).where(
        or(inArray(skills.id, skill_ids), inArray(skills.name, skill_ids))!
      )
      if (found.length) await db.insert(listingSkills).values(found.map(s => ({ listingId: listing.id, skillId: s.id })))
    }
  }

  return c.json(await withDetails(updated))
})

app.post('/:id/toggle', requireAuth, async c => {
  const user = c.get('user')
  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, c.req.param('id')), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  if (listing.ownerId !== user.id) return c.json({ detail: 'Not your listing' }, 403)

  const [updated] = await db.update(listings).set({ isActive: !listing.isActive, updatedAt: new Date() }).where(eq(listings.id, listing.id)).returning()
  return c.json(await withDetails(updated))
})

app.post('/:id/cover', requireAuth, async c => {
  const user = c.get('user')
  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, c.req.param('id')), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  if (listing.ownerId !== user.id) return c.json({ detail: 'Not your listing' }, 403)

  const body = await c.req.parseBody()
  const file = body['file'] as File
  if (!file) return c.json({ detail: 'No file provided' }, 400)
  if (!ALLOWED.has(file.type)) return c.json({ detail: 'Only JPEG, PNG, and WebP allowed' }, 400)
  const buf = await file.arrayBuffer()
  if (buf.byteLength > MAX_SIZE) return c.json({ detail: 'Image must be under 8MB' }, 400)

  if (!existsSync(COVER_DIR)) mkdirSync(COVER_DIR, { recursive: true })
  if (listing.coverImage) {
    const old = listing.coverImage.replace(/^\//, '')
    if (existsSync(old)) await unlink(old).catch(() => {})
  }

  const ext      = file.type.split('/')[1]
  const filename = `${listing.id}_${uuidv4().replace(/-/g, '')}.${ext}`
  await writeFile(path.join(COVER_DIR, filename), Buffer.from(buf))

  const [updated] = await db.update(listings).set({ coverImage: `/media/listings/${filename}`, updatedAt: new Date() }).where(eq(listings.id, listing.id)).returning()
  return c.json(await withDetails(updated))
})

app.delete('/:id', requireAuth, async c => {
  const user = c.get('user')
  const [listing] = await db.select().from(listings)
    .where(and(eq(listings.id, c.req.param('id')), eq(listings.isDeleted, false))).limit(1)
  if (!listing) return c.json({ detail: 'Listing not found' }, 404)
  if (listing.ownerId !== user.id) return c.json({ detail: 'Not your listing' }, 403)

  await db.update(listings).set({ isDeleted: true, isActive: false }).where(eq(listings.id, listing.id))
  return c.body(null, 204)
})

export default app
