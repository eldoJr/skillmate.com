import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlinePencilSquare, HiOutlineLink, HiOutlineEnvelope,
  HiOutlineCalendar, HiOutlineArrowUpRight, HiOutlineStar, HiOutlineCheckBadge,
  HiOutlineEye, HiOutlineEllipsisHorizontal,
  HiOutlineBriefcase, HiOutlineArrowRight,
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineBookOpen, HiOutlineCodeBracket,
  HiOutlineClipboard, HiOutlineDocumentArrowDown, HiOutlineExclamationTriangle,
  HiOutlineSquare2Stack, HiOutlineFolderOpen,
} from 'react-icons/hi2'
import { HiStar, HiOutlineStar as HiOutlineStarLine } from 'react-icons/hi2'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../../components/atoms/avatar'
import { useAuth } from '../../contexts/AuthContext'
import { listingsService, type Listing } from '../../services/listings'
import { usersService, type ProfileCompletion } from '../../services/users'
import { reviewsService, type AggregateScores, type Review } from '../../services/reviews'
import api from '../../services/api'

interface PortfolioEntry {
  id: string
  user_id: string
  title: string
  summary: string | null
  impact_statement: string | null
  technologies: string[] | null
  project_url: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
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

type Tab = 'listings' | 'skills' | 'reviews' | 'portfolio'
const tabDefs: { id: Tab; label: string }[] = [
  { id: 'listings', label: 'Listings' },
  { id: 'skills', label: 'Skills' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'portfolio', label: 'Portfolio' },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('listings')
  const [listings, setListings] = useState<Listing[]>([])
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [aggregate, setAggregate] = useState<AggregateScores | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listingsService.getMine().then(setListings)
    usersService.getCompletion().then(setCompletion)
    usersService.getMe().then(updateUser)
    if (user?.id) {
      reviewsService.getAggregate(user.id).then(setAggregate).catch(() => {})
      reviewsService.getForUser(user.id).then((r) => setReviews(r.items)).catch(() => {})
      api.get<PortfolioEntry[]>(`/portfolio/user/${user.id}`).then((r) => setPortfolio(r.data)).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close more menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const publicProfileUrl = user ? `${window.location.origin}/app/profile/${user.id}` : ''

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = publicProfileUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicProfileUrl)
    setCopied(true)
    setShowMoreMenu(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadResume = () => {
    setShowMoreMenu(false)
    // Generate a simple text-based resume download
    const skills = user?.skills?.map((s) => s.name).join(', ') || 'None listed'
    const resume = [
      `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
      user?.headline ?? '',
      '',
      'Contact',
      `Email: ${user?.email ?? ''}`,
      user?.portfolio_url ? `Portfolio: ${user.portfolio_url}` : '',
      user?.university ? `University: ${user.university}` : '',
      '',
      'About',
      user?.bio ?? 'No bio provided.',
      '',
      'Skills',
      skills,
      '',
      'Listings',
      ...listings.map((l) => `- ${l.title} (${l.category}) — ${formatPrice(l)}`),
    ].filter(Boolean).join('\n')

    const blob = new Blob([resume], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${user?.first_name ?? 'profile'}_resume.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fullName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : ''
  const joinedYear = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''

  const strengthPct = completion?.score ?? 0
  const strengthItems = completion
    ? [
        { label: 'Photo', done: !!user?.avatar_url },
        { label: 'Bio', done: !!user?.bio },
        { label: 'University', done: !!user?.university },
        { label: 'Skills', done: (user?.skills?.length ?? 0) > 0 },
        { label: 'Portfolio', done: !!user?.portfolio_url },
        { label: 'Headline', done: !!user?.headline },
      ]
    : []

  const tabCounts: Record<Tab, number> = {
    listings: listings.length,
    skills: user?.skills?.length ?? 0,
    reviews: reviews.length,
    portfolio: portfolio.length,
  }

  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 min-w-0 space-y-4">

        {/* Hero Card */}
        <SectionCard>
          <div className="h-40 bg-gradient-to-br from-[#0550ae] via-[#0969da] to-[#1a7f37] relative rounded-t-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <Link to="/app/settings" className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/30 transition-colors">
              <HiOutlinePencilSquare className="w-3.5 h-3.5" /> Edit profile
            </Link>
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <Avatar
                  name={fullName || 'S'}
                  src={user?.avatar_url ?? undefined}
                  size="lg"
                  showStatus
                  className="ring-4 ring-white dark:ring-[#161b22] !w-20 !h-20 !text-2xl"
                />
                {user?.is_verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#1a7f37] dark:bg-[#3fb950] flex items-center justify-center ring-2 ring-white dark:ring-[#161b22]">
                    <HiOutlineShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Action buttons: Share + More */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                      <span className="text-[#1a7f37] dark:text-[#3fb950]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineArrowUpRight className="w-3.5 h-3.5" /> Share
                    </>
                  )}
                </button>
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-1.5 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer"
                  >
                    <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showMoreMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] shadow-lg z-50 py-1.5 overflow-hidden"
                      >
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors text-left"
                        >
                          <HiOutlineSquare2Stack className="w-3.5 h-3.5" /> Copy profile link
                        </button>
                        <button
                          onClick={handleDownloadResume}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors text-left"
                        >
                          <HiOutlineDocumentArrowDown className="w-3.5 h-3.5" /> Download resume
                        </button>
                        <a
                          href={publicProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowMoreMenu(false)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors text-left"
                        >
                          <HiOutlineGlobeAlt className="w-3.5 h-3.5" /> View public profile
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Profile info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{fullName || 'Your Name'}</h1>
                {user?.is_verified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33]">
                    <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
                    <span className="text-[10px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">Verified Student</span>
                  </div>
                )}
              </div>
              {(user?.headline || user?.role || user?.university) && (
                <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">
                  {[user?.headline, user?.role, user?.university].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] text-[#636c76] dark:text-[#848d97]">
                {user?.email && <span className="flex items-center gap-1.5"><HiOutlineEnvelope className="w-3.5 h-3.5" />{user.email}</span>}
                {user?.portfolio_url && (
                  <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
                    <HiOutlineLink className="w-3.5 h-3.5" />{user.portfolio_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {joinedYear && <span className="flex items-center gap-1.5"><HiOutlineCalendar className="w-3.5 h-3.5" />Joined {joinedYear}</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#f6f8fa] dark:border-[#21262d]">
              <div className="text-center">
                <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{listings.filter((l) => l.is_active).length}</p>
                <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">active listings</p>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{user?.skills?.length ?? 0}</p>
                <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">skills</p>
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
              {portfolio.length > 0 && (
                <div className="text-center">
                  <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{portfolio.length}</p>
                  <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">projects</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Bio Section */}
        {user?.bio && (
          <SectionCard>
            <SectionHeader icon={HiOutlineBookOpen} title="About" />
            <p className="px-5 py-4 text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{user.bio}</p>
          </SectionCard>
        )}

        {/* Tabs Section */}
        <SectionCard>
          <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#f6f8fa] dark:border-[#21262d] overflow-x-auto">
            {tabDefs.map((tab) => (
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
                <span className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]'
                    : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                )}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Listings Tab */}
            {activeTab === 'listings' && (
              listings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#636c76] dark:text-[#848d97] mb-3">No listings yet.</p>
                  <Link to="/app/listings/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] text-white hover:bg-[#0860ca] transition-colors">
                    Create your first listing
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.map((l, i) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                    >
                      <Link to={`/app/listings/${l.id}`} className="flex items-start justify-between gap-3 p-4 rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{l.title}</p>
                            <span className={clsx(
                              'text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                              l.is_active
                                ? 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]'
                                : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                            )}>
                              {l.is_active ? 'active' : 'paused'}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1 line-clamp-2">{l.description}</p>
                          {l.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] font-medium">{l.category}</span>
                              {l.skills.map((s) => (
                                <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">{s.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-[14px] font-bold text-[#1f2328] dark:text-[#e6edf3] shrink-0">{formatPrice(l)}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              (user?.skills?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#636c76] dark:text-[#848d97] mb-3">No skills added yet.</p>
                  <Link to="/app/settings" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
                    Add skills
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((s) => (
                    <span key={s.id} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">
                      {s.name}
                    </span>
                  ))}
                </div>
              )
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">No reviews yet. Complete projects to receive reviews from clients.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => {
                    const avg = (r.reliability_score + r.professionalism_score + r.growth_score) / 3
                    const name = `${r.reviewer.first_name} ${r.reviewer.last_name}`
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
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
                              : <HiOutlineStarLine key={s} className="w-3 h-3 text-[#d0d7de] dark:text-[#30363d]" />
                            )}
                            <span className="text-[10px] text-[#636c76] dark:text-[#848d97] ml-1">{avg.toFixed(1)}</span>
                          </div>
                          {r.comment && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.comment}</p>}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              portfolio.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#636c76] dark:text-[#848d97] mb-3">No portfolio projects yet.</p>
                  <Link to="/app/portfolio" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] text-white hover:bg-[#0860ca] transition-colors">
                    Add your first project
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {portfolio.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className="rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors overflow-hidden"
                    >
                      {p.image_url && (
                        <div className="h-28 bg-[#f6f8fa] dark:bg-[#21262d]">
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3.5">
                        <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] line-clamp-1">{p.title}</p>
                        {p.summary && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-1 line-clamp-2">{p.summary}</p>}
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.technologies.slice(0, 4).map((t) => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">{t}</span>
                            ))}
                            {p.technologies.length > 4 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">+{p.technologies.length - 4}</span>
                            )}
                          </div>
                        )}
                        {p.project_url && (
                          <a href={p.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#0969da] dark:text-[#2f81f7] hover:underline">
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
        </SectionCard>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-[248px] shrink-0">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: String(listings.filter((l) => l.is_active).length), label: 'Active', icon: HiOutlineEye, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
            { value: String(user?.skills?.length ?? 0), label: 'Skills', icon: HiOutlineStar, color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
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
            <span className={clsx('text-[11px] font-bold', strengthPct >= 80 ? 'text-[#1a7f37] dark:text-[#3fb950]' : 'text-[#0969da] dark:text-[#2f81f7]')}>
              {strengthPct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
            <div
              className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-500', strengthPct >= 80 ? 'from-[#1a7f37] to-[#3fb950]' : 'from-[#0969da] to-[#2f81f7]')}
              style={{ width: `${strengthPct}%` }}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {strengthItems.map((item) => (
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

        {/* Reputation */}
        {aggregate && aggregate.total_reviews > 0 && (
          <SectionCard className="p-4">
            <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Reputation</p>
            <div className="space-y-2">
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
          </SectionCard>
        )}

        {/* Actions */}
        <SectionCard className="p-3">
          <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest px-2 mb-1.5">Actions</p>
          <Link to="/app/listings/new" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors w-full">
            <HiOutlineBriefcase className="w-4 h-4 shrink-0" /> New Listing
          </Link>
          <a
            href={publicProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors w-full"
          >
            <HiOutlineGlobeAlt className="w-4 h-4 shrink-0" /> View Public Profile
            <HiOutlineArrowUpRight className="w-3 h-3 ml-auto opacity-50" />
          </a>
          <Link to="/app/portfolio" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors w-full">
            <HiOutlineFolderOpen className="w-4 h-4 shrink-0" /> Manage Portfolio
          </Link>
        </SectionCard>
      </div>
    </div>
  )
}
