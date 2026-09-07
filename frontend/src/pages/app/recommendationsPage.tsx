import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineClock,
  HiOutlineCheckBadge, HiOutlineStar, HiOutlineCurrencyDollar,
} from 'react-icons/hi2'
import { aiService, type ListingRecommendation, type StudentRecommendation } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

const sectionCls = 'border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default'
const headCls = 'flex items-center gap-1.5 px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

function ScoreDot({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-semibold text-fg-default dark:text-fg-dark-default">{pct}%</span>
      <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted capitalize">{label}</span>
    </div>
  )
}

function ListingCard({ rec, index }: { rec: ListingRecommendation; index: number }) {
  const navigate = useNavigate()
  const { listing } = rec
  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/listings/${listing.id}`)}
      className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors cursor-pointer group bg-canvas-default dark:bg-canvas-dark-default"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors truncate">{listing.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{ownerName}</span>
              {listing.owner.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-success-fg dark:text-success-dark-fg" />}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="flex items-center gap-0.5 text-[12px] font-semibold text-fg-default dark:text-fg-dark-default justify-end">
              <HiOutlineCurrencyDollar className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted" />
              {listing.price ? `${listing.price}/hr` : listing.price_min ? `${listing.price_min}–${listing.price_max}` : 'Negotiable'}
            </p>
            {listing.delivery_days && (
              <p className="flex items-center gap-0.5 text-[11px] text-fg-muted dark:text-fg-dark-muted justify-end mt-0.5">
                <HiOutlineClock className="w-3 h-3" />{listing.delivery_days}d
              </p>
            )}
          </div>
        </div>
        <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted leading-relaxed line-clamp-2 mb-3">{listing.description}</p>
        {listing.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.skills.slice(0, 5).map((s) => (
              <span key={s.id} className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{s.name}</span>
            ))}
            {listing.skills.length > 5 && <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted self-center">+{listing.skills.length - 5}</span>}
          </div>
        )}
        <div className="pt-3 border-t border-border-default dark:border-border-dark-default flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ScoreDot value={rec.vector_score} label="Relevance" />
            <ScoreDot value={rec.reputation_score} label="Reputation" />
            <ScoreDot value={rec.activity_score} label="Activity" />
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-brand/40 dark:border-brand-dark-DEFAULT/40">
            <HiOutlineSparkles className="w-3 h-3 text-brand dark:text-brand-dark-DEFAULT" />
            <span className="text-[11px] font-bold text-brand dark:text-brand-dark-DEFAULT">{Math.round(rec.final_score * 100)}%</span>
          </div>
        </div>
        {rec.reason && <p className="mt-2 text-[11px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{rec.reason}</p>}
      </div>
    </motion.div>
  )
}

function StudentCard({ rec, index }: { rec: StudentRecommendation; index: number }) {
  const navigate = useNavigate()
  const name = `${rec.student.first_name} ${rec.student.last_name}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/profile/${rec.student.id}`)}
      className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors cursor-pointer group bg-canvas-default dark:bg-canvas-dark-default"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={name} src={rec.student.avatar_url ?? undefined} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors truncate">{name}</p>
              {rec.student.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-success-fg dark:text-success-dark-fg shrink-0" />}
            </div>
            {rec.student.headline && <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5 truncate">{rec.student.headline}</p>}
            {rec.student.university && <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted truncate">{rec.student.university}</p>}
          </div>
          {rec.scores.total_reviews > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default">{rec.scores.overall_avg.toFixed(1)}</span>
              <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">({rec.scores.total_reviews})</span>
            </div>
          )}
        </div>
        {rec.student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rec.student.skills.slice(0, 5).map((s) => (
              <span key={s.id} className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{s.name}</span>
            ))}
            {rec.student.skills.length > 5 && <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted self-center">+{rec.student.skills.length - 5}</span>}
          </div>
        )}
        <div className="pt-3 border-t border-border-default dark:border-border-dark-default flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ScoreDot value={rec.vector_score} label="Relevance" />
            <ScoreDot value={rec.reputation_score} label="Reputation" />
            <ScoreDot value={rec.activity_score} label="Activity" />
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-brand/40 dark:border-brand-dark-DEFAULT/40">
            <HiOutlineSparkles className="w-3 h-3 text-brand dark:text-brand-dark-DEFAULT" />
            <span className="text-[11px] font-bold text-brand dark:text-brand-dark-DEFAULT">{Math.round(rec.final_score * 100)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const [recListings, setRecListings] = useState<ListingRecommendation[]>([])
  const [recStudents, setRecStudents] = useState<StudentRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<'listings' | 'students'>('listings')

  useEffect(() => {
    aiService.getHomeFeed()
      .then((feed) => { setRecListings(feed.recommended_listings); setRecStudents(feed.recommended_students) })
      .catch(() => setError('Failed to load recommendations'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className={sectionCls}>
        <div className={headCls}>
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">For You</span>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <HiOutlineSparkles className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">Recommendations</p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">Personalized listings and students based on your profile and activity</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {(['listings', 'students'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-1.5 text-[12px] font-medium rounded-lg capitalize transition-colors cursor-pointer border',
              tab === t
                ? 'border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
            )}
          >
            {t === 'listings' ? `Listings (${recListings.length})` : `Students (${recStudents.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg border border-danger-fg/40 dark:border-danger-dark-fg/40 bg-canvas-inset dark:bg-canvas-dark-inset text-[12px] text-danger-fg dark:text-danger-dark-fg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT animate-spin" />
        </div>
      ) : tab === 'listings' ? (
        recListings.length === 0 ? (
          <div className={clsx(sectionCls, 'p-12 text-center')}>
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No listing recommendations yet — add skills to your profile to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recListings.map((r, i) => <ListingCard key={r.listing.id} rec={r} index={i} />)}
          </div>
        )
      ) : (
        recStudents.length === 0 ? (
          <div className={clsx(sectionCls, 'p-12 text-center')}>
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No student recommendations yet — create a listing to find matching students</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recStudents.map((r, i) => <StudentCard key={r.student.id} rec={r} index={i} />)}
          </div>
        )
      )}
    </div>
  )
}
