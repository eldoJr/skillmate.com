import { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlinePlusCircle, HiOutlineClock,
  HiOutlineArrowPath, HiOutlineXMark, HiOutlineMagnifyingGlass,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { listingsService, type Listing } from '../../services/listings'
import { categories } from '../../components/app/listingForm'

const filters = ['all', 'programming', 'design', 'writing', 'tutoring', 'video editing', 'data analysis', 'other'] as const
type Filter = typeof filters[number]

function formatBudget(l: Listing) {
  if (l.price) return `R${l.price}`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'negotiable'
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

const inputCls = [
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-canvas-overlay dark:bg-canvas-dark-inset',
  'border border-border-default dark:border-border-dark-default',
  'text-fg-default dark:text-fg-dark-default',
  'placeholder-fg-subtle dark:placeholder-fg-dark-subtle',
  'outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT',
  'transition-colors duration-150',
].join(' ')

const dot = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT'
const sectionHeader = 'px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">
        {label}{required && <span className="text-danger-fg dark:text-danger-dark-fg ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function RequestCard({ req }: { req: Listing }) {
  const ownerName = `${req.owner.first_name} ${req.owner.last_name}`
  const budget = formatBudget(req)
  const isNegotiable = budget === 'negotiable'

  return (
    <div className="border border-border-default dark:border-border-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors bg-canvas-overlay dark:bg-canvas-dark-default group">
      {/* Top strip */}
      <div className="h-[2px] bg-brand dark:bg-brand-dark-DEFAULT opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-4 flex items-start gap-3">
        <Avatar name={ownerName} src={req.owner.avatar_url ?? undefined} size="md" />

        <div className="flex-1 min-w-0">
          {/* Title + budget */}
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[12px] font-semibold text-fg-default dark:text-fg-dark-default leading-snug group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors">
              {req.title}
            </p>
            <span className={clsx(
              'shrink-0 font-mono text-[11px] font-bold',
              isNegotiable ? 'text-fg-muted dark:text-fg-dark-muted' : 'text-success-fg dark:text-success-dark-fg',
            )}>
              {budget}
            </span>
          </div>

          {/* Owner meta */}
          <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
            {ownerName}
            {req.owner.university && <> · {req.owner.university}</>}
            {' · '}{timeAgo(req.created_at)}
          </p>

          {/* Description */}
          <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-2 leading-relaxed line-clamp-2">
            {req.description}
          </p>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="font-mono text-[8px] tracking-wide px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">
              {req.category.toLowerCase()}
            </span>
            {req.delivery_days && (
              <span className="flex items-center gap-1 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                <HiOutlineClock className="w-3 h-3" />due in {req.delivery_days}d
              </span>
            )}
            <button className="ml-auto px-3 py-1 font-mono text-[9px] tracking-wide border border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors cursor-pointer">
              apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RequestsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ title: '', description: '', category: '', budget: '', deadline: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = { listing_type: 'project', page_size: 20 }
      if (activeFilter !== 'all') params.category = activeFilter
      if (search) params.search = search
      const res = await listingsService.getAll(params)
      setListings(res.items)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, search])

  useEffect(() => {
    const t = setTimeout(fetchRequests, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchRequests, search])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await listingsService.create({
        title: form.title,
        description: form.description,
        category: form.category || 'Other',
        listing_type: 'project',
        price: form.budget ? parseFloat(form.budget.replace(/[^0-9.]/g, '')) : null,
      })
      setShowForm(false)
      setForm({ title: '', description: '', category: '', budget: '', deadline: '' })
      fetchRequests()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setFormError(msg ?? 'failed to post request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">

        {/* Header */}
        <div className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHeader}>
            <div className="flex items-center gap-1.5">
              <span className={dot} />
              <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">task requests</span>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-wide border transition-colors cursor-pointer',
                showForm
                  ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white border-brand dark:border-brand-dark-DEFAULT'
                  : 'border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white',
              )}
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5" />
              post request
            </button>
          </div>
          <div className="px-4 py-2.5">
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
              {loading ? '—' : `${total} open request${total !== 1 ? 's' : ''}`}
              <span className="ml-2 text-fg-subtle dark:text-fg-dark-subtle">· students looking for skills — apply to help them</span>
            </p>
          </div>
        </div>

        {/* Post form */}
        {showForm && (
          <div className="border border-brand/30 dark:border-brand-dark-DEFAULT/30 bg-canvas-overlay dark:bg-canvas-dark-default">
            <div className="px-4 py-2.5 border-b border-brand/30 dark:border-brand-dark-DEFAULT/30 bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={dot} />
                <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">new request</span>
              </div>
              <button onClick={() => setShowForm(false)} className="text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                <HiOutlineXMark className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handlePost} className="p-4 space-y-3">
              {formError && (
                <div className="px-3 py-2 border border-danger-muted dark:border-danger-dark-muted bg-danger-subtle dark:bg-danger-dark-subtle font-mono text-[10px] text-danger-fg dark:text-danger-dark-fg">
                  ! {formError}
                </div>
              )}
              <Field label="title" required>
                <input
                  type="text" required
                  placeholder="what do you need help with?"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="description" required>
                <textarea
                  rows={3} required
                  placeholder="describe your request in detail…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={clsx(inputCls, 'resize-none')}
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={clsx(inputCls, 'appearance-none cursor-pointer')}
                  >
                    <option value="">select…</option>
                    {categories.map((c) => <option key={c} value={c}>{c.toLowerCase()}</option>)}
                  </select>
                </Field>
                <Field label="budget (R)">
                  <input
                    type="text"
                    placeholder="e.g. 200"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    className={inputCls}
                  />
                </Field>
                <Field label="deadline">
                  <input
                    type="text"
                    placeholder="e.g. 3 days"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 font-mono text-[10px] tracking-wide border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:border-fg-muted dark:hover:border-fg-dark-muted transition-colors cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                  {submitting ? 'posting…' : 'post request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="border border-border-default dark:border-border-dark-default flex items-center">
          <span className="px-3 font-mono text-[11px] text-brand dark:text-brand-dark-DEFAULT select-none border-r border-border-default dark:border-border-dark-default py-2.5">
            {loading ? '~' : '$'}
          </span>
          <HiOutlineMagnifyingGlass className="ml-3 w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search requests…"
            className="flex-1 px-3 py-2.5 font-mono text-[11px] tracking-wide bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-3 text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
            >
              <HiOutlineXMark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center border border-border-default dark:border-border-dark-default overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={clsx(
                'px-3 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer border-r border-border-default dark:border-border-dark-default last:border-r-0 border-b-2',
                activeFilter === f
                  ? 'border-b-brand dark:border-b-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                  : 'border-b-transparent text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="border border-border-default dark:border-border-dark-default p-12 text-center">
            <HiOutlineClipboardDocumentList className="w-6 h-6 text-fg-muted dark:text-fg-dark-muted mx-auto mb-2" />
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">~ no requests found</p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-2 font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer">
                &gt; clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {listings.map((req) => <RequestCard key={req.id} req={req} />)}
          </div>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <div className="w-[220px] shrink-0 hidden lg:flex flex-col gap-4">

        <div className="border border-border-default dark:border-border-dark-default">
          <div className="px-3 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5">
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">how it works</span>
          </div>
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {[
              { n: '01', t: 'browse requests', d: 'find tasks that match your skills' },
              { n: '02', t: 'apply',           d: 'send a short pitch to the requester' },
              { n: '03', t: 'get hired',       d: 'agree on scope and get to work' },
              { n: '04', t: 'get paid',        d: 'receive payment on completion' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-2.5 px-3 py-2.5">
                <span className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT shrink-0 mt-0.5">{n}</span>
                <div>
                  <p className="font-mono text-[9px] font-medium text-fg-default dark:text-fg-dark-default">{t}</p>
                  <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border-default dark:border-border-dark-default">
          <div className="px-3 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5">
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">tips</span>
          </div>
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {[
              'be specific about your budget',
              'include a clear deadline',
              'describe the expected output',
              'mention your tech stack if relevant',
            ].map((tip, i) => (
              <div key={i} className="flex gap-2.5 px-3 py-2.5">
                <span className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
