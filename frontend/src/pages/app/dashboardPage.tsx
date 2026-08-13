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
    {
      label: 'profile views',
      value: stats?.profile_views ?? 0,
      icon: HiOutlineEye,
      suffix: '',
    },
    {
      label: 'active listings',
      value: activeListings,
      icon: HiOutlineRectangleStack,
      suffix: '',
    },
    {
      label: 'unread messages',
      value: unreadMessages,
      icon: HiOutlineChatBubbleOvalLeft,
      suffix: '',
    },
    {
      label: 'rep score',
      value: stats?.reputation_score ?? 0,
      icon: HiOutlineBolt,
      suffix: 'pts',
    },
  ]

  return (
    <div className="flex gap-6 items-start">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Hero */}
        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-4 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">workspace</span>
          </div>
          <div className="px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-1">
                {greeting}
              </p>
              <h1 className="font-mono text-[18px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-tight">
                <span className="text-[#e8490f] dark:text-[#ff6b35]">&gt; </span>{firstName}
              </h1>
              <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97] mt-1">
                {unreadMessages > 0
                  ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''} waiting`
                  : 'workspace is up to date'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/listings/new"
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] text-white transition-colors duration-150"
              >
                <HiOutlinePlusCircle className="w-3.5 h-3.5" />
                new listing
              </Link>
              <Link
                to="/app/explore"
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors duration-150"
              >
                explore
                <HiOutlineArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#e2e4e8] dark:border-[#1e2228] divide-x divide-[#e2e4e8] dark:divide-[#1e2228]">
          {statCards.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`px-4 py-3 flex flex-col gap-1 ${i >= 2 ? 'border-t border-[#e2e4e8] dark:border-[#1e2228] sm:border-t-0' : ''}`}>
                <div className="flex items-center justify-between">
                  <Icon className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97]" />
                  {loading && <HiOutlineArrowPath className="w-3 h-3 text-[#636c76] dark:text-[#848d97] animate-spin" />}
                </div>
                <p className="font-mono text-[20px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-none">
                  {s.value}<span className="text-[11px] text-[#636c76] dark:text-[#848d97] ml-0.5">{s.suffix}</span>
                </p>
                <p className="font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] uppercase">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Recent listings */}
        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
              <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">recent listings</span>
            </div>
            <Link to="/app/explore" className="font-mono text-[9px] tracking-wide text-[#e8490f] dark:text-[#ff6b35] hover:underline flex items-center gap-1">
              <span>&gt;</span> view all
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-6 flex items-center justify-center">
              <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
            </div>
          ) : recentListings.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">no listings yet</p>
              <Link to="/app/explore" className="font-mono text-[10px] text-[#e8490f] dark:text-[#ff6b35] hover:underline mt-1 inline-block">&gt; explore skills</Link>
            </div>
          ) : (
            <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/app/listings/${listing.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35] group"
                >
                  <Avatar
                    name={`${listing.owner.first_name} ${listing.owner.last_name}`}
                    src={mediaUrl(listing.owner.avatar_url)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate group-hover:text-[#e8490f] dark:group-hover:text-[#ff6b35] transition-colors">
                      {listing.title}
                    </p>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5 truncate">
                      {listing.owner.first_name} {listing.owner.last_name}
                      {listing.owner.university ? ` · ${listing.owner.university}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                      {formatPrice(listing)}
                    </p>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">
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
          <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
            <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
                <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">activity</span>
              </div>
              <Link to="/app/notifications" className="font-mono text-[9px] tracking-wide text-[#e8490f] dark:text-[#ff6b35] hover:underline flex items-center gap-1">
                <span>&gt;</span> all
              </Link>
            </div>
            <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
              {notifications.map((n) => {
                const Icon = notifIcon(n.type)
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-l-2 ${!n.is_read ? 'border-l-[#e8490f] dark:border-l-[#ff6b35] bg-[#e8490f05] dark:bg-[#ff6b3508]' : 'border-l-transparent'}`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-[#1f2328] dark:text-[#e6edf3] leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5 truncate">{n.body}</p>
                      )}
                    </div>
                    <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] shrink-0 whitespace-nowrap">
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
