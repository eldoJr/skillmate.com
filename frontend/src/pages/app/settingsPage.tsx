import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlinePaintBrush,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
} from 'react-icons/hi2'

const navItems = [
  { key: 'account',       label: 'Account',       icon: HiOutlineUser },
  { key: 'privacy',       label: 'Privacy',        icon: HiOutlineShieldCheck },
  { key: 'notifications', label: 'Notifications',  icon: HiOutlineBell },
  { key: 'appearance',    label: 'Appearance',     icon: HiOutlinePaintBrush },
  { key: 'language',      label: 'Language',       icon: HiOutlineGlobeAlt },
  { key: 'security',      label: 'Security',       icon: HiOutlineLockClosed },
] as const

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#161b22] transition-all'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={clsx('relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0', enabled ? 'bg-[#0969da] dark:bg-[#2f81f7]' : 'bg-[#d0d7de] dark:bg-[#30363d]')}
    >
      <span className={clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', enabled ? 'left-[18px]' : 'left-0.5')} />
    </button>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#1f2328] dark:text-[#e6edf3]">{label}</p>
        {description && <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [active, setActive] = useState('account')
  const navigate = useNavigate()
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

  const handleSignOut = () => {
    localStorage.removeItem('skillmate_auth')
    navigate('/login')
  }

  return (
    <div className="flex gap-5">
      {/* Left nav */}
      <div className="hidden md:flex flex-col w-[200px] shrink-0">
        <div className="sticky top-20 space-y-0.5">
          {navItems.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors cursor-pointer',
                  active === s.key
                    ? 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]'
                    : 'text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                )}
              >
                <Icon className="w-4 h-4" />
                {s.label}
                <HiOutlineChevronRight className={clsx('w-3 h-3 ml-auto transition-opacity', active === s.key ? 'opacity-100' : 'opacity-0')} />
              </button>
            )
          })}

          <div className="h-px bg-[#d0d7de] dark:bg-[#30363d] my-2" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-[#d1242f] dark:text-[#f85149] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] transition-colors cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-5">

        {active === 'account' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Account</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Update your personal information.</p>
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">First name</label>
                  <input type="text" defaultValue="Student" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Last name</label>
                  <input type="text" defaultValue="Name" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">University email</label>
                <input type="email" defaultValue="student@university.edu" disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Headline</label>
                <input type="text" placeholder="e.g. Frontend Dev & UI Designer" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Portfolio / GitHub URL</label>
                <input type="url" placeholder="https://github.com/username" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Bio</label>
                <textarea rows={3} placeholder="Tell other students about yourself…" className={`${inputCls} resize-none`} />
              </div>
              <button className="px-5 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {active === 'privacy' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Privacy</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Control who can see your information.</p>
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] px-5 divide-y divide-[#f6f8fa] dark:divide-[#21262d]">
              <Row label="Public Profile" description="Anyone can discover and view your profile"><Toggle enabled={privacy.profilePublic} onChange={() => setPrivacy((p) => ({ ...p, profilePublic: !p.profilePublic }))} /></Row>
              <Row label="Show Email" description="Display your email on your profile"><Toggle enabled={privacy.showEmail} onChange={() => setPrivacy((p) => ({ ...p, showEmail: !p.showEmail }))} /></Row>
              <Row label="Show University" description="Display your university on your profile"><Toggle enabled={privacy.showUniversity} onChange={() => setPrivacy((p) => ({ ...p, showUniversity: !p.showUniversity }))} /></Row>
              <Row label="Activity Visible" description="Others can see when you were last active"><Toggle enabled={privacy.activityVisible} onChange={() => setPrivacy((p) => ({ ...p, activityVisible: !p.activityVisible }))} /></Row>
            </div>
          </div>
        )}

        {active === 'notifications' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Notifications</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Choose what you want to be notified about.</p>
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] px-5 divide-y divide-[#f6f8fa] dark:divide-[#21262d]">
              <Row label="Email Notifications" description="Receive updates via email"><Toggle enabled={notifs.email} onChange={() => setNotifs((n) => ({ ...n, email: !n.email }))} /></Row>
              <Row label="Push Notifications" description="Browser push notifications"><Toggle enabled={notifs.push} onChange={() => setNotifs((n) => ({ ...n, push: !n.push }))} /></Row>
              <Row label="Messages" description="New messages from other students"><Toggle enabled={notifs.messages} onChange={() => setNotifs((n) => ({ ...n, messages: !n.messages }))} /></Row>
              <Row label="Reviews" description="When someone leaves you a review"><Toggle enabled={notifs.reviews} onChange={() => setNotifs((n) => ({ ...n, reviews: !n.reviews }))} /></Row>
              <Row label="Listing Activity" description="Views and inquiries on your listings"><Toggle enabled={notifs.listings} onChange={() => setNotifs((n) => ({ ...n, listings: !n.listings }))} /></Row>
              <Row label="Marketing" description="Platform updates and tips"><Toggle enabled={notifs.marketing} onChange={() => setNotifs((n) => ({ ...n, marketing: !n.marketing }))} /></Row>
            </div>
          </div>
        )}

        {active === 'appearance' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Appearance</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Customize how Skillmate looks for you.</p>
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] px-5">
              <Row label="Dark Mode" description="Switch between light and dark theme"><Toggle enabled={dark} onChange={toggleTheme} /></Row>
            </div>
          </div>
        )}

        {active === 'language' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Language & Region</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Set your preferred language and timezone.</p>
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Language</label>
                <select defaultValue="en" className={`${inputCls} appearance-none`}>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Timezone</label>
                <select defaultValue="sast" className={`${inputCls} appearance-none`}>
                  <option value="sast">South Africa Standard Time (SAST) — UTC+2</option>
                  <option value="gmt">GMT — UTC+0</option>
                  <option value="eat">East Africa Time (EAT) — UTC+3</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {active === 'security' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Security</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Manage your password and account security.</p>
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Confirm Password</label>
                  <input type="password" placeholder="••••••••" className={inputCls} />
                </div>
              </div>
              <button className="px-5 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer">
                Update Password
              </button>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowDanger((v) => !v)}
                className="flex items-center gap-2 text-[12px] font-medium text-[#636c76] dark:text-[#848d97] hover:text-[#d1242f] dark:hover:text-[#f85149] transition-colors cursor-pointer"
              >
                <HiOutlineExclamationTriangle className="w-4 h-4" />
                {showDanger ? 'Hide danger zone' : 'Show danger zone'}
                <HiOutlineChevronRight className={clsx('w-3 h-3 transition-transform', showDanger && 'rotate-90')} />
              </button>

              {showDanger && (
                <div className="mt-3 rounded-2xl border border-[#ffcecb] dark:border-[#f85149]/30 bg-[#fff0ee] dark:bg-[#2d1216] p-5">
                  <p className="text-[13px] font-semibold text-[#d1242f] dark:text-[#f85149] mb-1">Delete Account</p>
                  <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mb-4">This action is permanent. All your listings, reviews, and messages will be removed.</p>
                  <button className="px-4 py-2 rounded-xl text-[12px] font-semibold border border-[#ffcecb] dark:border-[#f85149]/40 text-[#d1242f] dark:text-[#f85149] hover:bg-[#ffcecb]/40 dark:hover:bg-[#f85149]/10 transition-colors cursor-pointer">
                    Delete My Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
