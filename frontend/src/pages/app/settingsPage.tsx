import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineShieldCheck, HiOutlineBell, HiOutlinePaintBrush, HiOutlineGlobeAlt,
  HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineExclamationTriangle,
  HiOutlineChevronRight,
} from 'react-icons/hi2'
import { useAuth } from '../../contexts/AuthContext'

const sections = [
  { key: 'privacy',       label: 'Privacy',       icon: HiOutlineShieldCheck },
  { key: 'notifications', label: 'Notifications', icon: HiOutlineBell },
  { key: 'appearance',    label: 'Appearance',    icon: HiOutlinePaintBrush },
  { key: 'language',      label: 'Language',      icon: HiOutlineGlobeAlt },
  { key: 'security',      label: 'Security',      icon: HiOutlineLockClosed },
] as const

const iCls = 'w-full px-3 py-2 text-[12px] bg-canvas-default dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default rounded-lg text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors'
const lCls = 'text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-1 block'

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
      <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">{label}</span>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={clsx(
        'relative inline-flex w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
        enabled
          ? 'bg-brand dark:bg-brand-dark-DEFAULT'
          : 'bg-fg-muted/25 dark:bg-fg-dark-muted/30',
      )}
    >
      <span className={clsx(
        'absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
        enabled ? 'translate-x-[18px]' : 'translate-x-0',
      )} />
    </button>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border-default dark:border-border-dark-default last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg-default dark:text-fg-dark-default">{label}</p>
        {description && <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-0.5">{description}</p>}
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
        <div className="sticky top-20 border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Settings</span>
          </div>

          {sections.map((s) => {
            const Icon = s.icon
            const isActive = active === s.key
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] border-b border-border-default dark:border-border-dark-default last:border-0 transition-colors cursor-pointer text-left',
                  isActive
                    ? 'text-brand dark:text-brand-dark-DEFAULT bg-brand-muted dark:bg-brand-dark-muted font-medium'
                    : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            )
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-danger-fg dark:text-danger-dark-fg hover:bg-canvas-inset dark:hover:bg-canvas-dark-inset transition-colors cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-4">

        {/* Page header */}
        <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
          <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
            <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">
              Settings / {activeSection.label}
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="text-[17px] font-semibold text-fg-default dark:text-fg-dark-default">{activeSection.label}</p>
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              {active === 'privacy'       && 'Control who can see your information'}
              {active === 'notifications' && 'Choose what you want to be notified about'}
              {active === 'appearance'    && 'Customize how Skillmate looks for you'}
              {active === 'language'      && 'Set your preferred language and timezone'}
              {active === 'security'      && 'Manage your password and account security'}
            </p>
          </div>
        </div>

        {/* ── Privacy ── */}
        {active === 'privacy' && (
          <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="Visibility" />
            <Row label="Public profile" description="Anyone can discover and view your profile">
              <Toggle enabled={privacy.profilePublic} onChange={() => setPrivacy((p) => ({ ...p, profilePublic: !p.profilePublic }))} />
            </Row>
            <Row label="Show email" description="Display your email on your profile">
              <Toggle enabled={privacy.showEmail} onChange={() => setPrivacy((p) => ({ ...p, showEmail: !p.showEmail }))} />
            </Row>
            <Row label="Show university" description="Display your university on your profile">
              <Toggle enabled={privacy.showUniversity} onChange={() => setPrivacy((p) => ({ ...p, showUniversity: !p.showUniversity }))} />
            </Row>
            <Row label="Activity visible" description="Others can see when you were last active">
              <Toggle enabled={privacy.activityVisible} onChange={() => setPrivacy((p) => ({ ...p, activityVisible: !p.activityVisible }))} />
            </Row>
          </div>
        )}

        {/* ── Notifications ── */}
        {active === 'notifications' && (
          <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="Channels" />
            <Row label="Email notifications" description="Receive updates via email">
              <Toggle enabled={notifs.email} onChange={() => setNotifs((n) => ({ ...n, email: !n.email }))} />
            </Row>
            <Row label="Push notifications" description="Browser push notifications">
              <Toggle enabled={notifs.push} onChange={() => setNotifs((n) => ({ ...n, push: !n.push }))} />
            </Row>
            <SectionHeader label="Events" />
            <Row label="Messages" description="New messages from other students">
              <Toggle enabled={notifs.messages} onChange={() => setNotifs((n) => ({ ...n, messages: !n.messages }))} />
            </Row>
            <Row label="Reviews" description="When someone leaves you a review">
              <Toggle enabled={notifs.reviews} onChange={() => setNotifs((n) => ({ ...n, reviews: !n.reviews }))} />
            </Row>
            <Row label="Listing activity" description="Views and inquiries on your listings">
              <Toggle enabled={notifs.listings} onChange={() => setNotifs((n) => ({ ...n, listings: !n.listings }))} />
            </Row>
            <Row label="Marketing" description="Platform updates and tips">
              <Toggle enabled={notifs.marketing} onChange={() => setNotifs((n) => ({ ...n, marketing: !n.marketing }))} />
            </Row>
          </div>
        )}

        {/* ── Appearance ── */}
        {active === 'appearance' && (
          <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="Theme" />
            <Row label="Dark mode" description="Switch between light and dark theme">
              <Toggle enabled={dark} onChange={toggleTheme} />
            </Row>
            <SectionHeader label="Preview" />
            <div className="px-4 py-4 flex gap-3">
              {[
                { id: 'light', label: 'Light', bg: 'bg-white', border: 'border-[#d0d7de]', text: 'text-[#1f2328]' },
                { id: 'dark',  label: 'Dark',  bg: 'bg-[#0d1117]', border: 'border-[#30363d]', text: 'text-[#e6edf3]' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { if ((t.id === 'dark') !== dark) toggleTheme() }}
                  className={clsx(
                    'flex-1 border rounded-lg p-3 transition-colors cursor-pointer',
                    t.bg, t.border,
                    (t.id === 'dark') === dark
                      ? 'ring-2 ring-brand dark:ring-brand-dark-DEFAULT'
                      : 'hover:border-fg-muted dark:hover:border-fg-dark-muted',
                  )}
                >
                  <div className={clsx('text-[11px] font-semibold mb-2', t.text)}>{t.label}</div>
                  <div className="space-y-1">
                    <div className={clsx('h-1.5 w-3/4 rounded', t.id === 'dark' ? 'bg-white/20' : 'bg-black/10')} />
                    <div className={clsx('h-1.5 w-1/2 rounded', t.id === 'dark' ? 'bg-white/10' : 'bg-black/5')} />
                  </div>
                  {(t.id === 'dark') === dark && (
                    <div className="mt-2 text-[11px] font-medium text-brand dark:text-brand-dark-DEFAULT">Active</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Language ── */}
        {active === 'language' && (
          <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
            <SectionHeader label="Locale" />
            <Field label="Language">
              <select defaultValue="en" className={clsx(iCls, 'appearance-none cursor-pointer')}>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select defaultValue="sast" className={clsx(iCls, 'appearance-none cursor-pointer')}>
                <option value="sast">South Africa Standard Time (SAST) — UTC+2</option>
                <option value="gmt">GMT — UTC+0</option>
                <option value="eat">East Africa Time (EAT) — UTC+3</option>
              </select>
            </Field>
          </div>
        )}

        {/* ── Security ── */}
        {active === 'security' && (
          <>
            <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
              <SectionHeader label="Change Password" />
              <Field label="Current password">
                <input type="password" placeholder="••••••••" className={iCls} />
              </Field>
              <Field label="New password">
                <input type="password" placeholder="••••••••" className={iCls} />
              </Field>
              <Field label="Confirm new password">
                <input type="password" placeholder="••••••••" className={iCls} />
              </Field>
              <div className="px-4 py-3">
                <button className="px-4 py-2 rounded-lg bg-brand dark:bg-brand-dark-DEFAULT text-[12px] font-medium text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer">
                  Update password
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden bg-canvas-default dark:bg-canvas-dark-default">
              <button
                onClick={() => setShowDanger((v) => !v)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors cursor-pointer"
              >
                <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
                <span>{showDanger ? 'Hide' : 'Show'} danger zone</span>
                <HiOutlineChevronRight className={clsx('ml-auto w-4 h-4 transition-transform', showDanger && 'rotate-90')} />
              </button>

              {showDanger && (
                <div className="border-t border-danger-fg/20 dark:border-danger-dark-fg/20 bg-canvas-inset dark:bg-canvas-dark-inset">
                  <div className="px-4 py-3 border-b border-danger-fg/20 dark:border-danger-dark-fg/20">
                    <p className="text-[13px] font-medium text-danger-fg dark:text-danger-dark-fg">Delete account</p>
                    <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
                      Permanent — all listings, reviews, and messages will be removed
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <button className="px-4 py-2 rounded-lg text-[12px] font-medium border border-danger-fg/40 dark:border-danger-dark-fg/40 text-danger-fg dark:text-danger-dark-fg hover:bg-danger-fg dark:hover:bg-danger-dark-fg hover:text-white transition-colors cursor-pointer">
                      Delete my account
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
