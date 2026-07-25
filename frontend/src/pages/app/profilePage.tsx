import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlinePencilSquare, HiOutlineMapPin, HiOutlineLink, HiOutlineEnvelope,
  HiOutlineCalendar, HiOutlineArrowUpRight, HiOutlineStar, HiOutlineCheckBadge,
  HiOutlineEye, HiOutlineChatBubbleOvalLeft, HiOutlineEllipsisHorizontal,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineArrowRight,
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineBookOpen, HiOutlineCodeBracket,
} from 'react-icons/hi2'
import { motion } from 'framer-motion'
import Avatar from '../../components/atoms/avatar'
import { useAuth } from '../../contexts/AuthContext'
import { listingsService, type Listing } from '../../services/listings'
import { usersService, type ProfileCompletion } from '../../services/users'

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

type Tab = 'listings' | 'skills'
const tabDefs: { id: Tab; label: string }[] = [
  { id: 'listings', label: 'Listings' },
  { id: 'skills', label: 'Skills' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('listings')
  const [listings, setListings] = useState<Listing[]>([])
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)

  useEffect(() => {
    listingsService.getMine().then(setListings)
    usersService.getCompletion().then(setCompletion)
  }, [])

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

  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 min-w-0 space-y-4">

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
              <div className="flex items-center gap-2 pb-1">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer">
                  <HiOutlineArrowUpRight className="w-3.5 h-3.5" /> Share
                </button>
                <button className="p-1.5 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer">
                  <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

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

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#f6f8fa] dark:border-[#21262d]">
              <div className="text-center">
                <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{listings.filter((l) => l.is_active).length}</p>
                <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">active listings</p>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{user?.skills?.length ?? 0}</p>
                <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">skills</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {user?.bio && (
          <SectionCard>
            <SectionHeader icon={HiOutlineBookOpen} title="About" />
            <p className="px-5 py-4 text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{user.bio}</p>
          </SectionCard>
        )}

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
                  {tab.id === 'listings' ? listings.length : user?.skills?.length ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="p-5">
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
                      className="rounded-xl border border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

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
          </div>
        </SectionCard>
      </div>

      <div className="hidden lg:flex flex-col gap-4 w-[248px] shrink-0">
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

        <SectionCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile Strength</p>
            <span className={clsx('text-[11px] font-bold', strengthPct >= 80 ? 'text-[#1a7f37] dark:text-[#3fb950]' : 'text-[#0969da] dark:text-[#2f81f7]')}>
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

        <SectionCard className="p-3">
          <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest px-2 mb-1.5">Actions</p>
          {[
            { label: 'New Listing', icon: HiOutlineBriefcase, href: '/app/listings/new' },
            { label: 'View Public Profile', icon: HiOutlineGlobeAlt },
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
      </div>
    </div>
  )
}
