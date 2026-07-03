import { useState } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCodeBracket,
  HiOutlinePaintBrush,
  HiOutlinePencilSquare,
  HiOutlineAcademicCap,
  HiOutlineVideoCamera,
  HiOutlineSpeakerWave,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineStar,
  HiStar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowUpRight,
  HiOutlineMapPin,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

const tabs = [
  { key: 'all',         label: 'All',         icon: HiOutlineSparkles },
  { key: 'programming', label: 'Programming',  icon: HiOutlineCodeBracket },
  { key: 'design',      label: 'Design',       icon: HiOutlinePaintBrush },
  { key: 'writing',     label: 'Writing',      icon: HiOutlinePencilSquare },
  { key: 'tutoring',    label: 'Tutoring',     icon: HiOutlineAcademicCap },
  { key: 'video',       label: 'Video',        icon: HiOutlineVideoCamera },
  { key: 'music',       label: 'Music',        icon: HiOutlineSpeakerWave },
  { key: 'data',        label: 'Data',         icon: HiOutlineChartBar },
] as const

type TabKey = typeof tabs[number]['key']

const listings = [
  { id: '1', title: 'React & TypeScript Development', author: 'Amara K.', university: 'UCT', category: 'programming', price: 'R150/hr', avatar: 'https://i.pravatar.cc/100?img=1', rating: 4.9, reviews: 12, tags: ['React', 'TypeScript', 'Node.js'], available: true },
  { id: '2', title: 'UI/UX Design & Figma Prototyping', author: 'Tolu S.', university: 'Wits', category: 'design', price: 'R120/hr', avatar: 'https://i.pravatar.cc/100?img=3', rating: 4.8, reviews: 8, tags: ['Figma', 'UI/UX', 'Prototyping'], available: true },
  { id: '3', title: 'Academic Writing & Proofreading', author: 'Rania L.', university: 'Stellenbosch', category: 'writing', price: 'R80/hr', avatar: 'https://i.pravatar.cc/100?img=5', rating: 5.0, reviews: 21, tags: ['Essays', 'Proofreading', 'Research'], available: false },
  { id: '4', title: 'Python & Data Science Tutoring', author: 'James M.', university: 'UP', category: 'tutoring', price: 'R100/hr', avatar: 'https://i.pravatar.cc/100?img=8', rating: 4.7, reviews: 15, tags: ['Python', 'Pandas', 'ML'], available: true },
  { id: '5', title: 'Video Editing & Motion Graphics', author: 'Leila N.', university: 'UCT', category: 'video', price: 'R200/hr', avatar: 'https://i.pravatar.cc/100?img=9', rating: 4.9, reviews: 6, tags: ['Premiere', 'After Effects'], available: true },
  { id: '6', title: 'Data Analysis & Visualisation', author: 'Kwame B.', university: 'Stellenbosch', category: 'data', price: 'R130/hr', avatar: 'https://i.pravatar.cc/100?img=11', rating: 4.6, reviews: 9, tags: ['Excel', 'Power BI', 'SQL'], available: false },
  { id: '7', title: 'Logo & Brand Identity Design', author: 'Sipho D.', university: 'Wits', category: 'design', price: 'R500 fixed', avatar: 'https://i.pravatar.cc/100?img=12', rating: 4.8, reviews: 18, tags: ['Illustrator', 'Branding'], available: true },
  { id: '8', title: 'Music Production & Mixing', author: 'Fatima A.', university: 'UCT', category: 'music', price: 'R180/hr', avatar: 'https://i.pravatar.cc/100?img=16', rating: 4.7, reviews: 4, tags: ['Ableton', 'Mixing', 'Mastering'], available: true },
]

const topSkills = [
  { name: 'React / Frontend', count: 34 },
  { name: 'UI/UX Design', count: 28 },
  { name: 'Python / Data', count: 21 },
  { name: 'Academic Writing', count: 19 },
  { name: 'Video Editing', count: 14 },
]

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

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')

  const filtered = listings.filter((l) => {
    const matchTab = activeTab === 'all' || l.category === activeTab
    const matchSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchTab && matchSearch
  })

  return (
    <div className="flex gap-6">
      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search */}
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
          <button className="p-2.5 rounded-xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:border-[#b1bac4] dark:hover:border-[#484f58] transition-colors cursor-pointer">
            <HiOutlineAdjustmentsHorizontal className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Tabs */}
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
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-12 text-center">
            <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">No listings found</p>
            <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((listing) => (
              <div key={listing.id} className="group rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar name={listing.author} src={listing.avatar} size="md" showStatus={listing.available} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors truncate">
                      {listing.author}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <HiOutlineMapPin className="w-3 h-3 text-[#636c76] dark:text-[#848d97] shrink-0" />
                      <span className="text-[11px] text-[#636c76] dark:text-[#848d97] truncate">{listing.university}</span>
                      <span className={clsx(
                        'px-1.5 py-px rounded-full text-[10px] font-medium',
                        listing.available
                          ? 'bg-[#dafbe1] dark:bg-[#1a4721]/40 text-[#1a7f37] dark:text-[#3fb950]'
                          : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                      )}>
                        {listing.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Stars rating={listing.rating} />
                      <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">{listing.rating} ({listing.reviews})</span>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3] shrink-0">{listing.price}</span>
                </div>

                {/* Title */}
                <p className="mt-3 text-[12px] font-medium text-[#636c76] dark:text-[#848d97] leading-snug">
                  {listing.title}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {listing.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f6f8fa] dark:border-[#21262d]">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold border border-[#0969da] dark:border-[#2f81f7] text-[#0969da] dark:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer">
                    <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" /> Message
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer">
                    View Listing <HiOutlineArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0">
        {/* Stats */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0969da] to-[#0550ae] dark:from-[#1158c7] dark:to-[#0d419d] p-5 text-white">
          <p className="text-[13px] font-semibold mb-3">Skill Marketplace</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">240+</p>
              <p className="text-[10px] text-white/70">Students</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">8</p>
              <p className="text-[10px] text-white/70">Categories</p>
            </div>
          </div>
        </div>

        {/* Top skills */}
        <div className="p-4">
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Top Skills</p>
          <div className="space-y-2.5">
            {topSkills.map((s) => (
              <div key={s.name} className="flex items-center justify-between group cursor-pointer">
                <span className="text-[12px] text-[#636c76] dark:text-[#848d97] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">{s.name}</span>
                <span className="text-[10px] text-[#636c76] dark:text-[#848d97] bg-[#f6f8fa] dark:bg-[#21262d] px-1.5 py-0.5 rounded-full">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
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
