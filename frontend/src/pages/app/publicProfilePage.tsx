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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
      <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
        <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default dark:border-border-dark-default">
      <Icon className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0" />
      <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{label}</span>
      <span className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default ml-auto">{value}</span>
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
      <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">Loading profile…</p>
    </div>
  )

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-[17px] font-semibold text-fg-default dark:text-fg-dark-default">Profile not found</p>
      <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">This user may not exist or their profile is inactive</p>
      <button onClick={() => navigate(-1)}
        className="mt-2 px-4 py-2 rounded-lg border border-border-default dark:border-border-dark-default text-[12px] font-medium text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
        Go back
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

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
        <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Hero card */}
      <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">

        {/* Cover */}
        <div className="relative h-36 bg-canvas-inset dark:bg-canvas-dark-inset border-b border-border-default dark:border-border-dark-default flex items-center justify-center">
          <span className="text-[12px] text-fg-muted dark:text-fg-dark-muted opacity-30 select-none">
            {profile.university ?? 'skillmate.com'}
          </span>
        </div>

        {/* Avatar row */}
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                <img src={mediaUrl(profile.avatar_url)} alt={fullName}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-canvas-default dark:border-canvas-dark-default ring-2 ring-border-default dark:ring-border-dark-default" />
              ) : (
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold border-2 border-canvas-default dark:border-canvas-dark-default ring-2 ring-border-default dark:ring-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset text-brand dark:text-brand-dark-DEFAULT">
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success-fg dark:bg-success-dark-fg flex items-center justify-center border-2 border-canvas-default dark:border-canvas-dark-default">
                  <HiOutlineShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isMe ? (
                <Link to="/app/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default dark:border-border-dark-default text-[12px] font-medium text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
                  My profile
                </Link>
              ) : (
                <>
                  <button onClick={handleMessage} disabled={messaging}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-[12px] font-medium text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
                    <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                    {messaging ? 'Opening…' : 'Message'}
                  </button>
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default dark:border-border-dark-default text-[12px] font-medium text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
                      <HiOutlineGlobeAlt className="w-3.5 h-3.5" /> Portfolio
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
              <h1 className="text-[18px] font-bold text-fg-default dark:text-fg-dark-default">{fullName}</h1>
              {profile.is_verified && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-success-fg dark:border-success-dark-fg text-success-fg dark:text-success-dark-fg">
                  Verified
                </span>
              )}
            </div>
            {profile.headline && (
              <p className="text-[13px] text-fg-muted dark:text-fg-dark-muted mt-1">{profile.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {profile.university && (
                <span className="flex items-center gap-1 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineAcademicCap className="w-3 h-3" /> {profile.university}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineMapPin className="w-3 h-3" /> {profile.location}
                </span>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineCalendar className="w-3 h-3" /> Joined {joinedDate}
                </span>
              )}
              {profile.github_username && (
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT hover:underline">
                  <HiOutlineLink className="w-3 h-3" /> {profile.github_username}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border-default dark:border-border-dark-default pt-4">
            <StatPill icon={HiOutlineEye} label="Profile views" value={stats?.profile_views ?? profile.profile_views ?? 0} />
            <StatPill icon={HiOutlineBriefcase} label="Listings" value={listings.length} />
            <StatPill icon={HiOutlineStar} label="Avg rating" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} />
            <StatPill icon={HiOutlineTrophy} label="Projects" value={portfolio.length} />
          </div>
        </div>
      </div>

      {/* About */}
      <Section title="About">
        {profile.bio ? (
          <p className="text-[12px] text-fg-default dark:text-fg-dark-default leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        ) : (
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No bio provided</p>
        )}
      </Section>

      {/* Skills */}
      <Section title="Skills">
        {(profile.skills?.length ?? 0) === 0 ? (
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No skills listed</p>
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
                  <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-2">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {skills!.map((s) => (
                      <span key={s.id}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default">
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

      {/* Portfolio */}
      <Section title="Portfolio">
        {portfolio.length === 0 ? (
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No projects yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolio.map((p) => (
              <div key={p.id} className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors group">
                {p.imageUrl ? (
                  <div className="h-32 overflow-hidden">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-32 bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-center">
                    <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted opacity-40">No image</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default truncate">{p.title}</p>
                  {p.summary && (
                    <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-1 line-clamp-2 leading-relaxed">{p.summary}</p>
                  )}
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.technologies.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{t}</span>
                      ))}
                      {p.technologies.length > 3 && (
                        <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted">+{p.technologies.length - 3}</span>
                      )}
                    </div>
                  )}
                  {p.projectUrl && (
                    <a href={p.projectUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT hover:underline">
                      View project <HiOutlineArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Listings */}
      <Section title="Listings">
        {listings.length === 0 ? (
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No active listings</p>
        ) : (
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {listings.map((l) => (
              <Link key={l.id} to={`/app/listings/${l.id}`}
                className="flex items-center justify-between gap-4 py-3 group hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset -mx-5 px-5 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors truncate">
                    {l.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{l.category}</span>
                    <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">·</span>
                    <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{formatPrice(l)}</span>
                  </div>
                </div>
                <HiOutlineArrowUpRight className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Reviews */}
      <Section title="Reviews">
        {reviews.length === 0 ? (
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No reviews yet</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-4 pb-4 mb-2 border-b border-border-default dark:border-border-dark-default">
              <div className="text-center shrink-0">
                <p className="text-[32px] font-bold text-fg-default dark:text-fg-dark-default leading-none">{avgRating.toFixed(1)}</p>
                <div className="flex items-center gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map((s) => s <= Math.round(avgRating)
                    ? <HiStar key={s} className="w-3.5 h-3.5 text-brand dark:text-brand-dark-DEFAULT" />
                    : <HiOutlineStarLine key={s} className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted" />
                  )}
                </div>
                <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {(['reliability', 'professionalism', 'growth'] as const).map((key) => {
                  const avg = reviews.reduce((s, r) => s + r[`${key}_score`], 0) / reviews.length
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted w-24 shrink-0 capitalize">{key}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
                        <div className="h-full rounded-full bg-brand dark:bg-brand-dark-DEFAULT transition-all" style={{ width: `${(avg / 5) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-fg-default dark:text-fg-dark-default w-6 text-right tabular-nums">{avg.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="divide-y divide-border-default dark:divide-border-dark-default">
              {reviews.map((r) => {
                const avg = (r.reliability_score + r.professionalism_score + r.growth_score) / 3
                const name = `${r.reviewer.first_name} ${r.reviewer.last_name}`
                return (
                  <div key={r.id} className="flex gap-3 py-4 first:pt-0">
                    <Avatar name={name} src={r.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default">{name}</p>
                        <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted shrink-0">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {[1,2,3,4,5].map((s) => s <= Math.round(avg)
                          ? <HiStar key={s} className="w-3.5 h-3.5 text-brand dark:text-brand-dark-DEFAULT" />
                          : <HiOutlineStarLine key={s} className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted" />
                        )}
                        <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted ml-1">{avg.toFixed(1)}</span>
                      </div>
                      {r.comment && (
                        <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{r.comment}</p>
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
