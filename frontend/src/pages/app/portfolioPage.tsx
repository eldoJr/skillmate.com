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
  'w-full px-3 py-2 rounded-lg text-[12px]',
  'bg-canvas-overlay dark:bg-canvas-dark-inset',
  'border border-border-default dark:border-border-dark-default',
  'text-fg-default dark:text-fg-dark-default',
  'placeholder-fg-subtle dark:placeholder-fg-dark-subtle',
  'outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand dark:focus:border-brand-dark-DEFAULT',
  'transition-colors duration-150',
].join(' ')

const emptyForm: PortfolioCreate = { title: '', summary: '', impact_statement: '', technologies: [], project_url: '' }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-b border-border-default dark:border-border-dark-default last:border-0">
      <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted flex items-center gap-1">
        {label}{required && <span className="text-danger-fg dark:text-danger-dark-fg">*</span>}
      </label>
      {children}
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete }: { entry: PortfolioEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden hover:border-brand/40 dark:hover:border-brand-dark-DEFAULT/40 transition-colors group"
    >
      {entry.imageUrl ? (
        <div className="h-32 overflow-hidden">
          <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-20 bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-center">
          <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted opacity-40">No image</span>
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default leading-snug">{entry.title}</p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="p-1 rounded text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
              <HiOutlinePencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1 rounded text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer">
              <HiOutlineTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {entry.summary && <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted leading-relaxed line-clamp-2">{entry.summary}</p>}
        {entry.impactStatement && (
          <p className="flex items-start gap-1 text-[11px] font-medium text-success-fg dark:text-success-dark-fg">
            <HiOutlineCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{entry.impactStatement}
          </p>
        )}
        {entry.technologies && entry.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.technologies.map((t) => (
              <span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{t}</span>
            ))}
          </div>
        )}
        {entry.projectUrl && (
          <a href={entry.projectUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT hover:underline pt-1"
          >
            <HiOutlineLink className="w-3.5 h-3.5" />{entry.projectUrl.replace(/^https?:\/\//, '')}
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user?.id) return
    portfolioService.getByUser(user.id).then(setEntries).finally(() => setLoading(false))
  }, [user?.id])

  const openNew = () => { setEditing(null); setForm(emptyForm); setTechInput(''); setError(''); setImageFile(null); setImagePreview(null); setShowForm(true) }
  const openEdit = (e: PortfolioEntry) => {
    setEditing(e)
    setForm({ title: e.title, summary: e.summary ?? '', impact_statement: e.impactStatement ?? '', technologies: e.technologies ?? [], project_url: e.projectUrl ?? '' })
    setTechInput(''); setError(''); setImageFile(null); setImagePreview(e.imageUrl ?? null); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null) }

  const addTech = () => {
    const t = techInput.trim()
    if (t && !form.technologies?.includes(t)) setForm((f) => ({ ...f, technologies: [...(f.technologies ?? []), t] }))
    setTechInput('')
  }
  const removeTech = (t: string) => setForm((f) => ({ ...f, technologies: f.technologies?.filter((x) => x !== t) }))

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      let entry: PortfolioEntry
      if (editing) {
        entry = await portfolioService.update(editing.id, form)
        setEntries((prev) => prev.map((x) => x.id === entry.id ? entry : x))
      } else {
        entry = await portfolioService.create(form)
        setEntries((prev) => [entry, ...prev])
      }
      if (imageFile) {
        const imageUrl = await portfolioService.uploadImage(entry.id, imageFile)
        const withImage = { ...entry, imageUrl }
        setEntries((prev) => prev.map((x) => x.id === entry.id ? withImage : x))
      }
      closeForm()
    } catch { setError('Failed to save — please try again') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    await portfolioService.delete(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between">
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Portfolio</span>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
              onChange={() => setError('AI import is not available yet — add your project manually')} />
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
            >
              <HiOutlineSparkles className="w-3 h-3" />AI import
            </button>
            <button onClick={openNew}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer"
            >
              <HiOutlinePlusCircle className="w-3 h-3" />Add project
            </button>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">
            {entries.length > 0 ? `${entries.length} project${entries.length !== 1 ? 's' : ''}` : 'My projects'}
          </p>
          <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">Showcase your work and experience</p>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg border border-danger-muted dark:border-danger-dark-muted bg-danger-subtle dark:bg-danger-dark-subtle text-[12px] text-danger-fg dark:text-danger-dark-fg">
          {error}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <motion.div initial={{ scale: 0.98, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 16 }}
              className="w-full sm:max-w-lg bg-canvas-default dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default sm:rounded-xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-default dark:border-border-dark-default shrink-0">
                <div>
                  <p className="text-[14px] font-semibold text-fg-default dark:text-fg-dark-default">
                    {editing ? 'Edit project' : 'Add project'}
                  </p>
                  <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">Fill in the details below</p>
                </div>
                <button onClick={closeForm} className="p-1.5 rounded-lg text-fg-muted dark:text-fg-dark-muted hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer">
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable body — no visible scrollbar */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-5 py-4 space-y-4">

                  {/* Cover image */}
                  <div>
                    <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5 block">Cover image</label>
                    <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                    <button type="button" onClick={() => imageRef.current?.click()}
                      className="relative w-full h-36 rounded-lg border-2 border-dashed border-border-default dark:border-border-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors overflow-hidden group cursor-pointer"
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                            <HiOutlineArrowUpTray className="w-5 h-5 text-white" />
                            <span className="text-[11px] font-medium text-white">Change image</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-fg-muted dark:text-fg-dark-muted group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors">
                          <HiOutlineArrowUpTray className="w-5 h-5" />
                          <span className="text-[11px] font-medium">Click to upload a cover image</span>
                          <span className="text-[10px] opacity-60">JPG, PNG or WebP · max 8MB</span>
                        </div>
                      )}
                    </button>
                    {imagePreview && (
                      <button type="button"
                        onClick={() => { setImageFile(null); setImagePreview(editing?.imageUrl ?? null); if (imageRef.current) imageRef.current.value = '' }}
                        className="mt-1.5 text-[11px] text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <HiOutlineXMark className="w-3 h-3" /> Remove image
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5 flex items-center gap-1">
                      Title <span className="text-danger-fg dark:text-danger-dark-fg">*</span>
                    </label>
                    <input required value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className={inputCls} placeholder="e.g. E-commerce platform" />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5 block">Summary</label>
                    <textarea rows={3} value={form.summary}
                      onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                      className={clsx(inputCls, 'resize-none')} placeholder="Brief description of the project…" />
                  </div>

                  {/* Impact */}
                  <div>
                    <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5 block">Impact statement</label>
                    <input value={form.impact_statement}
                      onChange={(e) => setForm((f) => ({ ...f, impact_statement: e.target.value }))}
                      className={inputCls} placeholder="e.g. Reduced load time by 40%" />
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5 block">Technologies</label>
                    <div className="flex gap-2">
                      <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                        className={inputCls} placeholder="e.g. React, TypeScript…" />
                      <button type="button" onClick={addTech}
                        className="px-3 py-2 text-[12px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer shrink-0"
                      >Add</button>
                    </div>
                    {(form.technologies?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.technologies!.map((t) => (
                          <span key={t} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default">
                            {t}
                            <button type="button" onClick={() => removeTech(t)} className="cursor-pointer text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors">
                              <HiOutlineXMark className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* URL */}
                  <div>
                    <label className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5 block">Project URL</label>
                    <div className="flex items-center rounded-lg border border-border-default dark:border-border-dark-default focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT overflow-hidden transition-colors">
                      <span className="px-3 py-2 text-[11px] text-fg-muted dark:text-fg-dark-muted border-r border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset shrink-0">
                        <HiOutlineLink className="w-3.5 h-3.5" />
                      </span>
                      <input type="url" value={form.project_url}
                        onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-canvas-overlay dark:bg-canvas-dark-inset text-[12px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
                        placeholder="https://github.com/…" />
                    </div>
                  </div>

                  {error && (
                    <div className="px-3 py-2 rounded-lg border border-danger-muted dark:border-danger-dark-muted bg-danger-subtle dark:bg-danger-dark-subtle text-[12px] text-danger-fg dark:text-danger-dark-fg">{error}</div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 justify-end px-5 py-4 border-t border-border-default dark:border-border-dark-default shrink-0">
                  <button type="button" onClick={closeForm}
                    className="px-4 py-2 text-[12px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer"
                  >Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" />}
                    {saving ? 'Saving…' : editing ? 'Save changes' : 'Add project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="border border-border-default dark:border-border-dark-default rounded-xl p-12 text-center">
          <HiOutlineArrowUpTray className="w-6 h-6 text-border-default dark:text-border-dark-default mx-auto mb-3" />
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No projects yet — add a project manually or use AI import</p>
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
