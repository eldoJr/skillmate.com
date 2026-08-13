import { useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineMapPin,
  HiOutlineDocumentArrowDown, HiOutlineChevronDown,
  HiOutlineCheckCircle, HiOutlineBookOpen,
} from 'react-icons/hi2'
import { aiService, type RoadmapReport, type Milestone, type WeekPlan } from '../../services/ai'

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
      <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
    </div>
  )
}

function MilestoneRow({ m, index }: { m: Milestone; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors cursor-pointer text-left"
      >
        <span className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35] shrink-0 w-5">{String(index + 1).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{m.title}</p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">week {m.week_start}–{m.week_end}</p>
        </div>
        <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 border-t border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] space-y-3">
              <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{m.description}</p>
              {m.skills.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-1.5">skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 font-mono text-[9px] border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {m.projects.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-1.5">projects</p>
                  <div className="space-y-1">
                    {m.projects.map((p) => (
                      <p key={p} className="flex items-start gap-1.5 font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
                        <HiOutlineCheckCircle className="w-3 h-3 text-[#22c55e] shrink-0 mt-0.5" />{p}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {m.certifications.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-1.5">certifications</p>
                  <div className="space-y-1">
                    {m.certifications.map((c) => (
                      <p key={c} className="flex items-start gap-1.5 font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
                        <HiOutlineBookOpen className="w-3 h-3 text-[#d29922] shrink-0 mt-0.5" />{c}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WeekRow({ w }: { w: WeekPlan }) {
  return (
    <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
      <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35]">w{String(w.week).padStart(2, '0')}</span>
        <span className="font-mono text-[9px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">{w.focus}</span>
      </div>
      <div className="p-3 space-y-1">
        {w.tasks.map((t) => (
          <p key={t} className="flex items-start gap-1.5 font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
            <span className="text-[#e8490f] dark:text-[#ff6b35] shrink-0">›</span>{t}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function CareerRoadmapPage() {
  const [role, setRole] = useState('')
  const [roadmap, setRoadmap] = useState<RoadmapReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'milestones' | 'weekly'>('milestones')

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) return
    setLoading(true); setError('')
    try {
      const r = await aiService.generateRoadmap(role.trim())
      setRoadmap(r)
    } catch { setError('failed to generate roadmap — please try again') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">career roadmap</span>
          </div>
          {roadmap && (
            <div className="flex items-center gap-2">
              <button onClick={() => aiService.downloadResumePdf()}
                className="flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
              >
                <HiOutlineDocumentArrowDown className="w-3 h-3" />pdf
              </button>
              <button onClick={() => aiService.downloadResumeDocx()}
                className="flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
              >
                <HiOutlineDocumentArrowDown className="w-3 h-3" />docx
              </button>
            </div>
          )}
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">generate your roadmap</p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">get a personalized week-by-week plan to reach your target role</p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={generate} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#636c76] dark:text-[#848d97] pointer-events-none">$</span>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. full stack developer, product manager, data engineer…"
            className="w-full pl-8 pr-4 py-2 font-mono text-[11px] tracking-wide bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors"
          />
        </div>
        <button type="submit" disabled={loading || !role.trim()}
          className="flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loading ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
          {loading ? 'generating…' : 'generate'}
        </button>
      </form>

      {error && (
        <div className="px-3 py-2 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
          ! {error}
        </div>
      )}

      {!roadmap && !loading && (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ enter a target role above to generate your personalized career roadmap</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {roadmap && (
          <motion.div key={roadmap.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">

            {/* Summary */}
            <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <SectionHeader label="summary" />
              <div className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-1">target role</p>
                  <p className="font-mono text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{roadmap.target_role}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117]">
                  <HiOutlineMapPin className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97]" />
                  <div>
                    <p className="font-mono text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none">{roadmap.total_weeks}</p>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">total weeks</p>
                  </div>
                </div>
              </div>
              {roadmap.summary && (
                <div className="px-4 pb-4">
                  <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{roadmap.summary}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-[#e2e4e8] dark:border-[#1e2228] overflow-hidden pb-px">
              {(['milestones', 'weekly'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={clsx(
                    'px-3 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2',
                    tab === t
                      ? 'border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35]'
                      : 'border-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                  )}
                >
                  {t === 'milestones' ? `milestones (${roadmap.milestones.length})` : `weekly plan (${roadmap.weekly_plan.length}w)`}
                </button>
              ))}
            </div>

            {tab === 'milestones' && (
              <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
                {roadmap.milestones.map((m, i) => <MilestoneRow key={i} m={m} index={i} />)}
              </div>
            )}

            {tab === 'weekly' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roadmap.weekly_plan.map((w) => <WeekRow key={w.week} w={w} />)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
