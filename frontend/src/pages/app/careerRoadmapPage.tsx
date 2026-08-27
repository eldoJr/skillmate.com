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

// ── constants ─────────────────────────────────────────────────────────────────

const dot         = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT shrink-0'
const sectionHead = 'flex items-center gap-1.5 px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── sub-components ────────────────────────────────────────────────────────────

function MilestoneRow({ m, index, total }: { m: Milestone; index: number; total: number }) {
  const [open, setOpen] = useState(false)
  const progress = Math.round((m.week_end / total) * 100)
  return (
    <div className="border-b border-border-default dark:border-border-dark-default last:border-0">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer text-left"
      >
        {/* index + timeline bar */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-8">
          <span className="font-mono text-[10px] font-bold text-brand dark:text-brand-dark-DEFAULT">{String(index + 1).padStart(2, '0')}</span>
          <div className="w-full h-0.5 bg-canvas-inset dark:bg-canvas-dark-inset">
            <div className="h-full bg-brand dark:bg-brand-dark-DEFAULT" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] font-medium text-fg-default dark:text-fg-dark-default">{m.title}</p>
          <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
            week {m.week_start}–{m.week_end}
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
              <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">
                <span className="text-brand dark:text-brand-dark-DEFAULT mr-1.5">›</span>{m.description}
              </p>
              {m.skills.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1.5">skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 font-mono text-[9px] border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {m.projects.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1.5">projects</p>
                  <div className="space-y-1">
                    {m.projects.map((p) => (
                      <p key={p} className="flex items-start gap-1.5 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                        <HiOutlineCheckCircle className="w-3 h-3 text-success-fg dark:text-success-dark-fg shrink-0 mt-0.5" />{p}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {m.certifications.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1.5">certifications</p>
                  <div className="space-y-1">
                    {m.certifications.map((c) => (
                      <p key={c} className="flex items-start gap-1.5 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                        <HiOutlineBookOpen className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />{c}
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
    <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset hover:bg-canvas-overlay dark:hover:bg-canvas-dark-overlay transition-colors cursor-pointer text-left"
      >
        <span className="font-mono text-[9px] font-bold text-brand dark:text-brand-dark-DEFAULT shrink-0">w{String(w.week).padStart(2, '0')}</span>
        <span className="font-mono text-[9px] font-medium text-fg-default dark:text-fg-dark-default truncate flex-1">{w.focus}</span>
        <HiOutlineChevronDown className={clsx('w-3 h-3 text-fg-muted dark:text-fg-dark-muted shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
            <div className="p-3 space-y-2">
              <div className="space-y-1">
                {w.tasks.map((t) => (
                  <p key={t} className="flex items-start gap-1.5 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                    <span className="text-brand dark:text-brand-dark-DEFAULT shrink-0">›</span>{t}
                  </p>
                ))}
              </div>
              {w.resources.length > 0 && (
                <div className="pt-1 border-t border-border-default dark:border-border-dark-default space-y-1">
                  {w.resources.map((r) => (
                    <p key={r} className="flex items-start gap-1.5 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                      <HiOutlineBookOpen className="w-3 h-3 shrink-0 mt-0.5 text-yellow-500" />{r}
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

// ── main page ─────────────────────────────────────────────────────────────────

export default function CareerRoadmapPage() {
  const [role, setRole]       = useState('')
  const [roadmap, setRoadmap] = useState<RoadmapReport | null>(null)
  const [roadmaps, setRoadmaps] = useState<RoadmapReport[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<'milestones' | 'weekly'>('milestones')
  const [needsGap, setNeedsGap] = useState(false)

  useEffect(() => {
    aiService.getRoadmaps()
      .then((list) => {
        setRoadmaps(list)
        if (list.length > 0) setRoadmap(list[0])
      })
      .catch(() => setError('failed to load roadmaps'))
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
      setRole('')
      setTab('milestones')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? ''
      if (msg.toLowerCase().includes('skill gap')) setNeedsGap(true)
      else setError('failed to generate roadmap — please try again')
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

      {/* ── History sidebar ── */}
      {roadmaps.length > 0 && (
        <div className="hidden lg:flex flex-col w-[190px] shrink-0">
          <div className="sticky top-20 border border-border-default dark:border-border-dark-default">
            <div className={sectionHead}>
              <span className={dot} />
              <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">my roadmaps</span>
            </div>
            {roadmaps.map((b) => {
              const isActive = roadmap?.id === b.id
              return (
                <div key={b.id}
                  className={clsx(
                    'group flex items-center border-b border-border-default dark:border-border-dark-default last:border-0 border-l-2 transition-colors',
                    isActive
                      ? 'border-l-brand dark:border-l-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                      : 'border-l-transparent hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                  )}>
                  <button onClick={() => { setRoadmap(b); setTab('milestones') }}
                    className="flex-1 text-left px-3 py-2.5 cursor-pointer min-w-0">
                    <p className="font-mono text-[10px] text-fg-default dark:text-fg-dark-default truncate">{b.target_role}</p>
                    <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{b.total_weeks}w · v{b.version}</p>
                  </button>
                  <button onClick={() => deleteRoadmap(b)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-all cursor-pointer shrink-0">
                    <HiOutlineTrash className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Header */}
        <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
          <div className={sectionHead}>
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">career roadmap</span>
          </div>
          <div className="px-4 py-3">
            <p className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default">generate your roadmap</p>
            <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              get a personalized week-by-week plan to reach your target role —{' '}
              <span className="text-brand dark:text-brand-dark-DEFAULT">requires a skill gap analysis first</span>
            </p>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={generate} className="flex gap-2">
          <div className="flex-1 flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors bg-canvas-inset dark:bg-canvas-dark-inset">
            <span className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT px-3 shrink-0 select-none">$</span>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. full stack developer, product manager, data engineer…"
              className="flex-1 py-2.5 pr-3 font-mono text-[11px] bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
            />
          </div>
          <button type="submit" disabled={loading || !role.trim()}
            className="flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
            {loading ? 'generating…' : 'generate'}
          </button>
        </form>

        {/* Skill gap prerequisite warning */}
        {needsGap && (
          <div className="flex items-start gap-3 px-4 py-3 border border-yellow-500/40 bg-canvas-inset dark:bg-canvas-dark-inset">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-medium text-fg-default dark:text-fg-dark-default">skill gap analysis required</p>
              <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
                run a skill gap analysis for <span className="text-fg-default dark:text-fg-dark-default">"{role || 'this role'}"</span> first, then come back to generate the roadmap.
              </p>
            </div>
            <Link to="/app/ai/skill-gap"
              className="flex items-center gap-1 font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT px-2.5 py-1.5 hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors shrink-0">
              go <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
            </Link>
          </div>
        )}

        {error && (
          <div className="px-3 py-2 border border-danger-fg/40 dark:border-danger-dark-fg/40 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[10px] text-danger-fg dark:text-danger-dark-fg">
            ! {error}
          </div>
        )}

        {/* Empty state */}
        {!roadmap && !loading && !initialLoading && (
          <div className="border border-border-default dark:border-border-dark-default p-12 text-center bg-canvas-default dark:bg-canvas-dark-default">
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">~ enter a target role above to generate your personalized career roadmap</p>
          </div>
        )}

        {/* Loading skeleton */}
        {initialLoading && (
          <div className="border border-border-default dark:border-border-dark-default p-8 text-center bg-canvas-default dark:bg-canvas-dark-default">
            <HiOutlineArrowPath className="w-4 h-4 animate-spin text-brand dark:text-brand-dark-DEFAULT mx-auto mb-2" />
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">loading roadmap…</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {roadmap && (
            <motion.div key={roadmap.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">

              {/* ── Summary ── */}
              <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
                <div className={sectionHead}>
                  <span className={dot} />
                  <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">summary</span>
                  <span className="ml-auto font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">v{roadmap.version} · {formatDate(roadmap.created_at)}</span>
                </div>
                <div className="p-4 flex items-start gap-5 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-0.5">target role</p>
                    <p className="font-mono text-[14px] font-bold text-fg-default dark:text-fg-dark-default">{roadmap.target_role}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                        <HiOutlineMapPin className="w-3 h-3" />{roadmap.total_weeks} weeks total
                      </span>
                      <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                        {roadmap.milestones.length} milestone{roadmap.milestones.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                        {roadmap.weekly_plan.length} week plan
                      </span>
                    </div>
                  </div>

                  {/* mini milestone timeline */}
                  <div className="w-full sm:w-auto sm:min-w-[200px]">
                    <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-2">milestones</p>
                    <div className="relative h-2 bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default">
                      {roadmap.milestones.map((m, i) => (
                        <div key={i}
                          className="absolute top-0 h-full bg-brand dark:bg-brand-dark-DEFAULT opacity-80"
                          style={{
                            left:  `${((m.week_start - 1) / roadmap.total_weeks) * 100}%`,
                            width: `${((m.week_end - m.week_start + 1) / roadmap.total_weeks) * 100}%`,
                            opacity: 0.4 + (i / roadmap.milestones.length) * 0.6,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-mono text-[8px] text-fg-muted dark:text-fg-dark-muted">w1</span>
                      <span className="font-mono text-[8px] text-fg-muted dark:text-fg-dark-muted">w{roadmap.total_weeks}</span>
                    </div>
                  </div>
                </div>

                {roadmap.summary && (
                  <div className="px-4 pb-4 border-t border-border-default dark:border-border-dark-default pt-3">
                    <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">
                      <span className="text-brand dark:text-brand-dark-DEFAULT mr-1.5">›</span>{roadmap.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Tabs ── */}
              <div className="flex items-center border-b border-border-default dark:border-border-dark-default">
                {(['milestones', 'weekly'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={clsx(
                      'px-4 py-2 font-mono text-[9px] tracking-wide whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-px',
                      tab === t
                        ? 'border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT'
                        : 'border-transparent text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default',
                    )}
                  >
                    {t === 'milestones'
                      ? `milestones (${roadmap.milestones.length})`
                      : `weekly plan (${roadmap.weekly_plan.length}w)`}
                  </button>
                ))}
              </div>

              {/* ── Milestones ── */}
              {tab === 'milestones' && (
                <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
                  {roadmap.milestones.map((m, i) => (
                    <MilestoneRow key={i} m={m} index={i} total={roadmap.total_weeks} />
                  ))}
                </div>
              )}

              {/* ── Weekly plan ── */}
              {tab === 'weekly' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {roadmap.weekly_plan.map((w) => <WeekRow key={w.week} w={w} />)}
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setRole(roadmap.target_role); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
                >
                  <HiOutlineArrowPath className="w-3.5 h-3.5" /> regenerate
                </button>
                <button
                  onClick={() => deleteRoadmap(roadmap)}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" /> delete roadmap
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
