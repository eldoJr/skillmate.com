import { Link } from 'react-router-dom'
import {
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineStar,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineEye,
  HiOutlineUserPlus,
  HiOutlineRectangleStack,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

const recentListings = [
  { id: '1', title: 'React & TypeScript Development', author: 'Amara K.', university: 'UCT', category: 'Programming', price: 'R150/hr', avatar: 'https://i.pravatar.cc/100?img=1', rating: 4.9, reviews: 12 },
  { id: '2', title: 'UI/UX Design & Figma Prototyping', author: 'Tolu S.', university: 'Wits', category: 'Design', price: 'R120/hr', avatar: 'https://i.pravatar.cc/100?img=3', rating: 4.8, reviews: 8 },
  { id: '3', title: 'Academic Writing & Proofreading', author: 'Rania L.', university: 'Stellenbosch', category: 'Writing', price: 'R80/hr', avatar: 'https://i.pravatar.cc/100?img=5', rating: 5.0, reviews: 21 },
]

const recentRequests = [
  { id: '1', title: 'Need Python tutor for data science module', author: 'James M.', university: 'UP', budget: 'R100/hr', category: 'Tutoring', time: '2h ago' },
  { id: '2', title: 'Looking for logo designer for student startup', author: 'Leila N.', university: 'UCT', budget: 'R500 fixed', category: 'Design', time: '4h ago' },
]

const suggestedStudents = [
  { name: 'Sipho D.', headline: 'Full Stack Dev · Wits', avatar: 'https://i.pravatar.cc/100?img=8' },
  { name: 'Fatima A.', headline: 'Graphic Designer · UCT', avatar: 'https://i.pravatar.cc/100?img=9' },
  { name: 'Kwame B.', headline: 'Data Analyst · Stellenbosch', avatar: 'https://i.pravatar.cc/100?img=11' },
]

const stats = [
  { label: 'Profile views', value: '48', icon: HiOutlineEye, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
  { label: 'Active listings', value: '2', icon: HiOutlineRectangleStack, color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
  { label: 'Open requests', value: '5', icon: HiOutlineClipboardDocumentList, color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
]

export default function DashboardPage() {
  return (
    <div className="flex gap-5">
      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Welcome banner */}
        <div className="flex items-center justify-between gap-6 py-2">
          <div>
            <p className="text-xs font-semibold text-[#636c76] dark:text-[#848d97] mb-1 uppercase tracking-wide">Welcome back</p>
            <h2 className="text-lg font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Good morning, Student 👋</h2>
            <p className="text-sm text-[#636c76] dark:text-[#848d97]">You have 3 unread messages and 2 new reviews on your listings.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/app/listings/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0969da] dark:bg-[#2f81f7] hover:bg-[#0860ca] dark:hover:bg-[#388bfd] text-white text-xs font-semibold transition-colors">
              <HiOutlinePlusCircle className="w-4 h-4" /> New Listing
            </Link>
            <Link to="/app/explore" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:border-[#0969da] dark:hover:border-[#2f81f7] text-xs font-semibold transition-colors">
              Browse Skills <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-3 ${s.bg}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/60 dark:bg-black/20 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent listings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Recent Listings</h3>
            <Link to="/app/explore" className="text-[12px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline flex items-center gap-0.5">
              View all <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentListings.map((listing) => (
              <div key={listing.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 flex items-center gap-4 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors cursor-pointer">
                <Avatar name={listing.author} src={listing.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{listing.title}</p>
                  <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">{listing.author} · {listing.university}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{listing.category}</span>
                    <span className="flex items-center gap-0.5 text-[11px] text-[#636c76] dark:text-[#848d97]">
                      <HiOutlineStar className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" /> {listing.rating} ({listing.reviews})
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{listing.price}</p>
                  <button className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">
                    <HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /> Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Open Requests</h3>
            <Link to="/app/requests" className="text-[12px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline flex items-center gap-0.5">
              View all <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div key={req.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{req.title}</p>
                    <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">{req.author} · {req.university} · {req.time}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-bold text-[#1a7f37] dark:text-[#3fb950]">{req.budget}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]">{req.category}</span>
                  <button className="ml-auto text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">Apply →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0">

        {/* Profile card */}
        <div className="rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name="Student" size="md" showStatus />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">Student</p>
              <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">student@university.edu</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile strength</p>
            <span className="text-[11px] font-bold text-[#0969da] dark:text-[#2f81f7]">60%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[#0969da] to-[#2f81f7]" />
          </div>
          <p className="text-[10px] text-[#636c76] dark:text-[#848d97] mt-2">Add a portfolio link to reach All-Star.</p>
          <Link to="/app/profile" className="mt-3 flex items-center justify-center w-full py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
            Complete profile
          </Link>
        </div>

        {/* Suggested students */}
        <div className="rounded-2xl p-4">
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Students you may know</p>
          <div className="space-y-3">
            {suggestedStudents.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5">
                <Avatar name={s.name} src={s.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{s.name}</p>
                  <p className="text-[10px] text-[#636c76] dark:text-[#848d97] truncate">{s.headline}</p>
                </div>
                <button className="p-1.5 rounded-lg text-[#0969da] dark:text-[#2f81f7] hover:bg-[#ddf4ff] dark:hover:bg-[#121d2f] transition-colors cursor-pointer shrink-0">
                  <HiOutlineUserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
