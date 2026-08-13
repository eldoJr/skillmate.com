import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineShieldCheck, HiOutlineBell, HiOutlinePaintBrush, HiOutlineGlobeAlt,
  HiOutlineLockClosed, HiOutlineArrowRightOnRectangle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import { useAuth } from '../../contexts/AuthContext'

const sections = [
  { key: 'privacy',       label: 'privacy',       icon: HiOutlineShieldCheck },
  { key: 'notifications', label: 'notifications', icon: HiOutlineBell },
  { key: 'appearance',    label: 'appearance',    icon: HiOutlinePaintBrush },
  { key: 'language',      label: 'language',      icon: HiOutlineGlobeAlt },
  { key: 'security',      label: 'security',      icon: HiOutlineLockClosed },
] as const

const inputCls = [
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-white dark:bg-[#0d1117]',
  'border border-[#e2e4e8] dark:border-[#1e2228]',
  'text-[#1f2328] dark:text-[#e6edf3]',
  'placeholder-[#adb5bd] dark:placeholder-[#4a5568]',
  'outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35]',
  'transition-colors duration-150',
].join(' ')

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
      <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={clsx(
        'relative w-8 h-4 transition-colors cursor-pointer shrink-0',
        enabled ? 'bg-[#e8490f] dark:bg-[#ff6b35]' : 'bg-[#e2e4e8] dark:bg-[#1e2228]',
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
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{label}</p>
        {description && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0">
      <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [active, setActive] = useState<typeof sections[number]['key']>('privacy')
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showDanger, setShowDanger] = useState(false)

  const [notifs, setNotifs] = useState({ email: true, push: true, messages: true, reviews: true, listings: false, marketing: false })
  const [privacy, setPrivacy] = useState({ profilePublic: true, showEmail: false, showUniversity: true, activityVisible: true })
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

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

      {/* Left nav */}
      <div className="hidden md:flex flex-col w-[200px] shrink-0">
        <div className="sticky top-20 border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">settings</span>
          </div>

          {sections.map((s) => {
            const Icon = s.icon
            const isActive = active === s.key
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2.5 font-mono text-[10px] tracking-wide border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0 border-l-2 transition-colors cursor-pointer text-left',
                  isActive
                    ? 'border-l-[#e8490f] dark:border-l-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d] dark:bg-[#ff6b3510]'
                    : 'border-l-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117]',
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {isActive && <span className="text-[#e8490f] dark:text-[#ff6b35] mr-0.5">&gt;</span>}
                {s.label}
              </button>
            )
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 font-mono text-[10px] tracking-wide border-l-2 border-l-transparent text-[#d1242f] dark:text-[#f85149] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] hover:border-l-[#d1242f] transition-colors cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5 shrink-0" />
            sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-4">

        {/* Page header */}
        <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">
              settings / {activeSection.label}
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{activeSection.label}</p>
            <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
              {active === 'privacy'       && 'control who can see your information'}
              {active === 'notifications' && 'choose what you want to be notified about'}
              {active === 'appearance'    && 'customize how skillmate looks for you'}
              {active === 'language'      && 'set your preferred language and timezone'}
              {active === 'security'      && 'manage your password and account security'}
            </p>
          </div>
        </div>

        {/* Privacy */}
        {active === 'privacy' && (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
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

        {/* Notifications */}
        {active === 'notifications' && (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
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

        {/* Appearance */}
        {active === 'appearance' && (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
            <SectionHeader label="theme" />
            <Row label="dark mode" description="switch between light and dark theme">
              <Toggle enabled={dark} onChange={toggleTheme} />
            </Row>
            <SectionHeader label="preview" />
            <div className="px-4 py-4 flex gap-3">
              {[
                { id: 'light', label: 'light', bg: 'bg-white border-[#e2e4e8]', text: 'text-[#1f2328]' },
                { id: 'dark',  label: 'dark',  bg: 'bg-[#0d1117] border-[#1e2228]', text: 'text-[#e6edf3]' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { if ((t.id === 'dark') !== dark) toggleTheme() }}
                  className={clsx(
                    'flex-1 border p-3 transition-colors cursor-pointer',
                    t.bg,
                    (t.id === 'dark') === dark
                      ? 'border-[#e8490f] dark:border-[#ff6b35]'
                      : 'hover:border-[#636c76] dark:hover:border-[#848d97]',
                  )}
                >
                  <div className={clsx('font-mono text-[9px] tracking-widest uppercase mb-2', t.text)}>{t.label}</div>
                  <div className="space-y-1">
                    <div className={clsx('h-1.5 w-3/4', t.id === 'dark' ? 'bg-[#e6edf3]/20' : 'bg-[#1f2328]/10')} />
                    <div className={clsx('h-1.5 w-1/2', t.id === 'dark' ? 'bg-[#e6edf3]/10' : 'bg-[#1f2328]/5')} />
                  </div>
                  {(t.id === 'dark') === dark && (
                    <div className="mt-2 font-mono text-[8px] text-[#e8490f] dark:text-[#ff6b35]">› active</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Language */}
        {active === 'language' && (
          <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
            <SectionHeader label="locale" />
            <Field label="language">
              <select defaultValue="en" className={clsx(inputCls, 'appearance-none cursor-pointer')}>
                <option value="en">english</option>
                <option value="pt">português</option>
                <option value="fr">français</option>
                <option value="es">español</option>
                <option value="de">deutsch</option>
              </select>
            </Field>
            <Field label="timezone">
              <select defaultValue="sast" className={clsx(inputCls, 'appearance-none cursor-pointer')}>
                <option value="sast">south africa standard time (SAST) — UTC+2</option>
                <option value="gmt">GMT — UTC+0</option>
                <option value="eat">east africa time (EAT) — UTC+3</option>
              </select>
            </Field>
          </div>
        )}

        {/* Security */}
        {active === 'security' && (
          <>
            <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <SectionHeader label="change password" />
              <Field label="current password">
                <input type="password" placeholder="••••••••" className={inputCls} />
              </Field>
              <Field label="new password">
                <input type="password" placeholder="••••••••" className={inputCls} />
              </Field>
              <Field label="confirm new password">
                <input type="password" placeholder="••••••••" className={inputCls} />
              </Field>
              <div className="px-4 py-3">
                <button className="px-5 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer">
                  update password
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
              <button
                onClick={() => setShowDanger((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-[#d1242f] dark:hover:text-[#f85149] transition-colors cursor-pointer"
              >
                <HiOutlineExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{showDanger ? 'hide' : 'show'} danger zone</span>
                <span className={clsx('ml-auto font-mono text-[9px] transition-transform inline-block', showDanger && 'rotate-90')}>›</span>
              </button>

              {showDanger && (
                <div className="border-t border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216]">
                  <div className="px-4 py-3 border-b border-[#f8514926]">
                    <p className="font-mono text-[10px] font-medium text-[#d1242f] dark:text-[#f85149]">delete account</p>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                      permanent — all listings, reviews, and messages will be removed
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <button className="px-4 py-2 font-mono text-[10px] tracking-wide border border-[#d1242f]/40 text-[#d1242f] dark:text-[#f85149] hover:bg-[#d1242f] hover:text-white transition-colors cursor-pointer">
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
