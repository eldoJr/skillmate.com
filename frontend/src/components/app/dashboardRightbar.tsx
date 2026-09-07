import { Link } from 'react-router-dom'
import {
  HiOutlinePlusCircle, HiOutlineMagnifyingGlass, HiOutlineSparkles,
  HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineExclamationCircle,
  HiOutlineBriefcase,
} from 'react-icons/hi2'
import Avatar from '../atoms/avatar'
import type { ProfileCompletion, ProfileStats } from '../../services/users'
import type { Listing } from '../../services/listings'
import type { AuthUser } from '../../services/auth'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
function mediaUrl(p: string | null | undefined) {
  if (!p) return undefined
  return p.startsWith('http') ? p : `${BACKEND_URL}${p}`
}

function scoreColor(score: number) {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return 'var(--color-brand, #0969da)'
  return '#848d97'
}

interface Props {
  user: AuthUser | null
  completion: ProfileCompletion | null
  stats: ProfileStats | null
  myListings: Listing[]
}

const quickActions = [
  { label: 'New listing',  icon: HiOutlinePlusCircle,      href: '/app/listings/new' },
  { label: 'Explore',      icon: HiOutlineMagnifyingGlass, href: '/app/explore' },
  { label: 'AI Mentor',    icon: HiOutlineSparkles,        href: '/app/ai/mentor' },
  { label: 'My portfolio', icon: HiOutlineBriefcase,       href: '/app/portfolio' },
]

const completionItems = [
  { key: 'avatar',     label: 'Profile photo' },
  { key: 'headline',   label: 'Headline' },
  { key: 'bio',        label: 'Bio' },
  { key: 'skills',     label: 'Skills' },
  { key: 'university', label: 'University' },
]

const sectionHeader = 'px-3 py-2 border-b border-border-default dark:border-border-dark-default flex items-center justify-between bg-canvas-inset dark:bg-canvas-dark-inset'

export default function DashboardRightbar({ user, completion, stats, myListings }: Props) {
  const score   = completion?.score ?? 0
  const missing = completion?.missing ?? []

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[230px] shrink-0">

      {/* ── Profile card ── */}
      <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className={sectionHeader}>
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Profile</span>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar name={user?.full_name ?? 'S'} src={mediaUrl(user?.avatar_url)} size="md" showStatus />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default truncate">{user?.full_name ?? '—'}</p>
              <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted truncate">{user?.university ?? user?.email ?? '—'}</p>
              {user?.headline && (
                <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted truncate mt-0.5 italic">{user.headline}</p>
              )}
            </div>
          </div>

          {/* Completion bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">Profile strength</span>
              <span className="text-[11px] font-semibold" style={{ color: scoreColor(score) }}>{score}%</span>
            </div>
            <div className="w-full h-1 bg-border-default dark:bg-border-dark-default rounded-full">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5 mb-3">
            {completionItems.map((item) => {
              const done = !missing.some((m) => m.toLowerCase().includes(item.key))
              return (
                <div key={item.key} className="flex items-center gap-1.5">
                  {done
                    ? <HiOutlineCheckCircle className="w-3.5 h-3.5 text-success-fg dark:text-success-dark-fg shrink-0" />
                    : <HiOutlineExclamationCircle className="w-3.5 h-3.5 text-brand dark:text-brand-dark-DEFAULT shrink-0" />
                  }
                  <span className={`text-[12px] ${done ? 'text-fg-muted dark:text-fg-dark-muted line-through' : 'text-fg-default dark:text-fg-dark-default'}`}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>

          <Link to="/app/profile"
            className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
            Edit profile <HiOutlineArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      {stats && (
        <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
          <div className={sectionHeader}>
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Stats</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-border-default dark:divide-border-dark-default">
            {[
              { label: 'Views',     value: stats.profile_views },
              { label: 'Listings',  value: stats.total_listings },
              { label: 'Reviews',   value: stats.total_reviews },
              { label: 'Rep score', value: stats.reputation_score },
            ].map((s) => (
              <div key={s.label} className="px-3 py-2.5 flex flex-col gap-0.5">
                <span className="text-[16px] font-semibold text-fg-default dark:text-fg-dark-default leading-none">{s.value}</span>
                <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick actions ── */}
      <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className={sectionHeader}>
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Quick actions</span>
        </div>
        <div className="py-1">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <Link key={a.href} to={a.href}
                className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors">
                <Icon className="w-3.5 h-3.5 shrink-0" /> {a.label}
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── My listings ── */}
      {myListings.length > 0 && (
        <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
          <div className={sectionHeader}>
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">My listings</span>
            <Link to="/app/listings" className="text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT hover:underline">Manage</Link>
          </div>
          <div className="py-1">
            {myListings.slice(0, 4).map((l) => (
              <Link key={l.id} to={`/app/listings/${l.id}`}
                className="flex items-center gap-2.5 px-3 py-2 group hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.is_active ? 'bg-success-fg dark:bg-success-dark-fg' : 'bg-border-default dark:bg-border-dark-default'}`} />
                <span className="text-[12px] text-fg-muted dark:text-fg-dark-muted group-hover:text-fg-default dark:group-hover:text-fg-dark-default truncate flex-1 transition-colors">
                  {l.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills ── */}
      {user?.skills && user.skills.length > 0 && (
        <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
          <div className={sectionHeader}>
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Skills</span>
            <Link to="/app/settings" className="text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT hover:underline">Manage</Link>
          </div>
          <div className="p-3 flex flex-wrap gap-1.5">
            {user.skills.slice(0, 8).map((s: { id: string; name: string }) => (
              <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
                {s.name}
              </span>
            ))}
            {user.skills.length > 8 && (
              <span className="text-[11px] px-2 py-0.5 text-brand dark:text-brand-dark-DEFAULT">+{user.skills.length - 8}</span>
            )}
          </div>
        </section>
      )}

    </aside>
  )
}
