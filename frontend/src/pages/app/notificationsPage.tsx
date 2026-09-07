import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlineChatBubbleOvalLeft, HiOutlineStar, HiOutlineRectangleStack,
  HiOutlineUserPlus, HiOutlineCheckBadge, HiOutlineMegaphone,
  HiOutlineCheck, HiOutlineArrowPath,
} from 'react-icons/hi2'
import { notificationsService, type Notification } from '../../services/notifications'

const typeMap: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  accent: string
}> = {
  message:    { icon: HiOutlineChatBubbleOvalLeft, label: 'Message',    accent: 'text-brand dark:text-brand-dark-DEFAULT' },
  review:     { icon: HiOutlineStar,               label: 'Review',     accent: 'text-warning-fg dark:text-warning-dark-fg' },
  listing:    { icon: HiOutlineRectangleStack,      label: 'Listing',    accent: 'text-success-fg dark:text-success-dark-fg' },
  connection: { icon: HiOutlineUserPlus,            label: 'Connection', accent: 'text-accent-fg dark:text-accent-dark-fg' },
  badge:      { icon: HiOutlineCheckBadge,          label: 'Badge',      accent: 'text-success-fg dark:text-success-dark-fg' },
  system:     { icon: HiOutlineMegaphone,           label: 'System',     accent: 'text-fg-muted dark:text-fg-dark-muted' },
}

const filters = ['all', 'unread', 'message', 'review', 'listing'] as const
type Filter = typeof filters[number]

function formatTime(iso: string) {
  const d = new Date(iso)
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupByDate(items: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = []
  let lastLabel = ''
  for (const n of items) {
    const d = new Date(n.created_at)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    let label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    if (label !== lastLabel) { groups.push({ label, items: [] }); lastLabel = label }
    groups[groups.length - 1].items.push(n)
  }
  return groups
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [filter, setFilter] = useState<Filter>('all')
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
    if (filter === 'unread') return !n.is_read
    if (filter === 'message' || filter === 'review' || filter === 'listing') return n.type === filter
    return true
  })

  const grouped = groupByDate(filtered)

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between">
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-brand dark:bg-brand-dark-DEFAULT text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">
            {items.length} notification{items.length !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
            >
              <HiOutlineCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 text-[12px] font-medium rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer border',
              filter === f
                ? 'border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
            )}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] font-semibold text-brand dark:text-brand-dark-DEFAULT">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border-default dark:border-border-dark-default rounded-xl p-12 text-center">
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border-default dark:bg-border-dark-default" />
              </div>

              <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
                {group.items.map((n) => {
                  const meta = typeMap[n.type] ?? typeMap.system
                  const Icon = meta.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={clsx(
                        'w-full flex items-start gap-3 px-4 py-3 transition-colors text-left border-b border-border-default dark:border-border-dark-default last:border-0',
                        !n.is_read
                          ? 'bg-canvas-inset dark:bg-canvas-dark-inset hover:bg-canvas-subtle dark:hover:bg-canvas-dark-subtle cursor-pointer'
                          : 'bg-canvas-overlay dark:bg-canvas-dark-default hover:bg-canvas-inset/50 dark:hover:bg-canvas-dark-inset/50 cursor-default',
                      )}
                    >
                      <div className="flex items-center justify-center w-4 shrink-0 mt-1">
                        {!n.is_read
                          ? <span className="w-2 h-2 rounded-full bg-brand dark:bg-brand-dark-DEFAULT" />
                          : <span className="w-2 h-2" />
                        }
                      </div>

                      <div className={clsx('shrink-0 mt-0.5', meta.accent)}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-[12px] leading-snug',
                          !n.is_read
                            ? 'font-semibold text-fg-default dark:text-fg-dark-default'
                            : 'text-fg-muted dark:text-fg-dark-muted',
                        )}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5 line-clamp-1">
                            {n.body}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted">
                          {formatTime(n.created_at)}
                        </span>
                        <span className={clsx(
                          'text-[10px] font-medium px-1.5 py-px rounded-md border border-current opacity-70',
                          meta.accent,
                        )}>
                          {meta.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
