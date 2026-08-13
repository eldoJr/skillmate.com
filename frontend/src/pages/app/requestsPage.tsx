import { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlinePlusCircle, HiOutlineClock,
  HiOutlineArrowPath, HiOutlineXMark,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { listingsService, type Listing } from '../../services/listings'
import { categories } from '../../components/app/listingForm'

const filters = ['all', 'programming', 'design', 'writing', 'tutoring', 'video editing', 'data analysis', 'other'] as const
type Filter = typeof filters[number]

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'negotiable'
}

function formatTime(iso: string) {
  const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

const inputCls = [
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-white dark:bg-[#0d1117]',
  'border border-[#e2e4e8] dark:border-[#1e2228]',
  'text-[#1f2328] dark:text-[#e6edf3]',
  'placeholder-[#adb5bd] dark:placeholder-[#4a5568]',
  'outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35]',
  'transition-colors duration-150',
].join(' ')

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
        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">task requests</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                {total > 0 ? `${total} open request${total !== 1 ? 's' : ''}` : 'open requests'}
              </p>
              <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                students looking for skills — apply to help them
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-wide border border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] hover:text-white transition-colors cursor-pointer"
            >
              <HiOutlinePlusCircle className="w-3.5 h-3.5" />
              post request
            </button>
          </div>
        </div>

        {/* Post form */}
        {showForm && (
          <div className="border border-[#e8490f]/40 dark:border-[#ff6b35]/40">
            <div className="px-4 py-2.5 border-b border-[#e8490f]/40 dark:border-[#ff6b35]/40 bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
                <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">new request</span>
              </div>
              <button onClick={() => setShowForm(false)} className="text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer">
                <HiOutlineXMark className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handlePost} className="p-4 space-y-3">
              {formError && (
                <div className="px-3 py-2 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
                  ! {formError}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">
                  title <span className="text-[#e8490f] dark:text-[#ff6b35]">*</span>
                </label>
                <input
                  type="text" required
                  placeholder="what do you need help with?"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">
                  description <span className="text-[#e8490f] dark:text-[#ff6b35]">*</span>
                </label>
                <textarea
                  rows={3} required
                  placeholder="describe your request in detail…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={clsx(inputCls, 'resize-none')}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={clsx(inputCls, 'appearance-none cursor-pointer')}
                  >
                    <option value="">select…</option>
                    {categories.map((c) => <option key={c} value={c}>{c.toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">budget (R)</label>
                  <input
                    type="text"
                    placeholder="e.g. 200"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 days"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 font-mono text-[10px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:border-[#636c76] dark:hover:border-[#848d97] transition-colors cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                  {submitting ? 'posting…' : 'post request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#636c76] dark:text-[#848d97] pointer-events-none">$</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search requests…"
            className="w-full pl-8 pr-4 py-2 font-mono text-[11px] tracking-wide bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
            >
              <HiOutlineXMark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0 border-b border-[#e2e4e8] dark:border-[#1e2228] overflow-hidden pb-px">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={clsx(
                'px-3 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2',
                activeFilter === f
                  ? 'border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35]'
                  : 'border-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <HiOutlineArrowPath className="w-5 h-5 text-[#636c76] dark:text-[#848d97] animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
            <p className="font-mono text-[11px] text-[#636c76] dark:text-[#848d97]">~ no requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((req) => (
              <div key={req.id} className="border border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f]/40 dark:hover:border-[#ff6b35]/40 transition-colors">
                <div className="p-4 flex items-start gap-3">
                  <Avatar name={`${req.owner.first_name} ${req.owner.last_name}`} src={req.owner.avatar_url ?? undefined} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3] leading-snug">{req.title}</p>
                      <span className="shrink-0 font-mono text-[11px] font-bold text-[#22c55e]">{formatPrice(req)}</span>
                    </div>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                      {req.owner.first_name} {req.owner.last_name}
                      {req.owner.university && ` · ${req.owner.university}`}
                      {' · '}{formatTime(req.created_at)}
                    </p>
                    <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] mt-2 leading-relaxed line-clamp-2">{req.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="px-2 py-0.5 font-mono text-[9px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">
                        {req.category.toLowerCase()}
                      </span>
                      {req.delivery_days && (
                        <span className="flex items-center gap-0.5 font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                          <HiOutlineClock className="w-3 h-3" />due in {req.delivery_days}d
                        </span>
                      )}
                      <button className="ml-auto px-3 py-1.5 font-mono text-[9px] tracking-wide border border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] hover:text-white transition-colors cursor-pointer">
                        apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-[220px] shrink-0 hidden lg:flex flex-col gap-4">
        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">how it works</span>
          </div>
          <div className="p-3 space-y-3">
            {[
              { n: '01', t: 'browse requests', d: 'find tasks that match your skills' },
              { n: '02', t: 'apply', d: 'send a short pitch to the requester' },
              { n: '03', t: 'get hired', d: 'agree on scope and get to work' },
              { n: '04', t: 'get paid', d: 'receive payment on completion' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-2">
                <span className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35] shrink-0 mt-0.5">{n}</span>
                <div>
                  <p className="font-mono text-[9px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{t}</p>
                  <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">tips</span>
          </div>
          <div className="p-3 space-y-2">
            {[
              'be specific about your budget',
              'include a clear deadline',
              'describe the expected output',
              'mention your tech stack if relevant',
            ].map((tip) => (
              <p key={tip} className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] flex gap-1.5">
                <span className="text-[#e8490f] dark:text-[#ff6b35] shrink-0">›</span>{tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
