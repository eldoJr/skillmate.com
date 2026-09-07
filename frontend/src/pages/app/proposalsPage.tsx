import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineDocumentText, HiOutlineSparkles, HiOutlineArrowPath,
  HiOutlinePaperAirplane, HiOutlineChevronDown, HiOutlinePencil,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { aiService } from '../../services/ai'
import { proposalsService, type ProposalResponse, type ProposalBrief } from '../../services/proposals'

const sectionCls = 'border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default'
const headCls = 'flex items-center gap-1.5 px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

const statusCls = (s: string) =>
  s === 'sent'
    ? 'text-success-fg dark:text-success-dark-fg border-success-fg/40 dark:border-success-dark-fg/40'
    : s === 'draft'
    ? 'text-brand dark:text-brand-dark-DEFAULT border-brand/40 dark:border-brand-dark-DEFAULT/40'
    : 'text-fg-muted dark:text-fg-dark-muted border-border-default dark:border-border-dark-default'

const sections: { key: keyof Pick<ProposalResponse, 'intro' | 'understanding' | 'plan' | 'timeline' | 'pricing'>; label: string }[] = [
  { key: 'intro',         label: 'Introduction' },
  { key: 'understanding', label: 'Understanding' },
  { key: 'plan',          label: 'Plan' },
  { key: 'timeline',      label: 'Timeline' },
  { key: 'pricing',       label: 'Pricing' },
]

function ProposalDetail({ proposal, onUpdate, onSend }: {
  proposal: ProposalResponse
  onUpdate: (p: ProposalResponse) => void
  onSend:   (p: ProposalResponse) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [sending, setSending] = useState(false)

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try { onUpdate(await proposalsService.update(proposal.id, { [editing]: draft })); setEditing(null) }
    finally { setSaving(false) }
  }

  const handleSend = async () => {
    setSending(true)
    try { onSend(await proposalsService.send(proposal.id)) }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-3">
      {sections.map(({ key, label }) => (
        <div key={key} className={sectionCls}>
          <div className={clsx(headCls, 'justify-between')}>
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">{label}</span>
            {editing !== key && proposal.status === 'draft' && (
              <button onClick={() => { setEditing(key); setDraft(proposal[key]) }}
                className="text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                <HiOutlinePencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-4 py-3">
            {editing === key ? (
              <div className="space-y-2">
                <textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] rounded-lg bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors resize-none"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setEditing(null)}
                    className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={saveEdit} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
                    {saving && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed whitespace-pre-wrap">
                {proposal[key] || <span className="italic opacity-50">Empty</span>}
              </p>
            )}
          </div>
        </div>
      ))}

      {proposal.status === 'draft' && (
        <button onClick={handleSend} disabled={sending}
          className="flex items-center gap-2 w-full justify-center py-2.5 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
          {sending ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlinePaperAirplane className="w-3.5 h-3.5" />}
          {sending ? 'Sending…' : 'Send proposal'}
        </button>
      )}
      {proposal.status === 'sent' && (
        <div className="flex items-center gap-2 justify-center py-2.5 text-[12px] font-medium text-success-fg dark:text-success-dark-fg">
          <HiOutlineCheckCircle className="w-4 h-4" /> Proposal sent
        </div>
      )}
    </div>
  )
}

function clsx(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ')
}

export default function ProposalsPage() {
  const [briefs, setBriefs]         = useState<ProposalBrief[]>([])
  const [proposals, setProposals]   = useState<Record<string, ProposalResponse>>({})
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [listingId, setListingId]   = useState('')
  const [error, setError]           = useState('')

  useEffect(() => {
    proposalsService.list().then(setBriefs)
      .catch(() => setError('Failed to load proposals'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!proposals[id]) {
      try { const p = await proposalsService.get(id); setProposals((prev) => ({ ...prev, [id]: p })) }
      catch { /* ignore */ }
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listingId.trim()) return
    setGenerating(true); setError('')
    try {
      const p = await aiService.generateProposal(listingId.trim())
      setBriefs((prev) => [{ id: p.id, listing_id: p.listing_id, status: p.status, created_at: p.created_at, updated_at: p.updated_at }, ...prev.filter(b => b.id !== p.id)])
      setProposals((prev) => ({ ...prev, [p.id]: p }))
      setExpanded(p.id); setListingId('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? ''
      setError(msg || 'Failed to generate — check the listing ID and try again')
    } finally { setGenerating(false) }
  }

  const handleUpdate = (p: ProposalResponse) => {
    setProposals((prev) => ({ ...prev, [p.id]: p }))
    setBriefs((prev) => prev.map((b) => b.id === p.id ? { ...b, status: p.status } : b))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      <div className={sectionCls}>
        <div className={headCls}>
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Proposals</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">My proposals</p>
          <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">AI-generated proposals for listings you want to apply to</p>
        </div>
      </div>

      {/* Generate form */}
      <div className={sectionCls}>
        <div className={headCls}>
          <HiOutlineSparkles className="w-3.5 h-3.5 text-brand dark:text-brand-dark-DEFAULT" />
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Generate new</span>
        </div>
        <div className="p-4">
          <form onSubmit={handleGenerate} className="flex gap-2">
            <div className="flex-1 flex items-center border border-border-default dark:border-border-dark-default rounded-lg focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
              <span className="font-mono text-[11px] text-brand dark:text-brand-dark-DEFAULT px-3 shrink-0 select-none">$</span>
              <input value={listingId} onChange={(e) => setListingId(e.target.value)}
                placeholder="Paste a listing ID…"
                className="flex-1 py-2.5 pr-3 text-[12px] bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-muted dark:placeholder-fg-dark-muted outline-none"
              />
            </div>
            <button type="submit" disabled={generating || !listingId.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 shrink-0">
              {generating ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </form>
          {error && <p className="mt-2 text-[12px] text-danger-fg dark:text-danger-dark-fg">{error}</p>}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT animate-spin" />
        </div>
      ) : briefs.length === 0 ? (
        <div className={clsx(sectionCls, 'p-12 text-center')}>
          <HiOutlineDocumentText className="w-6 h-6 text-border-default dark:text-border-dark-default mx-auto mb-3" />
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No proposals yet — paste a listing ID above to generate your first one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefs.map((b) => (
            <div key={b.id} className={sectionCls}>
              <button onClick={() => toggleExpand(b.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <HiOutlineDocumentText className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default truncate">
                      listing_{b.listing_id.slice(0, 8)}
                    </p>
                    <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted">
                      {new Date(b.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={clsx('px-2 py-0.5 text-[10px] font-medium rounded-md border capitalize', statusCls(b.status))}>{b.status}</span>
                  <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted transition-transform', expanded === b.id && 'rotate-180')} />
                </div>
              </button>

              <AnimatePresence>
                {expanded === b.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-4 border-t border-border-default dark:border-border-dark-default">
                      {proposals[b.id] ? (
                        <ProposalDetail proposal={proposals[b.id]} onUpdate={handleUpdate} onSend={handleUpdate} />
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <HiOutlineArrowPath className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT animate-spin" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
