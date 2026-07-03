import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlinePencilSquare,
  HiOutlineMapPin,
  HiOutlineLink,
  HiOutlineEnvelope,
  HiOutlineCalendar,
  HiOutlineArrowUpRight,
  HiOutlineStar,
  HiOutlineCheckBadge,
  HiOutlineEye,
  HiOutlineChartBar,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineEllipsisHorizontal,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineTrophy,
  HiOutlineUserPlus,
  HiOutlineArrowRight,
  HiOutlineHandThumbUp,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlineBookOpen,
  HiOutlineCodeBracket,
  HiOutlinePhoto,
} from 'react-icons/hi2'
import { motion } from 'framer-motion'
import Avatar from '../../components/atoms/avatar'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const skills = [
  { name: 'React', level: 'Expert', endorsements: 18, category: 'Frontend' },
  { name: 'TypeScript', level: 'Expert', endorsements: 14, category: 'Frontend' },
  { name: 'Node.js', level: 'Advanced', endorsements: 11, category: 'Backend' },
  { name: 'PostgreSQL', level: 'Advanced', endorsements: 9, category: 'Backend' },
  { name: 'Python', level: 'Intermediate', endorsements: 7, category: 'Data' },
  { name: 'Figma', level: 'Intermediate', endorsements: 5, category: 'Design' },
  { name: 'Docker', level: 'Beginner', endorsements: 3, category: 'DevOps' },
  { name: 'AWS', level: 'Beginner', endorsements: 2, category: 'Cloud' },
]

const listings = [
  {
    id: '1',
    title: 'React & TypeScript Development',
    description: 'Build modern web apps, fix bugs, or add features to your React project.',
    price: 'R150/hr',
    rating: 4.9,
    reviews: 12,
    category: 'Programming',
    views: 84,
    status: 'active',
    tags: ['React', 'TypeScript', 'Next.js'],
  },
  {
    id: '2',
    title: 'Python Scripting & Automation',
    description: 'Automate repetitive tasks, write data processing scripts, or build CLI tools.',
    price: 'R120/hr',
    rating: 0,
    reviews: 0,
    category: 'Programming',
    views: 23,
    status: 'active',
    tags: ['Python', 'Automation', 'Scripts'],
  },
]

const reviews = [
  {
    id: '1',
    author: 'James M.',
    university: 'UP',
    avatar: 'https://i.pravatar.cc/100?img=8',
    rating: 5,
    text: 'Incredibly helpful tutor. Explained complex concepts clearly and was always on time. Highly recommend!',
    date: '2 weeks ago',
    listing: 'React & TypeScript Development',
  },
  {
    id: '2',
    author: 'Leila N.',
    university: 'UCT',
    avatar: 'https://i.pravatar.cc/100?img=9',
    rating: 5,
    text: 'Built exactly what I needed for my final year project. Clean code, great communication throughout.',
    date: '1 month ago',
    listing: 'React & TypeScript Development',
  },
  {
    id: '3',
    author: 'Kwame B.',
    university: 'Stellenbosch',
    avatar: 'https://i.pravatar.cc/100?img=11',
    rating: 4,
    text: 'Good work overall. Delivered on time and was responsive to feedback.',
    date: '2 months ago',
    listing: 'Python Scripting & Automation',
  },
]

const education = [
  {
    id: '1',
    institution: 'University of Cape Town',
    degree: 'BSc Computer Science',
    period: '2022 – Present',
    year: '3rd Year',
    icon: '🎓',
  },
]

const portfolio = [
  {
    id: '1',
    title: 'SkillMate Web App',
    description: 'Full-stack student marketplace built with React, Node.js, and PostgreSQL.',
    url: 'https://github.com/student/skillmate',
    tech: ['React', 'Node.js', 'PostgreSQL'],
    type: 'project',
  },
  {
    id: '2',
    title: 'UCT Student Portal Redesign',
    description: 'UI/UX redesign concept for the UCT student portal with accessibility improvements.',
    url: 'https://figma.com',
    tech: ['Figma', 'Design'],
    type: 'design',
  },
  {
    id: '3',
    title: 'Python Data Pipeline',
    description: 'Automated data ingestion and processing pipeline for academic research data.',
    url: 'https://github.com/student/pipeline',
    tech: ['Python', 'Pandas', 'SQL'],
    type: 'project',
  },
]

const certifications = [
  { id: '1', name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: '2024', badge: '☁️' },
  { id: '2', name: 'Meta Front-End Developer', issuer: 'Coursera / Meta', year: '2023', badge: '⚛️' },
  { id: '3', name: 'Google UX Design', issuer: 'Google / Coursera', year: '2023', badge: '🎨' },
]

const similarStudents = [
  { name: 'Sipho D.', headline: 'Full Stack Dev · Wits', avatar: 'https://i.pravatar.cc/100?img=8', rating: 4.8 },
  { name: 'Fatima A.', headline: 'UI/UX Designer · UCT', avatar: 'https://i.pravatar.cc/100?img=9', rating: 4.9 },
  { name: 'Kwame B.', headline: 'Data Analyst · Stellenbosch', avatar: 'https://i.pravatar.cc/100?img=11', rating: 4.7 },
]

const badges = [
  { label: 'Top Rated', color: 'bg-[#fff8c5] dark:bg-[#2d2000] text-[#9a6700] dark:text-[#d29922]', icon: '⭐' },
  { label: 'Fast Responder', color: 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]', icon: '⚡' },
  { label: 'Verified Student', color: 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]', icon: '✓' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const levelColor: Record<string, string> = {
  Expert: 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]',
  Advanced: 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]',
  Intermediate: 'bg-[#fff8c5] dark:bg-[#2d2000] text-[#9a6700] dark:text-[#d29922]',
  Beginner: 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
}

const portfolioTypeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  project: HiOutlineCodeBracket,
  design: HiOutlinePhoto,
}

function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'sm' ? 'w-3 h-3' : 'w-2.5 h-2.5'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HiOutlineStar
          key={i}
          className={clsx(cls, i < value ? 'text-[#9a6700] dark:text-[#d29922] fill-current' : 'text-[#d0d7de] dark:text-[#30363d]')}
        />
      ))}
    </div>
  )
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]', className)}>
      {children}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, action }: { icon: React.ComponentType<{ className?: string }>; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#f6f8fa] dark:border-[#21262d]">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#0969da] dark:text-[#2f81f7]" />
        <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{title}</h3>
      </div>
      {action}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ListingsTab() {
  return (
    <div className="space-y-3">
      {listings.map((l, i) => (
        <motion.div
          key={l.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.06 }}
          className="rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors p-4 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{l.title}</p>
                <span className={clsx(
                  'text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                  l.status === 'active'
                    ? 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]'
                    : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                )}>
                  {l.status}
                </span>
              </div>
              <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1 line-clamp-2">{l.description}</p>
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] font-medium">
                  {l.category}
                </span>
                {l.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-[14px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{l.price}</p>
              {l.reviews > 0 ? (
                <div className="flex items-center gap-1 justify-end">
                  <StarRating value={Math.round(l.rating)} />
                  <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{l.rating} ({l.reviews})</span>
                </div>
              ) : (
                <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">No reviews yet</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f6f8fa] dark:border-[#21262d]">
            <span className="flex items-center gap-1 text-[11px] text-[#636c76] dark:text-[#848d97]">
              <HiOutlineEye className="w-3.5 h-3.5" /> {l.views} views
            </span>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">
              <HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /> Contact
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ReviewsTab() {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="space-y-5">
      {/* Rating summary */}
      <div className="flex items-center gap-5 p-4 rounded-xl bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d]">
        <div className="text-center shrink-0">
          <p className="text-[40px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none">{avg}</p>
          <StarRating value={Math.round(Number(avg))} />
          <p className="text-[10px] text-[#636c76] dark:text-[#848d97] mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[10px] w-3 text-right text-[#636c76] dark:text-[#848d97] shrink-0">{star}</span>
              <HiOutlineStar className="w-3 h-3 text-[#9a6700] dark:text-[#d29922] shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-[#d0d7de] dark:bg-[#30363d] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#9a6700] dark:bg-[#d29922]"
                  style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-[#636c76] dark:text-[#848d97] w-3 shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      {reviews.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.06 }}
          className="flex gap-3"
        >
          <Avatar name={r.author} src={r.avatar} size="sm" className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                  {r.author}
                  <span className="font-normal text-[#636c76] dark:text-[#848d97]"> · {r.university}</span>
                </p>
                <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">{r.listing}</p>
              </div>
              <span className="text-[10px] text-[#636c76] dark:text-[#848d97] shrink-0">{r.date}</span>
            </div>
            <div className="flex items-center gap-1.5 my-1.5">
              <StarRating value={r.rating} />
            </div>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function SkillsTab() {
  const categories = [...new Set(skills.map((s) => s.category))]
  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#636c76] dark:text-[#848d97] mb-2.5">{cat}</p>
          <div className="space-y-2">
            {skills.filter((s) => s.category === cat).map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#eaf0f6] dark:hover:bg-[#262c35] transition-colors">
                <span className="flex-1 text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{s.name}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-[#636c76] dark:text-[#848d97]">
                  <HiOutlineHandThumbUp className="w-3.5 h-3.5" />
                  <span>{s.endorsements}</span>
                </div>
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', levelColor[s.level])}>
                  {s.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PortfolioTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {portfolio.map((p, i) => {
        const Icon = portfolioTypeIcon[p.type] ?? HiOutlineCodeBracket
        return (
          <motion.a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.07 }}
            className="group flex flex-col gap-2 p-4 rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ddf4ff] dark:bg-[#121d2f] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#0969da] dark:text-[#2f81f7]" />
              </div>
              <HiOutlineArrowUpRight className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors mt-0.5 shrink-0" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">
                {p.title}
              </p>
              <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-1 leading-relaxed line-clamp-2">
                {p.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {p.tech.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">
                  {t}
                </span>
              ))}
            </div>
          </motion.a>
        )
      })}
      {/* Add project CTA */}
      <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer min-h-[100px]">
        <HiOutlinePlusCircle className="w-5 h-5" />
        <span className="text-[12px] font-medium">Add Project</span>
      </button>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

type Tab = 'listings' | 'reviews' | 'skills' | 'portfolio'

const tabs: { id: Tab; label: string; count?: number }[] = [
  { id: 'listings', label: 'Listings', count: listings.length },
  { id: 'portfolio', label: 'Portfolio', count: portfolio.length },
  { id: 'skills', label: 'Skills', count: skills.length },
  { id: 'reviews', label: 'Reviews', count: reviews.length },
]

// Missing icon used in PortfolioTab above — imported inline to avoid circular
function HiOutlinePlusCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('listings')

  const profileStrengthItems = [
    { label: 'Photo', done: false },
    { label: 'About', done: true },
    { label: 'Education', done: true },
    { label: 'Skills', done: true },
    { label: 'Portfolio', done: true },
    { label: 'Certifications', done: true },
  ]
  const strengthPct = Math.round(
    (profileStrengthItems.filter((x) => x.done).length / profileStrengthItems.length) * 100,
  )

  return (
    <div className="flex gap-5 items-start">

      {/* ── Main column ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Cover + hero ──────────────────────────────────────── */}
        <SectionCard>
          {/* Cover image */}
          <div className="h-40 bg-gradient-to-br from-[#0550ae] via-[#0969da] to-[#1a7f37] relative rounded-t-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <Link to="/app/settings" className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/30 transition-colors">
              <HiOutlinePencilSquare className="w-3.5 h-3.5" /> Edit profile
            </Link>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <Avatar
                  name="Student"
                  size="lg"
                  showStatus
                  className="ring-4 ring-white dark:ring-[#161b22] !w-20 !h-20 !text-2xl"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#1a7f37] dark:bg-[#3fb950] flex items-center justify-center ring-2 ring-white dark:ring-[#161b22]">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer">
                  <HiOutlineArrowUpRight className="w-3.5 h-3.5" /> Share
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer">
                  <HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /> Message
                </button>
                <button className="p-1.5 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer">
                  <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Name + headline */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Alex Mokoena</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33]">
                  <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                  <span className="text-[10px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">Verified Student</span>
                </div>
              </div>
              <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">
                Full Stack Developer & Tutor · BSc Computer Science · University of Cape Town
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] text-[#636c76] dark:text-[#848d97]">
                <span className="flex items-center gap-1.5"><HiOutlineMapPin className="w-3.5 h-3.5" />Cape Town, SA</span>
                <span className="flex items-center gap-1.5"><HiOutlineEnvelope className="w-3.5 h-3.5" />alex@uct.ac.za</span>
                <a href="https://github.com/student" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
                  <HiOutlineLink className="w-3.5 h-3.5" />github.com/alexm
                </a>
                <span className="flex items-center gap-1.5"><HiOutlineCalendar className="w-3.5 h-3.5" />Joined Jan 2024</span>
              </div>
            </div>

            {/* Stat strip */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#f6f8fa] dark:border-[#21262d]">
              {[
                { value: '4.9', label: 'avg rating' },
                { value: '15', label: 'reviews' },
                { value: '2', label: 'active listings' },
                { value: '248', label: 'profile views' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{s.value}</p>
                  <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">{s.label}</p>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                {badges.map((b) => (
                  <span key={b.label} className={clsx('flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full', b.color)}>
                    <span>{b.icon}</span> {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* About ─────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader icon={HiOutlineBookOpen} title="About" />
          <p className="px-5 py-4 text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed">
            3rd-year Computer Science student at UCT with a passion for building scalable web applications and helping fellow students master technical skills. I specialise in full-stack development using React, Node.js, and PostgreSQL — and I love turning complex problems into clean, maintainable solutions.
            <br /><br />
            Currently available for tutoring, freelance development, and collaborative final-year projects. All engagements come with clear communication, on-time delivery, and clean, documented code.
          </p>
        </SectionCard>

        {/* Education ─────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader icon={HiOutlineAcademicCap} title="Education" />
          <div className="px-5 py-4 space-y-4">
            {education.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ddf4ff] dark:bg-[#121d2f] flex items-center justify-center text-lg shrink-0">
                  {e.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{e.institution}</p>
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">{e.degree}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">{e.period}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{e.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Certifications ────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader icon={HiOutlineTrophy} title="Certifications & Credentials" />
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {certifications.map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#eaf0f6] dark:hover:bg-[#262c35] transition-colors">
                <div className="text-2xl shrink-0 mt-0.5">{c.badge}</div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-snug">{c.name}</p>
                  <p className="text-[10px] text-[#636c76] dark:text-[#848d97] mt-0.5">{c.issuer}</p>
                  <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{c.year}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Tabs: Listings / Portfolio / Skills / Reviews ─────── */}
        <SectionCard>
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#f6f8fa] dark:border-[#21262d] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap shrink-0',
                  activeTab === tab.id
                    ? 'text-[#0969da] dark:text-[#2f81f7] border-[#0969da] dark:border-[#2f81f7]'
                    : 'text-[#636c76] dark:text-[#848d97] border-transparent hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    activeTab === tab.id
                      ? 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]'
                      : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === 'listings' && <ListingsTab />}
            {activeTab === 'portfolio' && <PortfolioTab />}
            {activeTab === 'skills' && <SkillsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
          </div>
        </SectionCard>

      </div>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-4 w-[248px] shrink-0">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: '248', label: 'Views', icon: HiOutlineEye, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
            { value: '4.9', label: 'Rating', icon: HiOutlineStar, color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
            { value: '15', label: 'Reviews', icon: HiOutlineChatBubbleOvalLeft, color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
            { value: '86', label: 'Searches', icon: HiOutlineChartBar, color: 'text-[#8250df] dark:text-[#a371f7]', bg: 'bg-[#fbefff] dark:bg-[#1e0a33]' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={clsx('rounded-2xl p-3 text-center', s.bg)}>
                <Icon className={clsx('w-4 h-4 mx-auto mb-1', s.color)} />
                <p className={clsx('text-[16px] font-bold', s.color)}>{s.value}</p>
                <p className="text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Profile Strength */}
        <SectionCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile Strength</p>
            <span className={clsx(
              'text-[11px] font-bold',
              strengthPct >= 80 ? 'text-[#1a7f37] dark:text-[#3fb950]' : 'text-[#0969da] dark:text-[#2f81f7]',
            )}>
              {strengthPct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
            <div
              className={clsx('h-full rounded-full bg-gradient-to-r', strengthPct >= 80 ? 'from-[#1a7f37] to-[#3fb950]' : 'from-[#0969da] to-[#2f81f7]')}
              style={{ width: `${strengthPct}%` }}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {profileStrengthItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={clsx('w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px]',
                  item.done ? 'bg-[#1a7f37] dark:bg-[#3fb950] text-white' : 'border-2 border-[#d0d7de] dark:border-[#30363d]',
                )}>
                  {item.done && '✓'}
                </div>
                <span className={clsx('text-[11px]', item.done ? 'text-[#636c76] dark:text-[#848d97] line-through' : 'text-[#1f2328] dark:text-[#e6edf3] font-medium')}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {strengthPct < 100 && (
            <Link to="/app/settings" className="mt-3 flex items-center justify-center w-full py-2 rounded-xl text-[11px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
              Complete profile <HiOutlineArrowRight className="w-3 h-3 ml-1" />
            </Link>
          )}
        </SectionCard>

        {/* Quick actions */}
        <SectionCard className="p-3">
          <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest px-2 mb-1.5">Actions</p>
          {[
            { label: 'Share Profile', icon: HiOutlineArrowUpRight },
            { label: 'New Listing', icon: HiOutlineBriefcase, href: '/app/listings/new' },
            { label: 'View as Public', icon: HiOutlineGlobeAlt },
          ].map((a) => {
            const Icon = a.icon
            const inner = (
              <span className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors w-full">
                <Icon className="w-4 h-4 shrink-0" /> {a.label}
              </span>
            )
            return a.href
              ? <Link key={a.label} to={a.href}>{inner}</Link>
              : <button key={a.label} className="w-full cursor-pointer text-left">{inner}</button>
          })}
        </SectionCard>

        {/* People also viewed */}
        <SectionCard className="p-4">
          <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">People also viewed</p>
          <div className="space-y-3">
            {similarStudents.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 group cursor-pointer">
                <Avatar name={s.name} src={s.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">
                    {s.name}
                  </p>
                  <p className="text-[10px] text-[#636c76] dark:text-[#848d97] truncate">{s.headline}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <HiOutlineStar className="w-2.5 h-2.5 text-[#9a6700] dark:text-[#d29922]" />
                    <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">{s.rating}</span>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg text-[#0969da] dark:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100">
                  <HiOutlineUserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full text-center text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">
            See more →
          </button>
        </SectionCard>

      </div>
    </div>
  )
}
