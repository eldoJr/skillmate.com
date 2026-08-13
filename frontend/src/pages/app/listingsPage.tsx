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
        'border border-[#e2e4e8] dark:border-[#1e2228] transition-all duration-150',
        !listing.is_active && 'opacity-60 hover:opacity-100',
      )}
    >
      {/* Main row */}
      <div
        onClick={() => navigate(`/app/listings/${listing.id}`)}
        className="flex items-start gap-4 px-4 py-3 cursor-pointer hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors group"
      >
        {/* Status dot */}
        <div className="pt-1 shrink-0">
          <span className={clsx(
            'block w-1.5 h-1.5 rounded-full',
            listing.is_active ? 'bg-[#22c55e]' : 'bg-[#d0d7de] dark:bg-[#30363d]',
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#e8490f] dark:group-hover:text-[#ff6b35] transition-colors leading-snug">
              {listing.title}
            </p>
            <span className="font-mono text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3] shrink-0">
              {formatPrice(listing)}
            </span>
          </div>

          {listing.description && (
            <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-1 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">
              {listing.category}
            </span>
            {listing.delivery_days && (
              <span className="flex items-center gap-1 font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                <HiOutlineClock className="w-3 h-3" />
                {listing.delivery_days}d delivery
              </span>
            )}
            <span className="flex items-center gap-1 font-mono text-[9px] text-[#636c76] dark:text-[#848d97] capitalize">
              <HiOutlineTag className="w-3 h-3" />
              {listing.listing_type}
            </span>
            <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
              {timeAgo(listing.created_at)}
            </span>
          </div>

          {listing.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {listing.skills.slice(0, 5).map((s) => (
                <span key={s.id} className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">
                  {s.name}
                </span>
              ))}
              {listing.skills.length > 5 && (
                <span className="font-mono text-[8px] text-[#e8490f] dark:text-[#ff6b35]">+{listing.skills.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-[#e2e4e8] dark:border-[#1e2228] divide-x divide-[#e2e4e8] dark:divide-[#1e2228]">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[9px] tracking-wide transition-colors duration-150 cursor-pointer disabled:opacity-50',
            'text-[#636c76] dark:text-[#848d97] hover:text-white hover:bg-[#e8490f] dark:hover:bg-[#ff6b35]',
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
          className="flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-white hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] transition-colors duration-150 cursor-pointer"
        >
          <HiOutlinePencilSquare className="w-3 h-3" /> edit
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/app/listings/${listing.id}`) }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-white hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] transition-colors duration-150 cursor-pointer"
        >
          <HiOutlineEye className="w-3 h-3" /> view
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 flex items-center justify-center py-2 font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-white hover:bg-[#d1242f] dark:hover:bg-[#f85149] transition-colors duration-150 cursor-pointer disabled:opacity-50"
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

  const activeCount  = listings.filter((l) => l.is_active).length
  const pausedCount  = listings.length - activeCount

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
        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">my listings</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
              {loading ? '—' : `${listings.length} total · ${activeCount} active · ${pausedCount} paused`}
            </p>
            <Link
              to="/app/listings/new"
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] text-white transition-colors duration-150"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5" />
              new listing
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        {!loading && listings.length > 0 && (
          <div className="flex border border-[#e2e4e8] dark:border-[#1e2228]">
            {(['all', 'active', 'paused'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'flex-1 py-2 font-mono text-[9px] tracking-widest uppercase transition-all duration-150 cursor-pointer border-r border-[#e2e4e8] dark:border-[#1e2228] last:border-r-0 border-b-2',
                  filter === f
                    ? 'border-b-[#e8490f] dark:border-b-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d] dark:bg-[#ff6b3510]'
                    : 'border-b-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117]',
                )}
              >
                {f} {f === 'all' ? `(${listings.length})` : f === 'active' ? `(${activeCount})` : `(${pausedCount})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-4 animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-48 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                  <div className="h-2.5 w-16 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                </div>
                <div className="h-2 w-full bg-[#e2e4e8] dark:bg-[#1e2228]" />
                <div className="h-2 w-2/3 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-4 w-16 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                  <div className="h-4 w-20 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] px-6 py-16 text-center">
            <HiOutlineRectangleStack className="w-8 h-8 text-[#636c76] dark:text-[#848d97] mx-auto mb-3" />
            <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] mb-1">no listings yet</p>
            <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mb-4">
              create your first listing to start offering your skills
            </p>
            <Link
              to="/app/listings/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] transition-colors"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5" />
              create listing
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] px-6 py-10 text-center">
            <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
              no {filter} listings
            </p>
          </div>
        ) : (
          <motion.div layout className="space-y-3">
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
        <section className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">overview</span>
          </div>
          <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
            {[
              { label: 'total',   value: listings.length },
              { label: 'active',  value: activeCount,  accent: true },
              { label: 'paused',  value: pausedCount },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] uppercase">{s.label}</span>
                <span className={clsx(
                  'font-mono text-[15px] font-semibold leading-none',
                  s.accent ? 'text-[#e8490f] dark:text-[#ff6b35]' : 'text-[#1f2328] dark:text-[#e6edf3]',
                )}>
                  {loading ? '—' : s.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">actions</span>
          </div>
          <div className="py-1">
            <Link
              to="/app/listings/new"
              className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35] transition-all duration-150"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5 shrink-0" />
              new listing
            </Link>
            <Link
              to="/app/explore"
              className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35] transition-all duration-150"
            >
              <HiOutlineEye className="w-3.5 h-3.5 shrink-0" />
              browse marketplace
            </Link>
          </div>
        </section>

        {/* Tips */}
        <section className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">tips</span>
          </div>
          <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
            {[
              'add a clear title and description to get more views',
              'tag relevant skills to appear in more searches',
              'set a competitive price to attract your first clients',
              'keep your listing active to stay visible',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5">
                <span className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35] shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </section>

      </aside>
    </div>
  )
}
