import 'dotenv/config'
import { db } from './index.js'
import { skills } from './schema.js'
import { sql } from 'drizzle-orm'

const SKILL_SEED = [
  // Technology
  { name: 'Python',             category: 'Technology' },
  { name: 'JavaScript',         category: 'Technology' },
  { name: 'TypeScript',         category: 'Technology' },
  { name: 'React',              category: 'Technology' },
  { name: 'Node.js',            category: 'Technology' },
  { name: 'FastAPI',            category: 'Technology' },
  { name: 'SQL',                category: 'Technology' },
  { name: 'Machine Learning',   category: 'Technology' },
  { name: 'Data Analysis',      category: 'Technology' },
  { name: 'DevOps',             category: 'Technology' },
  // Design
  { name: 'UI/UX Design',       category: 'Design' },
  { name: 'Figma',              category: 'Design' },
  { name: 'Graphic Design',     category: 'Design' },
  { name: 'Motion Graphics',    category: 'Design' },
  { name: '3D Modeling',        category: 'Design' },
  // Writing
  { name: 'Copywriting',        category: 'Writing' },
  { name: 'Academic Writing',   category: 'Writing' },
  { name: 'Technical Writing',  category: 'Writing' },
  { name: 'Translation',        category: 'Writing' },
  { name: 'Proofreading',       category: 'Writing' },
  // Media
  { name: 'Video Editing',      category: 'Media' },
  { name: 'Photography',        category: 'Media' },
  { name: 'Podcast Production', category: 'Media' },
  { name: 'Social Media',       category: 'Media' },
  // Education
  { name: 'Tutoring',           category: 'Education' },
  { name: 'Mathematics',        category: 'Education' },
  { name: 'Physics',            category: 'Education' },
  { name: 'Language Teaching',  category: 'Education' },
  // Business
  { name: 'Digital Marketing',  category: 'Business' },
  { name: 'Business Analysis',  category: 'Business' },
  { name: 'Project Management', category: 'Business' },
  { name: 'Accounting',         category: 'Business' },
  // Music
  { name: 'Music Production',   category: 'Music' },
  { name: 'Mixing & Mastering', category: 'Music' },
  { name: 'Songwriting',        category: 'Music' },
]

const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(skills)
if (Number(count) > 0) {
  console.log(`Skills already seeded (${count} records)`)
  process.exit(0)
}

await db.insert(skills).values(SKILL_SEED)
console.log(`${SKILL_SEED.length} skills seeded`)
process.exit(0)
