import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineClock,
  HiOutlineCheckBadge, HiOutlineCurrencyDollar,
} from 'react-icons/hi2'
import { aiService, type MatchResult } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

const dot         = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT shrink-0'
const sectionHead = 'flex items-center gap-1.5 px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-success-fg dark:bg-success-dark-fg' : pct >= 60 ? 'bg-yellow-500' : 'bg-danger-fg dark:bg-danger-dark-fg'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-canvas-inset dark:bg-canvas-dark-inset">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${color}`} />
      </div>
      <span className="font-mono text-[9px] font-medium text-fg-default dark:text-fg-dark-default w-7 text-right shrink-0">{pct}%</span>
    </div>
  )
}

function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const navigate = useNavigate()
  const { listing } = match
  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/listings/${listing.id}`)}
      className="border border-border-default dark:border-border-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors cursor-pointer group bg-canvas-default dark:bg-canvas-dark-default"
    >
      <div className="p-4">
        {/* owner + title row */}
        <div className="flex items-start gap-3 mb-2">
          <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors truncate">
              {listing.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">{ownerName}</span>
              {listing.owner.is_verified && <HiOutlineCheckBadge className="w-3 h-3 text-success-fg dark:text-success-dark-fg" />}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="flex items-center gap-0.5 font-mono text-[11px] font-bold text-fg-default dark:text-fg-dark-default justify-end">
              <HiOutlineCurrencyDollar className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted" />
              {listing.price
                ? `${listing.price}/hr`
                : listing.price_min
                ? `${listing.price_min}–${listing.price_max}`
                : 'negotiable'}
            </p>
            {listing.delivery_days && (
              <p className="flex items-center gap-0.5 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted justify-end mt-0.5">
                <HiOutlineClock className="w-3 h-3" />{listing.delivery_days}d
              </p>
            )}
          </div>
        </div>

        {/* description */}
        <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted leading-relaxed line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* skills */}
        {listing.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.skills.slice(0, 5).map((s) => (
              <span key={s.id} className="px-2 py-0.5 font-mono text-[9px] border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
                {s.name}
              </span>
            ))}
            {listing.skills.length > 5 && (
              <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted self-center">+{listing.skills.length - 5}</span>
            )}
          </div>
        )}

        {/* score bar */}
        <div className="pt-3 border-t border-border-default dark:border-border-dark-default space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">match score</span>
            <span className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT">{Math.round(match.score * 100)}%</span>
          </div>
          <ScoreBar value={match.score} />
        </div>

        {/* explanation */}
        {match.explanation && (
          <p className="mt-2 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">
            <span className="text-brand dark:text-brand-dark-DEFAULT mr-1">›</span>{match.explanation}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await aiService.getMatches(20)
      setMatches(res.items); setTotal(res.total)
    } catch { setError('failed to load matches') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = async () => {
    setRefreshing(true); setError('')
    try { await aiService.refreshMatches(); await load() }
    catch { setError('failed to refresh') }
    finally { setRefreshing(false) }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
        <div className={sectionHead}>
          <span className={dot} />
          <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">ai matches</span>
          <button onClick={handleRefresh} disabled={refreshing || loading}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer disabled:opacity-50"
          >
            <HiOutlineArrowPath className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'refreshing…' : 'refresh'}
          </button>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <HiOutlineSparkles className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT shrink-0" />
          <div>
            <p className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default">
              {!loading && total > 0 ? `${total} match${total !== 1 ? 'es' : ''} found` : 'listings matched to your profile'}
            </p>
            <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              ranked by vector similarity to your skills and activity
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 border border-danger-fg/40 dark:border-danger-dark-fg/40 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[10px] text-danger-fg dark:text-danger-dark-fg">
          ! {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="border border-border-default dark:border-border-dark-default p-12 text-center bg-canvas-default dark:bg-canvas-dark-default">
          <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
            ~ no matches yet — add skills to your profile and click refresh
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {matches.map((m, i) => <MatchCard key={m.listing.id} match={m} index={i} />)}
        </div>
      )}
    </div>
  )
}
