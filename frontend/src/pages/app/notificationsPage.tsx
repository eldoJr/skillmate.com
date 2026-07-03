import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineChatBubbleOvalLeft,
  HiOutlineStar,
  HiOutlineRectangleStack,
  HiOutlineUserPlus,
  HiOutlineCheckBadge,
  HiOutlineMegaphone,
  HiOutlineCheck,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

type NotifType = 'message' | 'review' | 'listing' | 'connection' | 'badge' | 'system'

interface Notification {
  id: string; type: NotifType; title: string; description: string
  avatar?: string; name?: string; time: string; read: boolean; link?: string
}

const iconMap: Record<NotifType, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  message:    { icon: HiOutlineChatBubbleOvalLeft, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
  review:     { icon: HiOutlineStar,               color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
  listing:    { icon: HiOutlineRectangleStack,      color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
  connection: { icon: HiOutlineUserPlus,            color: 'text-[#8250df] dark:text-[#a371f7]', bg: 'bg-[#fbefff] dark:bg-[#1e0a33]' },
  badge:      { icon: HiOutlineCheckBadge,          color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
  system:     { icon: HiOutlineMegaphone,           color: 'text-[#636c76] dark:text-[#848d97]', bg: 'bg-[#f6f8fa] dark:bg-[#21262d]' },
}

const notifications: Notification[] = [
  { id: '1', type: 'message', title: 'New message', description: 'Amara K. sent you a message about your React listing.', avatar: 'https://i.pravatar.cc/100?img=1', name: 'Amara K.', time: '2m', read: false, link: '/app/messages' },
  { id: '2', type: 'review', title: 'New review', description: 'James M. left you a 5-star review for your tutoring session.', avatar: 'https://i.pravatar.cc/100?img=8', name: 'James M.', time: '30m', read: false, link: '/app/profile' },
  { id: '3', type: 'listing', title: 'Listing viewed', description: 'Your "React & TypeScript Development" listing was viewed 12 times today.', time: '1h', read: false, link: '/app/listings' },
  { id: '4', type: 'connection', title: 'New connection', description: 'Sipho D. wants to connect with you.', avatar: 'https://i.pravatar.cc/100?img=12', name: 'Sipho D.', time: '2h', read: true },
  { id: '5', type: 'message', title: 'New message', description: 'Leila N. replied to your inquiry about the design request.', avatar: 'https://i.pravatar.cc/100?img=9', name: 'Leila N.', time: '3h', read: true, link: '/app/messages' },
  { id: '6', type: 'badge', title: 'Badge earned', description: 'You earned the "Top Rated" badge for maintaining a 4.8+ rating.', time: '1d', read: true, link: '/app/profile' },
  { id: '7', type: 'listing', title: 'New inquiry', description: 'Kwame B. sent an inquiry about your Python listing.', avatar: 'https://i.pravatar.cc/100?img=11', name: 'Kwame B.', time: '1d', read: true, link: '/app/listings' },
  { id: '8', type: 'system', title: 'Profile tip', description: 'Add a portfolio link to increase your profile strength to 80%.', time: '2d', read: true, link: '/app/profile' },
]

const filters = ['All', 'Unread', 'Messages', 'Reviews', 'Listings'] as const

export default function NotificationsPage() {
  const [items, setItems] = useState(notifications)
  const [filter, setFilter] = useState<string>('All')

  const unreadCount = items.filter((n) => !n.read).length
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))

  const filtered = items.filter((n) => {
    if (filter === 'All') return true
    if (filter === 'Unread') return !n.read
    if (filter === 'Messages') return n.type === 'message'
    if (filter === 'Reviews') return n.type === 'review'
    if (filter === 'Listings') return n.type === 'listing'
    return true
  })

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Notifications</h2>
          {unreadCount > 0 && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer"
          >
            <HiOutlineCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0',
              filter === f
                ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
                : 'text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d] hover:bg-white dark:hover:bg-[#161b22]',
            )}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f6f8fa] dark:divide-[#21262d]">
            {filtered.map((n) => {
              const meta = iconMap[n.type]
              const Icon = meta.icon
              return (
                <Link
                  key={n.id}
                  to={n.link || '#'}
                  onClick={() => markRead(n.id)}
                  className={clsx(
                    'flex items-start gap-3 px-5 py-4 transition-colors',
                    !n.read ? 'bg-[#f6f8fa] dark:bg-[#161b22]' : 'hover:bg-[#f6f8fa]/50 dark:hover:bg-[#21262d]/50',
                  )}
                >
                  {n.avatar ? (
                    <Avatar name={n.name} src={n.avatar} size="sm" />
                  ) : (
                    <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
                      <Icon className={clsx('w-4 h-4', meta.color)} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-[13px] leading-snug', !n.read ? 'font-semibold text-[#1f2328] dark:text-[#e6edf3]' : 'text-[#636c76] dark:text-[#848d97]')}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5 line-clamp-1">{n.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">{n.time}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#0969da] dark:bg-[#2f81f7] shrink-0" />}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
