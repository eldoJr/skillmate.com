import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineMapPin, HiOutlineLink, HiOutlineClock, HiOutlineChatBubbleLeftRight,
  HiOutlineCheckBadge, HiStar, HiOutlineStar, HiOutlineArrowLeft,
  HiOutlineCalendar, HiOutlineShieldCheck, HiOutlinePencilSquare,
  HiOutlineTag, HiOutlineUser,
} from 'react-icons/hi2'
import { motion } from 'framer-motion'
import Avatar from '../../components/atoms/avatar'
import { listingsService, type Listing } from '../../services/listings'
import { reviewsService, type AggregateScores, type Review } from '../../services/reviews'
import { messagesService } from '../../services/messages'
import { useAuth } from '../../contexts/AuthContext'

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

function StarBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#636c76] dark:text-[#848d97] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
        <div className="h-full rounded-full bg-[#d29922] dark:bg-[#d29922]" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3] w-6 text-right tabular-nums">{value.toFixed(1)}</span>
    </div>
  )
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= Math.round(value)
          ? <HiStar key={s} className={clsx(cls, 'text-[#d29922]')} />
          : <HiOutlineStar key={s} className={clsx(cls, 'text-[#d0d7de] dark:text-[#30363d]')} />
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const avg = (review.reliability_score + review.professionalism_score + review.growth_score) / 3
  const name = `${review.reviewer.first_name} ${review.reviewer.last_name}`
  const date = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return (
    <div className="flex gap-3 py-4 border-b border-[#f6f8fa] dark:border-[#21262d] last:border-0 last:pb-0">
      <Avatar name={name} src={review.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{name}</p>
          <span className="text-[10px] text-[#636c76] dark:text-[#848d97] shrink-0">{date}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Stars value={avg} />
          <span className="text-[10px] text-[#636c76] dark:text-[#848d97]">{avg.toFixed(1)}</span>
        </div>
        {review.comment && (
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [aggregate, setAggregate] = useState<AggregateScores | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ reliability_score: 5, professionalism_score: 5, growth_score: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    listingsService.getById(id)
      .then((l) => {
        setListing(l)
        return Promise.all([reviewsService.getAggregate(l.owner_id), reviewsService.getForUser(l.owner_id)])
      })
      .then(([agg, rev]) => { setAggregate(agg); setReviews(rev.items) })
      .finally(() => setLoading(false))
  }, [id])

  const handleMessage = async () => {
    if (!listing) return
    setMessaging(true)
    try {
      await messagesService.send(listing.owner_id, `Hi! I'm interested in your listing: "${listing.title}"`)
      navigate(`/app/messages?partner=${listing.owner_id}`)
    } finally { setMessaging(false) }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listing) return
    setSubmittingReview(true)
    try {
      const r = await reviewsService.submit({ ...reviewForm, reviewee_id: listing.owner_id, listing_id: listing.id })
      setReviews((prev) => [r, ...prev])
      setShowReview(false)
      reviewsService.getAggregate(listing.owner_id).then(setAggregate)
    } finally { setSubmittingReview(false) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
      <div className="h-4 w-16 rounded-lg bg-[#f6f8fa] dark:bg-[#21262d]" />
      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] h-40" />
      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] h-64" />
    </div>
  )

  if (!listing) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Listing not found</p>
      <button onClick={() => navigate(-1)} className="text-[12px] text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">Go back</button>
    </div>
  )

  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`
  const isOwner = user?.id === listing.owner_id
  const listedDate = new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer"
      >
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex gap-6 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Seller card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden"
          >
            {/* Subtle top accent */}
            <div className="h-[3px] bg-gradient-to-r from-[#0969da] via-[#2f81f7] to-[#388bfd]" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Link to={`/app/profile/${listing.owner_id}`}>
                  <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="lg" showStatus={listing.is_active} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/app/profile/${listing.owner_id}`}
                          className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors"
                        >
                          {ownerName}
                        </Link>
                        {listing.owner.is_verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950] text-[10px] font-semibold">
                            <HiOutlineCheckBadge className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      {listing.owner.headline && (
                        <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">{listing.owner.headline}</p>
                      )}
                    </div>
                    <span className={clsx(
                      'px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0',
                      listing.is_active
                        ? 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]'
                        : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                    )}>
                      {listing.is_active ? 'Available' : 'Busy'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-[#636c76] dark:text-[#848d97]">
                    {listing.owner.university && (
                      <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{listing.owner.university}</span>
                    )}
                    {listing.owner.portfolio_url && (
                      <a href={listing.owner.portfolio_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HiOutlineLink className="w-3.5 h-3.5" />
                        {listing.owner.portfolio_url.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" />Listed {listedDate}</span>
                  </div>

                  {aggregate && aggregate.total_reviews > 0 && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <Stars value={aggregate.overall_avg} />
                      <span className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{aggregate.overall_avg.toFixed(1)}</span>
                      <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">({aggregate.total_reviews} review{aggregate.total_reviews !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Listing info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}
            className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-6 space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-snug">{listing.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">
                    {listing.category}
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] capitalize flex items-center gap-1">
                    <HiOutlineTag className="w-3 h-3" />{listing.listing_type}
                  </span>
                  {listing.delivery_days && (
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] flex items-center gap-1">
                      <HiOutlineClock className="w-3 h-3" />{listing.delivery_days}d delivery
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[24px] font-bold text-[#1f2328] dark:text-[#e6edf3] shrink-0 tabular-nums">{formatPrice(listing)}</p>
            </div>

            <div className="h-px bg-[#f6f8fa] dark:bg-[#21262d]" />

            <p className="text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed whitespace-pre-line">{listing.description}</p>

            {listing.skills.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-2.5">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {listing.skills.map((s) => (
                    <span key={s.id} className="px-3 py-1 text-[11px] font-medium rounded-lg bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}
            className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                Reviews
                {aggregate && aggregate.total_reviews > 0 && (
                  <span className="ml-2 text-[#636c76] dark:text-[#848d97] font-normal text-[13px]">({aggregate.total_reviews})</span>
                )}
              </h2>
              {!isOwner && (
                <button
                  onClick={() => setShowReview((v) => !v)}
                  className="text-[11px] font-semibold text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer"
                >
                  {showReview ? 'Cancel' : '+ Leave a review'}
                </button>
              )}
            </div>

            {/* Review form */}
            {showReview && (
              <form onSubmit={handleReview} className="mb-6 p-4 rounded-xl border border-[#0969da]/20 dark:border-[#2f81f7]/20 bg-[#f6f8fa] dark:bg-[#0d1117] space-y-4">
                {(['reliability_score', 'professionalism_score', 'growth_score'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-[11px] text-[#636c76] dark:text-[#848d97] w-32 shrink-0 capitalize">
                      {key.replace('_score', '').replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewForm((f) => ({ ...f, [key]: s }))} className="cursor-pointer">
                          {s <= reviewForm[key]
                            ? <HiStar className="w-5 h-5 text-[#d29922]" />
                            : <HiOutlineStar className="w-5 h-5 text-[#d0d7de] dark:text-[#30363d]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <textarea
                  rows={3}
                  placeholder="Share your experience (optional)…"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-[12px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] resize-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Aggregate scores */}
            {aggregate && aggregate.total_reviews > 0 && (
              <div className="mb-6 p-5 rounded-xl bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d]">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-[40px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none tabular-nums">
                      {aggregate.overall_avg.toFixed(1)}
                    </p>
                    <div className="mt-1.5">
                      <Stars value={aggregate.overall_avg} size="md" />
                    </div>
                    <p className="text-[10px] text-[#636c76] dark:text-[#848d97] mt-1">{aggregate.total_reviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <StarBar value={aggregate.avg_reliability} label="Reliability" />
                    <StarBar value={aggregate.avg_professionalism} label="Professionalism" />
                    <StarBar value={aggregate.avg_growth} label="Growth" />
                  </div>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <HiOutlineStar className="w-8 h-8 text-[#d0d7de] dark:text-[#30363d]" />
                <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No reviews yet</p>
              </div>
            ) : (
              <div>
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sticky sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-[220px] shrink-0 sticky top-5">
          <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
            <div>
              <p className="text-[26px] font-bold text-[#1f2328] dark:text-[#e6edf3] tabular-nums leading-none">{formatPrice(listing)}</p>
              {listing.delivery_days && (
                <p className="flex items-center gap-1.5 text-[11px] text-[#636c76] dark:text-[#848d97] mt-1.5">
                  <HiOutlineClock className="w-3.5 h-3.5" />{listing.delivery_days} day delivery
                </p>
              )}
            </div>

            <div className="space-y-2">
              {isOwner ? (
                <Link
                  to={`/app/listings/${listing.id}/edit`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors"
                >
                  <HiOutlinePencilSquare className="w-4 h-4" /> Edit Listing
                </Link>
              ) : (
                <button
                  onClick={handleMessage}
                  disabled={messaging}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                  {messaging ? 'Opening…' : 'Message'}
                </button>
              )}
              <Link
                to={`/app/profile/${listing.owner_id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors"
              >
                <HiOutlineUser className="w-3.5 h-3.5" /> View Profile
              </Link>
            </div>
          </div>

          {listing.owner.is_verified && (
            <div className="rounded-2xl bg-[#dafbe1] dark:bg-[#0f2d1a] border border-[#aef0b8] dark:border-[#1f5f33] p-4 flex items-start gap-3">
              <HiOutlineShieldCheck className="w-5 h-5 text-[#1a7f37] dark:text-[#3fb950] shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">Verified Student</p>
                <p className="text-[11px] text-[#1a7f37]/70 dark:text-[#3fb950]/70 mt-0.5">Identity confirmed via university email.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
