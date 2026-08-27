import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HiEye, HiEyeSlash, HiOutlineChevronLeft } from 'react-icons/hi2'
import ThemeToggle from '../../components/atoms/themeToggle'
import ProgressBar from '../../components/atoms/progressBar'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../services/auth'

const lCls = 'font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1 block'
const iCls = 'w-full px-3 py-2.5 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle border border-border-default dark:border-border-dark-default outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors'

const universities = ['University of Cape Town', 'University of Pretoria', 'Wits University', 'Stellenbosch University', 'Other']
const skillOptions = ['Programming', 'UI/UX Design', 'Writing', 'Tutoring', 'Video Editing', 'Digital Marketing', 'Photography', 'Music', 'Translation', 'Data Analysis']
const roles = ['Student', 'Graduate', 'Teaching Assistant', 'Researcher']
const stepLabels = ['account', 'profile', 'skills']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    role: '', university: '', headline: '', portfolio_url: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const next = () => { setError(''); setStep((s) => Math.min(s + 1, 2)) }
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)) }
  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill])

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name,
        university: form.university || undefined,
        headline: form.headline || undefined,
        portfolio_url: form.portfolio_url || undefined,
        role: form.role || undefined,
        skills: selectedSkills.length ? selectedSkills : undefined,
      })
      navigate('/app')
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas-default dark:bg-canvas-dark-default flex flex-col items-center justify-center px-5 py-12 relative">
      <ProgressBar loading={loading} />

      <div className="absolute top-4 left-5 flex items-center gap-2">
        <img src="/ico.svg" alt="Skillmate" width={22} height={22} />
        <span className="font-mono text-[11px] font-bold text-fg-default dark:text-fg-dark-default tracking-tight">skillmate</span>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* terminal window */}
      <div className="w-full max-w-[420px] border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">

        {/* title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">
              skillmate — create account
            </span>
          </div>
          <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">auth/register</span>
        </div>

        {/* step indicator */}
        <div className="flex items-center border-b border-border-default dark:border-border-dark-default">
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className={`flex-1 py-2 text-center font-mono text-[9px] tracking-widest uppercase transition-colors border-r last:border-r-0 border-border-default dark:border-border-dark-default ${
                i === step
                  ? 'bg-canvas-inset dark:bg-canvas-dark-inset text-fg-default dark:text-fg-dark-default border-b-2 border-b-brand dark:border-b-brand-dark-DEFAULT'
                  : i < step
                  ? 'text-success-fg dark:text-success-dark-fg'
                  : 'text-fg-muted dark:text-fg-dark-muted'
              }`}
            >
              {i < step ? `✓ ${label}` : `${i + 1}. ${label}`}
            </div>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── step 0: account ── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div className="mb-5">
                  <p className="font-mono text-[15px] font-bold text-fg-default dark:text-fg-dark-default">create your account</p>
                  <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-0.5">use your university email to get verified</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); next() }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lCls}>first name</label>
                      <input type="text" placeholder="Jane" required value={form.first_name} onChange={set('first_name')} className={iCls} />
                    </div>
                    <div>
                      <label className={lCls}>last name</label>
                      <input type="text" placeholder="Doe" required value={form.last_name} onChange={set('last_name')} className={iCls} />
                    </div>
                  </div>

                  <div>
                    <label className={lCls}>university email</label>
                    <div className="flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors">
                      <span className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT px-2.5 py-2.5 border-r border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset shrink-0 select-none">$</span>
                      <input type="email" placeholder="you@university.edu" required value={form.email} onChange={set('email')}
                        className="flex-1 px-3 py-2.5 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className={lCls}>password</label>
                    <div className="flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors">
                      <span className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT px-2.5 py-2.5 border-r border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset shrink-0 select-none">$</span>
                      <input type={showPassword ? 'text' : 'password'} placeholder="min. 8 characters" required minLength={8}
                        value={form.password} onChange={set('password')}
                        className="flex-1 px-3 py-2.5 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="px-2.5 text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer">
                        {showPassword ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 w-3 h-3 accent-brand shrink-0" />
                    <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">
                      i agree to the{' '}
                      <a href="#" className="text-brand dark:text-brand-dark-DEFAULT hover:underline">terms of service</a>
                      {' '}and{' '}
                      <a href="#" className="text-brand dark:text-brand-dark-DEFAULT hover:underline">privacy policy</a>
                    </span>
                  </label>

                  <button type="submit"
                    className="w-full py-2.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[11px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer">
                    {'>'} continue
                  </button>
                </form>

                <div className="border-t border-border-default dark:border-border-dark-default pt-4 mt-5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">~ already have an account?</span>
                  <Link to="/login"
                    className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT px-3 py-1.5 hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors">
                    sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── step 1: profile ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <button onClick={back} className="flex items-center gap-1 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT mb-5 cursor-pointer transition-colors">
                  <HiOutlineChevronLeft className="w-3.5 h-3.5" /> back
                </button>

                <div className="mb-5">
                  <p className="font-mono text-[15px] font-bold text-fg-default dark:text-fg-dark-default">build your profile</p>
                  <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-0.5">help others know who you are</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); next() }}>
                  <div>
                    <label className={lCls}>i am a...</label>
                    <select required value={form.role} onChange={set('role')} className={`${iCls} appearance-none`}>
                      <option value="" disabled>select your role</option>
                      {roles.map((r) => <option key={r} value={r}>{r.toLowerCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={lCls}>university</label>
                    <select value={form.university} onChange={set('university')} className={`${iCls} appearance-none`}>
                      <option value="" disabled>select your university</option>
                      {universities.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={lCls}>headline <span className="normal-case tracking-normal text-fg-muted dark:text-fg-dark-muted">(optional)</span></label>
                    <input type="text" placeholder="e.g. frontend dev & ui designer" value={form.headline} onChange={set('headline')} className={iCls} />
                  </div>

                  <div>
                    <label className={lCls}>portfolio / github url <span className="normal-case tracking-normal text-fg-muted dark:text-fg-dark-muted">(optional)</span></label>
                    <input type="url" placeholder="https://github.com/username" value={form.portfolio_url} onChange={set('portfolio_url')} className={iCls} />
                  </div>

                  <button type="submit"
                    className="w-full py-2.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[11px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer">
                    {'>'} continue
                  </button>
                  <button type="button" onClick={next}
                    className="w-full font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT text-center cursor-pointer transition-colors">
                    ~ skip for now
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── step 2: skills ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <button onClick={back} className="flex items-center gap-1 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT mb-5 cursor-pointer transition-colors">
                  <HiOutlineChevronLeft className="w-3.5 h-3.5" /> back
                </button>

                <div className="mb-5">
                  <p className="font-mono text-[15px] font-bold text-fg-default dark:text-fg-dark-default">what can you offer?</p>
                  <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-0.5">pick your skills — you can always update these later</p>
                </div>

                {error && (
                  <div className="mb-4 px-3 py-2 border border-danger-fg dark:border-danger-dark-fg bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[10px] text-danger-fg dark:text-danger-dark-fg">
                    <span className="mr-1.5">!</span>{error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleFinish}>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => {
                      const active = selectedSkills.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`font-mono text-[10px] px-2.5 py-1 border transition-colors cursor-pointer ${
                            active
                              ? 'bg-brand dark:bg-brand-dark-DEFAULT border-brand dark:border-brand-dark-DEFAULT text-white'
                              : 'border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}{skill.toLowerCase()}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[11px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '> creating account...' : selectedSkills.length > 0 ? `> get started with ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''}` : '> get started'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted text-center mt-5">
        © {new Date().getFullYear()} skillmate.com
      </p>
    </div>
  )
}
