import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineArrowPath, HiOutlineClock, HiOutlineCheckBadge } from 'react-icons/hi2'
import { aiService, type MatchResult } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-[#22c55e]' : pct >= 60 ? 'bg-[#d29922]' : 'bg-[#e8490f] dark:bg-[#ff6b35]'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-[#e2e4e8] dark:bg-[#1e2228]">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${color}`} />
      </div>
      <span className="font-mono text-[9px] font-medium text-[#1f2328] dark:text-[#e6edf3] w-7 text-right shrink-0">{pct}%</span>
    </div>
  )
}

function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const navigate = useNavigate()
  const { listing } = match
  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/listings/${listing.id}`)}
      className="border border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f]/40 dark:hover:border-[#ff6b35]/40 transition-colors cursor-pointer group"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#e8490f] dark:group-hover:text-[#ff6b35] transition-colors truncate">{listing.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">{ownerName}</span>
              {listing.owner.is_verified && <HiOutlineCheckBadge className="w-3 h-3 text-[#22c55e]" />}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[11px] font-bold text-[#1f2328] dark:text-[#e6edf3]">
              {listing.price ? `R${listing.price}/hr` : listing.price_min ? `R${listing.price_min}–${listing.price_max}` : 'negotiable'}
            </p>
            {listing.delivery_days && (
              <p className="flex items-center gap-0.5 font-mono text-[9px] text-[#636c76] dark:text-[#848d97] justify-end mt-0.5">
                <HiOutlineClock className="w-3 h-3" />{listing.delivery_days}d
              </p>
            )}
          </div>
        </div>
        <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed line-clamp-2 mb-3">{listing.description}</p>
        {listing.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.skills.slice(0, 5).map((s) => (
              <span key={s.id} className="px-2 py-0.5 font-mono text-[9px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{s.name}</span>
            ))}
            {listing.skills.length > 5 && <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] self-center">+{listing.skills.length - 5}</span>}
          </div>
        )}
        <div className="pt-3 border-t border-[#e2e4e8] dark:border-[#1e2228] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">match score</span>
            <span className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35]">{Math.round(match.score * 100)}%</span>
          </div>
          <ScoreBar value={match.score} />
        </div>
        {match.explanation && (
          <p className="mt-2 font-mono text-[9px] text-[#636c76] dark:text-[#848d97] leading-relaxed">
            <span className="text-[#e8490f] dark:text-[#ff6b35] mr-1">›</span>{match.explanation}
          </p>
        )}
      </div>
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
    try { const res = await aiService.getMatches(20); setMatches(res.items); setTotal(res.total) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try { await aiService.refreshMatches(); await load() }
    finally { setRefreshing(false) }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">ai matches</span>
          </div>
          <button onClick={handleRefresh} disabled={refreshing || loading}
            className="flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer disabled:opacity-50"
          >
            <HiOutlineArrowPath className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'refreshing…' : 'refresh'}
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
            {!loading && total > 0 ? `${total} match${total !== 1 ? 'es' : ''} found` : 'listings matched to your profile'}
          </p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">ranked by vector similarity to your skills and activity</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no matches yet — add skills to your profile and click refresh</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m, i) => <MatchCard key={m.listing.id} match={m} index={i} />)}
        </div>
      )}
    </div>
  )
}
