import { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlinePlusCircle, HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineClock,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { listingsService, type Listing } from '../../services/listings'

const filters = ['All', 'Programming', 'Design', 'Writing', 'Tutoring', 'Video', 'Data', 'Other'] as const
type Filter = typeof filters[number]

function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

function formatTime(iso: string) {
  const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export default function RequestsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // New request form state
  const [form, setForm] = useState({ title: '', description: '', category: '', budget: '', deadline: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = {
        listing_type: 'project',
        page_size: 20,
      }
      if (activeFilter !== 'All') params.category = activeFilter
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
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'px-3 py-2 rounded-xl text-[12px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all'

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Task Requests</h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Students looking for skills — apply to help them.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer"
        >
          <HiOutlinePlusCircle className="w-4 h-4" /> Post a Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePost} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#0969da]/40 dark:border-[#2f81f7]/40 p-5 space-y-3">
          <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Post a new request</h3>
          <input type="text" required placeholder="What do you need help with?" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={`w-full ${inputCls}`} />
          <textarea rows={3} required placeholder="Describe your request in detail…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`w-full resize-none ${inputCls}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={`${inputCls} appearance-none`}>
              <option value="">Category</option>
              {filters.slice(1).map((f) => <option key={f}>{f}</option>)}
            </select>
            <input type="text" placeholder="Budget (e.g. R200)" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} className={inputCls} />
            <input type="text" placeholder="Deadline" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60">
              {submitting ? 'Posting…' : 'Post Request'}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer shrink-0">
          <HiOutlineAdjustmentsHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0',
              activeFilter === f
                ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
                : 'text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d] hover:bg-white dark:hover:bg-[#161b22]',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-12 text-center">
          <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((req) => (
            <div key={req.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar name={`${req.owner.first_name} ${req.owner.last_name}`} src={req.owner.avatar_url ?? undefined} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-snug">{req.title}</h3>
                    <span className="shrink-0 text-[13px] font-bold text-[#1a7f37] dark:text-[#3fb950]">{formatPrice(req)}</span>
                  </div>
                  <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                    {req.owner.first_name} {req.owner.last_name} · {req.owner.university ?? ''} · {formatTime(req.created_at)}
                  </p>
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-2 leading-relaxed line-clamp-2">{req.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]">{req.category}</span>
                    {req.delivery_days && (
                      <span className="flex items-center gap-0.5 text-[11px] text-[#636c76] dark:text-[#848d97]">
                        <HiOutlineClock className="w-3 h-3" />Due in {req.delivery_days}d
                      </span>
                    )}
                    <button className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
