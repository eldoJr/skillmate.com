import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineRectangleStack,
  HiOutlineArrowPath,
  HiOutlinePause,
  HiOutlinePlay,
} from 'react-icons/hi2'
import { listingsService, type Listing } from '../../services/listings'

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'negotiable'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

const dot = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT'
const sectionHeader = 'px-3 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5'

function ListingRow({ listing, onToggle, onDelete }: {
  listing: Listing
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setToggling(true)
    await onToggle(listing.id)
    setToggling(false)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    await onDelete(listing.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        'border border-border-default dark:border-border-dark-default transition-all duration-150 bg-canvas-overlay dark:bg-canvas-dark-default',
        !listing.is_active && 'opacity-60 hover:opacity-100',
      )}
    >
      {/* Active strip */}
      {listing.is_active && <div className="h-[2px] bg-brand dark:bg-brand-dark-DEFAULT" />}

      {/* Main row */}
      <div
        onClick={() => navigate(`/app/listings/${listing.id}`)}
        className="flex items-start gap-4 px-4 py-3 cursor-pointer hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors group"
      >
        {/* Status dot */}
        <div className="pt-[5px] shrink-0">
          <span className={clsx(
            'block w-2 h-2 rounded-full',
            listing.is_active ? 'bg-success-fg dark:bg-success-dark-fg' : 'bg-border-default dark:bg-border-dark-default',
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + price */}
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[12px] font-semibold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors leading-snug">
              {listing.title}
            </p>
            <span className="font-mono text-[13px] font-bold text-fg-default dark:text-fg-dark-default shrink-0">
              {formatPrice(listing)}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-1 line-clamp-1 leading-relaxed">
              {listing.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
              {listing.category}
            </span>
            <span className={clsx(
              'font-mono text-[8px] tracking-wide uppercase px-1.5 py-0.5 border',
              listing.is_active
                ? 'text-success-fg dark:text-success-dark-fg border-success-muted dark:border-success-dark-muted'
                : 'text-fg-muted dark:text-fg-dark-muted border-border-default dark:border-border-dark-default',
            )}>
              {listing.is_active ? 'active' : 'paused'}
            </span>
            {listing.delivery_days && (
              <span className="flex items-center gap-1 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                <HiOutlineClock className="w-3 h-3" />{listing.delivery_days}d
              </span>
            )}
            <span className="flex items-center gap-1 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted capitalize">
              <HiOutlineTag className="w-3 h-3" />{listing.listing_type}
            </span>
            <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted ml-auto">
              {timeAgo(listing.created_at)}
            </span>
          </div>

          {/* Skills */}
          {listing.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {listing.skills.slice(0, 6).map((s) => (
                <span key={s.id} className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
                  {s.name}
                </span>
              ))}
              {listing.skills.length > 6 && (
                <span className="font-mono text-[8px] text-brand dark:text-brand-dark-DEFAULT">+{listing.skills.length - 6}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-border-default dark:border-border-dark-default divide-x divide-border-default dark:divide-border-dark-default">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[9px] tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-50',
            listing.is_active
              ? 'text-fg-muted dark:text-fg-dark-muted hover:text-white hover:bg-neutral-emphasis dark:hover:bg-neutral-dark-emphasis'
              : 'text-fg-muted dark:text-fg-dark-muted hover:text-white hover:bg-success-emphasis dark:hover:bg-success-dark-emphasis',
          )}
        >
          {toggling
            ? <HiOutlineArrowPath className="w-3 h-3 animate-spin" />
            : listing.is_active
              ? <><HiOutlinePause className="w-3 h-3" /> pause</>
              : <><HiOutlinePlay className="w-3 h-3" /> activate</>
          }
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/app/listings/${listing.id}/edit`) }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[9px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:text-white hover:bg-brand dark:hover:bg-brand-dark-DEFAULT transition-colors duration-150 cursor-pointer"
        >
          <HiOutlinePencilSquare className="w-3 h-3" /> edit
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/app/listings/${listing.id}`) }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[9px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:text-white hover:bg-brand dark:hover:bg-brand-dark-DEFAULT transition-colors duration-150 cursor-pointer"
        >
          <HiOutlineEye className="w-3 h-3" /> view
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 flex items-center justify-center py-2 font-mono text-[9px] tracking-wide text-danger-fg dark:text-danger-dark-fg hover:text-white hover:bg-danger-emphasis dark:hover:bg-danger-dark-emphasis transition-colors duration-150 cursor-pointer disabled:opacity-50"
        >
          {deleting
            ? <HiOutlineArrowPath className="w-3 h-3 animate-spin" />
            : <HiOutlineTrash className="w-3 h-3" />
          }
        </button>
      </div>
    </motion.div>
  )
}

export default function ListingsPage() {
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')

  useEffect(() => {
    listingsService.getMine().then((data) => { setListings(data); setLoading(false) })
  }, [])

  const toggleStatus = async (id: string) => {
    const updated = await listingsService.toggle(id)
    setListings((prev) => prev.map((l) => l.id === id ? updated : l))
  }

  const remove = async (id: string) => {
    await listingsService.remove(id)
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const activeCount = listings.filter((l) => l.is_active).length
  const pausedCount = listings.length - activeCount

  const filtered = listings.filter((l) => {
    if (filter === 'active') return l.is_active
    if (filter === 'paused') return !l.is_active
    return true
  })

  return (
    <div className="flex gap-6 items-start">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Header */}
        <div className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">my listings</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
              {loading ? '—' : `${listings.length} total · ${activeCount} active · ${pausedCount} paused`}
            </p>
            <Link
              to="/app/listings/new"
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT hover:bg-brand-hover dark:hover:bg-brand-dark-hover text-white transition-colors duration-150"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5" />
              new listing
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        {!loading && listings.length > 0 && (
          <div className="flex border border-border-default dark:border-border-dark-default">
            {(['all', 'active', 'paused'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'flex-1 py-2 font-mono text-[9px] tracking-widest uppercase transition-all duration-150 cursor-pointer border-r border-border-default dark:border-border-dark-default last:border-r-0 border-b-2',
                  filter === f
                    ? 'border-b-brand dark:border-b-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                    : 'border-b-transparent text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                )}
              >
                {f} {f === 'all' ? `(${listings.length})` : f === 'active' ? `(${activeCount})` : `(${pausedCount})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="border border-border-default dark:border-border-dark-default divide-y divide-border-default dark:divide-border-dark-default">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-4 animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-48 bg-border-default dark:bg-border-dark-default" />
                  <div className="h-2.5 w-16 bg-border-default dark:bg-border-dark-default" />
                </div>
                <div className="h-2 w-full bg-border-default dark:bg-border-dark-default" />
                <div className="h-2 w-2/3 bg-border-default dark:bg-border-dark-default" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-4 w-16 bg-border-default dark:bg-border-dark-default" />
                  <div className="h-4 w-20 bg-border-default dark:bg-border-dark-default" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="border border-border-default dark:border-border-dark-default px-6 py-16 text-center">
            <HiOutlineRectangleStack className="w-8 h-8 text-fg-muted dark:text-fg-dark-muted mx-auto mb-3" />
            <p className="font-mono text-[11px] text-fg-default dark:text-fg-dark-default mb-1">no listings yet</p>
            <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mb-4">
              create your first listing to start offering your skills
            </p>
            <Link
              to="/app/listings/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover transition-colors"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5" />
              create listing
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-border-default dark:border-border-dark-default px-6 py-10 text-center">
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
              no {filter} listings
            </p>
          </div>
        ) : (
          <motion.div layout className="space-y-2">
            <AnimatePresence>
              {filtered.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  onToggle={toggleStatus}
                  onDelete={remove}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-4 w-[220px] shrink-0">

        {/* Stats */}
        <section className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">overview</span>
          </div>
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {[
              { label: 'total',  value: listings.length, accent: false },
              { label: 'active', value: activeCount,     accent: true },
              { label: 'paused', value: pausedCount,     accent: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="font-mono text-[9px] tracking-wide text-fg-muted dark:text-fg-dark-muted uppercase">{s.label}</span>
                <span className={clsx(
                  'font-mono text-[15px] font-semibold leading-none',
                  s.accent ? 'text-brand dark:text-brand-dark-DEFAULT' : 'text-fg-default dark:text-fg-dark-default',
                )}>
                  {loading ? '—' : s.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">actions</span>
          </div>
          <div className="py-1">
            <Link
              to="/app/listings/new"
              className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT transition-all duration-150"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5 shrink-0" />
              new listing
            </Link>
            <Link
              to="/app/explore"
              className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT transition-all duration-150"
            >
              <HiOutlineEye className="w-3.5 h-3.5 shrink-0" />
              browse marketplace
            </Link>
          </div>
        </section>

        {/* Tips */}
        <section className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">tips</span>
          </div>
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {[
              'add a clear title and description to get more views',
              'tag relevant skills to appear in more searches',
              'set a competitive price to attract your first clients',
              'keep your listing active to stay visible',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5">
                <span className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </section>

      </aside>
    </div>
  )
}
