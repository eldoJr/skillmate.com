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
  message:    { icon: HiOutlineChatBubbleOvalLeft, label: 'message',    accent: 'text-[#e8490f] dark:text-[#ff6b35]' },
  review:     { icon: HiOutlineStar,               label: 'review',     accent: 'text-[#d29922]' },
  listing:    { icon: HiOutlineRectangleStack,      label: 'listing',    accent: 'text-[#22c55e]' },
  connection: { icon: HiOutlineUserPlus,            label: 'connection', accent: 'text-[#a371f7]' },
  badge:      { icon: HiOutlineCheckBadge,          label: 'badge',      accent: 'text-[#22c55e]' },
  system:     { icon: HiOutlineMegaphone,           label: 'system',     accent: 'text-[#636c76] dark:text-[#848d97]' },
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
    if (d.toDateString() === today.toDateString()) label = 'today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'yesterday'
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
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 font-mono text-[9px] bg-[#e8490f] dark:bg-[#ff6b35] text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
            {items.length} notification{items.length !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
            >
              <HiOutlineCheck className="w-3 h-3" />
              mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center border-b border-[#e2e4e8] dark:border-[#1e2228] overflow-hidden pb-px">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2',
              filter === f
                ? 'border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35]'
                : 'border-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
            )}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 font-mono text-[8px] text-[#e8490f] dark:text-[#ff6b35]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no notifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Date label */}
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-[#e2e4e8] dark:bg-[#1e2228]" />
              </div>

              <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
                {group.items.map((n, i) => {
                  const meta = typeMap[n.type] ?? typeMap.system
                  const Icon = meta.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={clsx(
                        'w-full flex items-start gap-3 px-4 py-3 transition-colors text-left border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0',
                        !n.is_read
                          ? 'bg-[#f6f8fa] dark:bg-[#0d1117] hover:bg-[#f0f2f4] dark:hover:bg-[#111316] cursor-pointer'
                          : 'bg-white dark:bg-transparent hover:bg-[#f6f8fa]/50 dark:hover:bg-[#0d1117]/50 cursor-default',
                      )}
                    >
                      {/* Unread indicator */}
                      <div className="flex items-center justify-center w-4 shrink-0 mt-0.5">
                        {!n.is_read
                          ? <span className="w-1.5 h-1.5 bg-[#e8490f] dark:bg-[#ff6b35]" />
                          : <span className="w-1.5 h-1.5" />
                        }
                      </div>

                      {/* Icon */}
                      <div className={clsx('shrink-0 mt-0.5', meta.accent)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'font-mono text-[10px] leading-snug',
                          !n.is_read
                            ? 'font-medium text-[#1f2328] dark:text-[#e6edf3]'
                            : 'text-[#636c76] dark:text-[#848d97]',
                        )}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5 line-clamp-1">
                            {n.body}
                          </p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                          {formatTime(n.created_at)}
                        </span>
                        <span className={clsx(
                          'font-mono text-[8px] tracking-wide border px-1.5 py-0.5',
                          meta.accent,
                          'border-current opacity-60',
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
