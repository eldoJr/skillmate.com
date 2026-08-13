import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineClock, HiOutlineChevronDown,
} from 'react-icons/hi2'
import { aiService, type SkillGapReport } from '../../services/ai'

const priorityLabel = (p: number) => p === 1 ? 'critical' : p === 2 ? 'high' : 'medium'
const priorityColor = (p: number) =>
  p === 1 ? 'text-[#d1242f] dark:text-[#f85149] border-[#d1242f]/40'
  : p === 2 ? 'text-[#d29922] border-[#d29922]/40'
  : 'text-[#636c76] dark:text-[#848d97] border-[#e2e4e8] dark:border-[#1e2228]'

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
      <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
    </div>
  )
}

export default function SkillGapPage() {
  const [role, setRole] = useState('')
  const [report, setReport] = useState<SkillGapReport | null>(null)
  const [history, setHistory] = useState<SkillGapReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { aiService.getSkillGapReports().then(setHistory) }, [])

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) return
    setLoading(true); setError('')
    try {
      const r = await aiService.analyzeSkillGap(role.trim())
      setReport(r)
      setHistory((prev) => [r, ...prev.filter((h) => h.target_role !== r.target_role)])
    } catch { setError('analysis failed — please try again') }
    finally { setLoading(false) }
  }

  const active = report ?? (history.length > 0 ? history[0] : null)

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">skill gap analysis</span>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">analyze your skill gap</p>
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">enter a target role to see what skills you're missing and how to close the gap</p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={analyze} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#636c76] dark:text-[#848d97] pointer-events-none">$</span>
          <input
            type="text" value={role} onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. frontend developer, data scientist, ux designer…"
            className="w-full pl-8 pr-4 py-2 font-mono text-[11px] tracking-wide bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors"
          />
        </div>
        <button type="submit" disabled={loading || !role.trim()}
          className="flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loading ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
          {loading ? 'analyzing…' : 'analyze'}
        </button>
      </form>

      {error && (
        <div className="px-3 py-2 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
          ! {error}
        </div>
      )}

      {/* History tabs */}
      {history.length > 1 && (
        <div className="flex items-center border-b border-[#e2e4e8] dark:border-[#1e2228] overflow-hidden pb-px">
          {history.map((h) => (
            <button key={h.id} onClick={() => setReport(h)}
              className={clsx(
                'px-3 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2',
                (report ?? history[0])?.id === h.id
                  ? 'border-[#e8490f] dark:border-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35]'
                  : 'border-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
              )}
            >{h.target_role}</button>
          ))}
        </div>
      )}

      {/* Empty */}
      {!active && !loading && (
        <div className="border border-[#e2e4e8] dark:border-[#1e2228] p-12 text-center">
          <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">~ enter a target role above to get your personalized skill gap report</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {active && (
          <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">

            {/* Summary */}
            <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <SectionHeader label="summary" />
              <div className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-1">target role</p>
                  <p className="font-mono text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{active.target_role}</p>
                </div>
                {active.estimated_weeks && (
                  <div className="flex items-center gap-2 px-3 py-2 border border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117]">
                    <HiOutlineClock className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97]" />
                    <div>
                      <p className="font-mono text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none">{active.estimated_weeks}</p>
                      <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">weeks to close</p>
                    </div>
                  </div>
                )}
              </div>
              {active.summary && (
                <div className="px-4 pb-4">
                  <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed">{active.summary}</p>
                </div>
              )}
            </div>

            {/* Present skills */}
            <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <SectionHeader label={`skills you have (${active.present_skills.length})`} />
              <div className="p-4">
                {active.present_skills.length === 0 ? (
                  <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">no skills on your profile yet — add skills in settings</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {active.present_skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] border border-[#22c55e]/40 text-[#22c55e]">
                        <HiOutlineCheckCircle className="w-2.5 h-2.5" />{s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Missing skills */}
            <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <SectionHeader label={`skills to acquire (${active.missing_skills.length})`} />
              <div className="divide-y divide-[#e2e4e8] dark:divide-[#1e2228]">
                {active.missing_skills.sort((a, b) => a.priority - b.priority).map((ms) => (
                  <div key={ms.skill}>
                    <button
                      onClick={() => setExpanded((v) => v === ms.skill ? null : ms.skill)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={clsx('font-mono text-[8px] tracking-wide border px-1.5 py-0.5 shrink-0', priorityColor(ms.priority))}>
                          {priorityLabel(ms.priority)}
                        </span>
                        <span className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">{ms.skill}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1 font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                          <HiOutlineClock className="w-3 h-3" />{ms.estimated_weeks}w
                        </span>
                        <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] transition-transform', expanded === ms.skill && 'rotate-180')} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expanded === ms.skill && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                          <p className="px-4 pb-3 pt-2 font-mono text-[10px] text-[#636c76] dark:text-[#848d97] leading-relaxed border-t border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117]">
                            <span className="text-[#e8490f] dark:text-[#ff6b35] mr-1">›</span>{ms.reason}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
