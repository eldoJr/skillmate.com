import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlineArrowUpRight, HiOutlineShieldCheck,
  HiOutlineMapPin, HiOutlineAcademicCap, HiOutlineCalendar,
  HiOutlineLink, HiOutlineGlobeAlt, HiOutlineChatBubbleLeftRight,
  HiOutlineBriefcase, HiOutlineStar, HiOutlineEye, HiOutlineTrophy,
} from 'react-icons/hi2'
import { HiStar, HiOutlineStar as HiOutlineStarLine } from 'react-icons/hi2'
import { useAuth } from '../../contexts/AuthContext'
import { usersService, type ProfileStats } from '../../services/users'
import { listingsService, type Listing } from '../../services/listings'
import { reviewsService, type Review } from '../../services/reviews'
import { portfolioService, type PortfolioEntry } from '../../services/portfolio'
import { messagesService } from '../../services/messages'
import Avatar from '../../components/atoms/avatar'
import type { AuthUser } from '../../services/auth'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}
function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

/* ── Section wrapper ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117]">
      <div className="flex items-center px-5 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#161b22]">
        <span className="font-mono text-[9px] tracking-widest uppercase text-[#636c76] dark:text-[#848d97]">
          <span className="text-[#e8490f] mr-1">●</span>{title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ── Stat pill ── */
function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-[#e2e4e8] dark:border-[#1e2228]">
      <Icon className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0" />
      <span className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">{label}</span>
      <span className="font-mono text-[11px] font-bold text-[#1f2328] dark:text-[#e6edf3] ml-auto">{value}</span>
    </div>
  )
}

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

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      usersService.getPublicProfile(userId),
      listingsService.getAll({ page_size: 50 }),
      reviewsService.getForUser(userId).catch(() => ({ items: [] })),
      portfolioService.getByUser(userId).catch(() => []),
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
      <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ loading profile...</p>
    </div>
  )

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="font-mono text-[12px] text-[#1f2328] dark:text-[#e6edf3]">profile not found</p>
      <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">this user may not exist or their profile is inactive</p>
      <button onClick={() => navigate(-1)}
        className="mt-2 px-4 py-2 border border-[#e2e4e8] dark:border-[#1e2228] font-mono text-[10px] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] hover:text-[#e8490f] transition-colors cursor-pointer">
        go back
      </button>
    </div>
  )

  const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''
  const isMe = me?.id === userId
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (r.reliability_score + r.professionalism_score + r.growth_score) / 3, 0) / reviews.length
    : 0

  return (
    <div className="space-y-4">

      {/* back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] transition-colors cursor-pointer">
        <HiOutlineArrowLeft className="w-3.5 h-3.5" /> back
      </button>

      {/* ── HERO CARD ── */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117] overflow-hidden">

        {/* Cover banner */}
        <div className="relative h-36 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 32px)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[11px] tracking-widest text-[#636c76] dark:text-[#848d97] opacity-40 select-none">
              {profile.university ?? 'skillmate.com'}
            </span>
          </div>
        </div>

        {/* Avatar row */}
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                <img src={mediaUrl(profile.avatar_url)} alt={fullName}
                  className="w-20 h-20 object-cover border-2 border-white dark:border-[#0d1117] ring-2 ring-[#e2e4e8] dark:ring-[#1e2228]" />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center text-2xl font-bold font-mono border-2 border-white dark:border-[#0d1117] ring-2 ring-[#e2e4e8] dark:ring-[#1e2228] bg-[#f6f8fa] dark:bg-[#161b22] text-[#e8490f]">
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#22c55e] flex items-center justify-center border border-white dark:border-[#0d1117]">
                  <HiOutlineShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isMe ? (
                <Link to="/app/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e4e8] dark:border-[#1e2228] font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] hover:text-[#e8490f] transition-colors">
                  my profile
                </Link>
              ) : (
                <>
                  <button onClick={handleMessage} disabled={messaging}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e8490f] font-mono text-[10px] tracking-wide text-[#e8490f] hover:bg-[#e8490f] hover:text-white transition-colors cursor-pointer disabled:opacity-50">
                    <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                    {messaging ? 'opening...' : 'message'}
                  </button>
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e4e8] dark:border-[#1e2228] font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] hover:text-[#e8490f] transition-colors">
                      <HiOutlineGlobeAlt className="w-3.5 h-3.5" /> portfolio
                      <HiOutlineArrowUpRight className="w-3 h-3 opacity-50" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Name + headline */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-[18px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{fullName}</h1>
              {profile.is_verified && (
                <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border border-[#22c55e] text-[#22c55e]">
                  verified
                </span>
              )}
            </div>
            {profile.headline && (
              <p className="font-mono text-[12px] text-[#636c76] dark:text-[#848d97] mt-1">{profile.headline}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {profile.university && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
                  <HiOutlineAcademicCap className="w-3 h-3" /> {profile.university}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
                  <HiOutlineMapPin className="w-3 h-3" /> {profile.location}
                </span>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
                  <HiOutlineCalendar className="w-3 h-3" /> joined {joinedDate}
                </span>
              )}
              {profile.github_username && (
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-[10px] text-[#e8490f] hover:underline">
                  <HiOutlineLink className="w-3 h-3" /> {profile.github_username}
                </a>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-[#e2e4e8] dark:border-[#1e2228] pt-4">
            <StatPill icon={HiOutlineEye} label="profile views" value={stats?.profile_views ?? profile.profile_views ?? 0} />
            <StatPill icon={HiOutlineBriefcase} label="listings" value={listings.length} />
            <StatPill icon={HiOutlineStar} label="avg rating" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} />
            <StatPill icon={HiOutlineTrophy} label="projects" value={portfolio.length} />
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <Section title="about">
        {profile.bio ? (
          <p className="font-mono text-[12px] text-[#1f2328] dark:text-[#e6edf3] leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        ) : (
          <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ no bio provided</p>
        )}
      </Section>

      {/* ── SKILLS ── */}
      <Section title="skills">
        {(profile.skills?.length ?? 0) === 0 ? (
          <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ no skills listed</p>
        ) : (
          <div className="space-y-4">
            {(() => {
              const grouped = (profile.skills ?? []).reduce<Record<string, typeof profile.skills>>((acc, s) => {
                const cat = s.category ?? 'Other'
                if (!acc[cat]) acc[cat] = []
                acc[cat]!.push(s)
                return acc
              }, {})
              return Object.entries(grouped).map(([cat, skills]) => (
                <div key={cat}>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-[#636c76] dark:text-[#848d97] mb-2">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {skills!.map((s) => (
                      <span key={s.id}
                        className="font-mono text-[10px] px-2.5 py-1 border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        )}
      </Section>

      {/* ── PORTFOLIO ── */}
      <Section title="portfolio">
        {portfolio.length === 0 ? (
          <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ no projects yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolio.map((p) => (
              <div key={p.id} className="border border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f] transition-colors group">
                {p.imageUrl ? (
                  <div className="h-32 overflow-hidden border-b border-[#e2e4e8] dark:border-[#1e2228]">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-32 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#161b22] flex items-center justify-center">
                    <span className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] opacity-40">no image</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-mono text-[12px] font-bold text-[#1f2328] dark:text-[#e6edf3] truncate">{p.title}</p>
                  {p.summary && (
                    <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] mt-1 line-clamp-2 leading-relaxed">{p.summary}</p>
                  )}
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.technologies.slice(0, 3).map((t) => (
                        <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{t}</span>
                      ))}
                      {p.technologies.length > 3 && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 text-[#636c76] dark:text-[#848d97]">+{p.technologies.length - 3}</span>
                      )}
                    </div>
                  )}
                  {p.projectUrl && (
                    <a href={p.projectUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 font-mono text-[9px] text-[#e8490f] hover:underline">
                      view project <HiOutlineArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── LISTINGS ── */}
      <Section title="listings">
        {listings.length === 0 ? (
          <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ no active listings</p>
        ) : (
          <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
            {listings.map((l) => (
              <Link key={l.id} to={`/app/listings/${l.id}`}
                className="flex items-center justify-between gap-4 py-3 group hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] -mx-5 px-5 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[11px] font-bold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#e8490f] transition-colors truncate">
                    {l.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">{l.category}</span>
                    <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">·</span>
                    <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">{formatPrice(l)}</span>
                  </div>
                </div>
                <HiOutlineArrowUpRight className="w-3 h-3 text-[#636c76] dark:text-[#848d97] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* ── REVIEWS ── */}
      <Section title="reviews">
        {reviews.length === 0 ? (
          <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ no reviews yet</p>
        ) : (
          <div className="space-y-1">
            {/* Aggregate */}
            <div className="flex items-center gap-4 pb-4 mb-2 border-b border-[#e2e4e8] dark:border-[#1e2228]">
              <div className="text-center shrink-0">
                <p className="font-mono text-[32px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none">
                  {avgRating.toFixed(1)}
                </p>
                <div className="flex items-center gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map((s) => s <= Math.round(avgRating)
                    ? <HiStar key={s} className="w-3 h-3 text-[#e8490f]" />
                    : <HiOutlineStarLine key={s} className="w-3 h-3 text-[#636c76] dark:text-[#848d97]" />
                  )}
                </div>
                <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {(['reliability', 'professionalism', 'growth'] as const).map((key) => {
                  const avg = reviews.reduce((s, r) => s + r[`${key}_score`], 0) / reviews.length
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] w-24 shrink-0">{key}</span>
                      <div className="flex-1 h-1 bg-[#f6f8fa] dark:bg-[#1e2228]">
                        <div className="h-full bg-[#e8490f]" style={{ width: `${(avg / 5) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[9px] text-[#1f2328] dark:text-[#e6edf3] w-6 text-right">{avg.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
              {reviews.map((r) => {
                const avg = (r.reliability_score + r.professionalism_score + r.growth_score) / 3
                const name = `${r.reviewer.first_name} ${r.reviewer.last_name}`
                return (
                  <div key={r.id} className="flex gap-3 py-4 first:pt-0">
                    <Avatar name={name} src={r.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-[11px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{name}</p>
                        <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] shrink-0">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {[1,2,3,4,5].map((s) => s <= Math.round(avg)
                          ? <HiStar key={s} className="w-3 h-3 text-[#e8490f]" />
                          : <HiOutlineStarLine key={s} className="w-3 h-3 text-[#636c76] dark:text-[#848d97]" />
                        )}
                        <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] ml-1">{avg.toFixed(1)}</span>
                      </div>
                      {r.comment && (
                        <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Section>

    </div>
  )
}
