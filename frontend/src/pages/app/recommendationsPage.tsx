import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineClock,
  HiOutlineCheckBadge, HiOutlineStar,
} from 'react-icons/hi2'
import { aiService, type ListingRecommendation, type StudentRecommendation } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

function ScorePill({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{pct}%</span>
      <span className="text-[9px] text-[#636c76] dark:text-[#848d97] uppercase tracking-wide">{label}</span>
    </div>
  )
}

function ListingCard({ rec, index }: { rec: ListingRecommendation; index: number }) {
  const navigate = useNavigate()
  const { listing } = rec
  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/listings/${listing.id}`)}
      className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 cursor-pointer hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors truncate">{listing.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{ownerName}</span>
            {listing.owner.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[14px] font-bold text-[#1f2328] dark:text-[#e6edf3]">
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
        </div>
      )}

      <div className="pt-3 border-t border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ScorePill value={rec.vector_score} label="Relevance" />
          <ScorePill value={rec.reputation_score} label="Reputation" />
          <ScorePill value={rec.activity_score} label="Activity" />
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f]">
          <HiOutlineSparkles className="w-3 h-3 text-[#0969da] dark:text-[#2f81f7]" />
          <span className="text-[11px] font-bold text-[#0969da] dark:text-[#2f81f7]">{Math.round(rec.final_score * 100)}%</span>
        </div>
      </div>

      {rec.reason && <p className="mt-2 text-[11px] text-[#636c76] dark:text-[#848d97] italic">{rec.reason}</p>}
    </motion.div>
  )
}

function StudentCard({ rec, index }: { rec: StudentRecommendation; index: number }) {
  const navigate = useNavigate()
  const name = `${rec.student.first_name} ${rec.student.last_name}`
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/profile/${rec.student.id}`)}
      className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 cursor-pointer hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={name} src={rec.student.avatar_url ?? undefined} size="md" className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">{name}</p>
            {rec.student.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950] shrink-0" />}
          </div>
          {rec.student.headline && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5 truncate">{rec.student.headline}</p>}
          {rec.student.university && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] truncate">{rec.student.university}</p>}
        </div>
        {rec.scores.total_reviews > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <HiOutlineStar className="w-3.5 h-3.5 text-[#9a6700] dark:text-[#d29922]" />
            <span className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{rec.scores.overall_avg.toFixed(1)}</span>
            <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">({rec.scores.total_reviews})</span>
          </div>
        )}
      </div>

      {rec.student.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {rec.student.skills.slice(0, 5).map((s) => (
            <span key={s.id} className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{s.name}</span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ScorePill value={rec.vector_score} label="Relevance" />
          <ScorePill value={rec.reputation_score} label="Reputation" />
          <ScorePill value={rec.activity_score} label="Activity" />
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f]">
          <HiOutlineSparkles className="w-3 h-3 text-[#0969da] dark:text-[#2f81f7]" />
          <span className="text-[11px] font-bold text-[#0969da] dark:text-[#2f81f7]">{Math.round(rec.final_score * 100)}%</span>
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
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3] flex items-center gap-2">
          <HiOutlineSparkles className="w-5 h-5 text-[#8250df]" /> Recommendations
        </h2>
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Personalized listings and students based on your profile and activity.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d] w-fit">
        {(['listings', 'students'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer capitalize ${
              tab === t ? 'bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#e6edf3] shadow-sm' : 'text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]'
            }`}
          >
            {t === 'listings' ? `Listings (${listings.length})` : `Students (${students.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <HiOutlineArrowPath className="w-6 h-6 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : tab === 'listings' ? (
        listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HiOutlineSparkles className="w-10 h-10 text-[#d0d7de] dark:text-[#30363d] mb-3" />
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No listing recommendations yet. Add skills to your profile to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">{listings.map((r, i) => <ListingCard key={r.listing.id} rec={r} index={i} />)}</div>
        )
      ) : (
        students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HiOutlineSparkles className="w-10 h-10 text-[#d0d7de] dark:text-[#30363d] mb-3" />
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No student recommendations yet.</p>
          </div>
        ) : (
          <div className="space-y-3">{students.map((r, i) => <StudentCard key={r.student.id} rec={r} index={i} />)}</div>
        )
      )}
    </div>
  )
}
