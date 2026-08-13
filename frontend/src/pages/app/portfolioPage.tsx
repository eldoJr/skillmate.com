import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencil, HiOutlineLink,
  HiOutlineSparkles, HiOutlineArrowUpTray, HiOutlineXMark, HiOutlineArrowPath,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { portfolioService, type PortfolioEntry, type PortfolioCreate } from '../../services/portfolio'
import { useAuth } from '../../contexts/AuthContext'

const inputCls = [
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-white dark:bg-[#0d1117]',
  'border border-[#e2e4e8] dark:border-[#1e2228]',
  'text-[#1f2328] dark:text-[#e6edf3]',
  'placeholder-[#adb5bd] dark:placeholder-[#4a5568]',
  'outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35]',
  'transition-colors duration-150',
].join(' ')

const emptyForm: PortfolioCreate = { title: '', summary: '', impact_statement: '', technologies: [], project_url: '' }

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
      <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0">
      <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase flex items-center gap-1">
        {label}{required && <span className="text-[#e8490f] dark:text-[#ff6b35]">*</span>}
      </label>
      {children}
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete }: { entry: PortfolioEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="border border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f]/40 dark:hover:border-[#ff6b35]/40 transition-colors group"
    >
      {entry.imageUrl ? (
        <div className="h-32 overflow-hidden border-b border-[#e2e4e8] dark:border-[#1e2228]">
          <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-20 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-center">
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">no image</span>
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3] leading-snug">{entry.title}</p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="p-1 text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer">
              <HiOutlinePencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1 text-[#636c76] dark:text-[#848d97] hover:text-[#d1242f] dark:hover:text-[#f85149] transition-colors cursor-pointer">
              <HiOutlineTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {entry.summary && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] leading-relaxed line-clamp-2">{entry.summary}</p>}
        {entry.impactStatement && (
          <p className="flex items-start gap-1 font-mono text-[9px] text-[#22c55e]">
            <HiOutlineCheckCircle className="w-3 h-3 shrink-0 mt-0.5" />{entry.impactStatement}
          </p>
        )}
        {entry.technologies && entry.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.technologies.map((t) => (
              <span key={t} className="px-2 py-0.5 font-mono text-[9px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{t}</span>
            ))}
          </div>
        )}
        {entry.projectUrl && (
          <a href={entry.projectUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35] hover:underline pt-1"
          >
            <HiOutlineLink className="w-3 h-3" />{entry.projectUrl.replace(/^https?:\/\//, '')}
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
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user?.id) return
    portfolioService.getByUser(user.id).then(setEntries).finally(() => setLoading(false))
  }, [user?.id])

  const openNew = () => { setEditing(null); setForm(emptyForm); setTechInput(''); setError(''); setShowForm(true) }
  const openEdit = (e: PortfolioEntry) => {
    setEditing(e)
    setForm({ title: e.title, summary: e.summary ?? '', impact_statement: e.impactStatement ?? '', technologies: e.technologies ?? [], project_url: e.projectUrl ?? '' })
    setTechInput(''); setError(''); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const addTech = () => {
    const t = techInput.trim()
    if (t && !form.technologies?.includes(t)) setForm((f) => ({ ...f, technologies: [...(f.technologies ?? []), t] }))
    setTechInput('')
  }
  const removeTech = (t: string) => setForm((f) => ({ ...f, technologies: f.technologies?.filter((x) => x !== t) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) {
        const updated = await portfolioService.update(editing.id, form)
        setEntries((prev) => prev.map((x) => x.id === updated.id ? updated : x))
      } else {
        const created = await portfolioService.create(form)
        setEntries((prev) => [created, ...prev])
      }
      closeForm()
    } catch { setError('failed to save — please try again') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    await portfolioService.delete(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={() => setError('ai import is not available yet — add your project manually')} />
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
            >
              <HiOutlineSparkles className="w-3 h-3" />ai import
            </button>
            <button onClick={openNew}
              className="flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer"
            >
              <HiOutlinePlusCircle className="w-3 h-3" />add project
            </button>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
            {entries.length > 0 ? `${entries.length} project${entries.length !== 1 ? 's' : ''}` : 'my projects'}
          </p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">showcase your work and experience</p>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
          ! {error}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <motion.div initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
              className="w-full max-w-lg bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] shadow-xl overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
                  <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{editing ? 'edit project' : 'add project'}</span>
                </div>
                <button onClick={closeForm} className="text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer">
                  <HiOutlineXMark className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
                <SectionHeader label="details" />
                <Field label="title" required>
                  <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="e.g. e-commerce platform" />
                </Field>
                <Field label="summary">
                  <textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className={clsx(inputCls, 'resize-none')} placeholder="brief description of the project…" />
                </Field>
                <Field label="impact statement">
                  <input value={form.impact_statement} onChange={(e) => setForm((f) => ({ ...f, impact_statement: e.target.value }))} className={inputCls} placeholder="e.g. reduced load time by 40%" />
                </Field>
                <SectionHeader label="technologies" />
                <Field label="add technology">
                  <div className="flex gap-2">
                    <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                      className={inputCls} placeholder="type and press enter…" />
                    <button type="button" onClick={addTech}
                      className="px-3 py-2 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer shrink-0"
                    >add</button>
                  </div>
                  {form.technologies && form.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.technologies.map((t) => (
                        <span key={t} className="flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] bg-[#e8490f] dark:bg-[#ff6b35] text-white">
                          {t}
                          <button type="button" onClick={() => removeTech(t)} className="cursor-pointer hover:opacity-70 transition-opacity"><HiOutlineXMark className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
                <SectionHeader label="link" />
                <Field label="project url">
                  <input type="url" value={form.project_url} onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))} className={inputCls} placeholder="https://github.com/…" />
                </Field>
                {error && (
                  <div className="mx-4 my-2 px-3 py-2 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
                    ! {error}
                  </div>
                )}
                <div className="flex items-center gap-2 justify-end px-4 py-3 border-t border-[#e2e4e8] dark:border-[#1e2228]">
                  <button type="button" onClick={closeForm}
                    className="px-4 py-2 font-mono text-[10px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer"
                  >cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                    {saving ? 'saving…' : editing ? 'save changes' : 'add project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <HiOutlineArrowUpTray className="w-6 h-6 text-[#e2e4e8] dark:text-[#1e2228] mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no projects yet — add a project manually or use ai import</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
