import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineShieldCheck, HiOutlineBell, HiOutlinePaintBrush, HiOutlineGlobeAlt,
  HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineChevronRight,
  HiOutlineExclamationTriangle, HiOutlineUser, HiOutlineSparkles,
  HiOutlineXMark, HiOutlineCamera,
} from 'react-icons/hi2'
import { useAuth } from '../../contexts/AuthContext'
import { usersService } from '../../services/users'
import { skillsService, type Skill } from '../../services/skills'
import Avatar from '../../components/atoms/avatar'

const navItems = [
  { key: 'account',       label: 'Account',       icon: HiOutlineUser },
  { key: 'skills',        label: 'Skills',         icon: HiOutlineSparkles },
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
  const { user, logout, updateUser } = useAuth()
  const [showDanger, setShowDanger] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Avatar
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

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
    }
  }

  // Skills
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [skillSaving, setSkillSaving] = useState<string | null>(null)

  useEffect(() => {
    if (active === 'skills' && allSkills.length === 0)
      skillsService.getAll().then(setAllSkills)
  }, [active, allSkills.length])

  const userSkillIds = new Set(user?.skills?.map((s) => s.id) ?? [])

  const filteredSkills = skillSearch.trim()
    ? allSkills.filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
    : allSkills

  const handleToggleSkill = async (skill: Skill) => {
    setSkillSaving(skill.id)
    try {
      const updated = userSkillIds.has(skill.id)
        ? await usersService.detachSkill(skill.id)
        : await usersService.attachSkill(skill.id)
      updateUser(updated)
    } catch { /* ignore */ } finally {
      setSkillSaving(null)
    }
  }

  const [form, setForm] = useState({
    first_name: '', last_name: '', headline: '', portfolio_url: '', bio: '', university: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        headline: user.headline ?? '',
        portfolio_url: user.portfolio_url ?? '',
        bio: user.bio ?? '',
        university: user.university ?? '',
      })
    }
  }, [user])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      const updated = await usersService.updateMe(form)
      updateUser(updated)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch {
      setSaveMsg('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const [notifs, setNotifs] = useState({ email: true, push: true, messages: true, reviews: true, listings: false, marketing: false })
  const [privacy, setPrivacy] = useState({ profilePublic: true, showEmail: false, showUniversity: true, activityVisible: true })
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
  }

  return (
    <div className="flex gap-5">
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

      <div className="flex-1 min-w-0 max-w-2xl space-y-5">

        {active === 'account' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Account</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Update your personal information.</p>

            {/* Avatar upload */}
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 mb-4 flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar
                  name={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'S'}
                  src={user?.avatar_url ?? undefined}
                  size="lg"
                  className="!w-16 !h-16 !text-xl"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0969da] dark:bg-[#2f81f7] flex items-center justify-center text-white shadow cursor-pointer disabled:opacity-60"
                >
                  <HiOutlineCamera className="w-3.5 h-3.5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile photo</p>
                <p className="text-[11px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                  {avatarUploading ? 'Uploading…' : 'JPG, PNG or GIF · max 5 MB'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">First name</label>
                  <input type="text" value={form.first_name} onChange={set('first_name')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Last name</label>
                  <input type="text" value={form.last_name} onChange={set('last_name')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">University email</label>
                <input type="email" value={user?.email ?? ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">University</label>
                <input type="text" value={form.university} onChange={set('university')} placeholder="e.g. University of Cape Town" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Headline</label>
                <input type="text" value={form.headline} onChange={set('headline')} placeholder="e.g. Frontend Dev & UI Designer" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Portfolio / GitHub URL</label>
                <input type="url" value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://github.com/username" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell other students about yourself…" className={`${inputCls} resize-none`} />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saveMsg && <span className="text-[12px] text-[#1a7f37] dark:text-[#3fb950]">{saveMsg}</span>}
              </div>
            </form>
          </div>
        )}

        {active === 'skills' && (
          <div>
            <h2 className="text-[15px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Skills</h2>
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mb-4">Add skills to your profile so clients can find you.</p>

            {/* Current skills */}
            {(user?.skills?.length ?? 0) > 0 && (
              <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4 mb-4">
                <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-3">Your skills</p>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((s) => (
                    <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border border-[#b6e3ff] dark:border-[#1f4a7a]">
                      {s.name}
                      <button
                        onClick={() => handleToggleSkill(s)}
                        disabled={skillSaving === s.id}
                        className="hover:text-[#d1242f] dark:hover:text-[#f85149] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <HiOutlineXMark className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Browse & add */}
            <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4">
              <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest mb-3">Browse skills</p>
              <input
                type="text"
                placeholder="Search skills…"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className={`${inputCls} mb-3`}
              />
              {allSkills.length === 0 ? (
                <p className="text-[12px] text-[#636c76] dark:text-[#848d97]">Loading…</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {filteredSkills.map((s) => {
                    const added = userSkillIds.has(s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleToggleSkill(s)}
                        disabled={skillSaving === s.id}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer disabled:opacity-50',
                          added
                            ? 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] border-[#b6e3ff] dark:border-[#1f4a7a]'
                            : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7]',
                        )}
                      >
                        {s.name}
                      </button>
                    )
                  })}
                </div>
              )}
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
