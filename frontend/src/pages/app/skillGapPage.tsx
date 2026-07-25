import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineClock, HiOutlineChevronDown,
} from 'react-icons/hi2'
import { aiService, type SkillGapReport } from '../../services/ai'

const priorityLabel = (p: number) => p === 1 ? 'Critical' : p === 2 ? 'High' : 'Medium'
const priorityColor = (p: number) =>
  p === 1
    ? 'bg-[#fff0ee] dark:bg-[#2d1216] text-[#d1242f] dark:text-[#f85149] border-[#ffcecb] dark:border-[#f8514926]'
    : p === 2
    ? 'bg-[#fff8c5] dark:bg-[#2d2000] text-[#9a6700] dark:text-[#d29922] border-[#f0d060] dark:border-[#d2992226]'
    : 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border-[#b6e3ff] dark:border-[#2f81f726]'

export default function SkillGapPage() {
  const [role, setRole] = useState('')
  const [report, setReport] = useState<SkillGapReport | null>(null)
  const [history, setHistory] = useState<SkillGapReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    aiService.getSkillGapReports().then(setHistory)
  }, [])

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) return
    setLoading(true)
    setError('')
    try {
      const r = await aiService.analyzeSkillGap(role.trim())
      setReport(r)
      setHistory((prev) => [r, ...prev.filter((h) => h.target_role !== r.target_role)])
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const active = report ?? (history.length > 0 ? history[0] : null)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3] flex items-center gap-2">
          <HiOutlineSparkles className="w-5 h-5 text-[#0969da] dark:text-[#2f81f7]" /> Skill Gap Analysis
        </h2>
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Enter a target role to see what skills you're missing and how long it'll take to close the gap.</p>
      </div>

      {/* Input */}
      <form onSubmit={analyze} className="flex gap-3">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Frontend Developer, Data Scientist, UX Designer…"
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#0d1117] transition-all"
        />
        <button
          type="submit"
          disabled={loading || !role.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineSparkles className="w-4 h-4" />}
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </form>

      {error && (
        <div className="px-3 py-2.5 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-[12px]">
          {error}
        </div>
      )}

      {/* History tabs */}
      {history.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => setReport(h)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                (report ?? history[0])?.id === h.id
                  ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white border-[#0969da] dark:border-[#2f81f7]'
                  : 'bg-white dark:bg-[#161b22] text-[#636c76] dark:text-[#848d97] border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da] dark:hover:border-[#2f81f7]'
              }`}
            >
              {h.target_role}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {active && (
          <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">

            {/* Summary */}
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-1">Target Role</p>
                  <p className="text-[18px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{active.target_role}</p>
                </div>
                {active.estimated_weeks && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d]">
                    <HiOutlineClock className="w-4 h-4 text-[#636c76] dark:text-[#848d97]" />
                    <div>
                      <p className="text-[18px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none">{active.estimated_weeks}</p>
                      <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">weeks to close</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed mt-3">{active.summary}</p>
            </div>

            {/* Present skills */}
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] flex items-center gap-2 mb-3">
                <HiOutlineCheckCircle className="w-4 h-4 text-[#1a7f37] dark:text-[#3fb950]" /> Skills You Have ({active.present_skills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.present_skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950] border border-[#aef0b8] dark:border-[#1f5f33]">
                    {s}
                  </span>
                ))}
                {active.present_skills.length === 0 && (
                  <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">No skills on your profile yet. Add skills in Settings.</p>
                )}
              </div>
            </div>

            {/* Missing skills */}
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] flex items-center gap-2 mb-3">
                <HiOutlineExclamationCircle className="w-4 h-4 text-[#9a6700] dark:text-[#d29922]" /> Skills to Acquire ({active.missing_skills.length})
              </p>
              <div className="space-y-2">
                {active.missing_skills.sort((a, b) => a.priority - b.priority).map((ms) => (
                  <div key={ms.skill} className="rounded-xl border border-[#d0d7de] dark:border-[#30363d] overflow-hidden">
                    <button
                      onClick={() => setExpanded((v) => v === ms.skill ? null : ms.skill)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${priorityColor(ms.priority)}`}>
                          {priorityLabel(ms.priority)}
                        </span>
                        <span className="text-[13px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">{ms.skill}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-[#636c76] dark:text-[#848d97]">{ms.estimated_weeks}w</span>
                        <HiOutlineChevronDown className={`w-4 h-4 text-[#636c76] dark:text-[#848d97] transition-transform ${expanded === ms.skill ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expanded === ms.skill && (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          transition={{ duration: 0.2 }} className="overflow-hidden"
                        >
                          <p className="px-4 pb-3 text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed border-t border-[#d0d7de] dark:border-[#30363d] pt-3">
                            {ms.reason}
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

      {!active && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineSparkles className="w-10 h-10 text-[#d0d7de] dark:text-[#30363d] mb-3" />
          <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Enter a target role above to get your personalized skill gap report.</p>
        </div>
      )}
    </div>
  )
}
