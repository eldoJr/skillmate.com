import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineBuildingOffice2, HiOutlinePlusCircle, HiOutlineArrowPath,
  HiOutlineChevronDown, HiOutlineCheckBadge, HiOutlineStar,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { aiService, type RequirementResponse, type CandidateResult, type RequirementCreate } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

const inputCls = [
  'w-full px-3 py-2 rounded-lg text-[12px]',
  'bg-canvas-overlay dark:bg-canvas-dark-inset',
  'border border-border-default dark:border-border-dark-default',
  'text-fg-default dark:text-fg-dark-default',
  'placeholder-fg-subtle dark:placeholder-fg-dark-subtle',
  'outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand dark:focus:border-brand-dark-DEFAULT',
  'transition-colors duration-150',
].join(' ')

const emptyForm: RequirementCreate = { company_name: '', role_title: '', description: '', required_skills: [], preferred_university: '' }

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

function CandidateRow({ c, index }: { c: CandidateResult; index: number }) {
  const navigate = useNavigate()
  const name = `${c.student.first_name} ${c.student.last_name}`
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/profile/${c.student.id}`)}
      className="flex items-start gap-3 px-4 py-3 border-b border-border-default dark:border-border-dark-default last:border-0 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset cursor-pointer transition-colors group"
    >
      <div className="relative shrink-0">
        <Avatar name={name} src={c.student.avatar_url ?? undefined} size="sm" />
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand dark:bg-brand-dark-DEFAULT flex items-center justify-center text-[9px] font-bold text-white">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors">{name}</p>
          {c.student.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-success-fg dark:text-success-dark-fg shrink-0" />}
        </div>
        {c.student.headline && <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted truncate">{c.student.headline}</p>}
        {c.student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {c.student.skills.slice(0, 4).map((s) => (
              <span key={s.id} className="px-1.5 py-0.5 text-[10px] font-medium rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{s.name}</span>
            ))}
          </div>
        )}
        {c.summary && <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-1 leading-relaxed">{c.summary}</p>}
      </div>
      <div className="shrink-0 text-right space-y-1">
        <div className="flex items-center gap-1 justify-end px-2 py-0.5 rounded-md border border-brand/40 dark:border-brand-dark-DEFAULT/40">
          <span className="text-[11px] font-bold text-brand dark:text-brand-dark-DEFAULT">{Math.round(c.final_score * 100)}%</span>
        </div>
        {c.scores.total_reviews > 0 && (
          <div className="flex items-center gap-1 justify-end">
            <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default">{c.scores.overall_avg.toFixed(1)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function CompanyPage() {
  const [requirements, setRequirements] = useState<RequirementResponse[]>([])
  const [candidates, setCandidates] = useState<Record<string, CandidateResult[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loadingCandidates, setLoadingCandidates] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<RequirementCreate>(emptyForm)
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { aiService.listRequirements().then(setRequirements).finally(() => setLoading(false)) }, [])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!candidates[id]) {
      setLoadingCandidates(id)
      try {
        const res = await aiService.getMatches_company(id, 10)
        setCandidates((prev) => ({ ...prev, [id]: res.candidates }))
      } finally { setLoadingCandidates(null) }
    }
  }

  const handleToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = await aiService.toggleRequirement(id)
    setRequirements((prev) => prev.map((r) => r.id === id ? updated : r))
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.required_skills.includes(s)) setForm((f) => ({ ...f, required_skills: [...f.required_skills, s] }))
    setSkillInput('')
  }
  const removeSkill = (s: string) => setForm((f) => ({ ...f, required_skills: f.required_skills.filter((x) => x !== s) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const r = await aiService.postRequirement({ ...form, preferred_university: form.preferred_university || undefined })
      setRequirements((prev) => [r, ...prev])
      setShowForm(false); setForm(emptyForm); setSkillInput('')
    } catch { setError('Failed to post requirement — please try again') }
    finally { setSaving(false) }
  }

  const sectionCls = 'border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden'
  const headCls = 'px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className={sectionCls}>
        <div className={clsx(headCls, 'flex items-center justify-between')}>
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Company Matching</span>
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors cursor-pointer"
          >
            <HiOutlinePlusCircle className="w-3.5 h-3.5" />Post requirement
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">
            {requirements.length > 0 ? `${requirements.length} requirement${requirements.length !== 1 ? 's' : ''}` : 'Role requirements'}
          </p>
          <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">Post role requirements and find matching student candidates</p>
        </div>
      </div>

      {/* Post form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border border-brand/30 dark:border-brand-dark-DEFAULT/30 rounded-xl overflow-hidden">
              <div className={clsx(headCls, 'flex items-center justify-between border-brand/30 dark:border-brand-dark-DEFAULT/30')}>
                <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">New requirement</span>
                <button onClick={() => setShowForm(false)} className="text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="bg-canvas-default dark:bg-canvas-dark-default">
                <div className={headCls}>
                  <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Role details</span>
                </div>
                <div className="grid grid-cols-2">
                  <Field label="Company name" required>
                    <input required value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} className={inputCls} placeholder="Acme Corp" />
                  </Field>
                  <Field label="Role title" required>
                    <input required value={form.role_title} onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))} className={inputCls} placeholder="Frontend Intern" />
                  </Field>
                </div>
                <Field label="Description" required>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={clsx(inputCls, 'resize-none')} placeholder="Describe the role and what you're looking for…" />
                </Field>
                <div className={headCls}>
                  <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Requirements</span>
                </div>
                <Field label="Required skills" required>
                  <div className="flex gap-2">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                      className={inputCls} placeholder="Type and press enter…" />
                    <button type="button" onClick={addSkill}
                      className="px-3 py-2 text-[12px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer shrink-0"
                    >Add</button>
                  </div>
                  {form.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.required_skills.map((s) => (
                        <span key={s} className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-brand dark:bg-brand-dark-DEFAULT text-white">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="cursor-pointer hover:opacity-70 transition-opacity"><HiOutlineXMark className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="Preferred university">
                  <input value={form.preferred_university} onChange={(e) => setForm((f) => ({ ...f, preferred_university: e.target.value }))} className={inputCls} placeholder="Optional" />
                </Field>
                {error && (
                  <div className="mx-4 my-2 px-3 py-2 rounded-lg border border-danger-muted dark:border-danger-dark-muted bg-danger-subtle dark:bg-danger-dark-subtle text-[12px] text-danger-fg dark:text-danger-dark-fg">{error}</div>
                )}
                <div className="flex items-center gap-2 justify-end px-4 py-3 border-t border-border-default dark:border-border-dark-default">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-[12px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer"
                  >Cancel</button>
                  <button type="submit" disabled={saving || form.required_skills.length === 0}
                    className="px-5 py-2 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" />}
                    {saving ? 'Posting…' : 'Post requirement'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
        </div>
      ) : requirements.length === 0 ? (
        <div className={clsx(sectionCls, 'p-12 text-center')}>
          <HiOutlineBuildingOffice2 className="w-6 h-6 text-border-default dark:text-border-dark-default mx-auto mb-3" />
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">No requirements posted yet — post one to find matching student candidates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requirements.map((r) => (
            <div key={r.id} className={sectionCls}>
              <button onClick={() => toggleExpand(r.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer text-left"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <HiOutlineBuildingOffice2 className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">{r.role_title}</p>
                    <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{r.company_name}{r.preferred_university ? ` · ${r.preferred_university}` : ''}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.required_skills.slice(0, 4).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 text-[10px] font-medium rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{s}</span>
                      ))}
                      {r.required_skills.length > 4 && <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted self-center">+{r.required_skills.length - 4}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button onClick={(e) => handleToggle(r.id, e)}
                    className={clsx(
                      'px-2 py-0.5 text-[10px] font-medium rounded-md border transition-colors cursor-pointer',
                      r.is_active
                        ? 'border-success-fg/40 dark:border-success-dark-fg/40 text-success-fg dark:text-success-dark-fg hover:bg-success-fg dark:hover:bg-success-dark-fg hover:text-white'
                        : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-fg-muted dark:hover:border-fg-dark-muted',
                    )}
                  >{r.is_active ? 'Active' : 'Inactive'}</button>
                  <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted transition-transform', expanded === r.id && 'rotate-180')} />
                </div>
              </button>

              <AnimatePresence>
                {expanded === r.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="border-t border-border-default dark:border-border-dark-default">
                      <div className="px-4 py-3 border-b border-border-default dark:border-border-dark-default">
                        <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{r.description}</p>
                      </div>
                      <div className={headCls}>
                        <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Top candidates</span>
                      </div>
                      {loadingCandidates === r.id ? (
                        <div className="flex items-center justify-center py-8">
                          <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
                        </div>
                      ) : candidates[r.id]?.length === 0 ? (
                        <p className="px-4 py-3 text-[12px] text-fg-muted dark:text-fg-dark-muted">No candidates found yet</p>
                      ) : (
                        <div>
                          {(candidates[r.id] ?? []).map((c, i) => <CandidateRow key={c.student.id} c={c} index={i} />)}
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
