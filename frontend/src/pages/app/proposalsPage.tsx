import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineDocumentText, HiOutlineSparkles, HiOutlineArrowPath,
  HiOutlinePaperAirplane, HiOutlineChevronDown, HiOutlinePencil,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { proposalsService, type ProposalResponse, type ProposalBrief } from '../../services/proposals'

const statusCls = (s: string) =>
  s === 'sent'
    ? 'text-[#22c55e] border-[#22c55e]/40'
    : s === 'draft'
    ? 'text-[#e8490f] dark:text-[#ff6b35] border-[#e8490f]/40 dark:border-[#ff6b35]/40'
    : 'text-[#636c76] dark:text-[#848d97] border-[#e2e4e8] dark:border-[#1e2228]'

const sections: { key: keyof Pick<ProposalResponse, 'intro' | 'understanding' | 'plan' | 'timeline' | 'pricing'>; label: string }[] = [
  { key: 'intro', label: 'introduction' },
  { key: 'understanding', label: 'understanding' },
  { key: 'plan', label: 'plan' },
  { key: 'timeline', label: 'timeline' },
  { key: 'pricing', label: 'pricing' },
]

const inputCls = [
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-white dark:bg-[#0d1117]',
  'border border-[#e2e4e8] dark:border-[#1e2228]',
  'text-[#1f2328] dark:text-[#e6edf3]',
  'placeholder-[#adb5bd] dark:placeholder-[#4a5568]',
  'outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35]',
  'transition-colors duration-150',
].join(' ')

function ProposalDetail({ proposal, onUpdate, onSend }: {
  proposal: ProposalResponse
  onUpdate: (p: ProposalResponse) => void
  onSend: (p: ProposalResponse) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const startEdit = (key: string, value: string) => { setEditing(key); setDraft(value) }
  const cancelEdit = () => { setEditing(null); setDraft('') }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const updated = await proposalsService.update(proposal.id, { [editing]: draft })
      onUpdate(updated)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const updated = await proposalsService.send(proposal.id)
      onSend(updated)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      {sections.map(({ key, label }) => (
        <div key={key} className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="flex items-center justify-between px-3 py-2 bg-[#f6f8fa] dark:bg-[#0d1117] border-b border-[#e2e4e8] dark:border-[#1e2228]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
              <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
            </div>
            {editing !== key && proposal.status === 'draft' && (
              <button
                onClick={() => startEdit(key, proposal[key])}
                className="text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
              >
                <HiOutlinePencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-3 py-3">
            {editing === key ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer"
                  >
                    cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="px-3 py-1.5 font-mono text-[9px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                    {saving ? 'saving…' : 'save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed whitespace-pre-wrap">
                {proposal[key] || <span className="italic opacity-50">empty</span>}
              </p>
            )}
          </div>
        </div>
      ))}

      {proposal.status === 'draft' && (
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 w-full justify-center py-2.5 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50"
        >
          {sending ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlinePaperAirplane className="w-3.5 h-3.5" />}
          {sending ? 'sending…' : 'send proposal'}
        </button>
      )}
      {proposal.status === 'sent' && (
        <div className="flex items-center gap-2 justify-center py-2.5 font-mono text-[10px] text-[#22c55e]">
          <HiOutlineCheckCircle className="w-4 h-4" /> proposal sent
        </div>
      )}
    </div>
  )
}

export default function ProposalsPage() {
  const [briefs, setBriefs] = useState<ProposalBrief[]>([])
  const [proposals, setProposals] = useState<Record<string, ProposalResponse>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [listingId, setListingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    proposalsService.list().then(setBriefs).finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!proposals[id]) {
      const p = await proposalsService.get(id)
      setProposals((prev) => ({ ...prev, [id]: p }))
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listingId.trim()) return
    setGenerating(true)
    setError('')
    try {
      const p = await proposalsService.create({
        listing_id: listingId.trim(),
        intro: '', understanding: '', plan: '', timeline: '', pricing: '',
      })
      setBriefs((prev) => [{ id: p.id, listingId: p.listingId, status: p.status, createdAt: p.createdAt, updatedAt: p.updatedAt }, ...prev])
      setProposals((prev) => ({ ...prev, [p.id]: p }))
      setExpanded(p.id)
      setListingId('')
    } catch {
      setError('failed to create proposal — check the listing id and try again')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdate = (p: ProposalResponse) => {
    setProposals((prev) => ({ ...prev, [p.id]: p }))
    setBriefs((prev) => prev.map((b) => b.id === p.id ? { ...b, status: p.status } : b))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">proposals</span>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] font-medium">my proposals</p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
            ai-generated proposals for listings you want to apply to
          </p>
        </div>
      </div>

      {/* Generate form */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
          <HiOutlineSparkles className="w-3.5 h-3.5 text-[#e8490f] dark:text-[#ff6b35]" />
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">generate new proposal</span>
        </div>
        <div className="p-4">
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              placeholder="paste a listing id…"
              className="flex-1 px-3 py-2 font-mono text-[11px] tracking-wide bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors"
            />
            <button
              type="submit"
              disabled={generating || !listingId.trim()}
              className="flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              {generating ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
              {generating ? 'generating…' : 'generate'}
            </button>
          </form>
          {error && (
            <p className="mt-2 font-mono text-[9px] text-[#d1242f] dark:text-[#f85149]">! {error}</p>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-5 h-5 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : briefs.length === 0 ? (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <HiOutlineDocumentText className="w-6 h-6 text-[#e2e4e8] dark:text-[#1e2228] mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
            ~ no proposals yet — paste a listing id above to generate your first one
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefs.map((b) => (
            <div key={b.id} className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <button
                onClick={() => toggleExpand(b.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <HiOutlineDocumentText className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">
                      listing_{b.listingId.slice(0, 8)}
                    </p>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                      {new Date(b.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.5 font-mono text-[9px] border ${statusCls(b.status)}`}>{b.status}</span>
                  <HiOutlineChevronDown className={`w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] transition-transform ${expanded === b.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {expanded === b.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-[#e2e4e8] dark:border-[#1e2228] pt-4">
                      {proposals[b.id] ? (
                        <ProposalDetail
                          proposal={proposals[b.id]}
                          onUpdate={handleUpdate}
                          onSend={handleUpdate}
                        />
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
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
