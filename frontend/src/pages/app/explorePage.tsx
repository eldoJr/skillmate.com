import { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlineMagnifyingGlass, HiOutlineCodeBracket, HiOutlinePaintBrush,
  HiOutlinePencilSquare, HiOutlineAcademicCap, HiOutlineVideoCamera,
  HiOutlineSpeakerWave, HiOutlineChartBar, HiOutlineSparkles,
  HiOutlineStar, HiStar, HiOutlineChatBubbleLeftRight, HiOutlineArrowUpRight,
  HiOutlineMapPin,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { useNavigate } from 'react-router-dom'
import { listingsService, type Listing } from '../../services/listings'

const tabs = [
  { key: 'all',         label: 'All',        icon: HiOutlineSparkles },
  { key: 'Programming', label: 'Programming', icon: HiOutlineCodeBracket },
  { key: 'Design',      label: 'Design',      icon: HiOutlinePaintBrush },
  { key: 'Writing',     label: 'Writing',     icon: HiOutlinePencilSquare },
  { key: 'Tutoring',    label: 'Tutoring',    icon: HiOutlineAcademicCap },
  { key: 'Video',       label: 'Video',       icon: HiOutlineVideoCamera },
  { key: 'Music',       label: 'Music',       icon: HiOutlineSpeakerWave },
  { key: 'Data',        label: 'Data',        icon: HiOutlineChartBar },
] as const

type TabKey = typeof tabs[number]['key']

const howItWorks = [
  { step: '1', text: 'Search for the skill you need' },
  { step: '2', text: 'Review profiles and ratings' },
  { step: '3', text: 'Message and agree on terms' },
  { step: '4', text: 'Get the work done' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= Math.floor(rating)
          ? <HiStar key={s} className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" />
          : <HiOutlineStar key={s} className="w-3 h-3 text-[#d0d7de] dark:text-[#30363d]" />,
      )}
    </div>
  )
}

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = { page_size: 20 }
      if (activeTab !== 'all') params.category = activeTab
      if (search) params.search = search
      const res = await listingsService.getAll(params)
      setListings(res.items)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    const t = setTimeout(fetchListings, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchListings, search])

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills, e.g. React, Design, Tutoring…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                  activeTab === tab.key
                    ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
                    : 'bg-white dark:bg-[#161b22] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d] hover:border-[#b1bac4] dark:hover:border-[#484f58]',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">
          {loading ? 'Loading…' : `${total} listing${total !== 1 ? 's' : ''} found`}
        </p>

        {!loading && listings.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-12 text-center">
            <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">No listings found</p>
            <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {listings.map((listing) => (
              <div key={listing.id} onClick={() => navigate(`/app/listings/${listing.id}`)} className="group rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <Avatar
                    name={`${listing.owner.first_name} ${listing.owner.last_name}`}
                    src={listing.owner.avatar_url ?? undefined}
                    size="md"
                    showStatus={listing.is_active}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors truncate">
                      {listing.owner.first_name} {listing.owner.last_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <HiOutlineMapPin className="w-3 h-3 text-[#636c76] dark:text-[#848d97] shrink-0" />
                      <span className="text-[11px] text-[#636c76] dark:text-[#848d97] truncate">{listing.owner.university ?? ''}</span>
                      <span className={clsx(
                        'px-1.5 py-px rounded-full text-[10px] font-medium',
                        listing.is_active
                          ? 'bg-[#dafbe1] dark:bg-[#1a4721]/40 text-[#1a7f37] dark:text-[#3fb950]'
                          : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                      )}>
                        {listing.is_active ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3] shrink-0">{formatPrice(listing)}</span>
                </div>

                <p className="mt-3 text-[12px] font-medium text-[#636c76] dark:text-[#848d97] leading-snug">{listing.title}</p>

                {listing.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {listing.skills.map((s) => (
                      <span key={s.id} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f6f8fa] dark:border-[#21262d]">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold border border-[#0969da] dark:border-[#2f81f7] text-[#0969da] dark:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer">
                    <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" /> Message
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/app/listings/${listing.id}`) }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer">
                    View Listing <HiOutlineArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0">
        <div className="rounded-2xl bg-gradient-to-br from-[#0969da] to-[#0550ae] dark:from-[#1158c7] dark:to-[#0d419d] p-5 text-white">
          <p className="text-[13px] font-semibold mb-3">Skill Marketplace</p>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{total}</p>
            <p className="text-[10px] text-white/70">Active listings</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4">
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">How it works</p>
          <div className="space-y-3">
            {howItWorks.map((s) => (
              <div key={s.step} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] text-[10px] font-bold flex items-center justify-center shrink-0">{s.step}</span>
                <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
