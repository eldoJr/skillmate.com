import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineMapPin, HiOutlineLink, HiOutlineCalendar, HiOutlineCheckBadge,
  HiOutlineChatBubbleLeftRight, HiOutlineArrowLeft, HiOutlineShieldCheck,
  HiOutlineStar, HiStar, HiOutlineArrowUpRight,
} from 'react-icons/hi2'
import { motion } from 'framer-motion'
import Avatar from '../../components/atoms/avatar'
import { usersService } from '../../services/users'
import { listingsService, type Listing } from '../../services/listings'
import { reviewsService, type AggregateScores, type Review } from '../../services/reviews'
import { messagesService } from '../../services/messages'
import { useAuth } from '../../contexts/AuthContext'
import type { AuthUser } from '../../services/auth'

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [aggregate, setAggregate] = useState<AggregateScores | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'skills'>('listings')

  useEffect(() => {
    if (!userId) return
    Promise.all([
      usersService.getPublicProfile(userId),
      listingsService.getAll({ page_size: 20 }),
      reviewsService.getAggregate(userId),
      reviewsService.getForUser(userId),
    ]).then(([p, allListings, agg, rev]) => {
      setProfile(p)
      setListings(allListings.items.filter((l: Listing) => l.owner_id === userId))
      setAggregate(agg)
      setReviews(rev.items)
    }).finally(() => setLoading(false))
  }, [userId])

  const handleMessage = async () => {
    if (!userId) return
    setMessaging(true)
    try {
      await messagesService.send(userId, 'Hi! I came across your profile and wanted to connect.')
      navigate('/app/messages')
    } finally {
      setMessaging(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Loading…</p>
    </div>
  )

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Profile not found.</p>
    </div>
  )

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const joinedYear = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
  const isMe = me?.id === userId

  const tabs = [
    { id: 'listings' as const, label: 'Listings', count: listings.length },
    { id: 'reviews' as const, label: 'Reviews', count: reviews.length },
    { id: 'skills' as const, label: 'Skills', count: profile.skills?.length ?? 0 },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12px] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-4">

          {/* Hero card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-[#0550ae] via-[#0969da] to-[#1a7f37] relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
              />
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  <Avatar name={fullName} src={profile.avatar_url ?? undefined} size="lg" showStatus
                    className="ring-4 ring-white dark:ring-[#161b22] !w-20 !h-20 !text-2xl" />
                  {profile.is_verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#1a7f37] dark:bg-[#3fb950] flex items-center justify-center ring-2 ring-white dark:ring-[#161b22]">
                      <HiOutlineShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                {!isMe && (
                  <button
                    onClick={handleMessage}
                    disabled={messaging}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer disabled:opacity-60 mb-1"
                  >
                    <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                    {messaging ? 'Opening…' : 'Message'}
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{fullName}</h1>
                  {profile.is_verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33]">
                      <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                      <span className="text-[10px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">Verified Student</span>
                    </div>
                  )}
                </div>
                {(profile.headline || profile.role || profile.university) && (
                  <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">
                    {[profile.headline, profile.role, profile.university].filter(Boolean).join(' · ')}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] text-[#636c76] dark:text-[#848d97]">
                  {profile.university && <span className="flex items-center gap-1.5"><HiOutlineMapPin className="w-3.5 h-3.5" />{profile.university}</span>}
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
                      <HiOutlineLink className="w-3.5 h-3.5" />{profile.portfolio_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {joinedYear && <span className="flex items-center gap-1.5"><HiOutlineCalendar className="w-3.5 h-3.5" />Joined {joinedYear}</span>}
                </div>
              </div>

              <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#f6f8fa] dark:border-[#21262d]">
                <div className="text-center">
                  <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{listings.filter((l) => l.is_active).length}</p>
                  <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">active listings</p>
                </div>
                {aggregate && aggregate.total_reviews > 0 && (
                  <>
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{aggregate.overall_avg.toFixed(1)}</p>
                      <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">avg rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{aggregate.total_reviews}</p>
                      <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">reviews</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {profile.bio && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-2">About</p>
              <p className="text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{profile.bio}</p>
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#f6f8fa] dark:border-[#21262d] overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap shrink-0',
                    activeTab === tab.id
                      ? 'text-[#0969da] dark:text-[#2f81f7] border-[#0969da] dark:border-[#2f81f7]'
                      : 'text-[#636c76] dark:text-[#848d97] border-transparent hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                  )}
                >
                  {tab.label}
                  <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    activeTab === tab.id ? 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]' : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]'
                  )}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'listings' && (
                listings.length === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No active listings.</p>
                ) : (
                  <div className="space-y-3">
                    {listings.map((l) => (
                      <Link key={l.id} to={`/app/listings/${l.id}`}
                        className="flex items-start justify-between gap-3 p-4 rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">{l.title}</p>
                          <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5 line-clamp-1">{l.description}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{l.category}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{formatPrice(l)}</p>
                          <HiOutlineArrowUpRight className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] ml-auto mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'reviews' && (
                reviews.length === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No reviews yet.</p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((r) => {
                      const avg = (r.reliability_score + r.professionalism_score + r.growth_score) / 3
                      const name = `${r.reviewer.first_name} ${r.reviewer.last_name}`
                      return (
                        <div key={r.id} className="flex gap-3">
                          <Avatar name={name} src={r.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{name}</p>
                              <span className="text-[10px] text-[#636c76] dark:text-[#848d97] shrink-0">
                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 my-1">
                              {[1,2,3,4,5].map((s) => s <= Math.round(avg)
                                ? <HiStar key={s} className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" />
                                : <HiOutlineStar key={s} className="w-3 h-3 text-[#d0d7de] dark:text-[#30363d]" />
                              )}
                            </div>
                            {r.comment && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.comment}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}

              {activeTab === 'skills' && (
                (profile.skills?.length ?? 0) === 0 ? (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No skills listed.</p>
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
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-[220px] shrink-0">
          {aggregate && aggregate.total_reviews > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 space-y-2">
              <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Reputation</p>
              {[
                { label: 'Reliability', value: aggregate.avg_reliability },
                { label: 'Professionalism', value: aggregate.avg_professionalism },
                { label: 'Growth', value: aggregate.avg_growth },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{s.label}</span>
                  <div className="flex items-center gap-1">
                    <HiStar className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" />
                    <span className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{s.value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isMe && (
            <button
              onClick={handleMessage}
              disabled={messaging}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer disabled:opacity-60"
            >
              <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
              {messaging ? 'Opening…' : 'Send Message'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
