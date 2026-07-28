import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineLink, HiOutlineCalendar, HiOutlineCheckBadge,
  HiOutlineChatBubbleLeftRight, HiOutlineArrowLeft, HiOutlineShieldCheck,
  HiOutlineArrowUpRight, HiOutlineMapPin, HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineEye, HiOutlineStar, HiOutlineChatBubbleOvalLeft, HiOutlineTrophy,
} from 'react-icons/hi2'
import { HiStar, HiOutlineStar as HiOutlineStarLine } from 'react-icons/hi2'
import { motion } from 'framer-motion'
import Avatar from '../../components/atoms/avatar'
import { usersService, type ProfileStats, type ActivityDay } from '../../services/users'
import { listingsService, type Listing } from '../../services/listings'
import { reviewsService, type Review } from '../../services/reviews'
import { messagesService } from '../../services/messages'
import { useAuth } from '../../contexts/AuthContext'
import type { AuthUser } from '../../services/auth'
import api from '../../services/api'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')

function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

interface PortfolioEntry {
  id: string; user_id: string; title: string; summary: string | null
  impact_statement: string | null; technologies: string[] | null
  project_url: string | null; image_url: string | null
  created_at: string; updated_at: string
}

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

/* ─── Activity Heatmap ─── */
function ActivityHeatmap({ data, activeDays, maxStreak }: { data: ActivityDay[]; activeDays: number; maxStreak: number }) {
  const weeks = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const dateMap = new Map<string, number>()
    data.forEach((d) => dateMap.set(d.date, d.count))

    const result: { date: string; count: number }[][] = []
    let currentWeek: { date: string; count: number }[] = []
    const cursor = new Date(startDate)

    while (cursor <= today) {
      const key = cursor.toISOString().split('T')[0]
      currentWeek.push({ date: key, count: dateMap.get(key) ?? 0 })
      if (currentWeek.length === 7) { result.push(currentWeek); currentWeek = [] }
      cursor.setDate(cursor.getDate() + 1)
    }
    if (currentWeek.length > 0) result.push(currentWeek)
    return result
  }, [data])

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#ebedf0] dark:bg-[#161b22]'
    if (count <= 2) return 'bg-[#9be9a8] dark:bg-[#0e4429]'
    if (count <= 4) return 'bg-[#40c463] dark:bg-[#006d32]'
    if (count <= 6) return 'bg-[#30a14e] dark:bg-[#26a641]'
    return 'bg-[#216e39] dark:bg-[#39d353]'
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const totalActivities = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-[13px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
          <span className="font-bold">{totalActivities}</span> activities in the past one year
        </p>
        <div className="flex items-center gap-3 text-[11px] text-[#636c76] dark:text-[#848d97]">
          <span>Active days: <span className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">{activeDays}</span></span>
          <span>Max streak: <span className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">{maxStreak}</span></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-[700px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div key={day.date} className={clsx('w-[11px] h-[11px] rounded-[2px]', getColor(day.count))}
                  title={`${day.date}: ${day.count} activities`} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[#636c76] dark:text-[#848d97] min-w-[700px] px-1">
          {months.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  )
}

/* ─── Skill Donut ─── */
function SkillDonut({ skills, listings, portfolio }: { skills: number; listings: number; portfolio: number }) {
  const total = skills + listings + portfolio
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const skillPct = total > 0 ? skills / total : 0
  const listingPct = total > 0 ? listings / total : 0
  const portfolioPct = total > 0 ? portfolio / total : 0

  const skillDash = skillPct * circumference
  const listingDash = listingPct * circumference
  const portfolioDash = portfolioPct * circumference

  const skillOffset = 0
  const listingOffset = -(skillDash)
  const portfolioOffset = -(skillDash + listingDash)

  return (
    <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
      <div className="flex items-center gap-6">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" className="stroke-[#f6f8fa] dark:stroke-[#21262d]" strokeWidth="10" />
            {portfolioPct > 0 && (
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#da3633" strokeWidth="10"
                strokeDasharray={`${portfolioDash} ${circumference - portfolioDash}`}
                strokeDashoffset={portfolioOffset} strokeLinecap="round" />
            )}
            {listingPct > 0 && (
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#f0883e" strokeWidth="10"
                strokeDasharray={`${listingDash} ${circumference - listingDash}`}
                strokeDashoffset={listingOffset} strokeLinecap="round" />
            )}
            {skillPct > 0 && (
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#3fb950" strokeWidth="10"
                strokeDasharray={`${skillDash} ${circumference - skillDash}`}
                strokeDashoffset={skillOffset} strokeLinecap="round" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[22px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{total}</p>
            <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">Total</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { color: 'bg-[#3fb950]', label: 'Skills', value: skills },
            { color: 'bg-[#f0883e]', label: 'Listings', value: listings },
            { color: 'bg-[#da3633]', label: 'Portfolio', value: portfolio },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className={clsx('w-2.5 h-2.5 rounded-full', item.color)} />
                <span className="text-[12px] text-[#636c76] dark:text-[#848d97]">{item.label}</span>
              </div>
              <span className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Public Profile Page ─── */
type Tab = 'listings' | 'reviews' | 'skills' | 'portfolio'

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('listings')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      usersService.getPublicProfile(userId),
      listingsService.getAll({ page_size: 50 }),
      reviewsService.getForUser(userId).catch(() => ({ items: [] })),
      api.get<PortfolioEntry[]>(`/portfolio/user/${userId}`).then((r) => r.data).catch(() => []),
      usersService.getUserStats(userId).catch(() => null),
    ]).then(([p, allListings, rev, port, st]) => {
      setProfile(p)
      setListings(allListings.items.filter((l: Listing) => l.owner_id === userId && l.is_active))
      setReviews(rev.items)
      setPortfolio(port)
      setStats(st)
    }).finally(() => setLoading(false))
  }, [userId])

  const handleMessage = async () => {
    if (!userId) return
    setMessaging(true)
    try {
      await messagesService.send(userId, 'Hi! I came across your profile and wanted to connect.')
      navigate('/app/messages')
    } finally { setMessaging(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#0969da] dark:border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Loading profile...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-[14px] font-medium text-[#1f2328] dark:text-[#e6edf3]">Profile not found</p>
      <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">This user may not exist or their profile is inactive.</p>
      <button onClick={() => navigate(-1)} className="mt-2 px-4 py-2 rounded-lg text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer">
        Go back
      </button>
    </div>
  )

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const joinedDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const isMe = me?.id === userId

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12px] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer mb-5">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex gap-6 items-start">
        {/* ═══ LEFT SIDEBAR ═══ */}
        <div className="w-[280px] shrink-0 space-y-4 hidden md:block">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={mediaUrl(profile.avatar_url)}
                  alt={fullName}
                  className="w-[140px] h-[140px] rounded-xl object-cover border-2 border-[#d0d7de] dark:border-[#30363d] ring-4 ring-[#d0d7de] dark:ring-[#30363d]"
                />
              ) : (
                <div className="w-[140px] h-[140px] rounded-xl flex items-center justify-center text-4xl font-semibold bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border-2 border-[#d0d7de] dark:border-[#30363d] ring-4 ring-[#d0d7de] dark:ring-[#30363d]">
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#1a7f37] flex items-center justify-center ring-3 ring-white dark:ring-[#0d1117]">
                  <HiOutlineShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3] mt-4">{fullName}</h1>
            {profile.github_username && <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">@{profile.github_username}</p>}
            {profile.headline && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1 leading-relaxed max-w-[240px]">{profile.headline}</p>}
            {profile.is_verified && (
              <div className="flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33]">
                <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                <span className="text-[10px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">Verified Student</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isMe ? (
            <Link to="/app/profile"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#363b42] text-[#1f2328] dark:text-[#e6edf3] hover:bg-[#eaeef2] dark:hover:bg-[#30363d] transition-colors">
              Back to my profile
            </Link>
          ) : (
            <button onClick={handleMessage} disabled={messaging}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#238636] text-white hover:bg-[#2ea043] transition-colors cursor-pointer disabled:opacity-60">
              <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
              {messaging ? 'Opening...' : 'Send Message'}
            </button>
          )}

          {/* Bio */}
          {profile.bio && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{profile.bio}</p>}

          {/* Info */}
          <div className="space-y-2.5 text-[12px] text-[#636c76] dark:text-[#848d97]">
            {profile.location && (
              <div className="flex items-center gap-2.5"><HiOutlineMapPin className="w-4 h-4 shrink-0" /><span>{profile.location}</span></div>
            )}
            {profile.university && (
              <div className="flex items-center gap-2.5"><HiOutlineAcademicCap className="w-4 h-4 shrink-0" /><span>{profile.university}</span></div>
            )}
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
                <HiOutlineGlobeAlt className="w-4 h-4 shrink-0" />
                <span className="truncate">{profile.portfolio_url.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {profile.github_username && (
              <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
                <HiOutlineLink className="w-4 h-4 shrink-0" /><span>{profile.github_username}</span>
              </a>
            )}
            {joinedDate && (
              <div className="flex items-center gap-2.5"><HiOutlineCalendar className="w-4 h-4 shrink-0" /><span>Joined {joinedDate}</span></div>
            )}
          </div>

          {/* Community Stats */}
          <div className="rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] p-4">
            <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Community Stats</p>
            <div className="space-y-3">
              {[
                { icon: HiOutlineEye, color: 'text-[#0969da] dark:text-[#2f81f7]', label: 'Views', value: stats?.profile_views ?? profile.profile_views ?? 0 },
                { icon: HiOutlineStar, color: 'text-[#9a6700] dark:text-[#d29922]', label: 'Reviews', value: stats?.total_reviews ?? 0 },
                { icon: HiOutlineChatBubbleOvalLeft, color: 'text-[#1a7f37] dark:text-[#3fb950]', label: 'Reputation', value: stats?.reputation_score?.toFixed(1) ?? '0.0' },
                { icon: HiOutlineTrophy, color: 'text-[#cf222e] dark:text-[#da3633]', label: 'Projects', value: stats?.total_portfolio ?? 0 },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <Icon className={clsx('w-4 h-4 shrink-0', s.color)} />
                    <p className="text-[12px] text-[#1f2328] dark:text-[#e6edf3]">{s.label} <span className="font-bold">{s.value}</span></p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT CONTENT ═══ */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkillDonut skills={profile.skills?.length ?? 0} listings={listings.length} portfolio={portfolio.length} />
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Badges</p>
                <span className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{stats?.total_reviews ?? 0}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.skills?.length ?? 0) > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33] text-[#1a7f37] dark:text-[#3fb950]">Skill Builder</span>
                )}
                {listings.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#fff8c5] dark:bg-[#2d2000] border border-[#d4a72c] dark:border-[#5c4200] text-[#9a6700] dark:text-[#d29922]">Active Freelancer</span>
                )}
                {portfolio.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#fff0ee] dark:bg-[#2d1a1a] border border-[#ffcecb] dark:border-[#5c3333] text-[#cf222e] dark:text-[#da3633]">Portfolio Pro</span>
                )}
                {(stats?.total_reviews ?? 0) > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#ddf4ff] dark:bg-[#121d2f] border border-[#b6e3ff] dark:border-[#1f3d5c] text-[#0969da] dark:text-[#2f81f7]">Reviewed</span>
                )}
                {profile.is_verified && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33] text-[#1a7f37] dark:text-[#3fb950]">Verified</span>
                )}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <ActivityHeatmap data={stats?.activity_heatmap ?? []} activeDays={stats?.active_days ?? 0} maxStreak={stats?.max_streak ?? 0} />

          {/* Tabs */}
          <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#d0d7de] dark:border-[#21262d] overflow-x-auto">
              {([
                { id: 'listings' as Tab, label: 'Listings', count: listings.length },
                { id: 'reviews' as Tab, label: 'Reviews', count: reviews.length },
                { id: 'skills' as Tab, label: 'Skills', count: profile.skills?.length ?? 0 },
                { id: 'portfolio' as Tab, label: 'Portfolio', count: portfolio.length },
              ]).map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap shrink-0',
                    activeTab === tab.id
                      ? 'text-[#1f2328] dark:text-[#e6edf3] border-[#f0883e]'
                      : 'text-[#636c76] dark:text-[#848d97] border-transparent hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                  )}>
                  {tab.label}
                  <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    activeTab === tab.id ? 'bg-[#f6f8fa] dark:bg-[#30363d] text-[#1f2328] dark:text-[#e6edf3]' : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]'
                  )}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Listings */}
              {activeTab === 'listings' && (
                listings.length === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] text-center py-6">No active listings.</p>
                ) : (
                  <div className="space-y-1">
                    {listings.map((l, i) => (
                      <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
                        <Link to={`/app/listings/${l.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">{l.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">{l.category}</span>
                              <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{formatPrice(l)}</span>
                            </div>
                          </div>
                          <HiOutlineArrowUpRight className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                reviews.length === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] text-center py-6">No reviews yet.</p>
                ) : (
                  <div className="space-y-1">
                    {reviews.map((r) => {
                      const avg = (r.reliability_score + r.professionalism_score + r.growth_score) / 3
                      const name = `${r.reviewer.first_name} ${r.reviewer.last_name}`
                      return (
                        <div key={r.id} className="flex gap-3 px-3 py-3 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors">
                          <Avatar name={name} src={r.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{name}</p>
                              <span className="text-[10px] text-[#636c76] dark:text-[#848d97] shrink-0">
                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 my-1">
                              {[1,2,3,4,5].map((s) => s <= Math.round(avg)
                                ? <HiStar key={s} className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" />
                                : <HiOutlineStarLine key={s} className="w-3 h-3 text-[#d0d7de] dark:text-[#30363d]" />
                              )}
                              <span className="text-[10px] text-[#636c76] dark:text-[#848d97] ml-1">{avg.toFixed(1)}</span>
                            </div>
                            {r.comment && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.comment}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}

              {/* Skills */}
              {activeTab === 'skills' && (
                (profile.skills?.length ?? 0) === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] text-center py-6">No skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((s) => (
                      <span key={s.id} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )
              )}

              {/* Portfolio */}
              {activeTab === 'portfolio' && (
                portfolio.length === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] text-center py-6">No portfolio projects yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {portfolio.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        className="rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/50 dark:hover:border-[#2f81f7]/50 transition-colors overflow-hidden bg-[#f6f8fa] dark:bg-[#0d1117]">
                        {p.image_url && (
                          <div className="h-28 bg-[#eaeef2] dark:bg-[#21262d]">
                            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3.5">
                          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] line-clamp-1">{p.title}</p>
                          {p.summary && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-1 line-clamp-2">{p.summary}</p>}
                          {p.technologies && p.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {p.technologies.slice(0, 4).map((t) => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{t}</span>
                              ))}
                              {p.technologies.length > 4 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">+{p.technologies.length - 4}</span>
                              )}
                            </div>
                          )}
                          {p.project_url && (
                            <a href={p.project_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#0969da] dark:text-[#2f81f7] hover:underline">
                              <HiOutlineLink className="w-3 h-3" /> View project
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
