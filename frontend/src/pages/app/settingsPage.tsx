import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineShieldCheck, HiOutlineBell, HiOutlinePaintBrush, HiOutlineGlobeAlt,
  HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import { useAuth } from '../../contexts/AuthContext'

const sections = [
  { key: 'privacy',       label: 'privacy',       icon: HiOutlineShieldCheck },
  { key: 'notifications', label: 'notifications', icon: HiOutlineBell },
  { key: 'appearance',    label: 'appearance',    icon: HiOutlinePaintBrush },
  { key: 'language',      label: 'language',      icon: HiOutlineGlobeAlt },
  { key: 'security',      label: 'security',      icon: HiOutlineLockClosed },
] as const

const dot  = 'w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT shrink-0'
const iCls = 'w-full px-3 py-2 font-mono text-[11px] bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors'
const lCls = 'font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1 block'

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5">
      <span className={dot} />
      <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">{label}</span>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={clsx(
        'relative w-8 h-4 transition-colors cursor-pointer shrink-0',
        enabled ? 'bg-brand dark:bg-brand-dark-DEFAULT' : 'bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default',
      )}
    >
      <span className={clsx(
        'absolute top-0.5 w-3 h-3 bg-white transition-transform',
        enabled ? 'translate-x-[18px]' : 'translate-x-0.5',
      )} />
    </button>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border-default dark:border-border-dark-default last:border-0">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium text-fg-default dark:text-fg-dark-default">{label}</p>
        {description && <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-b border-border-default dark:border-border-dark-default last:border-0">
      <label className={lCls}>{label}</label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [active, setActive] = useState<typeof sections[number]['key']>('privacy')
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showDanger, setShowDanger] = useState(false)

  const [notifs, setNotifs]   = useState({ email: true, push: true, messages: true, reviews: true, listings: false, marketing: false })
  const [privacy, setPrivacy] = useState({ profilePublic: true, showEmail: false, showUniversity: true, activityVisible: true })
  const [dark, setDark]       = useState(() => document.documentElement.classList.contains('dark'))

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
  }

  const handleSignOut = () => { logout(); navigate('/login') }
  const activeSection = sections.find((s) => s.key === active)!

  return (
    <div className="flex gap-6">

      {/* ── Left nav ── */}
      <div className="hidden md:flex flex-col w-[200px] shrink-0">
        <div className="sticky top-20 border border-border-default dark:border-border-dark-default">
          <div className="px-3 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5">
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">settings</span>
          </div>

          {sections.map((s) => {
            const Icon = s.icon
            const isActive = active === s.key
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2.5 font-mono text-[10px] tracking-wide border-b border-border-default dark:border-border-dark-default last:border-0 border-l-2 transition-colors cursor-pointer text-left',
                  isActive
                    ? 'border-l-brand dark:border-l-brand-dark-DEFAULT text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted'
                    : 'border-l-transparent text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {s.label}
              </button>
            )
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 font-mono text-[10px] tracking-wide border-l-2 border-l-transparent text-danger-fg dark:text-danger-dark-fg hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset hover:border-l-danger-fg dark:hover:border-l-danger-dark-fg transition-colors cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5 shrink-0" />
            sign out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-4">

        {/* Page header */}
        <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
          <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5">
            <span className={dot} />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">
              settings / {activeSection.label}
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default">{activeSection.label}</p>
            <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              {active === 'privacy'       && 'control who can see your information'}
              {active === 'notifications' && 'choose what you want to be notified about'}
              {active === 'appearance'    && 'customize how skillmate looks for you'}
              {active === 'language'      && 'set your preferred language and timezone'}
              {active === 'security'      && 'manage your password and account security'}
            </p>
          </div>
        </div>

        {/* ── Privacy ── */}
        {active === 'privacy' && (
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="visibility" />
            <Row label="public profile" description="anyone can discover and view your profile">
              <Toggle enabled={privacy.profilePublic} onChange={() => setPrivacy((p) => ({ ...p, profilePublic: !p.profilePublic }))} />
            </Row>
            <Row label="show email" description="display your email on your profile">
              <Toggle enabled={privacy.showEmail} onChange={() => setPrivacy((p) => ({ ...p, showEmail: !p.showEmail }))} />
            </Row>
            <Row label="show university" description="display your university on your profile">
              <Toggle enabled={privacy.showUniversity} onChange={() => setPrivacy((p) => ({ ...p, showUniversity: !p.showUniversity }))} />
            </Row>
            <Row label="activity visible" description="others can see when you were last active">
              <Toggle enabled={privacy.activityVisible} onChange={() => setPrivacy((p) => ({ ...p, activityVisible: !p.activityVisible }))} />
            </Row>
          </div>
        )}

        {/* ── Notifications ── */}
        {active === 'notifications' && (
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="channels" />
            <Row label="email notifications" description="receive updates via email">
              <Toggle enabled={notifs.email} onChange={() => setNotifs((n) => ({ ...n, email: !n.email }))} />
            </Row>
            <Row label="push notifications" description="browser push notifications">
              <Toggle enabled={notifs.push} onChange={() => setNotifs((n) => ({ ...n, push: !n.push }))} />
            </Row>
            <SectionHeader label="events" />
            <Row label="messages" description="new messages from other students">
              <Toggle enabled={notifs.messages} onChange={() => setNotifs((n) => ({ ...n, messages: !n.messages }))} />
            </Row>
            <Row label="reviews" description="when someone leaves you a review">
              <Toggle enabled={notifs.reviews} onChange={() => setNotifs((n) => ({ ...n, reviews: !n.reviews }))} />
            </Row>
            <Row label="listing activity" description="views and inquiries on your listings">
              <Toggle enabled={notifs.listings} onChange={() => setNotifs((n) => ({ ...n, listings: !n.listings }))} />
            </Row>
            <Row label="marketing" description="platform updates and tips">
              <Toggle enabled={notifs.marketing} onChange={() => setNotifs((n) => ({ ...n, marketing: !n.marketing }))} />
            </Row>
          </div>
        )}

        {/* ── Appearance ── */}
        {active === 'appearance' && (
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="theme" />
            <Row label="dark mode" description="switch between light and dark theme">
              <Toggle enabled={dark} onChange={toggleTheme} />
            </Row>
            <SectionHeader label="preview" />
            <div className="px-4 py-4 flex gap-3">
              {[
                { id: 'light', label: 'light', bg: 'bg-white border-[#d0d7de]',   text: 'text-[#1f2328]' },
                { id: 'dark',  label: 'dark',  bg: 'bg-[#0d1117] border-[#30363d]', text: 'text-[#e6edf3]' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { if ((t.id === 'dark') !== dark) toggleTheme() }}
                  className={clsx(
                    'flex-1 border p-3 transition-colors cursor-pointer',
                    t.bg,
                    (t.id === 'dark') === dark
                      ? 'border-brand dark:border-brand-dark-DEFAULT'
                      : 'hover:border-fg-muted dark:hover:border-fg-dark-muted',
                  )}
                >
                  <div className={clsx('font-mono text-[9px] tracking-widest uppercase mb-2', t.text)}>{t.label}</div>
                  <div className="space-y-1">
                    <div className={clsx('h-1.5 w-3/4', t.id === 'dark' ? 'bg-white/20' : 'bg-black/10')} />
                    <div className={clsx('h-1.5 w-1/2', t.id === 'dark' ? 'bg-white/10' : 'bg-black/5')} />
                  </div>
                  {(t.id === 'dark') === dark && (
                    <div className="mt-2 font-mono text-[8px] text-brand dark:text-brand-dark-DEFAULT">› active</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Language ── */}
        {active === 'language' && (
          <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="locale" />
            <Field label="language">
              <select defaultValue="en" className={clsx(iCls, 'appearance-none cursor-pointer')}>
                <option value="en">english</option>
                <option value="pt">português</option>
                <option value="fr">français</option>
                <option value="es">español</option>
                <option value="de">deutsch</option>
              </select>
            </Field>
            <Field label="timezone">
              <select defaultValue="sast" className={clsx(iCls, 'appearance-none cursor-pointer')}>
                <option value="sast">south africa standard time (SAST) — UTC+2</option>
                <option value="gmt">GMT — UTC+0</option>
                <option value="eat">east africa time (EAT) — UTC+3</option>
              </select>
            </Field>
          </div>
        )}

        {/* ── Security ── */}
        {active === 'security' && (
          <>
            <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
              <SectionHeader label="change password" />
              <Field label="current password">
                <input type="password" placeholder="••••••••" className={iCls} />
              </Field>
              <Field label="new password">
                <input type="password" placeholder="••••••••" className={iCls} />
              </Field>
              <Field label="confirm new password">
                <input type="password" placeholder="••••••••" className={iCls} />
              </Field>
              <div className="px-4 py-3">
                <button className="px-4 py-2 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[10px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer">
                  update password
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">
              <button
                onClick={() => setShowDanger((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer"
              >
                <HiOutlineExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{showDanger ? 'hide' : 'show'} danger zone</span>
                <span className={clsx('ml-auto font-mono text-[9px] transition-transform inline-block', showDanger && 'rotate-90')}>›</span>
              </button>

              {showDanger && (
                <div className="border-t border-danger-fg/20 dark:border-danger-dark-fg/20 bg-canvas-inset dark:bg-canvas-dark-inset">
                  <div className="px-4 py-3 border-b border-danger-fg/20 dark:border-danger-dark-fg/20">
                    <p className="font-mono text-[10px] font-medium text-danger-fg dark:text-danger-dark-fg">delete account</p>
                    <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
                      permanent — all listings, reviews, and messages will be removed
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <button className="px-4 py-2 font-mono text-[10px] border border-danger-fg/40 dark:border-danger-dark-fg/40 text-danger-fg dark:text-danger-dark-fg hover:bg-danger-fg dark:hover:bg-danger-dark-fg hover:text-white transition-colors cursor-pointer">
                      delete my account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
