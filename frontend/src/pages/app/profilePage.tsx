import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlinePencilSquare, HiOutlineSquare2Stack, HiOutlineDocumentArrowDown,
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineMapPin,
  HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineCalendar,
  HiOutlineLink, HiOutlineArrowUpRight, HiOutlineCamera,
  HiOutlineBriefcase, HiOutlineStar, HiOutlineEye, HiOutlineTrophy,
  HiOutlineXMark, HiOutlineCheck, HiOutlineTrash,
} from 'react-icons/hi2'
import { HiStar, HiOutlineStar as HiOutlineStarLine } from 'react-icons/hi2'
import { useAuth } from '../../contexts/AuthContext'
import { usersService, type ProfileStats } from '../../services/users'
import { listingsService, type Listing } from '../../services/listings'
import { reviewsService, type Review } from '../../services/reviews'
import { certificatesService, type Certificate } from '../../services/certificates'
import { portfolioService, type PortfolioEntry } from '../../services/portfolio'
import { skillsService, type Skill } from '../../services/skills'
import Avatar from '../../components/atoms/avatar'
import type { AuthUser } from '../../services/auth'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}
function formatPrice(l: Listing) {
  if (l.price) return `R${l.price}/hr`
  if (l.price_min && l.price_max) return `R${l.price_min}–${l.price_max}`
  return 'Negotiable'
}

/* ── shared input style ── */
const iCls = 'w-full px-3 py-2 border border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors'
const lCls = 'font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1 block'
const dot = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT shrink-0'
const sectionHeader = 'flex items-center justify-between px-5 py-3 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset'

/* ── Section wrapper ── */
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
      <div className={sectionHeader}>
        <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">
          <span className={dot} />{title}
        </span>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ── Stat pill ── */
function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-border-default dark:border-border-dark-default">
      <Icon className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0" />
      <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">{label}</span>
      <span className="font-mono text-[11px] font-bold text-fg-default dark:text-fg-dark-default ml-auto">{value}</span>
    </div>
  )
}

/* ══════════════════════════════════════════
   INLINE EDIT DRAWER
   slides in from the right over the hero
══════════════════════════════════════════ */
interface DrawerProps {
  open: boolean
  onClose: () => void
  form: Record<string, string>
  onChange: (k: string, v: string) => void
  onSave: () => void
  saving: boolean
  saveMsg: string
}

function EditDrawer({ open, onClose, form, onChange, onSave, saving, saveMsg }: DrawerProps) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-canvas-default dark:bg-canvas-dark-default border-l border-border-default dark:border-border-dark-default z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">
            <span className={dot} />edit profile
          </span>
          <button onClick={onClose} className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
            <HiOutlineXMark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>first name</label>
              <input className={iCls} value={form.first_name} onChange={(e) => onChange('first_name', e.target.value)} placeholder="John" />
            </div>
            <div>
              <label className={lCls}>last name</label>
              <input className={iCls} value={form.last_name} onChange={(e) => onChange('last_name', e.target.value)} placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className={lCls}>headline</label>
            <input className={iCls} value={form.headline} onChange={(e) => onChange('headline', e.target.value)} placeholder="e.g. Full-Stack Developer & Designer" />
          </div>

          <div>
            <label className={lCls}>university</label>
            <input className={iCls} value={form.university} onChange={(e) => onChange('university', e.target.value)} placeholder="e.g. University of Cape Town" />
          </div>

          <div>
            <label className={lCls}>location</label>
            <input className={iCls} value={form.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Cape Town, South Africa" />
          </div>

          <div>
            <label className={lCls}>portfolio / website</label>
            <input className={iCls} value={form.portfolio_url} onChange={(e) => onChange('portfolio_url', e.target.value)} placeholder="https://yoursite.com" />
          </div>

          <div>
            <label className={lCls}>github username</label>
            <div className="flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors">
              <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted px-2 border-r border-border-default dark:border-border-dark-default py-2 bg-canvas-inset dark:bg-canvas-dark-inset shrink-0">
                github.com/
              </span>
              <input
                className="flex-1 px-3 py-2 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
                value={form.github_username}
                onChange={(e) => onChange('github_username', e.target.value)}
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className={lCls}>role</label>
            <select className={iCls} value={form.role} onChange={(e) => onChange('role', e.target.value)}>
              <option value="">select role...</option>
              {['developer','designer','tutor','writer','marketer','video_editor','photographer','data_scientist','other'].map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between gap-3">
          {saveMsg && (
            <span className={`font-mono text-[10px] ${saveMsg.includes('saved') ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'}`}>
              {saveMsg.includes('saved') ? '✓' : '!'} {saveMsg}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={onClose}
              className="px-3 py-1.5 border border-border-default dark:border-border-dark-default font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
              cancel
            </button>
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[10px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
              <HiOutlineCheck className="w-3.5 h-3.5" />
              {saving ? 'saving...' : 'save'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
/* ── ABOUT SECTION ── */
function AboutSection({ user, onUpdate }: { user: AuthUser | null; onUpdate: (u: AuthUser) => void }) {
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setBio(user?.bio ?? '') }, [user?.bio])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await usersService.updateMe({ bio })
      onUpdate(updated)
      setEditing(false)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  return (
    <Section
      title="about"
      action={
        !editing ? (
          <button onClick={() => setEditing(true)}
            className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
            edit
          </button>
        ) : null
      }
    >
      {editing ? (
        <div className="space-y-3">
          <textarea
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
            placeholder="share your background, experience, and what drives you..."
            className={`${iCls} resize-none`}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className={`font-mono text-[9px] ${bio.length > 900 ? 'text-danger-fg dark:text-danger-dark-fg' : 'text-fg-muted dark:text-fg-dark-muted'}`}>
              {bio.length}/1000
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => { setBio(user?.bio ?? ''); setEditing(false) }}
                className="px-3 py-1.5 border border-border-default dark:border-border-dark-default font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[10px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
                <HiOutlineCheck className="w-3.5 h-3.5" />
                {saving ? 'saving...' : 'save'}
              </button>
            </div>
          </div>
        </div>
      ) : user?.bio ? (
        <p className="font-mono text-[12px] text-fg-default dark:text-fg-dark-default leading-relaxed whitespace-pre-wrap">{user.bio}</p>
      ) : (
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted">~ no bio yet</p>
          <button onClick={() => setEditing(true)}
            className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer">+ add bio</button>
        </div>
      )}
    </Section>
  )
}

/* ── SKILLS SECTION ── */
function SkillsSection({
  user, onUpdate, allSkills, setAllSkills,
}: {
  user: AuthUser | null
  onUpdate: (u: AuthUser) => void
  allSkills: Skill[]
  setAllSkills: React.Dispatch<React.SetStateAction<Skill[]>>
}) {
  const [managing, setManaging] = useState(false)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [customName, setCustomName] = useState('')
  const [customCat, setCustomCat] = useState('Custom')
  const [creating, setCreating] = useState(false)

  const userSkillIds = new Set(user?.skills?.map((s) => s.id) ?? [])
  const filtered = search.trim()
    ? allSkills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : allSkills

  const handleToggle = async (skill: Skill) => {
    setToggling(skill.id)
    try {
      const updated = userSkillIds.has(skill.id)
        ? await usersService.detachSkill(skill.id)
        : await usersService.attachSkill(skill.id)
      onUpdate(updated)
    } catch { /* ignore */ } finally { setToggling(null) }
  }

  const handleCreate = async () => {
    if (!customName.trim()) return
    setCreating(true)
    try {
      const newSkill = await skillsService.create(customName.trim(), customCat)
      setAllSkills((prev) => prev.some((s) => s.id === newSkill.id) ? prev : [...prev, newSkill])
      const updated = await usersService.attachSkill(newSkill.id)
      onUpdate(updated)
      setCustomName('')
    } catch { /* ignore */ } finally { setCreating(false) }
  }

  type SkillItem = NonNullable<AuthUser['skills']>[number]
  const grouped = (user?.skills ?? []).reduce<Record<string, SkillItem[]>>((acc, s) => {
    const cat = s.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(s)
    return acc
  }, {})

  return (
    <Section
      title="skills"
      action={
        <button onClick={() => setManaging((v) => !v)}
          className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
          {managing ? 'done' : 'manage'}
        </button>
      }
    >
      {/* display view */}
      {!managing && (
        (user?.skills?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted">~ no skills added yet</p>
            <button onClick={() => setManaging(true)}
              className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer">+ add skills</button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, skills]) => (
              <div key={cat}>
                <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-2">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s.id}
                      className="font-mono text-[10px] px-2.5 py-1 border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted pt-1">
              {user?.skills?.length} skill{(user?.skills?.length ?? 0) !== 1 ? 's' : ''} total
            </p>
          </div>
        )
      )}

      {/* manage panel */}
      {managing && (
        <div className="space-y-4">
          {(user?.skills?.length ?? 0) > 0 && (
            <div>
              <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-2">your skills</p>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((s) => (
                  <button key={s.id} onClick={() => handleToggle(s)} disabled={toggling === s.id}
                    className="flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 border border-brand dark:border-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors cursor-pointer disabled:opacity-50">
                    {s.name} <HiOutlineXMark className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-2">browse & add</p>
            <input className={`${iCls} mb-2`} placeholder="search skills..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {filtered.filter((s) => !userSkillIds.has(s.id)).map((s) => (
                <button key={s.id} onClick={() => handleToggle(s)} disabled={toggling === s.id}
                  className="font-mono text-[10px] px-2.5 py-1 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer disabled:opacity-50">
                  + {s.name}
                </button>
              ))}
              {filtered.filter((s) => !userSkillIds.has(s.id)).length === 0 && (
                <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">~ no results</p>
              )}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-2">create custom skill</p>
            <div className="flex gap-2">
              <input className={`${iCls} flex-1`} placeholder="e.g. Rust, Blender..." value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate() } }} />
              <select className={`${iCls} w-28 shrink-0`} value={customCat} onChange={(e) => setCustomCat(e.target.value)}>
                {['Custom','Technology','Design','Writing','Media','Education','Business','Music'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button onClick={handleCreate} disabled={creating || !customName.trim()}
                className="px-3 py-1.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[10px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 shrink-0">
                {creating ? '...' : 'add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

/* ── PORTFOLIO SECTION ── */
function PortfolioSection({ portfolio }: { portfolio: PortfolioEntry[] }) {
  return (
    <Section
      title="portfolio"
      action={
        <Link to="/app/portfolio"
          className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
          manage
        </Link>
      }
    >
      {portfolio.length === 0 ? (
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted">~ no projects yet</p>
          <Link to="/app/portfolio" className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline">+ add project</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {portfolio.map((p) => (
            <div key={p.id} className="border border-border-default dark:border-border-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT transition-colors group">
              {p.imageUrl ? (
                <div className="h-32 overflow-hidden border-b border-border-default dark:border-border-dark-default">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-32 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-center">
                  <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted opacity-40">no image</span>
                </div>
              )}
              <div className="p-3">
                <p className="font-mono text-[12px] font-bold text-fg-default dark:text-fg-dark-default truncate">{p.title}</p>
                {p.summary && (
                  <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-1 line-clamp-2 leading-relaxed">{p.summary}</p>
                )}
                {p.technologies && p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.technologies.slice(0, 3).map((t) => (
                      <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted">{t}</span>
                    ))}
                    {p.technologies.length > 3 && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 text-fg-muted dark:text-fg-dark-muted">+{p.technologies.length - 3}</span>
                    )}
                  </div>
                )}
                {p.projectUrl && (
                  <a href={p.projectUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT hover:underline">
                    view project <HiOutlineArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ── LISTINGS SECTION ── */
function ListingsSection({ listings }: { listings: Listing[] }) {
  return (
    <Section
      title="listings"
      action={
        <Link to="/app/listings"
          className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
          manage
        </Link>
      }
    >
      {listings.length === 0 ? (
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted">~ no listings yet</p>
          <Link to="/app/listings/new" className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline">+ create listing</Link>
        </div>
      ) : (
        <div className="divide-y divide-border-default dark:divide-border-dark-default">
          {listings.map((l) => (
            <Link key={l.id} to={`/app/listings/${l.id}`}
              className="flex items-center justify-between gap-4 py-3 group hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset -mx-5 px-5 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-fg-default dark:text-fg-dark-default group-hover:text-brand dark:group-hover:text-brand-dark-DEFAULT transition-colors truncate">
                    {l.title}
                  </span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 border shrink-0 ${
                    l.is_active
                      ? 'border-success-fg dark:border-success-dark-fg text-success-fg dark:text-success-dark-fg'
                      : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted'
                  }`}>
                    {l.is_active ? 'active' : 'paused'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">{l.category}</span>
                  <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">·</span>
                  <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">{formatPrice(l)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                  {l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                <HiOutlineArrowUpRight className="w-3 h-3 text-fg-muted dark:text-fg-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ── CERTIFICATES SECTION ── */
type CertForm = {
  title: string; issuer: string; issue_date: string
  expiry_date: string; credential_id: string; credential_url: string; description: string
}
const emptyCertForm = (): CertForm => ({
  title: '', issuer: '', issue_date: '', expiry_date: '',
  credential_id: '', credential_url: '', description: '',
})

function CertificatesSection({
  certificates, setCertificates,
}: {
  certificates: Certificate[]
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CertForm>(emptyCertForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const set = (k: keyof CertForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const openAdd = () => { setForm(emptyCertForm()); setEditingId(null); setShowForm(true) }
  const openEdit = (c: Certificate) => {
    setForm({
      title: c.title, issuer: c.issuer, issue_date: c.issue_date,
      expiry_date: c.expiry_date ?? '', credential_id: c.credential_id ?? '',
      credential_url: c.credential_url ?? '', description: c.description ?? '',
    })
    setEditingId(c.id); setShowForm(true)
  }
  const cancel = () => { setShowForm(false); setEditingId(null) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim() || !form.issue_date) return
    setSaving(true)
    try {
      const payload = {
        title: form.title, issuer: form.issuer, issue_date: form.issue_date,
        expiry_date: form.expiry_date || null,
        credential_id: form.credential_id || null,
        credential_url: form.credential_url || null,
        description: form.description || null,
      }
      if (editingId) {
        const updated = await certificatesService.update(editingId, payload)
        setCertificates((prev) => prev.map((c) => c.id === editingId ? updated : c))
      } else {
        const created = await certificatesService.create(payload)
        setCertificates((prev) => [created, ...prev])
      }
      cancel()
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await certificatesService.delete(id)
      setCertificates((prev) => prev.filter((c) => c.id !== id))
    } catch { /* ignore */ } finally { setDeleting(null) }
  }

  return (
    <Section
      title="licenses & certifications"
      action={
        !showForm ? (
          <button onClick={openAdd}
            className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
            + add
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        {certificates.length === 0 && !showForm && (
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted">~ no certificates yet</p>
            <button onClick={openAdd} className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer">+ add certificate</button>
          </div>
        )}
        {certificates.length > 0 && (
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-start gap-4 py-4 first:pt-0">
                <div className="w-10 h-10 shrink-0 border border-border-default dark:border-border-dark-default flex items-center justify-center bg-canvas-inset dark:bg-canvas-dark-inset">
                  <HiOutlineShieldCheck className="w-5 h-5 text-brand dark:text-brand-dark-DEFAULT" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[12px] font-bold text-fg-default dark:text-fg-dark-default">{cert.title}</p>
                  <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{cert.issuer}</p>
                  <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
                    issued {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {cert.expiry_date ? ` · expires ${new Date(cert.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' · no expiration'}
                  </p>
                  {cert.credential_id && <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">id: {cert.credential_id}</p>}
                  {cert.description && <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-1 line-clamp-2 leading-relaxed">{cert.description}</p>}
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT hover:underline">
                      show credential <HiOutlineArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(cert)}
                    className="p-1.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cert.id)} disabled={deleting === cert.id}
                    className="p-1.5 border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-danger-fg dark:hover:border-danger-dark-fg hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer disabled:opacity-50">
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="border border-border-default dark:border-border-dark-default p-4 space-y-3">
            <p className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">
              {editingId ? 'edit certificate' : 'new certificate'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={lCls}>title *</label>
                <input className={iCls} value={form.title} onChange={set('title')} placeholder="e.g. AWS Solutions Architect" />
              </div>
              <div className="sm:col-span-2">
                <label className={lCls}>issuing organization *</label>
                <input className={iCls} value={form.issuer} onChange={set('issuer')} placeholder="e.g. Amazon Web Services" />
              </div>
              <div>
                <label className={lCls}>issue date *</label>
                <input type="date" className={iCls} value={form.issue_date} onChange={set('issue_date')} />
              </div>
              <div>
                <label className={lCls}>expiry date</label>
                <input type="date" className={iCls} value={form.expiry_date} onChange={set('expiry_date')} />
              </div>
              <div>
                <label className={lCls}>credential id</label>
                <input className={iCls} value={form.credential_id} onChange={set('credential_id')} placeholder="e.g. ABC123" />
              </div>
              <div>
                <label className={lCls}>credential url</label>
                <input className={iCls} value={form.credential_url} onChange={set('credential_url')} placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className={lCls}>description</label>
                <textarea rows={2} className={`${iCls} resize-none`} value={form.description} onChange={set('description')} placeholder="brief description..." />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={cancel}
                className="px-3 py-1.5 border border-border-default dark:border-border-dark-default font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.issuer.trim() || !form.issue_date}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[10px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50">
                <HiOutlineCheck className="w-3.5 h-3.5" />
                {saving ? 'saving...' : editingId ? 'update' : 'add certificate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

/* ── REVIEWS SECTION ── */
function ReviewsSection({ reviews, avgRating }: { reviews: Review[]; avgRating: number }) {
  return (
    <Section title="reviews received">
      {reviews.length === 0 ? (
        <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted">~ no reviews yet — complete projects to receive reviews</p>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-4 pb-4 mb-2 border-b border-border-default dark:border-border-dark-default">
            <div className="text-center shrink-0">
              <p className="font-mono text-[32px] font-bold text-fg-default dark:text-fg-dark-default leading-none">{avgRating.toFixed(1)}</p>
              <div className="flex items-center gap-0.5 mt-1 justify-center">
                {[1,2,3,4,5].map((s) => s <= Math.round(avgRating)
                  ? <HiStar key={s} className="w-3 h-3 text-brand dark:text-brand-dark-DEFAULT" />
                  : <HiOutlineStarLine key={s} className="w-3 h-3 text-fg-muted dark:text-fg-dark-muted" />
                )}
              </div>
              <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {(['reliability', 'professionalism', 'growth'] as const).map((key) => {
                const avg = reviews.reduce((s, r) => s + r[`${key}_score`], 0) / reviews.length
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted w-24 shrink-0">{key}</span>
                    <div className="flex-1 h-1 bg-canvas-inset dark:bg-canvas-dark-inset">
                      <div className="h-full bg-brand dark:bg-brand-dark-DEFAULT transition-all" style={{ width: `${(avg / 5) * 100}%` }} />
                    </div>
                    <span className="font-mono text-[9px] text-fg-default dark:text-fg-dark-default w-6 text-right">{avg.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="divide-y divide-border-default dark:divide-border-dark-default">
            {reviews.map((r) => {
              const avg = (r.reliability_score + r.professionalism_score + r.growth_score) / 3
              const name = `${r.reviewer.first_name} ${r.reviewer.last_name}`
              return (
                <div key={r.id} className="flex gap-3 py-4 first:pt-0">
                  <Avatar name={name} src={r.reviewer.avatar_url ?? undefined} size="sm" className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[11px] font-bold text-fg-default dark:text-fg-dark-default">{name}</p>
                      <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted shrink-0">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 my-1">
                      {[1,2,3,4,5].map((s) => s <= Math.round(avg)
                        ? <HiStar key={s} className="w-3 h-3 text-brand dark:text-brand-dark-DEFAULT" />
                        : <HiOutlineStarLine key={s} className="w-3 h-3 text-fg-muted dark:text-fg-dark-muted" />
                      )}
                      <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted ml-1">{avg.toFixed(1)}</span>
                    </div>
                    {r.comment && <p className="font-mono text-[11px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Section>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [copied, setCopied] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)

  /* drawer state */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSaving, setDrawerSaving] = useState(false)
  const [drawerMsg, setDrawerMsg] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', headline: '', university: '',
    location: '', portfolio_url: '', github_username: '', role: '',
  })

  useEffect(() => {
    listingsService.getMine().then(setListings)
    usersService.getMe().then(updateUser)
    usersService.getMyStats().then(setStats).catch(() => {})
    certificatesService.getMine().then(setCertificates).catch(() => {})
    skillsService.getAll().then(setAllSkills).catch(() => {})
    if (user?.id) {
      reviewsService.getForUser(user.id).then((r) => setReviews(r.items)).catch(() => {})
      portfolioService.getByUser(user.id).then(setPortfolio).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* sync form when user loads */
  useEffect(() => {
    if (!user) return
    setForm({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      headline: user.headline ?? '',
      university: user.university ?? '',
      location: user.location ?? '',
      portfolio_url: user.portfolio_url ?? '',
      github_username: user.github_username ?? '',
      role: user.role ?? '',
    })
  }, [user])

  const openDrawer = () => { setDrawerMsg(''); setDrawerOpen(true) }

  const handleDrawerSave = async () => {
    setDrawerSaving(true); setDrawerMsg('')
    try {
      const updated = await usersService.updateMe(form)
      updateUser(updated)
      setDrawerMsg('changes saved')
      setTimeout(() => { setDrawerOpen(false); setDrawerMsg('') }, 800)
    } catch {
      setDrawerMsg('failed to save')
    } finally {
      setDrawerSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const url = await usersService.uploadAvatar(file)
      const fresh = await usersService.getMe()
      updateUser({ ...fresh, avatar_url: url })
    } catch { /* ignore */ } finally {
      setAvatarUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const url = await usersService.uploadCover(file)
      const fresh = await usersService.getMe()
      updateUser({ ...fresh, cover_url: url })
    } catch { /* ignore */ } finally {
      setCoverUploading(false)
      if (coverRef.current) coverRef.current.value = ''
    }
  }

  const publicProfileUrl = user ? `${window.location.origin}/app/profile/${user.id}` : ''
  const fullName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : ''
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (r.reliability_score + r.professionalism_score + r.growth_score) / 3, 0) / reviews.length
    : 0

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(publicProfileUrl) } catch {
      const el = document.createElement('input')
      el.value = publicProfileUrl
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadResume = () => {
    const skills = user?.skills?.map((s) => s.name).join(', ') || 'None listed'
    const lines = [
      fullName, user?.headline ?? '', '',
      'Contact', `Email: ${user?.email ?? ''}`,
      user?.portfolio_url ? `Portfolio: ${user.portfolio_url}` : '',
      user?.university ? `University: ${user.university}` : '', '',
      'About', user?.bio ?? 'No bio provided.', '',
      'Skills', skills, '',
      'Listings', ...listings.map((l) => `- ${l.title} (${l.category}) — ${formatPrice(l)}`),
    ].filter(Boolean).join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${user?.first_name ?? 'profile'}_resume.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">

      <EditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        form={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onSave={handleDrawerSave}
        saving={drawerSaving}
        saveMsg={drawerMsg}
      />

      {/* ── HERO CARD ── */}
      <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default overflow-hidden">

        {/* Cover banner */}
        <div className="relative h-36 border-b border-border-default dark:border-border-dark-default group overflow-hidden">
          {user?.cover_url ? (
            <img
              src={mediaUrl(user.cover_url)}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-canvas-inset dark:bg-canvas-dark-inset">
              <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 32px)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[11px] tracking-widest text-fg-muted dark:text-fg-dark-muted opacity-40 select-none">
                  {user?.university ?? 'skillmate.com'}
                </span>
              </div>
            </div>
          )}
          {/* hover overlay */}
          <button
            onClick={() => coverRef.current?.click()}
            disabled={coverUploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
          >
            <HiOutlineCamera className="w-5 h-5 text-white" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-white">
              {coverUploading ? 'uploading...' : 'change cover'}
            </span>
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {/* Avatar + actions row */}
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">

            {/* Avatar */}
            <div className="relative shrink-0 group">
              {user?.avatar_url ? (
                <img src={mediaUrl(user.avatar_url)} alt={fullName}
                  className="w-20 h-20 object-cover border-2 border-canvas-default dark:border-canvas-dark-default ring-2 ring-border-default dark:ring-border-dark-default" />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center text-2xl font-bold font-mono border-2 border-canvas-default dark:border-canvas-dark-default ring-2 ring-border-default dark:ring-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset text-brand dark:text-brand-dark-DEFAULT">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
              >
                <HiOutlineCamera className="w-5 h-5 text-white" />
                <span className="font-mono text-[8px] text-white mt-0.5">
                  {avatarUploading ? 'uploading...' : 'change'}
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              {user?.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-fg dark:bg-success-dark-fg flex items-center justify-center border-2 border-canvas-default dark:border-canvas-dark-default">
                  <HiOutlineShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button onClick={openDrawer}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-brand dark:border-brand-dark-DEFAULT font-mono text-[10px] tracking-wide text-brand dark:text-brand-dark-DEFAULT hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors cursor-pointer">
                <HiOutlinePencilSquare className="w-3.5 h-3.5" /> edit profile
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default dark:border-border-dark-default font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                <HiOutlineSquare2Stack className="w-3.5 h-3.5" />
                {copied ? <span className="text-success-fg dark:text-success-dark-fg">copied!</span> : 'copy link'}
              </button>
              <button onClick={handleDownloadResume}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default dark:border-border-dark-default font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                <HiOutlineDocumentArrowDown className="w-3.5 h-3.5" /> resume
              </button>
              <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default dark:border-border-dark-default font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors">
                <HiOutlineGlobeAlt className="w-3.5 h-3.5" /> public view
                <HiOutlineArrowUpRight className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>

          {/* Name + headline */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-[18px] font-bold text-fg-default dark:text-fg-dark-default">
                {fullName || 'Your Name'}
              </h1>
              {user?.is_verified && (
                <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border border-success-fg dark:border-success-dark-fg text-success-fg dark:text-success-dark-fg">
                  verified
                </span>
              )}
            </div>
            {user?.headline && (
              <p className="font-mono text-[12px] text-fg-muted dark:text-fg-dark-muted mt-1">{user.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {user?.university && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineAcademicCap className="w-3 h-3" /> {user.university}
                </span>
              )}
              {user?.location && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineMapPin className="w-3 h-3" /> {user.location}
                </span>
              )}
              {user?.email && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineEnvelope className="w-3 h-3" /> {user.email}
                </span>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                  <HiOutlineCalendar className="w-3 h-3" /> joined {joinedDate}
                </span>
              )}
              {user?.portfolio_url && (
                <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline">
                  <HiOutlineLink className="w-3 h-3" />
                  {user.portfolio_url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border-default dark:border-border-dark-default pt-4">
            <StatPill icon={HiOutlineEye} label="profile views" value={stats?.profile_views ?? 0} />
            <StatPill icon={HiOutlineBriefcase} label="listings" value={listings.length} />
            <StatPill icon={HiOutlineStar} label="avg rating" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} />
            <StatPill icon={HiOutlineTrophy} label="projects" value={portfolio.length} />
          </div>
        </div>
      </div>

      <AboutSection user={user} onUpdate={updateUser} />
      <SkillsSection user={user} onUpdate={updateUser} allSkills={allSkills} setAllSkills={setAllSkills} />
      <PortfolioSection portfolio={portfolio} />
      <ListingsSection listings={listings} />
      <CertificatesSection certificates={certificates} setCertificates={setCertificates} />
      <ReviewsSection reviews={reviews} avgRating={avgRating} />

    </div>
  )
}
