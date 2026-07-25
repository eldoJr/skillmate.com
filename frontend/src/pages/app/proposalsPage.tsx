import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineDocumentText, HiOutlineSparkles, HiOutlineArrowPath,
  HiOutlinePaperAirplane, HiOutlineChevronDown, HiOutlinePencil,
  HiOutlineCheckCircle, HiOutlineXMark,
} from 'react-icons/hi2'
import { aiService, type ProposalResponse, type ProposalBrief } from '../../services/ai'

const statusColor = (s: string) =>
  s === 'sent' ? 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]'
  : s === 'draft' ? 'bg-[#fff8c5] dark:bg-[#2d2000] text-[#9a6700] dark:text-[#d29922]'
  : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]'

const sections: { key: keyof Pick<ProposalResponse, 'intro' | 'understanding' | 'plan' | 'timeline' | 'pricing'>; label: string }[] = [
  { key: 'intro', label: 'Introduction' },
  { key: 'understanding', label: 'Understanding' },
  { key: 'plan', label: 'Plan' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'pricing', label: 'Pricing' },
]

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
      const updated = await aiService.updateProposal(proposal.id, { [editing]: draft })
      onUpdate(updated)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const updated = await aiService.sendProposal(proposal.id)
      onSend(updated)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      {sections.map(({ key, label }) => (
        <div key={key} className="rounded-xl border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#21262d]">
            <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest">{label}</p>
            {editing !== key && proposal.status === 'draft' && (
              <button onClick={() => startEdit(key, proposal[key])} className="p-1 rounded hover:bg-[#d0d7de] dark:hover:bg-[#30363d] text-[#636c76] dark:text-[#848d97] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer">
                <HiOutlinePencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="px-4 py-3">
            {editing === key ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-[12px] bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] resize-none transition-colors"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-[12px] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">Cancel</button>
                  <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed whitespace-pre-wrap">{proposal[key]}</p>
            )}
          </div>
        </div>
      ))}

      {proposal.status === 'draft' && (
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60"
        >
          <HiOutlinePaperAirplane className="w-4 h-4" />
          {sending ? 'Sending…' : 'Send Proposal'}
        </button>
      )}
      {proposal.status === 'sent' && (
        <div className="flex items-center gap-2 justify-center py-2.5 text-[12px] text-[#1a7f37] dark:text-[#3fb950]">
          <HiOutlineCheckCircle className="w-4 h-4" /> Proposal sent
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
    aiService.listProposals().then(setBriefs).finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!proposals[id]) {
      const p = await aiService.getProposal(id)
      setProposals((prev) => ({ ...prev, [id]: p }))
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listingId.trim()) return
    setGenerating(true)
    setError('')
    try {
      const p = await aiService.generateProposal(listingId.trim())
      setBriefs((prev) => [{ id: p.id, listing_id: p.listing_id, status: p.status, created_at: p.created_at, updated_at: p.updated_at }, ...prev])
      setProposals((prev) => ({ ...prev, [p.id]: p }))
      setExpanded(p.id)
      setListingId('')
    } catch {
      setError('Failed to generate proposal. Check the listing ID and try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdate = (p: ProposalResponse) => {
    setProposals((prev) => ({ ...prev, [p.id]: p }))
    setBriefs((prev) => prev.map((b) => b.id === p.id ? { ...b, status: p.status, updated_at: p.updated_at } : b))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3] flex items-center gap-2">
          <HiOutlineDocumentText className="w-5 h-5 text-[#0969da] dark:text-[#2f81f7]" /> Proposals
        </h2>
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">AI-generated proposals for listings you want to apply to.</p>
      </div>

      {/* Generate form */}
      <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
        <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3 flex items-center gap-2">
          <HiOutlineSparkles className="w-4 h-4 text-[#8250df]" /> Generate New Proposal
        </p>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="Paste a listing ID…"
            className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-all"
          />
          <button
            type="submit"
            disabled={generating || !listingId.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60 shrink-0"
          >
            {generating ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineSparkles className="w-4 h-4" />}
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </form>
        {error && <p className="mt-2 text-[12px] text-[#d1242f] dark:text-[#f85149]">{error}</p>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-6 h-6 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : briefs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineDocumentText className="w-10 h-10 text-[#d0d7de] dark:text-[#30363d] mb-3" />
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No proposals yet. Paste a listing ID above to generate your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefs.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
              <button
                onClick={() => toggleExpand(b.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HiOutlineDocumentText className="w-4 h-4 text-[#636c76] dark:text-[#848d97] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">Listing {b.listing_id.slice(0, 8)}…</p>
                    <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">{new Date(b.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColor(b.status)}`}>{b.status}</span>
                  <HiOutlineChevronDown className={`w-4 h-4 text-[#636c76] dark:text-[#848d97] transition-transform ${expanded === b.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {expanded === b.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-[#d0d7de] dark:border-[#30363d] pt-4">
                      {proposals[b.id] ? (
                        <ProposalDetail
                          proposal={proposals[b.id]}
                          onUpdate={handleUpdate}
                          onSend={handleUpdate}
                        />
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <HiOutlineArrowPath className="w-5 h-5 text-[#636c76] dark:text-[#848d97] animate-spin" />
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
