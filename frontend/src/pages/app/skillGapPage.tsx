import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineChevronDown, HiOutlineTrash,
} from 'react-icons/hi2'
import { aiService, type SkillGapReport } from '../../services/ai'

function priorityMeta(p: number) {
  if (p === 1) return { label: 'Critical', bar: 'bg-danger-fg dark:bg-danger-dark-fg',   text: 'text-danger-fg dark:text-danger-dark-fg',   border: 'border-danger-fg/40 dark:border-danger-dark-fg/40' }
  if (p === 2) return { label: 'High',     bar: 'bg-yellow-500',                          text: 'text-yellow-600 dark:text-yellow-400',       border: 'border-yellow-500/40' }
  return              { label: 'Medium',   bar: 'bg-brand dark:bg-brand-dark-DEFAULT',    text: 'text-fg-muted dark:text-fg-dark-muted',      border: 'border-border-default dark:border-border-dark-default' }
}

function readinessScore(report: SkillGapReport) {
  const total = report.present_skills.length + report.missing_skills.length
  if (total === 0) return 0
  return Math.round((report.present_skills.length / total) * 100)
}

function ReadinessRing({ score }: { score: number }) {
  const r = 28, circ = 2 * Math.PI * r, fill = circ - (score / 100) * circ
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={72} height={72} className="shrink-0 -rotate-90">
      <circle cx={36} cy={36} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-border-default dark:text-border-dark-default" />
      <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x={36} y={40} textAnchor="middle" fill="currentColor"
        style={{ fontSize: 13, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
        {score}%
      </text>
    </svg>
  )
}

function SkillRow({ ms, expanded, onToggle }: {
  ms: SkillGapReport['missing_skills'][number]
  expanded: boolean
  onToggle: () => void
}) {
  const meta = priorityMeta(ms.priority)
  return (
    <div className="border-b border-border-default dark:border-border-dark-default last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={clsx('text-[10px] font-medium border px-1.5 py-0.5 rounded-md shrink-0', meta.text, meta.border)}>
            {meta.label}
          </span>
          <span className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default truncate">{ms.skill}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-fg-muted dark:text-fg-dark-muted">
            <HiOutlineClock className="w-3 h-3" />{ms.estimated_weeks}w
          </span>
          <HiOutlineChevronDown className={clsx('w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-4 pb-3 pt-2 border-t border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset space-y-2">
              <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{ms.reason}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted w-12 shrink-0">Effort</span>
                <div className="flex-1 h-1.5 rounded-full bg-canvas-default dark:bg-canvas-dark-default overflow-hidden">
                  <div className={clsx('h-full rounded-full transition-all', meta.bar)}
                    style={{ width: `${Math.min(100, (ms.estimated_weeks / 12) * 100)}%` }} />
                </div>
                <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted w-8 text-right">{ms.estimated_weeks}w</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SkillGapPage() {
  const [role, setRole]         = useState('')
  const [report, setReport]     = useState<SkillGapReport | null>(null)
  const [history, setHistory]   = useState<SkillGapReport[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    aiService.getSkillGapReports().then((r) => {
      setHistory(r)
      if (r.length > 0 && !report) setReport(r[0])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) return
    setLoading(true); setError('')
    try {
      const r = await aiService.analyzeSkillGap(role.trim())
      setReport(r)
      setHistory((prev) => [r, ...prev.filter((h) => h.target_role !== r.target_role)])
      setRole(''); setExpanded(null)
    } catch { setError('Analysis failed — please try again') }
    finally { setLoading(false) }
  }

  const active  = report
  const score   = active ? readinessScore(active) : 0
  const sorted  = active ? [...active.missing_skills].sort((a, b) => a.priority - b.priority) : []
  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, ms) => {
    const key = priorityMeta(ms.priority).label
    if (!acc[key]) acc[key] = []
    acc[key]!.push(ms)
    return acc
  }, {})

  const sectionCls = 'border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default'
  const headCls = 'px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

  return (
    <div className="flex gap-5">

      {/* History sidebar */}
      {history.length > 0 && (
        <div className="hidden lg:flex flex-col w-[180px] shrink-0">
          <div className={clsx('sticky top-20', sectionCls)}>
            <div className={headCls}>
              <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Past reports</span>
            </div>
            {history.map((h) => {
              const s = readinessScore(h)
              const isActive = active?.id === h.id
              return (
                <button key={h.id} onClick={() => { setReport(h); setExpanded(null) }}
                  className={clsx(
                    'w-full text-left px-3 py-2.5 border-b border-border-default dark:border-border-dark-default last:border-0 border-l-2 transition-colors cursor-pointer',
                    isActive ? 'border-l-brand dark:border-l-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted' : 'border-l-transparent hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                  )}>
                  <p className="text-[12px] font-medium text-fg-default dark:text-fg-dark-default truncate">{h.target_role}</p>
                  <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{s}% ready</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">

        <div className={sectionCls}>
          <div className={headCls}>
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Skill Gap Analysis</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">Analyze your skill gap</p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">Enter a target role to see what skills you're missing and how to close the gap</p>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={analyze} className="flex gap-2">
          <div className="flex-1 flex items-center border border-border-default dark:border-border-dark-default rounded-lg focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
            <span className="font-mono text-[11px] text-brand dark:text-brand-dark-DEFAULT px-3 shrink-0 select-none">{'>'}</span>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. frontend developer, data scientist, ux designer…"
              className="flex-1 py-2.5 pr-3 text-[12px] bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
            />
          </div>
          <button type="submit" disabled={loading || !role.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : <HiOutlineSparkles className="w-3.5 h-3.5" />}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>

        {error && (
          <div className="px-3 py-2 rounded-lg border border-danger-fg/40 dark:border-danger-dark-fg/40 bg-canvas-inset dark:bg-canvas-dark-inset text-[12px] text-danger-fg dark:text-danger-dark-fg">
            {error}
          </div>
        )}

        {!active && !loading && (
          <div className={clsx(sectionCls, 'p-12 text-center')}>
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted">Enter a target role above to get your personalized skill gap report</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {active && (
            <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">

              {/* Summary */}
              <div className={sectionCls}>
                <div className={clsx(headCls, 'flex items-center justify-between')}>
                  <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Summary</span>
                </div>
                <div className="p-4 flex items-start gap-5">
                  <ReadinessRing score={score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-0.5">Target role</p>
                    <p className="text-[15px] font-bold text-fg-default dark:text-fg-dark-default">{active.target_role}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-[11px] font-medium text-success-fg dark:text-success-dark-fg">✓ {active.present_skills.length} matched</span>
                      <span className="text-[11px] font-medium text-danger-fg dark:text-danger-dark-fg">✗ {active.missing_skills.length} missing</span>
                      {active.estimated_weeks && (
                        <span className="flex items-center gap-1 text-[11px] text-fg-muted dark:text-fg-dark-muted">
                          <HiOutlineClock className="w-3 h-3" />{active.estimated_weeks}w to close
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">Readiness</span>
                    <span className="text-[11px] font-semibold text-fg-default dark:text-fg-dark-default">{score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-canvas-inset dark:bg-canvas-dark-inset overflow-hidden">
                    <motion.div
                      className={clsx('h-full rounded-full', score >= 70 ? 'bg-success-fg dark:bg-success-dark-fg' : score >= 40 ? 'bg-yellow-500' : 'bg-danger-fg dark:bg-danger-dark-fg')}
                      initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                {active.summary && (
                  <div className="px-4 pb-4 border-t border-border-default dark:border-border-dark-default pt-3">
                    <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{active.summary}</p>
                  </div>
                )}
              </div>

              {/* Skills you have */}
              {active.present_skills.length > 0 && (
                <div className={sectionCls}>
                  <div className={headCls}>
                    <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Skills you have ({active.present_skills.length})</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-1.5">
                    {active.present_skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-success-fg/40 dark:border-success-dark-fg/40 text-success-fg dark:text-success-dark-fg bg-canvas-inset dark:bg-canvas-dark-inset">
                        <HiOutlineCheckCircle className="w-3 h-3 shrink-0" />{s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills to acquire */}
              {active.missing_skills.length > 0 && (
                <div className={sectionCls}>
                  <div className={clsx(headCls, 'flex items-center justify-between')}>
                    <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Skills to acquire ({active.missing_skills.length})</span>
                    <span className="text-[10px] text-fg-muted dark:text-fg-dark-muted">Click to expand</span>
                  </div>
                  {(['Critical', 'High', 'Medium'] as const).map((group) => {
                    const items = grouped[group]
                    if (!items?.length) return null
                    const meta = priorityMeta(group === 'Critical' ? 1 : group === 'High' ? 2 : 3)
                    return (
                      <div key={group}>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-canvas-inset dark:bg-canvas-dark-inset border-b border-border-default dark:border-border-dark-default">
                          <div className={clsx('w-2 h-2 rounded-full shrink-0', meta.bar)} />
                          <span className={clsx('text-[11px] font-semibold', meta.text)}>{group}</span>
                          <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted ml-auto">{items.length} skill{items.length !== 1 ? 's' : ''}</span>
                        </div>
                        {items.map((ms) => (
                          <SkillRow key={ms.skill} ms={ms} expanded={expanded === ms.skill}
                            onToggle={() => setExpanded((v) => v === ms.skill ? null : ms.skill)} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Timeline */}
              {active.estimated_weeks && active.missing_skills.length > 0 && (
                <div className={sectionCls}>
                  <div className={headCls}>
                    <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Learning timeline</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {sorted.map((ms, i) => {
                      const meta = priorityMeta(ms.priority)
                      const offset = sorted.slice(0, i).reduce((s, m) => s + m.estimated_weeks, 0)
                      const total  = active.estimated_weeks!
                      return (
                        <div key={ms.skill} className="flex items-center gap-3">
                          <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted w-28 shrink-0 truncate">{ms.skill}</span>
                          <div className="flex-1 h-4 rounded bg-canvas-inset dark:bg-canvas-dark-inset relative overflow-hidden">
                            <div className={clsx('absolute top-0 h-full rounded opacity-80', meta.bar)}
                              style={{ left: `${(offset / total) * 100}%`, width: `${(ms.estimated_weeks / total) * 100}%` }} />
                          </div>
                          <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted w-6 text-right shrink-0">{ms.estimated_weeks}w</span>
                        </div>
                      )
                    })}
                    <div className="flex items-center justify-between pt-2 border-t border-border-default dark:border-border-dark-default">
                      <span className="text-[11px] text-fg-muted dark:text-fg-dark-muted">Total estimated time</span>
                      <span className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default">{active.estimated_weeks} weeks</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button onClick={() => { setRole(active.target_role); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="flex items-center gap-1.5 text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                  <HiOutlineArrowPath className="w-3.5 h-3.5" /> Re-analyze
                </button>
                <button onClick={async () => {
                  try { await aiService.deleteSkillGapReport(active.id) } catch { /* ignore */ }
                  const next = history.find((h) => h.id !== active.id) ?? null
                  setHistory((prev) => prev.filter((h) => h.id !== active.id))
                  setReport(next)
                }}
                  className="flex items-center gap-1.5 text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer">
                  <HiOutlineTrash className="w-3.5 h-3.5" /> Remove report
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
