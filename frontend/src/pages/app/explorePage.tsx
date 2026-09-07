import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineCodeBracket,
  HiOutlinePaintBrush,
  HiOutlinePencilSquare,
  HiOutlineAcademicCap,
  HiOutlineVideoCamera,
  HiOutlineSpeakerWave,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowUpRight,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { listingsService, type Listing } from '../../services/listings'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
function mediaUrl(p: string | null | undefined) {
  if (!p) return undefined
  return p.startsWith('http') ? p : `${BACKEND_URL}${p}`
}

const categories = [
  { key: 'all',         label: 'All',        icon: HiOutlineSparkles },
  { key: 'Programming', label: 'Programming', icon: HiOutlineCodeBracket },
  { key: 'Design',      label: 'Design',      icon: HiOutlinePaintBrush },
  { key: 'Writing',     label: 'Writing',     icon: HiOutlinePencilSquare },
  { key: 'Tutoring',    label: 'Tutoring',    icon: HiOutlineAcademicCap },
  { key: 'Video',       label: 'Video',       icon: HiOutlineVideoCamera },
  { key: 'Music',       label: 'Music',       icon: HiOutlineSpeakerWave },
  { key: 'Data',        label: 'Data',        icon: HiOutlineChartBar },
] as const

type CategoryKey = typeof categories[number]['key']

const sortOptions = [
  { key: 'newest',     label: 'Newest' },
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
] as const

type SortKey = typeof sortOptions[number]['key']

const howItWorks = [
  { n: '01', text: 'Search for the skill you need' },
  { n: '02', text: 'Review profiles and ratings' },
  { n: '03', text: 'Message and agree on terms' },
  { n: '04', text: 'Get the work done' },
]

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

function ListingCard({ listing, onClick, onMessage }: {
  listing: Listing
  onClick: () => void
  onMessage: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onClick}
      className="group border border-border-default dark:border-border-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT rounded-xl overflow-hidden transition-all duration-150 cursor-pointer bg-canvas-overlay dark:bg-canvas-dark-default"
    >
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Avatar
          name={`${listing.owner.first_name} ${listing.owner.last_name}`}
          src={mediaUrl(listing.owner.avatar_url)}
          size="sm"
          showStatus={listing.is_active}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors truncate">
            {listing.owner.first_name} {listing.owner.last_name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {listing.owner.university && (
              <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted truncate">
                {listing.owner.university}
              </span>
            )}
            <span className={clsx(
              'text-[10px] font-medium px-1.5 py-px rounded-full border',
              listing.is_active
                ? 'text-success-fg dark:text-success-dark-fg border-success-muted dark:border-success-dark-muted'
                : 'text-fg-muted dark:text-fg-dark-muted border-border-default dark:border-border-dark-default',
            )}>
              {listing.is_active ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">
            {formatPrice(listing)}
          </p>
          <span className="text-[10px] px-1.5 py-px rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
            {listing.category}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default leading-snug mb-1 line-clamp-1">
          {listing.title}
        </p>
        <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted leading-relaxed line-clamp-2">
          {listing.description}
        </p>
      </div>

      {listing.skills.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {listing.skills.slice(0, 5).map((s) => (
            <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
              {s.name}
            </span>
          ))}
          {listing.skills.length > 5 && (
            <span className="text-[10px] text-brand dark:text-brand-dark-DEFAULT">+{listing.skills.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex border-t border-border-default dark:border-border-dark-default divide-x divide-border-default dark:divide-border-dark-default">
        <button
          onClick={onMessage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-fg-muted dark:text-fg-dark-muted hover:text-white hover:bg-brand dark:hover:bg-brand-dark-DEFAULT transition-colors duration-150 cursor-pointer"
        >
          <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
          Message
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-fg-muted dark:text-fg-dark-muted hover:text-fg-onEmphasis hover:bg-fg-default dark:hover:bg-fg-dark-default dark:hover:text-fg-default transition-colors duration-150 cursor-pointer"
        >
          View listing
          <HiOutlineArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeCategory, setActiveCategory] = useState<CategoryKey>(
    (searchParams.get('category') as CategoryKey) ?? 'all'
  )
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [sort, setSort] = useState<SortKey>('newest')
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = { page_size: 20 }
      if (activeCategory !== 'all') params.category = activeCategory
      if (search.trim()) params.search = search.trim()
      if (sort === 'price_asc') params.sort = 'price_asc'
      if (sort === 'price_desc') params.sort = 'price_desc'
      const res = await listingsService.getAll(params)
      setListings(res.items)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search, sort])

  useEffect(() => {
    const t = setTimeout(fetchListings, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [fetchListings])

  useEffect(() => {
    const p: Record<string, string> = {}
    if (activeCategory !== 'all') p.category = activeCategory
    if (search.trim()) p.search = search.trim()
    setSearchParams(p, { replace: true })
  }, [activeCategory, search, setSearchParams])

  return (
    <div className="flex gap-6 items-start">

      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Search bar */}
        <div className="flex items-center gap-2 border border-border-default dark:border-border-dark-default rounded-lg px-3 py-2 bg-canvas-overlay dark:bg-canvas-dark-default focus-within:ring-2 focus-within:ring-brand/30">
          {loading
            ? <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin shrink-0" />
            : <HiOutlineMagnifyingGlass className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted shrink-0" />
          }
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, students, listings…"
            className="flex-1 text-[13px] bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-fg-muted dark:text-fg-dark-muted hover:text-brand transition-colors cursor-pointer">
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1 border-l border-border-default dark:border-border-dark-default pl-2">
            {sortOptions.map((o) => (
              <button
                key={o.key}
                onClick={() => setSort(o.key)}
                className={clsx(
                  'px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer',
                  sort === o.key
                    ? 'text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                    : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon
            const active = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer border',
                  active
                    ? 'border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                    : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">
            {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''}`}
          </span>
          {(search || activeCategory !== 'all') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="text-[11px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer flex items-center gap-1"
            >
              <HiOutlineXMark className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {!loading && listings.length === 0 ? (
          <div className="border border-border-default dark:border-border-dark-default rounded-xl px-6 py-12 text-center">
            <p className="text-[13px] font-medium text-fg-default dark:text-fg-dark-default">No listings found</p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-1">Try a different search or category</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="mt-3 text-[12px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-border-default dark:border-border-dark-default rounded-xl animate-pulse">
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                      <div className="w-8 h-8 rounded-full bg-border-default dark:bg-border-dark-default shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 rounded bg-border-default dark:bg-border-dark-default" />
                        <div className="h-2.5 w-20 rounded bg-border-default dark:bg-border-dark-default" />
                      </div>
                      <div className="h-3 w-14 rounded bg-border-default dark:bg-border-dark-default shrink-0" />
                    </div>
                    <div className="px-4 pb-3 space-y-1.5">
                      <div className="h-3 w-full rounded bg-border-default dark:bg-border-dark-default" />
                      <div className="h-2.5 w-3/4 rounded bg-border-default dark:bg-border-dark-default" />
                    </div>
                    <div className="h-10 border-t border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset" />
                  </div>
                ))
              : listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => navigate(`/app/listings/${listing.id}`)}
                    onMessage={(e) => {
                      e.stopPropagation()
                      navigate(`/app/messages?partner=${listing.owner_id}`)
                    }}
                  />
                ))
            }
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:flex flex-col gap-4 w-[220px] shrink-0">

        <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Marketplace</span>
          </div>
          <div className="px-4 py-4 text-center border-b border-border-default dark:border-border-dark-default">
            <p className="text-[32px] font-semibold text-fg-default dark:text-fg-dark-default leading-none">
              {loading ? '—' : total}
            </p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-1">Active listings</p>
          </div>
          <div className="px-3 py-2">
            <Link
              to="/app/listings/new"
              className="flex items-center justify-between w-full px-3 py-2 text-[12px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors duration-150"
            >
              <span>Post a listing</span>
              <span className="text-brand dark:text-brand-dark-DEFAULT">+</span>
            </Link>
          </div>
        </section>

        <section className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">How it works</span>
          </div>
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {howItWorks.map((s) => (
              <div key={s.n} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-[11px] font-semibold text-brand dark:text-brand-dark-DEFAULT shrink-0 mt-0.5">{s.n}</span>
                <span className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </section>

      </aside>
    </div>
  )
}
