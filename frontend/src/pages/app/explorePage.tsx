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
  HiOutlineMapPin,
  HiOutlineArrowPath,
  HiOutlineXMark,
  HiOutlineFunnel,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { listingsService, type Listing } from '../../services/listings'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
function mediaUrl(p: string | null | undefined) {
  if (!p) return undefined
  return p.startsWith('http') ? p : `${BACKEND_URL}${p}`
}

const categories = [
  { key: 'all',         label: 'all',         icon: HiOutlineSparkles },
  { key: 'Programming', label: 'programming',  icon: HiOutlineCodeBracket },
  { key: 'Design',      label: 'design',       icon: HiOutlinePaintBrush },
  { key: 'Writing',     label: 'writing',      icon: HiOutlinePencilSquare },
  { key: 'Tutoring',    label: 'tutoring',     icon: HiOutlineAcademicCap },
  { key: 'Video',       label: 'video',        icon: HiOutlineVideoCamera },
  { key: 'Music',       label: 'music',        icon: HiOutlineSpeakerWave },
  { key: 'Data',        label: 'data',         icon: HiOutlineChartBar },
] as const

type CategoryKey = typeof categories[number]['key']

const sortOptions = [
  { key: 'newest',  label: 'newest' },
  { key: 'price_asc', label: 'price ↑' },
  { key: 'price_desc', label: 'price ↓' },
] as const

type SortKey = typeof sortOptions[number]['key']

const howItWorks = [
  { n: '01', text: 'search for the skill you need' },
  { n: '02', text: 'review profiles and ratings' },
  { n: '03', text: 'message and agree on terms' },
  { n: '04', text: 'get the work done' },
]

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'negotiable'
}

function ListingCard({ listing, onClick, onMessage }: {
  listing: Listing
  onClick: () => void
  onMessage: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onClick}
      className="group border border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f] dark:hover:border-[#ff6b35] transition-all duration-150 cursor-pointer bg-white dark:bg-[#0a0c0f]"
    >
      {/* Top row — avatar + meta + price */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Avatar
          name={`${listing.owner.first_name} ${listing.owner.last_name}`}
          src={mediaUrl(listing.owner.avatar_url)}
          size="sm"
          showStatus={listing.is_active}
        />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#e8490f] dark:group-hover:text-[#ff6b35] transition-colors truncate">
            {listing.owner.first_name} {listing.owner.last_name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {listing.owner.university && (
              <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">
                {listing.owner.university}
              </span>
            )}
            <span className={clsx(
              'font-mono text-[8px] tracking-wide uppercase px-1.5 py-px border',
              listing.is_active
                ? 'text-[#22c55e] border-[#22c55e]/30'
                : 'text-[#636c76] dark:text-[#848d97] border-[#e2e4e8] dark:border-[#1e2228]',
            )}>
              {listing.is_active ? 'available' : 'busy'}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
            {formatPrice(listing)}
          </p>
          <span className="font-mono text-[9px] px-1.5 py-px border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">
            {listing.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="font-mono text-[10px] text-[#1f2328] dark:text-[#e6edf3] font-medium leading-snug mb-1.5 line-clamp-1">
          {listing.title}
        </p>
        <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] leading-relaxed line-clamp-2">
          {listing.description}
        </p>
      </div>

      {/* Skills */}
      {listing.skills.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
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

      {/* Actions */}
      <div className="flex border-t border-[#e2e4e8] dark:border-[#1e2228] divide-x divide-[#e2e4e8] dark:divide-[#1e2228]">
        <button
          onClick={onMessage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-white hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] transition-colors duration-150 cursor-pointer"
        >
          <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
          message
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-white hover:bg-[#1f2328] dark:hover:bg-[#e6edf3] dark:hover:text-[#1f2328] transition-colors duration-150 cursor-pointer"
        >
          view listing
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

  // Sync URL params
  useEffect(() => {
    const p: Record<string, string> = {}
    if (activeCategory !== 'all') p.category = activeCategory
    if (search.trim()) p.search = search.trim()
    setSearchParams(p, { replace: true })
  }, [activeCategory, search, setSearchParams])

  const clearSearch = () => setSearch('')

  return (
    <div className="flex gap-6 items-start">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Search bar */}
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] flex items-center">
          <span className="px-3 font-mono text-[11px] text-[#e8490f] dark:text-[#ff6b35] select-none border-r border-[#e2e4e8] dark:border-[#1e2228] py-2.5">
            {loading ? '~' : '$'}
          </span>
          {loading && (
            <HiOutlineArrowPath className="ml-3 w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] animate-spin shrink-0" />
          )}
          {!loading && (
            <HiOutlineMagnifyingGlass className="ml-3 w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0" />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search skills, students, listings…"
            className="flex-1 px-3 py-2.5 font-mono text-[11px] tracking-wide bg-transparent text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none"
          />
          {search && (
            <button onClick={clearSearch} className="px-3 text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer">
              <HiOutlineXMark className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Sort */}
          <div className="border-l border-[#e2e4e8] dark:border-[#1e2228] flex">
            {sortOptions.map((o) => (
              <button
                key={o.key}
                onClick={() => setSort(o.key)}
                className={clsx(
                  'px-3 py-2.5 font-mono text-[9px] tracking-wide transition-colors cursor-pointer border-r border-[#e2e4e8] dark:border-[#1e2228] last:border-r-0',
                  sort === o.key
                    ? 'text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d] dark:bg-[#ff6b3510]'
                    : 'text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117]',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-0 border border-[#e2e4e8] dark:border-[#1e2228] overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon
            const active = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer border-r border-[#e2e4e8] dark:border-[#1e2228] last:border-r-0 border-b-2',
                  active
                    ? 'border-b-[#e8490f] dark:border-b-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d] dark:bg-[#ff6b3510]'
                    : 'border-b-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117]',
                )}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">
            {loading ? 'searching…' : `${total} result${total !== 1 ? 's' : ''}`}
          </span>
          {(search || activeCategory !== 'all') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35] hover:underline cursor-pointer flex items-center gap-1"
            >
              <HiOutlineXMark className="w-3 h-3" /> clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {!loading && listings.length === 0 ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] px-6 py-12 text-center">
            <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">no listings found</p>
            <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-1">try a different search or category</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="mt-3 font-mono text-[10px] text-[#e8490f] dark:text-[#ff6b35] hover:underline cursor-pointer"
            >
              &gt; clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-[#e2e4e8] dark:border-[#1e2228] animate-pulse">
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                      <div className="w-7 h-7 rounded-full bg-[#e2e4e8] dark:bg-[#1e2228] shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-28 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                        <div className="h-2 w-20 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                      </div>
                      <div className="h-3 w-14 bg-[#e2e4e8] dark:bg-[#1e2228] shrink-0" />
                    </div>
                    <div className="px-4 pb-3 space-y-1.5">
                      <div className="h-2.5 w-full bg-[#e2e4e8] dark:bg-[#1e2228]" />
                      <div className="h-2 w-3/4 bg-[#e2e4e8] dark:bg-[#1e2228]" />
                    </div>
                    <div className="h-9 border-t border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117]" />
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

      {/* ── Right sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-0 w-[220px] shrink-0">

        {/* Marketplace stats */}
        <section className="border border-[#e2e4e8] dark:border-[#1e2228] mb-4">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">marketplace</span>
          </div>
          <div className="px-4 py-4 text-center border-b border-[#e2e4e8] dark:border-[#1e2228]">
            <p className="font-mono text-[32px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-none">
              {loading ? '—' : total}
            </p>
            <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mt-1">
              active listings
            </p>
          </div>
          <div className="px-3 py-2">
            <Link
              to="/app/listings/new"
              className="flex items-center justify-between w-full px-3 py-1.5 font-mono text-[10px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors duration-150"
            >
              <span>post a listing</span>
              <span className="text-[#e8490f] dark:text-[#ff6b35]">+</span>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">how it works</span>
          </div>
          <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
            {howItWorks.map((s) => (
              <div key={s.n} className="flex items-start gap-3 px-3 py-2.5">
                <span className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35] shrink-0 mt-0.5">{s.n}</span>
                <span className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </section>

      </aside>
    </div>
  )
}
