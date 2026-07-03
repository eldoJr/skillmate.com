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
  HiOutlineChatBubbleOvalLeft,
  HiOutlineBookmark,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

const tabs = [
  { key: 'all',        label: 'All Skills',  icon: HiOutlineSparkles },
  { key: 'programming',label: 'Programming', icon: HiOutlineCodeBracket },
  { key: 'design',     label: 'Design',      icon: HiOutlinePaintBrush },
  { key: 'writing',    label: 'Writing',     icon: HiOutlinePencilSquare },
  { key: 'tutoring',   label: 'Tutoring',    icon: HiOutlineAcademicCap },
  { key: 'video',      label: 'Video',       icon: HiOutlineVideoCamera },
  { key: 'music',      label: 'Music',       icon: HiOutlineSpeakerWave },
  { key: 'data',       label: 'Data',        icon: HiOutlineChartBar },
] as const

type TabKey = typeof tabs[number]['key']

const listings = [
  { id: '1', title: 'React & TypeScript Development', author: 'Amara K.', university: 'UCT', category: 'programming', price: 'R150/hr', avatar: 'https://i.pravatar.cc/100?img=1', rating: 4.9, reviews: 12, tags: ['React', 'TypeScript', 'Node.js'] },
  { id: '2', title: 'UI/UX Design & Figma Prototyping', author: 'Tolu S.', university: 'Wits', category: 'design', price: 'R120/hr', avatar: 'https://i.pravatar.cc/100?img=3', rating: 4.8, reviews: 8, tags: ['Figma', 'UI/UX', 'Prototyping'] },
  { id: '3', title: 'Academic Writing & Proofreading', author: 'Rania L.', university: 'Stellenbosch', category: 'writing', price: 'R80/hr', avatar: 'https://i.pravatar.cc/100?img=5', rating: 5.0, reviews: 21, tags: ['Essays', 'Proofreading', 'Research'] },
  { id: '4', title: 'Python & Data Science Tutoring', author: 'James M.', university: 'UP', category: 'tutoring', price: 'R100/hr', avatar: 'https://i.pravatar.cc/100?img=8', rating: 4.7, reviews: 15, tags: ['Python', 'Pandas', 'ML'] },
  { id: '5', title: 'Video Editing & Motion Graphics', author: 'Leila N.', university: 'UCT', category: 'video', price: 'R200/hr', avatar: 'https://i.pravatar.cc/100?img=9', rating: 4.9, reviews: 6, tags: ['Premiere', 'After Effects'] },
  { id: '6', title: 'Data Analysis & Visualisation', author: 'Kwame B.', university: 'Stellenbosch', category: 'data', price: 'R130/hr', avatar: 'https://i.pravatar.cc/100?img=11', rating: 4.6, reviews: 9, tags: ['Excel', 'Power BI', 'SQL'] },
  { id: '7', title: 'Logo & Brand Identity Design', author: 'Sipho D.', university: 'Wits', category: 'design', price: 'R500 fixed', avatar: 'https://i.pravatar.cc/100?img=12', rating: 4.8, reviews: 18, tags: ['Illustrator', 'Branding'] },
  { id: '8', title: 'Music Production & Mixing', author: 'Fatima A.', university: 'UCT', category: 'music', price: 'R180/hr', avatar: 'https://i.pravatar.cc/100?img=16', rating: 4.7, reviews: 4, tags: ['Ableton', 'Mixing', 'Mastering'] },
]

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')

  const filtered = listings.filter((l) => {
    const matchTab = activeTab === 'all' || l.category === activeTab
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchTab && matchSearch
  })

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Search */}
      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills, e.g. React, Design, Tutoring…"
          className="w-full pl-11 pr-12 py-3 rounded-2xl text-[13px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">
          <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0',
                activeTab === tab.key
                  ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white shadow-sm'
                  : 'text-[#636c76] dark:text-[#848d97] hover:bg-white dark:hover:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Results count */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <div key={listing.id} className="group rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 hover:border-[#0969da]/50 dark:hover:border-[#2f81f7]/50 hover:shadow-md transition-all cursor-pointer flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Avatar name={listing.author} src={listing.avatar} size="md" />
                <button className="p-1.5 rounded-lg text-[#636c76] dark:text-[#848d97] hover:text-[#0969da] dark:hover:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer">
                  <HiOutlineBookmark className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-snug mb-1 group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">
                {listing.title}
              </h4>
              <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mb-3">{listing.author} · {listing.university}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {listing.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f6f8fa] dark:border-[#21262d]">
                <div className="flex items-center gap-1 text-[11px] text-[#636c76] dark:text-[#848d97]">
                  <HiOutlineStar className="w-3.5 h-3.5 text-[#9a6700] dark:text-[#d29922]" />
                  <span className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">{listing.rating}</span>
                  <span>({listing.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{listing.price}</span>
                  <button className="p-1.5 rounded-lg text-[#0969da] dark:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer">
                    <HiOutlineChatBubbleOvalLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
