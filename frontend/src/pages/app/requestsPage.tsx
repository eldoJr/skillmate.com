import { useState } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlinePlusCircle,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

const filters = ['All', 'Programming', 'Design', 'Writing', 'Tutoring', 'Video', 'Data', 'Other'] as const
type Filter = typeof filters[number]

const requests = [
  { id: '1', title: 'Need Python tutor for data science module', author: 'James M.', university: 'UP', avatar: 'https://i.pravatar.cc/100?img=8', budget: 'R100/hr', category: 'Tutoring', location: 'Remote', deadline: '3 days', description: 'Looking for someone to help me understand pandas, numpy and basic ML concepts. 2–3 sessions needed.', time: '2h ago' },
  { id: '2', title: 'Logo & brand identity for student startup', author: 'Leila N.', university: 'UCT', avatar: 'https://i.pravatar.cc/100?img=9', budget: 'R500 fixed', category: 'Design', location: 'Remote', deadline: '1 week', description: 'We need a modern logo and basic brand kit (colors, fonts, icons) for our new student-run food delivery app.', time: '4h ago' },
  { id: '3', title: 'React developer for final year project', author: 'Sipho D.', university: 'Wits', avatar: 'https://i.pravatar.cc/100?img=12', budget: 'Negotiable', category: 'Programming', location: 'On-campus', deadline: '2 weeks', description: 'Need help building a React frontend for my capstone project. Must be comfortable with hooks and REST APIs.', time: '6h ago' },
  { id: '4', title: 'Proofreading for research paper (15 pages)', author: 'Fatima A.', university: 'Stellenbosch', avatar: 'https://i.pravatar.cc/100?img=16', budget: 'R200 fixed', category: 'Writing', location: 'Remote', deadline: '2 days', description: 'Need a thorough proofread of my research paper on renewable energy. APA format. Turnaround within 48 hours.', time: '1d ago' },
  { id: '5', title: 'Video editing for YouTube channel intro', author: 'Kwame B.', university: 'UCT', avatar: 'https://i.pravatar.cc/100?img=11', budget: 'R300 fixed', category: 'Video', location: 'Remote', deadline: '5 days', description: 'Short 30-second intro animation for a student tech YouTube channel. Motion graphics preferred.', time: '1d ago' },
]

export default function RequestsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filtered = requests.filter((r) => {
    const matchFilter = activeFilter === 'All' || r.category === activeFilter
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Task Requests</h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Students looking for skills — apply to help them.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer"
        >
          <HiOutlinePlusCircle className="w-4 h-4" /> Post a Request
        </button>
      </div>

      {/* Post request form */}
      {showForm && (
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#0969da]/40 dark:border-[#2f81f7]/40 p-5 space-y-3">
          <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Post a new request</h3>
          <input type="text" placeholder="What do you need help with?" className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all" />
          <textarea rows={3} placeholder="Describe your request in detail…" className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all resize-none" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <select className="px-3 py-2 rounded-xl text-[12px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] outline-none appearance-none cursor-pointer">
              <option value="">Category</option>
              {filters.slice(1).map((f) => <option key={f}>{f}</option>)}
            </select>
            <input type="text" placeholder="Budget (e.g. R200)" className="px-3 py-2 rounded-xl text-[12px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all" />
            <input type="text" placeholder="Deadline" className="px-3 py-2 rounded-xl text-[12px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">Cancel</button>
            <button className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer">Post Request</button>
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer shrink-0">
          <HiOutlineAdjustmentsHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0',
              activeFilter === f
                ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
                : 'text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d] hover:bg-white dark:hover:bg-[#161b22]',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-3">
        {filtered.map((req) => (
          <div key={req.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors">
            <div className="flex items-start gap-3">
              <Avatar name={req.author} src={req.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-snug">{req.title}</h3>
                  <span className="shrink-0 text-[13px] font-bold text-[#1a7f37] dark:text-[#3fb950]">{req.budget}</span>
                </div>
                <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">{req.author} · {req.university} · {req.time}</p>
                <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-2 leading-relaxed line-clamp-2">{req.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{req.category}</span>
                  <span className="flex items-center gap-0.5 text-[11px] text-[#636c76] dark:text-[#848d97]"><HiOutlineMapPin className="w-3 h-3" />{req.location}</span>
                  <span className="flex items-center gap-0.5 text-[11px] text-[#636c76] dark:text-[#848d97]"><HiOutlineClock className="w-3 h-3" />Due in {req.deadline}</span>
                  <button className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer">
                    <HiOutlineCurrencyDollar className="w-3.5 h-3.5" /> Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
