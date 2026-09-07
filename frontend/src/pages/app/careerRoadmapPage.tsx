import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineMapPin,
  HiOutlineChevronDown, HiOutlineCheckCircle, HiOutlineBookOpen,
  HiOutlineTrash, HiOutlineExclamationTriangle, HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2'
import { Link } from 'react-router-dom'
import { aiService, type RoadmapReport, type Milestone, type WeekPlan } from '../../services/ai'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const sectionCls = 'border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default'
const headCls = 'px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

function MilestoneRow({ m, index, total }: { m: Milestone; index: number; total: number }) {
  const [open, setOpen] = useState(false)
  const progress = Math.round((m.week_end / total) * 100)
  return (
    <div className="border-b border-border-default dark:border-border-dark-default last:border-0">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer text-left"
      >
        <div className="flex flex-col items-center gap-1 shrink-0 w-8">
          <span className="text-[11px] font-bold text-brand dark:text-brand-dark-DEFAULT">{String(index + 1).padStart(2, '0')}</span>
          <div className="w-full h-0.5 rounded-full bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
            <div className="h-full rounded-full bg-brand dark:bg-brand-dark-DEFAULT" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default">{m.title}</p>
          <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
            Week {m.week_start}–{m.week_end}
            {m.skills.length > 0 && ` · ${m.skills.length} skill${m.skills.length !== 1 ? 's' : ''}`}
            {m.projects.length > 0 && ` · ${m.projects.length} project${m.projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 border-t border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset space-y-3">
              <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{m.description}</p>
              {m.skills.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {m.projects.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5">Projects</p>
                  <div className="space-y-1">
                    {m.projects.map((p) => (
                      <p key={p} className="flex items-start gap-1.5 text-[12px] text-fg-muted dark:text-fg-dark-muted">
                        <HiOutlineCheckCircle className="w-3.5 h-3.5 text-success-fg dark:text-success-dark-fg shrink-0 mt-0.5" />{p}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {m.certifications.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1.5">Certifications</p>
                  <div className="space-y-1">
                    {m.certifications.map((c) => (
                      <p key={c} className="flex items-start gap-1.5 text-[12px] text-fg-muted dark:text-fg-dark-muted">
                        <HiOutlineBookOpen className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />{c}
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
  const [open, setOpen] = useState(false)
  return (
    <div className={sectionCls}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset hover:bg-canvas-overlay dark:hover:bg-canvas-dark-overlay transition-colors cursor-pointer text-left"
      >
        <span className="text-[11px] font-bold text-brand dark:text-brand-dark-DEFAULT shrink-0">W{String(w.week).padStart(2, '0')}</span>
        <span className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default truncate flex-1">{w.focus}</span>
        <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
            <div className="p-3 space-y-2">
              <div className="space-y-1">
                {w.tasks.map((t) => (
                  <p key={t} className="flex items-start gap-1.5 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                    <span className="text-brand dark:text-brand-dark-DEFAULT shrink-0 mt-0.5">·</span>{t}
                  </p>
                ))}
              </div>
              {w.resources.length > 0 && (
                <div className="pt-1 border-t border-border-default dark:border-border-dark-default space-y-1">
                  {w.resources.map((r) => (
                    <p key={r} className="flex items-start gap-1.5 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                      <HiOutlineBookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-500" />{r}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CareerRoadmapPage() {
  const [role, setRole]           = useState('')
  const [roadmap, setRoadmap]     = useState<RoadmapReport | null>(null)
  const [roadmaps, setRoadmaps]   = useState<RoadmapReport[]>([])
  const [loading, setLoading]     = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState<'milestones' | 'weekly'>('milestones')
  const [needsGap, setNeedsGap]   = useState(false)

  useEffect(() => {
    aiService.getRoadmaps()
      .then((list) => { setRoadmaps(list); if (list.length > 0) setRoadmap(list[0]) })
      .catch(() => setError('Failed to load roadmaps'))
      .finally(() => setInitialLoading(false))
  }, [])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) return
    setLoading(true); setError(''); setNeedsGap(false)
    try {
      const r = await aiService.generateRoadmap(role.trim())
      setRoadmap(r)
      setRoadmaps((prev) => [r, ...prev.filter((b) => b.target_role !== r.target_role)])
      setRole(''); setTab('milestones')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? ''
      if (msg.toLowerCase().includes('skill gap')) setNeedsGap(true)
      else setError('Failed to generate roadmap — please try again')
    } finally { setLoading(false) }
  }

  const deleteRoadmap = async (r: RoadmapReport) => {
    try {
      await aiService.deleteRoadmap(r.id)
      const next = roadmaps.filter((b) => b.id !== r.id)
      setRoadmaps(next)
      if (roadmap?.id === r.id) setRoadmap(next.length > 0 ? next[0] : null)
    } catch { /* ignore */ }
  }

  return (
    <div className="flex gap-5">

      {/* History sidebar */}
      {roadmaps.length > 0 && (
        <div className="hidden lg:flex flex-col w-[190px] shrink-0">
          <div className={clsx('sticky top-20', sectionCls)}>
            <div className={headCls}>
              <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">My roadmaps</span>
            </div>
            {roadmaps.map((b) => {
              const isActive = roadmap?.id === b.id
              return (
                <div key={b.id} className={clsx(
                  'group flex items-center border-b border-border-default dark:border-border-dark-default last:border-0 border-l-2 transition-colors',
                  isActive ? 'border-l-brand dark:border-l-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted' : 'border-l-transparent hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                )}>
                  <button onClick={() => { setRoadmap(b); setTab('milestones') }}
                    className="flex-1 text-left px-3 py-2.5 cursor-pointer min-w-0">
                    <p className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default truncate">{b.target_role}</p>
                    <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{b.total_weeks}w · v{b.version}</p>
                  </button>
                  <button onClick={() => deleteRoadmap(b)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-all cursor-pointer shrink-0">
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">

        <div className={sectionCls}>
          <div className={headCls}>
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Career Roadmap</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">Generate your roadmap</p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              Get a personalized week-by-week plan to reach your target role —{' '}
              <span className="text-brand dark:text-brand-dark-DEFAULT font-medium">requires a skill gap analysis first</span>
            </p>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={generate} className="flex gap-2">
          <div className="flex-1 flex items-center border border-border-default dark:border-border-dark-default rounded-lg focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
            <span className="font-mono text-[11px] text-brand dark:text-brand-dark-DEFAULT px-3 shrink-0 select-none">{'>'}</span>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. full stack developer, product manager, data engineer…"
              className="flex-1 py-2.5 pr-3 text-[12px] bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
            />
          </div>
          <button type="submit" disabled={loading || !role.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </form>

        {needsGap && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-yellow-500/40 bg-canvas-inset dark:bg-canvas-dark-inset">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default">Skill gap analysis required</p>
              <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
                Run a skill gap analysis for <span className="font-medium text-fg-default dark:text-fg-dark-default">"{role || 'this role'}"</span> first, then come back to generate the roadmap.
              </p>
            </div>
            <Link to="/app/ai/skill-gap"
              className="flex items-center gap-1 text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT rounded-lg px-2.5 py-1.5 hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors shrink-0">
              Go <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
            </Link>
          </div>
        )}

        {error && (
          <div className="px-3 py-2 rounded-lg border border-danger-fg/40 dark:border-danger-dark-fg/40 bg-canvas-inset dark:bg-canvas-dark-inset text-[12px] text-danger-fg dark:text-danger-dark-fg">
            {error}
          </div>
        )}

        {!roadmap && !loading && !initialLoading && (
          <div className={clsx(sectionCls, 'p-12 text-center')}>
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">Enter a target role above to generate your personalized career roadmap</p>
          </div>
        )}

        {initialLoading && (
          <div className={clsx(sectionCls, 'p-8 text-center')}>
            <HiOutlineArrowPath className="w-4 h-4 animate-spin text-brand dark:text-brand-dark-DEFAULT mx-auto mb-2" />
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">Loading roadmap…</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {roadmap && (
            <motion.div key={roadmap.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">

              {/* Summary */}
              <div className={sectionCls}>
                <div className={clsx(headCls, 'flex items-center justify-between')}>
                  <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Summary</span>
                  <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">v{roadmap.version} · {formatDate(roadmap.created_at)}</span>
                </div>
                <div className="p-4 flex items-start gap-5 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-0.5">Target role</p>
                    <p className="text-[15px] font-bold text-fg-default dark:text-fg-dark-default">{roadmap.target_role}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                        <HiOutlineMapPin className="w-3 h-3" />{roadmap.total_weeks} weeks total
                      </span>
                      <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{roadmap.milestones.length} milestone{roadmap.milestones.length !== 1 ? 's' : ''}</span>
                      <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">{roadmap.weekly_plan.length} week plan</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-2">Milestones</p>
                    <div className="relative h-2 rounded-full bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
                      {roadmap.milestones.map((m, i) => (
                        <div key={i} className="absolute top-0 h-full rounded-full bg-brand dark:bg-brand-dark-DEFAULT"
                          style={{
                            left: `${((m.week_start - 1) / roadmap.total_weeks) * 100}%`,
                            width: `${((m.week_end - m.week_start + 1) / roadmap.total_weeks) * 100}%`,
                            opacity: 0.4 + (i / roadmap.milestones.length) * 0.6,
                          }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted">W1</span>
                      <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted">W{roadmap.total_weeks}</span>
                    </div>
                  </div>
                </div>
                {roadmap.summary && (
                  <div className="px-4 pb-4 border-t border-border-default dark:border-border-dark-default pt-3">
                    <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{roadmap.summary}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1">
                {(['milestones', 'weekly'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={clsx(
                      'px-3 py-1.5 text-[12px] font-medium rounded-lg capitalize transition-colors cursor-pointer border',
                      tab === t
                        ? 'border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                        : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                    )}
                  >
                    {t === 'milestones' ? `Milestones (${roadmap.milestones.length})` : `Weekly plan (${roadmap.weekly_plan.length}w)`}
                  </button>
                ))}
              </div>

              {tab === 'milestones' && (
                <div className={sectionCls}>
                  {roadmap.milestones.map((m, i) => <MilestoneRow key={i} m={m} index={i} total={roadmap.total_weeks} />)}
                </div>
              )}

              {tab === 'weekly' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {roadmap.weekly_plan.map((w) => <WeekRow key={w.week} w={w} />)}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button onClick={() => { setRole(roadmap.target_role); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="flex items-center gap-1.5 text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                  <HiOutlineArrowPath className="w-3.5 h-3.5" /> Regenerate
                </button>
                <button onClick={() => deleteRoadmap(roadmap)}
                  className="flex items-center gap-1.5 text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer">
                  <HiOutlineTrash className="w-3.5 h-3.5" /> Delete roadmap
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
