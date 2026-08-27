import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineRectangleStack,
  HiOutlineEye,
  HiOutlineBolt,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import DashboardRightbar from '../../components/app/dashboardRightbar'
import { useAuth } from '../../contexts/AuthContext'
import { listingsService, type Listing } from '../../services/listings'
import { usersService, type ProfileCompletion, type ProfileStats } from '../../services/users'
import { messagesService } from '../../services/messages'
import { notificationsService, type Notification } from '../../services/notifications'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
function mediaUrl(p: string | null | undefined) {
  if (!p) return undefined
  return p.startsWith('http') ? p : `${BACKEND_URL}${p}`
}

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function notifIcon(type: string) {
  if (type.includes('message')) return HiOutlineChatBubbleOvalLeft
  if (type.includes('listing')) return HiOutlineRectangleStack
  if (type.includes('proposal')) return HiOutlineClipboardDocumentList
  return HiOutlineBolt
}

const sectionHeader = 'px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between'
const dot = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT'

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentListings, setRecentListings] = useState<Listing[]>([])
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listingsService.getAll({ page_size: 5 }).then((r) => setRecentListings(r.items)),
      listingsService.getMine().then(setMyListings),
      usersService.getCompletion().then(setCompletion),
      usersService.getMyStats().then(setStats),
      messagesService.getUnreadCount().then(setUnreadMessages),
      notificationsService.getAll(1).then((r) => setNotifications(r.items.slice(0, 5))),
    ]).finally(() => setLoading(false))
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'
  const activeListings = myListings.filter((l) => l.is_active).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'good morning' : hour < 18 ? 'good afternoon' : 'good evening'

  const statCards = [
    { label: 'profile views',   value: stats?.profile_views ?? 0,      icon: HiOutlineEye,               suffix: '' },
    { label: 'active listings', value: activeListings,                  icon: HiOutlineRectangleStack,    suffix: '' },
    { label: 'unread messages', value: unreadMessages,                  icon: HiOutlineChatBubbleOvalLeft, suffix: '' },
    { label: 'rep score',       value: stats?.reputation_score ?? 0,   icon: HiOutlineBolt,              suffix: 'pts' },
  ]

  return (
    <div className="flex gap-6 items-start">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Hero */}
        <div className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <div className="flex items-center gap-1.5">
              <span className={dot} />
              <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">workspace</span>
            </div>
          </div>
          <div className="px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase mb-1">
                {greeting}
              </p>
              <h1 className="font-mono text-[18px] font-semibold text-fg-default dark:text-fg-dark-default leading-tight">
                <span className="text-brand dark:text-brand-dark-DEFAULT">&gt; </span>{firstName}
              </h1>
              <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted mt-1">
                {unreadMessages > 0
                  ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''} waiting`
                  : 'workspace is up to date'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/listings/new"
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT hover:bg-brand-hover dark:hover:bg-brand-dark-hover text-white transition-colors duration-150"
              >
                <HiOutlinePlusCircle className="w-3.5 h-3.5" />
                new listing
              </Link>
              <Link
                to="/app/explore"
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors duration-150"
              >
                explore
                <HiOutlineArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border-default dark:border-border-dark-default divide-x divide-border-default dark:divide-border-dark-default">
          {statCards.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`px-4 py-3 flex flex-col gap-1 ${i >= 2 ? 'border-t border-border-default dark:border-border-dark-default sm:border-t-0' : ''}`}>
                <div className="flex items-center justify-between">
                  <Icon className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted" />
                  {loading && <HiOutlineArrowPath className="w-3 h-3 text-fg-muted dark:text-fg-dark-muted animate-spin" />}
                </div>
                <p className="font-mono text-[20px] font-semibold text-fg-default dark:text-fg-dark-default leading-none">
                  {s.value}<span className="text-[11px] text-fg-muted dark:text-fg-dark-muted ml-0.5">{s.suffix}</span>
                </p>
                <p className="font-mono text-[9px] tracking-wide text-fg-muted dark:text-fg-dark-muted uppercase">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Recent listings */}
        <div className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <div className="flex items-center gap-1.5">
              <span className={dot} />
              <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">recent listings</span>
            </div>
            <Link to="/app/explore" className="font-mono text-[9px] tracking-wide text-brand dark:text-brand-dark-DEFAULT hover:underline flex items-center gap-1">
              <span>&gt;</span> view all
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-6 flex items-center justify-center">
              <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
            </div>
          ) : recentListings.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">no listings yet</p>
              <Link to="/app/explore" className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline mt-1 inline-block">&gt; explore skills</Link>
            </div>
          ) : (
            <div className="divide-y divide-border-default dark:divide-border-dark-default">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/app/listings/${listing.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT group"
                >
                  <Avatar
                    name={`${listing.owner.first_name} ${listing.owner.last_name}`}
                    src={mediaUrl(listing.owner.avatar_url)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default truncate group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors">
                      {listing.title}
                    </p>
                    <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5 truncate">
                      {listing.owner.first_name} {listing.owner.last_name}
                      {listing.owner.university ? ` · ${listing.owner.university}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[11px] font-semibold text-fg-default dark:text-fg-dark-default">
                      {formatPrice(listing)}
                    </p>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
                      {listing.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        {notifications.length > 0 && (
          <div className="border border-border-default dark:border-border-dark-default">
            <div className={sectionHeader}>
              <div className="flex items-center gap-1.5">
                <span className={dot} />
                <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">activity</span>
              </div>
              <Link to="/app/notifications" className="font-mono text-[9px] tracking-wide text-brand dark:text-brand-dark-DEFAULT hover:underline flex items-center gap-1">
                <span>&gt;</span> all
              </Link>
            </div>
            <div className="divide-y divide-border-default dark:divide-border-dark-default">
              {notifications.map((n) => {
                const Icon = notifIcon(n.type)
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-l-2 ${!n.is_read ? 'border-l-brand dark:border-l-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted' : 'border-l-transparent'}`}
                  >
                    <Icon className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-fg-default dark:text-fg-dark-default leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5 truncate">{n.body}</p>
                      )}
                    </div>
                    <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted shrink-0 whitespace-nowrap">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Right bar ── */}
      <DashboardRightbar
        user={user}
        completion={completion}
        stats={stats}
        myListings={myListings}
      />

    </div>
  )
}
