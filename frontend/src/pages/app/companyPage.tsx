import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineBuildingOffice2, HiOutlinePlusCircle, HiOutlineArrowPath,
  HiOutlineChevronDown, HiOutlineCheckBadge, HiOutlineStar,
  HiOutlineXMark, HiOutlineSparkles,
} from 'react-icons/hi2'
import { aiService, type RequirementResponse, type CandidateResult, type RequirementCreate } from '../../services/ai'
import Avatar from '../../components/atoms/avatar'

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#0d1117] transition-all'

const emptyForm: RequirementCreate = { company_name: '', role_title: '', description: '', required_skills: [], preferred_university: '' }

function CandidateCard({ c, index }: { c: CandidateResult; index: number }) {
  const navigate = useNavigate()
  const name = `${c.student.first_name} ${c.student.last_name}`
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/app/profile/${c.student.id}`)}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] cursor-pointer transition-colors group"
    >
      <div className="relative shrink-0">
        <Avatar name={name} src={c.student.avatar_url ?? undefined} size="sm" />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0969da] dark:bg-[#2f81f7] flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">{index + 1}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] group-hover:text-[#0969da] dark:group-hover:text-[#2f81f7] transition-colors">{name}</p>
          {c.student.is_verified && <HiOutlineCheckBadge className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950] shrink-0" />}
        </div>
        {c.student.headline && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] truncate">{c.student.headline}</p>}
        {c.student.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {c.student.skills.slice(0, 4).map((s) => (
              <span key={s.id} className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{s.name}</span>
            ))}
          </div>
        )}
        {c.summary && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] italic mt-1 leading-relaxed">{c.summary}</p>}
      </div>
      <div className="shrink-0 text-right space-y-1">
        <div className="flex items-center gap-1 justify-end px-2 py-0.5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f]">
          <HiOutlineSparkles className="w-3 h-3 text-[#0969da] dark:text-[#2f81f7]" />
          <span className="text-[11px] font-bold text-[#0969da] dark:text-[#2f81f7]">{Math.round(c.final_score * 100)}%</span>
        </div>
        {c.scores.total_reviews > 0 && (
          <div className="flex items-center gap-1 justify-end">
            <HiOutlineStar className="w-3 h-3 text-[#9a6700] dark:text-[#d29922]" />
            <span className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{c.scores.overall_avg.toFixed(1)}</span>
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

  useEffect(() => {
    aiService.listRequirements().then(setRequirements).finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!candidates[id]) {
      setLoadingCandidates(id)
      try {
        const res = await aiService.getMatches_company(id, 10)
        setCandidates((prev) => ({ ...prev, [id]: res.candidates }))
      } finally {
        setLoadingCandidates(null)
      }
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
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const r = await aiService.postRequirement({ ...form, preferred_university: form.preferred_university || undefined })
      setRequirements((prev) => [r, ...prev])
      setShowForm(false)
      setForm(emptyForm)
      setSkillInput('')
    } catch {
      setError('Failed to post requirement. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Company Matching</h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Post role requirements and find matching student candidates.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer"
        >
          <HiOutlinePlusCircle className="w-4 h-4" /> Post Requirement
        </button>
      </div>

      {/* Post form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">New Requirement</p>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] text-[#636c76] dark:text-[#848d97] cursor-pointer transition-colors">
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Company Name *</label>
                    <input required value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} className={inputCls} placeholder="Acme Corp" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Role Title *</label>
                    <input required value={form.role_title} onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))} className={inputCls} placeholder="Frontend Intern" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Describe the role and what you're looking for…" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Required Skills *</label>
                  <div className="flex gap-2">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                      className={inputCls} placeholder="Type and press Enter…" />
                    <button type="button" onClick={addSkill} className="px-3 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer shrink-0">Add</button>
                  </div>
                  {form.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {form.required_skills.map((s) => (
                        <span key={s} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border border-[#b6e3ff] dark:border-[#2f81f726]">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="cursor-pointer hover:text-[#d1242f] transition-colors"><HiOutlineXMark className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Preferred University</label>
                  <input value={form.preferred_university} onChange={(e) => setForm((f) => ({ ...f, preferred_university: e.target.value }))} className={inputCls} placeholder="Optional" />
                </div>
                {error && <p className="text-[12px] text-[#d1242f] dark:text-[#f85149]">{error}</p>}
                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving || form.required_skills.length === 0} className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60">
                    {saving ? 'Posting…' : 'Post Requirement'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <HiOutlineArrowPath className="w-6 h-6 text-[#636c76] dark:text-[#848d97] animate-spin" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-12 text-center">
          <HiOutlineBuildingOffice2 className="w-8 h-8 text-[#d0d7de] dark:text-[#30363d] mx-auto mb-3" />
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No requirements posted yet. Post one to find matching student candidates.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requirements.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
              <button
                onClick={() => toggleExpand(r.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <HiOutlineBuildingOffice2 className="w-4 h-4 text-[#636c76] dark:text-[#848d97] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{r.role_title}</p>
                    <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">{r.company_name}{r.preferred_university ? ` · ${r.preferred_university}` : ''}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.required_skills.slice(0, 4).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{s}</span>
                      ))}
                      {r.required_skills.length > 4 && <span className="text-[9px] text-[#636c76] dark:text-[#848d97] self-center">+{r.required_skills.length - 4}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => handleToggle(r.id, e)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                      r.is_active
                        ? 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950] hover:bg-[#aef0b8] dark:hover:bg-[#1f5f33]'
                        : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] hover:bg-[#d0d7de] dark:hover:bg-[#30363d]'
                    }`}
                  >
                    {r.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <HiOutlineChevronDown className={`w-4 h-4 text-[#636c76] dark:text-[#848d97] transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {expanded === r.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-[#d0d7de] dark:border-[#30363d] pt-4 space-y-3">
                      <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{r.description}</p>
                      <p className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3] uppercase tracking-widest">Top Candidates</p>
                      {loadingCandidates === r.id ? (
                        <div className="flex items-center justify-center py-8">
                          <HiOutlineArrowPath className="w-5 h-5 text-[#636c76] dark:text-[#848d97] animate-spin" />
                        </div>
                      ) : candidates[r.id]?.length === 0 ? (
                        <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No candidates found yet.</p>
                      ) : (
                        <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                          {(candidates[r.id] ?? []).map((c, i) => <CandidateCard key={c.student.id} c={c} index={i} />)}
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
