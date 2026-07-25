import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlineChatBubbleOvalLeft, HiOutlineStar, HiOutlineRectangleStack,
  HiOutlineUserPlus, HiOutlineCheckBadge, HiOutlineMegaphone, HiOutlineCheck,
} from 'react-icons/hi2'
import { notificationsService, type Notification } from '../../services/notifications'

type NotifType = 'message' | 'review' | 'listing' | 'connection' | 'badge' | 'system'

const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  message:    { icon: HiOutlineChatBubbleOvalLeft, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
  review:     { icon: HiOutlineStar,               color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
  listing:    { icon: HiOutlineRectangleStack,      color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
  connection: { icon: HiOutlineUserPlus,            color: 'text-[#8250df] dark:text-[#a371f7]', bg: 'bg-[#fbefff] dark:bg-[#1e0a33]' },
  badge:      { icon: HiOutlineCheckBadge,          color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
  system:     { icon: HiOutlineMegaphone,           color: 'text-[#636c76] dark:text-[#848d97]', bg: 'bg-[#f6f8fa] dark:bg-[#21262d]' },
}

function getIcon(type: string) {
  return iconMap[type] ?? iconMap.system
}

const filters = ['All', 'Unread', 'Messages', 'Reviews', 'Listings'] as const

function formatTime(iso: string) {
  const d = new Date(iso)
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsService.getAll().then((res) => { setItems(res.items); setLoading(false) })
  }, [])

  const unreadCount = items.filter((n) => !n.is_read).length

  const markRead = async (id: string) => {
    await notificationsService.markRead(id)
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await notificationsService.markAllRead()
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const filtered = items.filter((n) => {
    if (filter === 'Unread') return !n.is_read
    if (filter === 'Messages') return n.type === 'message'
    if (filter === 'Reviews') return n.type === 'review'
    if (filter === 'Listings') return n.type === 'listing'
    return true
  })

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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

      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f6f8fa] dark:divide-[#21262d]">
            {filtered.map((n) => {
              const meta = getIcon(n.type)
              const Icon = meta.icon
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={clsx(
                    'w-full flex items-start gap-3 px-5 py-4 transition-colors text-left',
                    !n.is_read ? 'bg-[#f6f8fa] dark:bg-[#161b22]' : 'hover:bg-[#f6f8fa]/50 dark:hover:bg-[#21262d]/50',
                  )}
                >
                  <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
                    <Icon className={clsx('w-4 h-4', meta.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-[13px] leading-snug', !n.is_read ? 'font-semibold text-[#1f2328] dark:text-[#e6edf3]' : 'text-[#636c76] dark:text-[#848d97]')}>
                      {n.title}
                    </p>
                    {n.body && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5 line-clamp-1">{n.body}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">{formatTime(n.created_at)}</span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#0969da] dark:bg-[#2f81f7] shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
