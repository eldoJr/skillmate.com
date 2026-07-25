import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlinePlusCircle, HiOutlineArrowRight, HiOutlineStar,
  HiOutlineChatBubbleOvalLeft, HiOutlineEye, HiOutlineRectangleStack,
  HiOutlineUserPlus,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { useAuth } from '../../contexts/AuthContext'
import { listingsService, type Listing } from '../../services/listings'
import { usersService, type ProfileCompletion } from '../../services/users'
import { messagesService } from '../../services/messages'

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentListings, setRecentListings] = useState<Listing[]>([])
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    listingsService.getAll({ page_size: 3 }).then((r) => setRecentListings(r.items))
    listingsService.getMine().then(setMyListings)
    usersService.getCompletion().then(setCompletion)
    messagesService.getUnreadCount().then(setUnreadMessages)
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'
  const activeListings = myListings.filter((l) => l.is_active).length

  const stats = [
    { label: 'Profile strength', value: `${completion?.score ?? 0}%`, icon: HiOutlineEye, color: 'text-[#0969da] dark:text-[#2f81f7]', bg: 'bg-[#ddf4ff] dark:bg-[#121d2f]' },
    { label: 'Active listings', value: String(activeListings), icon: HiOutlineRectangleStack, color: 'text-[#1a7f37] dark:text-[#3fb950]', bg: 'bg-[#dafbe1] dark:bg-[#0f2d1a]' },
    { label: 'Unread messages', value: String(unreadMessages), icon: HiOutlineChatBubbleOvalLeft, color: 'text-[#9a6700] dark:text-[#d29922]', bg: 'bg-[#fff8c5] dark:bg-[#2d2000]' },
  ]

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0 space-y-5">

        <div className="flex items-center justify-between gap-6 py-2">
          <div>
            <p className="text-xs font-semibold text-[#636c76] dark:text-[#848d97] mb-1 uppercase tracking-wide">Welcome back</p>
            <h2 className="text-lg font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Good morning, {firstName} 👋</h2>
            <p className="text-sm text-[#636c76] dark:text-[#848d97]">
              {unreadMessages > 0 ? `You have ${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}.` : 'Your workspace is up to date.'}
            </p>
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

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Recent Listings</h3>
            <Link to="/app/explore" className="text-[12px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline flex items-center gap-0.5">
              View all <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentListings.length === 0 ? (
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentListings.map((listing) => (
                <div key={listing.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 flex items-center gap-4 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors cursor-pointer">
                  <Avatar name={`${listing.owner.first_name} ${listing.owner.last_name}`} src={listing.owner.avatar_url ?? undefined} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{listing.title}</p>
                    <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                      {listing.owner.first_name} {listing.owner.last_name} · {listing.owner.university ?? ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{listing.category}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{formatPrice(listing)}</p>
                    <Link to="/app/messages" className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline">
                      <HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /> Contact
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0">
        <div className="rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user?.full_name ?? 'S'} src={user?.avatar_url ?? undefined} size="md" showStatus />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{user?.full_name}</p>
              <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile strength</p>
            <span className="text-[11px] font-bold text-[#0969da] dark:text-[#2f81f7]">{completion?.score ?? 0}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0969da] to-[#2f81f7]" style={{ width: `${completion?.score ?? 0}%` }} />
          </div>
          {completion && completion.missing.length > 0 && (
            <p className="text-[10px] text-[#636c76] dark:text-[#848d97] mt-2">Add {completion.missing[0].toLowerCase()} to strengthen your profile.</p>
          )}
          <Link to="/app/profile" className="mt-3 flex items-center justify-center w-full py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors">
            Complete profile
          </Link>
        </div>

        {myListings.length > 0 && (
          <div className="rounded-2xl p-4">
            <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Your listings</p>
            <div className="space-y-2">
              {myListings.slice(0, 3).map((l) => (
                <div key={l.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${l.is_active ? 'bg-[#1a7f37] dark:bg-[#3fb950]' : 'bg-[#d0d7de] dark:bg-[#30363d]'}`} />
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] truncate flex-1">{l.title}</p>
                  <HiOutlineStar className="w-3 h-3 text-[#636c76] dark:text-[#848d97] shrink-0" />
                </div>
              ))}
            </div>
            <Link to="/app/listings" className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline">
              Manage listings <HiOutlineUserPlus className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
