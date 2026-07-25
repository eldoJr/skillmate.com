import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencil, HiOutlineLink,
  HiOutlineSparkles, HiOutlineArrowUpTray, HiOutlineXMark, HiOutlinePhoto,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { aiService, type PortfolioEntry, type PortfolioCreate } from '../../services/ai'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#0d1117] transition-all'

const emptyForm: PortfolioCreate = { title: '', summary: '', impact_statement: '', technologies: [], project_url: '' }

function EntryCard({ entry, onEdit, onDelete }: { entry: PortfolioEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden group"
    >
      {entry.image_url && (
        <div className="h-36 overflow-hidden bg-[#f6f8fa] dark:bg-[#21262d]">
          <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover" />
        </div>
      )}
      {!entry.image_url && (
        <div className="h-24 bg-gradient-to-br from-[#ddf4ff] dark:from-[#121d2f] to-[#f6f8fa] dark:to-[#21262d] flex items-center justify-center">
          <HiOutlinePhoto className="w-8 h-8 text-[#d0d7de] dark:text-[#30363d]" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-snug">{entry.title}</p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#636c76] dark:text-[#848d97] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer">
              <HiOutlinePencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] text-[#636c76] dark:text-[#848d97] hover:text-[#d1242f] dark:hover:text-[#f85149] transition-colors cursor-pointer">
              <HiOutlineTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {entry.summary && <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed line-clamp-2">{entry.summary}</p>}
        {entry.impact_statement && (
          <p className="text-[11px] text-[#1a7f37] dark:text-[#3fb950] flex items-start gap-1.5">
            <HiOutlineCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{entry.impact_statement}
          </p>
        )}
        {entry.technologies && entry.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.technologies.map((t) => (
              <span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{t}</span>
            ))}
          </div>
        )}
        {entry.project_url && (
          <a href={entry.project_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#0969da] dark:text-[#2f81f7] hover:underline pt-1">
            <HiOutlineLink className="w-3.5 h-3.5" />{entry.project_url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<PortfolioEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PortfolioEntry | null>(null)
  const [form, setForm] = useState<PortfolioCreate>(emptyForm)
  const [techInput, setTechInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user?.id) return
    aiService.getMyPortfolio(user.id).then(setEntries).finally(() => setLoading(false))
  }, [user?.id])

  const openNew = () => { setEditing(null); setForm(emptyForm); setTechInput(''); setError(''); setShowForm(true) }
  const openEdit = (e: PortfolioEntry) => {
    setEditing(e)
    setForm({ title: e.title, summary: e.summary ?? '', impact_statement: e.impact_statement ?? '', technologies: e.technologies ?? [], project_url: e.project_url ?? '' })
    setTechInput('')
    setError('')
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const addTech = () => {
    const t = techInput.trim()
    if (t && !form.technologies?.includes(t)) setForm((f) => ({ ...f, technologies: [...(f.technologies ?? []), t] }))
    setTechInput('')
  }
  const removeTech = (t: string) => setForm((f) => ({ ...f, technologies: f.technologies?.filter((x) => x !== t) }))

  const handleAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAnalyzing(true)
    setError('')
    try {
      const res = await aiService.analyzePortfolioFile(file)
      setEntries((prev) => [res.entry, ...prev])
      setShowForm(false)
    } catch {
      setError('AI analysis failed. Try again or add manually.')
    } finally {
      setAnalyzing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        const updated = await aiService.updatePortfolioEntry(editing.id, form)
        setEntries((prev) => prev.map((x) => x.id === updated.id ? updated : x))
      } else {
        const created = await aiService.createPortfolioEntry(form)
        setEntries((prev) => [created, ...prev])
      }
      closeForm()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await aiService.deletePortfolioEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Portfolio</h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Showcase your projects and work.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleAnalyze} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#8250df] dark:hover:border-[#8250df] hover:text-[#8250df] transition-colors cursor-pointer disabled:opacity-60"
          >
            <HiOutlineSparkles className="w-4 h-4" />{analyzing ? 'Analyzing…' : 'AI Import'}
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer"
          >
            <HiOutlinePlusCircle className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2.5 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-[12px]">{error}</div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-lg bg-white dark:bg-[#161b22] rounded-2xl border border-[#d0d7de] dark:border-[#30363d] shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#d0d7de] dark:border-[#30363d]">
                <p className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{editing ? 'Edit Project' : 'Add Project'}</p>
                <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#636c76] dark:text-[#848d97] cursor-pointer transition-colors">
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="e.g. E-commerce Platform" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Summary</label>
                  <textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Brief description of the project…" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Impact Statement</label>
                  <input value={form.impact_statement} onChange={(e) => setForm((f) => ({ ...f, impact_statement: e.target.value }))} className={inputCls} placeholder="e.g. Reduced load time by 40%" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Technologies</label>
                  <div className="flex gap-2">
                    <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                      className={inputCls} placeholder="Type and press Enter…" />
                    <button type="button" onClick={addTech} className="px-3 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer shrink-0">Add</button>
                  </div>
                  {form.technologies && form.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {form.technologies.map((t) => (
                        <span key={t} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border border-[#b6e3ff] dark:border-[#2f81f726]">
                          {t}
                          <button type="button" onClick={() => removeTech(t)} className="cursor-pointer hover:text-[#d1242f] transition-colors"><HiOutlineXMark className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Project URL</label>
                  <input type="url" value={form.project_url} onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))} className={inputCls} placeholder="https://github.com/…" />
                </div>
                {error && <p className="text-[12px] text-[#d1242f] dark:text-[#f85149]">{error}</p>}
                <div className="flex items-center gap-3 justify-end pt-1">
                  <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60">
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HiOutlineArrowUpTray className="w-10 h-10 text-[#d0d7de] dark:text-[#30363d] mb-3" />
          <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">No projects yet</p>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1">Add a project manually or use AI Import to extract from a PDF/doc.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {entries.map((e) => (
              <EntryCard key={e.id} entry={e} onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
