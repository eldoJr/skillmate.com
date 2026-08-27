import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineDocumentText, HiOutlineSparkles, HiOutlineArrowPath,
  HiOutlinePaperAirplane, HiOutlineChevronDown, HiOutlinePencil,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { aiService } from '../../services/ai'
import { proposalsService, type ProposalResponse, type ProposalBrief } from '../../services/proposals'

const dot         = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT shrink-0'
const sectionHead = 'flex items-center gap-1.5 px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

const statusCls = (s: string) =>
  s === 'sent'
    ? 'text-success-fg dark:text-success-dark-fg border-success-fg/40 dark:border-success-dark-fg/40'
    : s === 'draft'
    ? 'text-brand dark:text-brand-dark-DEFAULT border-brand/40 dark:border-brand-dark-DEFAULT/40'
    : 'text-fg-muted dark:text-fg-dark-muted border-border-default dark:border-border-dark-default'

const sections: { key: keyof Pick<ProposalResponse, 'intro' | 'understanding' | 'plan' | 'timeline' | 'pricing'>; label: string }[] = [
  { key: 'intro',         label: 'introduction' },
  { key: 'understanding', label: 'understanding' },
  { key: 'plan',          label: 'plan' },
  { key: 'timeline',      label: 'timeline' },
  { key: 'pricing',       label: 'pricing' },
]

function ProposalDetail({ proposal, onUpdate, onSend }: {
  proposal: ProposalResponse
  onUpdate: (p: ProposalResponse) => void
  onSend:   (p: ProposalResponse) => void
}) {
  const [editing, setEditing]   = useState<string | null>(null)
  const [draft, setDraft]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [sending, setSending]   = useState(false)

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
        <div key={key} className="border border-border-default dark:border-border-dark-default">
          <div className={sectionHead}>
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">{label}</span>
            {editing !== key && proposal.status === 'draft' && (
              <button onClick={() => { setEditing(key); setDraft(proposal[key]) }}
                className="ml-auto text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                <HiOutlinePencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-3 py-3">
            {editing === key ? (
              <div className="space-y-2">
                <textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-[11px] bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-muted dark:placeholder-fg-dark-muted outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors resize-none"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setEditing(null)}
                    className="px-3 py-1.5 font-mono text-[9px] border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer">
                    cancel
                  </button>
                  <button onClick={saveEdit} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
                    {saving && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                    {saving ? 'saving…' : 'save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted leading-relaxed whitespace-pre-wrap">
                {proposal[key] || <span className="italic opacity-50">empty</span>}
              </p>
            )}
          </div>
        </div>
      ))}

      {proposal.status === 'draft' && (
        <button onClick={handleSend} disabled={sending}
          className="flex items-center gap-2 w-full justify-center py-2.5 font-mono text-[10px] bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
          {sending ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlinePaperAirplane className="w-3.5 h-3.5" />}
          {sending ? 'sending…' : 'send proposal'}
        </button>
      )}
      {proposal.status === 'sent' && (
        <div className="flex items-center gap-2 justify-center py-2.5 font-mono text-[10px] text-success-fg dark:text-success-dark-fg">
          <HiOutlineCheckCircle className="w-4 h-4" /> proposal sent
        </div>
      )}
    </div>
  )
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
      .catch(() => setError('failed to load proposals'))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!proposals[id]) {
      try {
        const p = await proposalsService.get(id)
        setProposals((prev) => ({ ...prev, [id]: p }))
      } catch { /* ignore */ }
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
      setExpanded(p.id)
      setListingId('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? ''
      setError(msg || 'failed to generate — check the listing id and try again')
    } finally { setGenerating(false) }
  }

  const handleUpdate = (p: ProposalResponse) => {
    setProposals((prev) => ({ ...prev, [p.id]: p }))
    setBriefs((prev) => prev.map((b) => b.id === p.id ? { ...b, status: p.status } : b))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
        <div className={sectionHead}>
          <span className={dot} />
          <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">proposals</span>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default">my proposals</p>
          <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
            ai-generated proposals for listings you want to apply to
          </p>
        </div>
      </div>

      {/* Generate form */}
      <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
        <div className={sectionHead}>
          <HiOutlineSparkles className="w-3.5 h-3.5 text-brand dark:text-brand-dark-DEFAULT" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">generate new</span>
        </div>
        <div className="p-4">
          <form onSubmit={handleGenerate} className="flex gap-2">
            <div className="flex-1 flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors bg-canvas-inset dark:bg-canvas-dark-inset">
              <span className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT px-3 shrink-0 select-none">$</span>
              <input value={listingId} onChange={(e) => setListingId(e.target.value)}
                placeholder="paste a listing id…"
                className="flex-1 py-2.5 pr-3 font-mono text-[11px] bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-muted dark:placeholder-fg-dark-muted outline-none"
              />
            </div>
            <button type="submit" disabled={generating || !listingId.trim()}
              className="flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 shrink-0">
              {generating ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
              {generating ? 'generating…' : 'generate'}
            </button>
          </form>
          {error && (
            <p className="mt-2 font-mono text-[9px] text-danger-fg dark:text-danger-dark-fg">! {error}</p>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-brand dark:text-brand-dark-DEFAULT animate-spin" />
        </div>
      ) : briefs.length === 0 ? (
        <div className="border border-border-default dark:border-border-dark-default p-12 text-center bg-canvas-default dark:bg-canvas-dark-default">
          <HiOutlineDocumentText className="w-6 h-6 text-border-default dark:text-border-dark-default mx-auto mb-3" />
          <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
            ~ no proposals yet — paste a listing id above to generate your first one
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefs.map((b) => (
            <div key={b.id} className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
              <button onClick={() => toggleExpand(b.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <HiOutlineDocumentText className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-medium text-fg-default dark:text-fg-dark-default truncate">
                      listing_{b.listing_id.slice(0, 8)}
                    </p>
                    <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                      {new Date(b.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.5 font-mono text-[9px] border ${statusCls(b.status)}`}>{b.status}</span>
                  <HiOutlineChevronDown className={`w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted transition-transform ${expanded === b.id ? 'rotate-180' : ''}`} />
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
