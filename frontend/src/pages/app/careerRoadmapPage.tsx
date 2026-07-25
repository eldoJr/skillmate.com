import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineMapPin,
  HiOutlineCalendar, HiOutlineDocumentArrowDown, HiOutlineChevronDown,
  HiOutlineCheckCircle, HiOutlineBookOpen,
} from 'react-icons/hi2'
import { aiService, type RoadmapReport, type Milestone, type WeekPlan } from '../../services/ai'

function MilestoneCard({ m, index }: { m: Milestone; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[#0969da] dark:bg-[#2f81f7] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-[#d0d7de] dark:bg-[#30363d] mt-1" />
      </div>
      <div className="flex-1 pb-5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 hover:border-[#0969da] dark:hover:border-[#2f81f7] transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{m.title}</p>
              <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5 flex items-center gap-1">
                <HiOutlineCalendar className="w-3.5 h-3.5" /> Week {m.week_start}–{m.week_end}
              </p>
            </div>
            <HiOutlineChevronDown className={`w-4 h-4 text-[#636c76] dark:text-[#848d97] shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <p className="text-[12px] text-[#636c76] dark:text-[#848d97] leading-relaxed mt-3">{m.description}</p>

                {m.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 text-[11px] rounded-lg bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border border-[#b6e3ff] dark:border-[#2f81f726]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {m.projects.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-1.5">Projects</p>
                    <ul className="space-y-1">
                      {m.projects.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-[12px] text-[#636c76] dark:text-[#848d97]">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950] shrink-0 mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.certifications.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-1.5">Certifications</p>
                    <ul className="space-y-1">
                      {m.certifications.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-[12px] text-[#636c76] dark:text-[#848d97]">
                          <HiOutlineBookOpen className="w-3.5 h-3.5 text-[#9a6700] dark:text-[#d29922] shrink-0 mt-0.5" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}

function WeekCard({ w }: { w: WeekPlan }) {
  return (
    <div className="rounded-xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-[#0969da] dark:text-[#2f81f7] bg-[#ddf4ff] dark:bg-[#121d2f] px-2 py-0.5 rounded-full">Week {w.week}</span>
        <p className="text-[12px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{w.focus}</p>
      </div>
      <ul className="space-y-1">
        {w.tasks.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[11px] text-[#636c76] dark:text-[#848d97]">
            <span className="w-1 h-1 rounded-full bg-[#636c76] dark:bg-[#848d97] shrink-0 mt-1.5" />{t}
          </li>
        ))}
      </ul>
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
    setLoading(true)
    setError('')
    try {
      const r = await aiService.generateRoadmap(role.trim())
      setRoadmap(r)
    } catch {
      setError('Failed to generate roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3] flex items-center gap-2">
            <HiOutlineMapPin className="w-5 h-5 text-[#0969da] dark:text-[#2f81f7]" /> Career Roadmap
          </h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Get a personalized week-by-week plan to reach your target role.</p>
        </div>
        {roadmap && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => aiService.downloadResumePdf()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer"
            >
              <HiOutlineDocumentArrowDown className="w-4 h-4" /> Resume PDF
            </button>
            <button
              onClick={() => aiService.downloadResumeDocx()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer"
            >
              <HiOutlineDocumentArrowDown className="w-4 h-4" /> Resume DOCX
            </button>
          </div>
        )}
      </div>

      <form onSubmit={generate} className="flex gap-3">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Full Stack Developer, Product Manager, Data Engineer…"
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#0d1117] transition-all"
        />
        <button
          type="submit"
          disabled={loading || !role.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineSparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {error && (
        <div className="px-3 py-2.5 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-[12px]">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {roadmap && (
          <motion.div key={roadmap.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">

            {/* Summary card */}
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-1">Target Role</p>
                  <p className="text-[18px] font-bold text-[#1f2328] dark:text-[#e6edf3]">{roadmap.target_role}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d]">
                  <HiOutlineCalendar className="w-4 h-4 text-[#636c76] dark:text-[#848d97]" />
                  <div>
                    <p className="text-[18px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-none">{roadmap.total_weeks}</p>
                    <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">total weeks</p>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed mt-3">{roadmap.summary}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[#f6f8fa] dark:bg-[#21262d] w-fit">
              {(['milestones', 'weekly'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer capitalize ${
                    tab === t
                      ? 'bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#e6edf3] shadow-sm'
                      : 'text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]'
                  }`}
                >
                  {t === 'milestones' ? `Milestones (${roadmap.milestones.length})` : `Weekly Plan (${roadmap.weekly_plan.length}w)`}
                </button>
              ))}
            </div>

            {tab === 'milestones' && (
              <div>
                {roadmap.milestones.map((m, i) => (
                  <MilestoneCard key={i} m={m} index={i} />
                ))}
              </div>
            )}

            {tab === 'weekly' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmap.weekly_plan.map((w) => <WeekCard key={w.week} w={w} />)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!roadmap && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HiOutlineMapPin className="w-10 h-10 text-[#d0d7de] dark:text-[#30363d] mb-3" />
          <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Enter a target role above to generate your personalized career roadmap.</p>
        </div>
      )}
    </div>
  )
}
