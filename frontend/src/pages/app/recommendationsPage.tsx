import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineArrowPath, HiOutlineClock, HiOutlineCheckBadge, HiOutlineStar } from 'react-icons/hi2'
import { aiService, type ListingRecommendation, type StudentRecommendation } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

function ScoreDot({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-[10px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{pct}%</span>
      <span className="font-mono text-[8px] tracking-wide text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
    </div>
  )
}

function ListingCard({ rec, index }: { rec: ListingRecommendation; index: number }) {
  const navigate = useNavigate()
  const { listing } = rec
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
          </div>
        )}
        <div className="pt-3 border-t border-[#e2e4e8] dark:border-[#1e2228] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ScoreDot value={rec.vector_score} label="relevance" />
            <ScoreDot value={rec.reputation_score} label="reputation" />
            <ScoreDot value={rec.activity_score} label="activity" />
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 border border-[#e8490f]/40 dark:border-[#ff6b35]/40">
            <HiOutlineSparkles className="w-3 h-3 text-[#e8490f] dark:text-[#ff6b35]" />
            <span className="font-mono text-[9px] font-bold text-[#e8490f] dark:text-[#ff6b35]">{Math.round(rec.final_score * 100)}%</span>
          </div>
        </div>
        {rec.reason && <p className="mt-2 font-mono text-[9px] text-[#636c76] dark:text-[#848d97] leading-relaxed"><span className="text-[#e8490f] dark:text-[#ff6b35] mr-1">›</span>{rec.reason}</p>}
      </div>
    </motion.div>
  )
}

function StudentCard({ rec, index }: { rec: StudentRecommendation; index: number }) {
  const navigate = useNavigate()
  const name = `${rec.student.first_name} ${rec.student.last_name}`
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/profile/${rec.student.id}`)}
      className="border border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f]/40 dark:hover:border-[#ff6b35]/40 transition-colors cursor-pointer group"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={name} src={rec.student.avatar_url ?? undefined} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#e8490f] dark:group-hover:text-[#ff6b35] transition-colors">{name}</p>
              {rec.student.is_verified && <HiOutlineCheckBadge className="w-3 h-3 text-[#22c55e] shrink-0" />}
            </div>
            {rec.student.headline && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5 truncate">{rec.student.headline}</p>}
            {rec.student.university && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">{rec.student.university}</p>}
          </div>
          {rec.scores.total_reviews > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <HiOutlineStar className="w-3 h-3 text-[#d29922]" />
              <span className="font-mono text-[10px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{rec.scores.overall_avg.toFixed(1)}</span>
              <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">({rec.scores.total_reviews})</span>
            </div>
          )}
        </div>
        {rec.student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rec.student.skills.slice(0, 5).map((s) => (
              <span key={s.id} className="px-2 py-0.5 font-mono text-[9px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{s.name}</span>
            ))}
          </div>
        )}
        <div className="pt-3 border-t border-[#e2e4e8] dark:border-[#1e2228] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ScoreDot value={rec.vector_score} label="relevance" />
            <ScoreDot value={rec.reputation_score} label="reputation" />
            <ScoreDot value={rec.activity_score} label="activity" />
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 border border-[#e8490f]/40 dark:border-[#ff6b35]/40">
            <HiOutlineSparkles className="w-3 h-3 text-[#e8490f] dark:text-[#ff6b35]" />
            <span className="font-mono text-[9px] font-bold text-[#e8490f] dark:text-[#ff6b35]">{Math.round(rec.final_score * 100)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const [listings, setListings] = useState<ListingRecommendation[]>([])
  const [students, setStudents] = useState<StudentRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'listings' | 'students'>('listings')

  useEffect(() => {
    aiService.getHomeFeed()
      .then((feed) => { setListings(feed.recommended_listings); setStudents(feed.recommended_students) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">for you</span>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">recommendations</p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">personalized listings and students based on your profile and activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#e2e4e8] dark:border-[#1e2228] overflow-hidden pb-px">
        {(['listings', 'students'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2',
              tab === t
                ? 'border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35]'
                : 'border-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
            )}
          >
            {t === 'listings' ? `listings (${listings.length})` : `students (${students.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : tab === 'listings' ? (
        listings.length === 0 ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
            <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no listing recommendations yet — add skills to your profile to get started</p>
          </div>
        ) : (
          <div className="space-y-3">{listings.map((r, i) => <ListingCard key={r.listing.id} rec={r} index={i} />)}</div>
        )
      ) : (
        students.length === 0 ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
            <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no student recommendations yet</p>
          </div>
        ) : (
          <div className="space-y-3">{students.map((r, i) => <StudentCard key={r.student.id} rec={r} index={i} />)}</div>
        )
      )}
    </div>
  )
}
