import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlinePencilSquare,
  HiOutlineMapPin,
  HiOutlineLink,
  HiOutlineEnvelope,
  HiOutlineCalendar,
  HiOutlineArrowUpRight,
  HiOutlineStar,
  HiOutlineCheckBadge,
  HiOutlineEye,
  HiOutlineChartBar,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineEllipsisHorizontal,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

const skills = [
  { name: 'React', level: 'Expert' },
  { name: 'TypeScript', level: 'Expert' },
  { name: 'Node.js', level: 'Advanced' },
  { name: 'Python', level: 'Intermediate' },
  { name: 'Figma', level: 'Intermediate' },
  { name: 'PostgreSQL', level: 'Advanced' },
  { name: 'Docker', level: 'Beginner' },
  { name: 'AWS', level: 'Beginner' },
]

const listings = [
  { id: '1', title: 'React & TypeScript Development', price: 'R150/hr', rating: 4.9, reviews: 12, category: 'Programming' },
  { id: '2', title: 'Python Scripting & Automation', price: 'R120/hr', rating: 0, reviews: 0, category: 'Programming' },
]

const reviews = [
  { id: '1', author: 'James M.', university: 'UP', avatar: 'https://i.pravatar.cc/100?img=8', rating: 5, text: 'Incredibly helpful tutor. Explained complex concepts clearly and was always on time. Highly recommend!', date: '2 weeks ago' },
  { id: '2', author: 'Leila N.', university: 'UCT', avatar: 'https://i.pravatar.cc/100?img=9', rating: 5, text: 'Built exactly what I needed for my final year project. Clean code, great communication.', date: '1 month ago' },
  { id: '3', author: 'Kwame B.', university: 'Stellenbosch', avatar: 'https://i.pravatar.cc/100?img=11', rating: 4, text: 'Good work overall. Delivered on time and was responsive to feedback.', date: '2 months ago' },
]

const levelColor: Record<string, string> = {
  Expert:       'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]',
  Advanced:     'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]',
  Intermediate: 'bg-[#fff8c5] dark:bg-[#2d2000] text-[#9a6700] dark:text-[#d29922]',
  Beginner:     'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'skills'>('listings')

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0 space-y-4">

        {/* Cover + avatar */}
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
          <div className="h-36 bg-gradient-to-br from-[#0969da] via-[#0550ae] to-[#1a7f37] relative">
            <Link to="/app/settings" className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
              <HiOutlinePencilSquare className="w-4 h-4" />
            </Link>
          </div>
          <div className="px-5 pb-5 -mt-12">
            <div className="flex items-end justify-between">
              <Avatar name="Student" size="lg" showStatus className="ring-4 ring-white dark:ring-[#161b22] !w-20 !h-20 !text-2xl" />
              <div className="flex items-center gap-2 mb-1">
                <Link to="/app/settings" className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors">
                  Edit Profile
                </Link>
                <button className="p-2 rounded-xl border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer">
                  <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Student Name</h1>
                <HiOutlineCheckBadge className="w-5 h-5 text-[#1a7f37] dark:text-[#3fb950]" title="Verified student" />
              </div>
              <p className="text-[13px] text-[#636c76] dark:text-[#848d97] mt-0.5">Computer Science · University of Cape Town</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#636c76] dark:text-[#848d97]">
                <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />Cape Town, SA</span>
                <span className="flex items-center gap-1"><HiOutlineEnvelope className="w-3.5 h-3.5" />student@uct.ac.za</span>
                <span className="flex items-center gap-1"><HiOutlineLink className="w-3.5 h-3.5" />github.com/student</span>
                <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" />Joined Jan 2024</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[12px]">
                <span className="text-[#636c76] dark:text-[#848d97]"><span className="font-bold text-[#1f2328] dark:text-[#e6edf3]">4.9</span> avg rating</span>
                <span className="text-[#636c76] dark:text-[#848d97]"><span className="font-bold text-[#1f2328] dark:text-[#e6edf3]">15</span> reviews</span>
                <span className="text-[#636c76] dark:text-[#848d97]"><span className="font-bold text-[#1f2328] dark:text-[#e6edf3]">2</span> active listings</span>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
          <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-2">About</h3>
          <p className="text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed">
            3rd year Computer Science student at UCT. Passionate about building web applications and helping fellow students with programming challenges. Available for tutoring, freelance development, and collaborative projects.
          </p>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
          <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-[#f6f8fa] dark:border-[#21262d]">
            {(['listings', 'reviews', 'skills'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-3.5 py-2 text-[12px] font-medium transition-colors cursor-pointer capitalize border-b-2 -mb-px',
                  activeTab === tab
                    ? 'text-[#0969da] dark:text-[#2f81f7] border-[#0969da] dark:border-[#2f81f7]'
                    : 'text-[#636c76] dark:text-[#848d97] border-transparent hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'listings' && (
              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{l.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{l.category}</span>
                        {l.reviews > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] text-[#636c76] dark:text-[#848d97]">
                            <HiOutlineStar className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" /> {l.rating} ({l.reviews})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{l.price}</p>
                      <button className="mt-1 flex items-center gap-1 text-[11px] text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">
                        <HiOutlineChatBubbleOvalLeft className="w-3 h-3" /> Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="flex gap-3">
                    <Avatar name={r.author} src={r.avatar} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{r.author} · {r.university}</p>
                        <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <HiOutlineStar key={i} className={clsx('w-3 h-3', i < r.rating ? 'text-[#9a6700] dark:text-[#d29922] fill-current' : 'text-[#d0d7de] dark:text-[#30363d]')} />
                        ))}
                      </div>
                      <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="grid grid-cols-2 gap-2">
                {skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d]">
                    <span className="text-[12px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{s.name}</span>
                    <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', levelColor[s.level])}>{s.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-[240px] shrink-0">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: '248', label: 'Views', icon: HiOutlineEye, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
            { value: '4.9', label: 'Rating', icon: HiOutlineStar, color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
            { value: '15', label: 'Reviews', icon: HiOutlineChatBubbleOvalLeft, color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
            { value: '86', label: 'Searches', icon: HiOutlineChartBar, color: 'text-[#8250df] dark:text-[#a371f7]', bg: 'bg-[#fbefff] dark:bg-[#1e0a33]' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={clsx('rounded-2xl p-3 text-center', s.bg)}>
                <Icon className={clsx('w-4 h-4 mx-auto mb-1', s.color)} />
                <p className={clsx('text-[16px] font-bold', s.color)}>{s.value}</p>
                <p className="text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Profile strength */}
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile Strength</p>
            <span className="text-[11px] font-bold text-[#0969da] dark:text-[#2f81f7]">60%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[#0969da] to-[#2f81f7]" />
          </div>
          <p className="text-[10px] text-[#636c76] dark:text-[#848d97] mt-2">Add a portfolio link to reach All-Star.</p>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-3 space-y-1">
          {[
            { label: 'Share Profile', icon: HiOutlineArrowUpRight },
            { label: 'Download CV', icon: HiOutlineArrowUpRight },
          ].map((a) => {
            const Icon = a.icon
            return (
              <button key={a.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer">
                <Icon className="w-4 h-4" /> {a.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
