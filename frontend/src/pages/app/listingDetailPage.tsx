import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineMapPin, HiOutlineLink, HiOutlineClock, HiOutlineChatBubbleLeftRight,
  HiOutlineCheckBadge, HiStar, HiOutlineStar, HiOutlineArrowLeft,
  HiOutlineCalendar, HiOutlineShieldCheck, HiOutlinePencilSquare,
  HiOutlineTag, HiOutlineUser,
} from 'react-icons/hi2'
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

const dot = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT'
const sectionHeader = 'px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between'

function StarBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-border-default dark:bg-border-dark-default overflow-hidden">
        <div className="h-full bg-brand dark:bg-brand-dark-DEFAULT" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="font-mono text-[10px] font-semibold text-fg-default dark:text-fg-dark-default w-6 text-right tabular-nums">{value.toFixed(1)}</span>
    </div>
  )
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= Math.round(value)
          ? <HiStar key={s} className={clsx(cls, 'text-brand dark:text-brand-dark-DEFAULT')} />
          : <HiOutlineStar key={s} className={clsx(cls, 'text-border-default dark:text-border-dark-default')} />
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const avg = (review.reliability_score + review.professionalism_score + review.growth_score) / 3
  const name = `${review.reviewer.first_name} ${review.reviewer.last_name}`
  const date = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-border-default dark:border-border-dark-default last:border-0">
      <Avatar name={name} src={review.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-mono text-[11px] font-semibold text-fg-default dark:text-fg-dark-default">{name}</p>
          <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted shrink-0">{date}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <Stars value={avg} />
          <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">{avg.toFixed(1)}</span>
        </div>
        {review.comment && (
          <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{review.comment}</p>
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
    <div className="space-y-4 animate-pulse">
      <div className="h-3 w-12 bg-border-default dark:bg-border-dark-default" />
      <div className="border border-border-default dark:border-border-dark-default h-32" />
      <div className="border border-border-default dark:border-border-dark-default h-48" />
    </div>
  )

  if (!listing) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="font-mono text-[11px] text-fg-default dark:text-fg-dark-default">listing not found</p>
      <button onClick={() => navigate(-1)} className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer">&gt; go back</button>
    </div>
  )

  const ownerName = `${listing.owner.first_name} ${listing.owner.last_name}`
  const isOwner = user?.id === listing.owner_id
  const listedDate = new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="space-y-4">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer"
      >
        <HiOutlineArrowLeft className="w-3.5 h-3.5" /> back
      </button>

      <div className="flex gap-6 items-start">
        {/* ── Main column ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Seller card */}
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-default">
            {listing.is_active && <div className="h-[2px] bg-brand dark:bg-brand-dark-DEFAULT" />}
            <div className={sectionHeader}>
              <div className="flex items-center gap-1.5">
                <span className={dot} />
                <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">seller</span>
              </div>
              <span className={clsx(
                'font-mono text-[8px] tracking-wide uppercase px-1.5 py-0.5 border',
                listing.is_active
                  ? 'text-success-fg dark:text-success-dark-fg border-success-muted dark:border-success-dark-muted'
                  : 'text-fg-muted dark:text-fg-dark-muted border-border-default dark:border-border-dark-default',
              )}>
                {listing.is_active ? 'available' : 'busy'}
              </span>
            </div>
            <div className="p-4 flex items-start gap-4">
              <Link to={`/app/profile/${listing.owner_id}`}>
                <Avatar name={ownerName} src={listing.owner.avatar_url ?? undefined} size="lg" showStatus={listing.is_active} />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/app/profile/${listing.owner_id}`}
                    className="font-mono text-[13px] font-semibold text-fg-default dark:text-fg-dark-default hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors"
                  >
                    {ownerName}
                  </Link>
                  {listing.owner.is_verified && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-success-muted dark:border-success-dark-muted text-success-fg dark:text-success-dark-fg font-mono text-[8px] tracking-wide">
                      <HiOutlineCheckBadge className="w-3 h-3" /> verified
                    </span>
                  )}
                </div>
                {listing.owner.headline && (
                  <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{listing.owner.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                  {listing.owner.university && (
                    <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3 h-3" />{listing.owner.university}</span>
                  )}
                  {listing.owner.portfolio_url && (
                    <a href={listing.owner.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HiOutlineLink className="w-3 h-3" />
                      {listing.owner.portfolio_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3 h-3" />listed {listedDate}</span>
                </div>
                {aggregate && aggregate.total_reviews > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Stars value={aggregate.overall_avg} />
                    <span className="font-mono text-[10px] font-semibold text-fg-default dark:text-fg-dark-default">{aggregate.overall_avg.toFixed(1)}</span>
                    <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">({aggregate.total_reviews} review{aggregate.total_reviews !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Listing info */}
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-default">
            <div className={sectionHeader}>
              <div className="flex items-center gap-1.5">
                <span className={dot} />
                <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">listing</span>
              </div>
              <span className="font-mono text-[13px] font-bold text-fg-default dark:text-fg-dark-default tabular-nums">{formatPrice(listing)}</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h1 className="font-mono text-[16px] font-semibold text-fg-default dark:text-fg-dark-default leading-snug">{listing.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT">
                    {listing.category}
                  </span>
                  <span className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted capitalize flex items-center gap-1">
                    <HiOutlineTag className="w-2.5 h-2.5" />{listing.listing_type}
                  </span>
                  {listing.delivery_days && (
                    <span className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted flex items-center gap-1">
                      <HiOutlineClock className="w-2.5 h-2.5" />{listing.delivery_days}d delivery
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-border-default dark:bg-border-dark-default" />

              <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted leading-relaxed whitespace-pre-line">{listing.description}</p>

              {listing.skills.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase mb-2">skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.skills.map((s) => (
                      <span key={s.id} className="font-mono text-[9px] tracking-wide px-2 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-default">
            <div className={sectionHeader}>
              <div className="flex items-center gap-1.5">
                <span className={dot} />
                <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">
                  reviews{aggregate && aggregate.total_reviews > 0 && ` (${aggregate.total_reviews})`}
                </span>
              </div>
              {!isOwner && (
                <button
                  onClick={() => setShowReview((v) => !v)}
                  className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer"
                >
                  {showReview ? 'cancel' : '+ leave a review'}
                </button>
              )}
            </div>

            {/* Review form */}
            {showReview && (
              <form onSubmit={handleReview} className="p-4 border-b border-border-default dark:border-border-dark-default space-y-4 bg-canvas-inset dark:bg-canvas-dark-inset">
                {(['reliability_score', 'professionalism_score', 'growth_score'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted w-32 shrink-0 capitalize">
                      {key.replace('_score', '').replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewForm((f) => ({ ...f, [key]: s }))} className="cursor-pointer">
                          {s <= reviewForm[key]
                            ? <HiStar className="w-5 h-5 text-brand dark:text-brand-dark-DEFAULT" />
                            : <HiOutlineStar className="w-5 h-5 text-border-default dark:text-border-dark-default" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <textarea
                  rows={3}
                  placeholder="share your experience (optional)…"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full px-3 py-2 font-mono text-[11px] bg-canvas-overlay dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT resize-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submittingReview ? 'submitting…' : 'submit review'}
                </button>
              </form>
            )}

            {/* Aggregate scores */}
            {aggregate && aggregate.total_reviews > 0 && (
              <div className="p-4 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
                <div className="flex items-center gap-6">
                  <div className="shrink-0 text-center">
                    <p className="font-mono text-[36px] font-bold text-fg-default dark:text-fg-dark-default leading-none tabular-nums">
                      {aggregate.overall_avg.toFixed(1)}
                    </p>
                    <div className="mt-1.5 flex justify-center">
                      <Stars value={aggregate.overall_avg} size="md" />
                    </div>
                    <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-1">{aggregate.total_reviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <StarBar value={aggregate.avg_reliability} label="reliability" />
                    <StarBar value={aggregate.avg_professionalism} label="professionalism" />
                    <StarBar value={aggregate.avg_growth} label="growth" />
                  </div>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <HiOutlineStar className="w-6 h-6 text-border-default dark:text-border-dark-default" />
                <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">~ no reviews yet</p>
              </div>
            ) : (
              <div>{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
            )}
          </div>
        </div>

        {/* ── Sticky sidebar ── */}
        <div className="hidden lg:flex flex-col gap-4 w-[220px] shrink-0 sticky top-5">

          {/* CTA card */}
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-default">
            <div className="px-4 py-3 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
              <p className="font-mono text-[20px] font-bold text-fg-default dark:text-fg-dark-default tabular-nums leading-none">{formatPrice(listing)}</p>
              {listing.delivery_days && (
                <p className="flex items-center gap-1 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-1">
                  <HiOutlineClock className="w-3 h-3" />{listing.delivery_days} day delivery
                </p>
              )}
            </div>
            <div className="p-3 space-y-2">
              {isOwner ? (
                <Link
                  to={`/app/listings/${listing.id}/edit`}
                  className="flex items-center justify-center gap-2 w-full py-2 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors"
                >
                  <HiOutlinePencilSquare className="w-3.5 h-3.5" /> edit listing
                </Link>
              ) : (
                <button
                  onClick={handleMessage}
                  disabled={messaging}
                  className="flex items-center justify-center gap-2 w-full py-2 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-60"
                >
                  <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                  {messaging ? 'opening…' : 'message'}
                </button>
              )}
              <Link
                to={`/app/profile/${listing.owner_id}`}
                className="flex items-center justify-center gap-2 w-full py-2 font-mono text-[10px] tracking-wide border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors"
              >
                <HiOutlineUser className="w-3.5 h-3.5" /> view profile
              </Link>
            </div>
          </div>

          {/* Verified badge */}
          {listing.owner.is_verified && (
            <div className="border border-success-muted dark:border-success-dark-muted bg-success-subtle dark:bg-success-dark-subtle p-3 flex items-start gap-3">
              <HiOutlineShieldCheck className="w-4 h-4 text-success-fg dark:text-success-dark-fg shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-[10px] font-semibold text-success-fg dark:text-success-dark-fg">verified student</p>
                <p className="font-mono text-[9px] text-success-fg/70 dark:text-success-dark-fg/70 mt-0.5">identity confirmed via university email</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
