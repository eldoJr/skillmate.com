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
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-white dark:bg-[#0d1117]',
  'border border-[#e2e4e8] dark:border-[#1e2228]',
  'text-[#1f2328] dark:text-[#e6edf3]',
  'placeholder-[#adb5bd] dark:placeholder-[#4a5568]',
  'outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35]',
  'transition-colors duration-150',
].join(' ')

const emptyForm: RequirementCreate = { company_name: '', role_title: '', description: '', required_skills: [], preferred_university: '' }

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

function CandidateRow({ c, index }: { c: CandidateResult; index: number }) {
  const navigate = useNavigate()
  const name = `${c.student.first_name} ${c.student.last_name}`
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/profile/${c.student.id}`)}
      className="flex items-start gap-3 px-4 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] cursor-pointer transition-colors group"
    >
      <div className="relative shrink-0">
        <Avatar name={name} src={c.student.avatar_url ?? undefined} size="sm" />
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#e8490f] dark:bg-[#ff6b35] flex items-center justify-center font-mono text-[7px] font-bold text-white">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#e8490f] dark:group-hover:text-[#ff6b35] transition-colors">{name}</p>
          {c.student.is_verified && <HiOutlineCheckBadge className="w-3 h-3 text-[#22c55e] shrink-0" />}
        </div>
        {c.student.headline && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">{c.student.headline}</p>}
        {c.student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {c.student.skills.slice(0, 4).map((s) => (
              <span key={s.id} className="px-1.5 py-0.5 font-mono text-[8px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{s.name}</span>
            ))}
          </div>
        )}
        {c.summary && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-1 leading-relaxed"><span className="text-[#e8490f] dark:text-[#ff6b35] mr-1">›</span>{c.summary}</p>}
      </div>
      <div className="shrink-0 text-right space-y-1">
        <div className="flex items-center gap-1 justify-end px-2 py-0.5 border border-[#e8490f]/40 dark:border-[#ff6b35]/40">
          <span className="font-mono text-[9px] font-bold text-[#e8490f] dark:text-[#ff6b35]">{Math.round(c.final_score * 100)}%</span>
        </div>
        {c.scores.total_reviews > 0 && (
          <div className="flex items-center gap-1 justify-end">
            <HiOutlineStar className="w-3 h-3 text-[#d29922]" />
            <span className="font-mono text-[10px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{c.scores.overall_avg.toFixed(1)}</span>
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
    } catch { setError('failed to post requirement — please try again') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">company matching</span>
          </div>
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide border border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] hover:text-white transition-colors cursor-pointer"
          >
            <HiOutlinePlusCircle className="w-3 h-3" />post requirement
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
            {requirements.length > 0 ? `${requirements.length} requirement${requirements.length !== 1 ? 's' : ''}` : 'role requirements'}
          </p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">post role requirements and find matching student candidates</p>
        </div>
      </div>

      {/* Post form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border border-[#e8490f]/40 dark:border-[#ff6b35]/40">
              <div className="px-4 py-2.5 border-b border-[#e8490f]/40 dark:border-[#ff6b35]/40 bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
                  <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">new requirement</span>
                </div>
                <button onClick={() => setShowForm(false)} className="text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer">
                  <HiOutlineXMark className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <SectionHeader label="role details" />
                <div className="grid grid-cols-2">
                  <Field label="company name" required>
                    <input required value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} className={inputCls} placeholder="acme corp" />
                  </Field>
                  <Field label="role title" required>
                    <input required value={form.role_title} onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))} className={inputCls} placeholder="frontend intern" />
                  </Field>
                </div>
                <Field label="description" required>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={clsx(inputCls, 'resize-none')} placeholder="describe the role and what you're looking for…" />
                </Field>
                <SectionHeader label="requirements" />
                <Field label="required skills" required>
                  <div className="flex gap-2">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                      className={inputCls} placeholder="type and press enter…" />
                    <button type="button" onClick={addSkill}
                      className="px-3 py-2 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer shrink-0"
                    >add</button>
                  </div>
                  {form.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.required_skills.map((s) => (
                        <span key={s} className="flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] bg-[#e8490f] dark:bg-[#ff6b35] text-white">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="cursor-pointer hover:opacity-70 transition-opacity"><HiOutlineXMark className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="preferred university">
                  <input value={form.preferred_university} onChange={(e) => setForm((f) => ({ ...f, preferred_university: e.target.value }))} className={inputCls} placeholder="optional" />
                </Field>
                {error && (
                  <div className="mx-4 my-2 px-3 py-2 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
                    ! {error}
                  </div>
                )}
                <div className="flex items-center gap-2 justify-end px-4 py-3 border-t border-[#e2e4e8] dark:border-[#1e2228]">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 font-mono text-[10px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer"
                  >cancel</button>
                  <button type="submit" disabled={saving || form.required_skills.length === 0}
                    className="px-5 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <HiOutlineArrowPath className="w-3 h-3 animate-spin" />}
                    {saving ? 'posting…' : 'post requirement'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <HiOutlineBuildingOffice2 className="w-6 h-6 text-[#e2e4e8] dark:text-[#1e2228] mx-auto mb-3" />
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no requirements posted yet — post one to find matching student candidates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requirements.map((r) => (
            <div key={r.id} className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <button onClick={() => toggleExpand(r.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <HiOutlineBuildingOffice2 className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{r.role_title}</p>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">{r.company_name}{r.preferred_university ? ` · ${r.preferred_university}` : ''}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.required_skills.slice(0, 4).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 font-mono text-[8px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{s}</span>
                      ))}
                      {r.required_skills.length > 4 && <span className="font-mono text-[8px] text-[#636c76] dark:text-[#848d97] self-center">+{r.required_skills.length - 4}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button onClick={(e) => handleToggle(r.id, e)}
                    className={clsx(
                      'px-2 py-0.5 font-mono text-[8px] tracking-wide border transition-colors cursor-pointer',
                      r.is_active
                        ? 'border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e] hover:text-white'
                        : 'border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#636c76]',
                    )}
                  >{r.is_active ? 'active' : 'inactive'}</button>
                  <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] transition-transform', expanded === r.id && 'rotate-180')} />
                </div>
              </button>

              <AnimatePresence>
                {expanded === r.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="border-t border-[#e2e4e8] dark:border-[#1e2228]">
                      <div className="px-4 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228]">
                        <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.description}</p>
                      </div>
                      <SectionHeader label="top candidates" />
                      {loadingCandidates === r.id ? (
                        <div className="flex items-center justify-center py-8">
                          <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
                        </div>
                      ) : candidates[r.id]?.length === 0 ? (
                        <p className="px-4 py-3 font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ no candidates found yet</p>
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
