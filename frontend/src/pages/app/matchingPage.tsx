import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineClock,
  HiOutlineStar, HiOutlineCheckBadge,
} from 'react-icons/hi2'
import { aiService, type MatchResult } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-[#1a7f37] dark:bg-[#3fb950]' : pct >= 60 ? 'bg-[#9a6700] dark:bg-[#d29922]' : 'bg-[#0969da] dark:bg-[#2f81f7]'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#636c76] dark:text-[#848d97] w-10 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-[10px] font-semibold text-[#1f2328] dark:text-[#e6edf3] w-8 text-right">{pct}%</span>
    </div>
  )
}

function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const navigate = useNavigate()
  const { listing } = match
  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/app/listings/${listing.id}`)}
      className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 cursor-pointer hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors truncate">{listing.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{ownerName}</span>
            {listing.owner.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3]">
            {listing.price ? `R${listing.price}/hr` : listing.price_min ? `R${listing.price_min}–${listing.price_max}` : 'Negotiable'}
          </p>
          {listing.delivery_days && (
            <p className="text-[10px] text-[#636c76] dark:text-[#848d97] flex items-center gap-1 justify-end mt-0.5">
              <HiOutlineClock className="w-3 h-3" />{listing.delivery_days}d
            </p>
          )}
        </div>
      </div>

      <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed line-clamp-2 mb-3">{listing.description}</p>

      {listing.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {listing.skills.slice(0, 4).map((s) => (
            <span key={s.id} className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{s.name}</span>
          ))}
          {listing.skills.length > 4 && <span className="text-[10px] text-[#636c76] dark:text-[#848d97] self-center">+{listing.skills.length - 4}</span>}
        </div>
      )}

      <div className="pt-3 border-t border-[#d0d7de] dark:border-[#30363d] space-y-1.5">
        <ScoreBar value={match.score} label="Match" />
      </div>

      {match.explanation && (
        <p className="mt-2 text-[11px] text-[#636c76] dark:text-[#848d97] italic leading-relaxed">{match.explanation}</p>
      )}
    </motion.div>
  )
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await aiService.getMatches(20)
      setMatches(res.items)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await aiService.refreshMatches()
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">AI Matches</h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Listings matched to your skills and profile using vector similarity.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer disabled:opacity-60"
        >
          <HiOutlineArrowPath className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {!loading && total > 0 && (
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">{total} match{total !== 1 ? 'es' : ''} found</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <HiOutlineArrowPath className="w-6 h-6 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-12 text-center">
          <HiOutlineSparkles className="w-8 h-8 text-[#d0d7de] dark:text-[#30363d] mx-auto mb-3" />
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">No matches yet</p>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1">Add skills to your profile and click Refresh to find matches.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m, i) => <MatchCard key={m.listing.id} match={m} index={i} />)}
        </div>
      )}
    </div>
  )
}
