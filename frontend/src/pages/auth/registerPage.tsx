import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HiEye, HiEyeSlash, HiOutlineChevronLeft, HiOutlineCheck } from 'react-icons/hi2'
import ThemeToggle from '../../components/atoms/themeToggle'
import ProgressBar from '../../components/atoms/progressBar'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../services/auth'

const universities = ['University of Cape Town', 'University of Pretoria', 'Wits University', 'Stellenbosch University', 'Other']
const skillOptions = ['Programming', 'UI/UX Design', 'Writing', 'Tutoring', 'Video Editing', 'Digital Marketing', 'Photography', 'Music', 'Translation', 'Data Analysis']
const roles        = ['Student', 'Graduate', 'Teaching Assistant', 'Researcher']
const steps        = ['Account', 'Profile', 'Skills']

const inputCls = 'w-full px-3 py-2 rounded-lg text-[13px] bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-muted dark:placeholder-fg-dark-muted outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-dark-DEFAULT/20 transition-all'
const labelCls = 'block text-[12px] font-medium text-fg-default dark:text-fg-dark-default mb-1'

export default function RegisterPage() {
  const [step, setStep]                   = useState(0)
  const [showPassword, setShowPassword]   = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const { register } = useAuth()
  const navigate     = useNavigate()

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
        headline:   form.headline   || undefined,
        portfolio_url: form.portfolio_url || undefined,
        role:    form.role    || undefined,
        skills:  selectedSkills.length ? selectedSkills : undefined,
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

      {/* top bar */}
      <div className="absolute top-5 left-6 flex items-center gap-2">
        <img src="/ico.svg" alt="Skillmate" width={24} height={24} />
        <span className="text-[15px] font-semibold text-fg-default dark:text-fg-dark-default tracking-tight">skillmate</span>
      </div>
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      {/* card */}
      <div className="w-full max-w-[400px] bg-canvas-default dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default rounded-xl shadow-sm overflow-hidden">

        {/* card header */}
        <div className="px-6 pt-6 pb-5 border-b border-border-default dark:border-border-dark-default">
          <div className="w-8 h-8 rounded-lg bg-brand dark:bg-brand-dark-DEFAULT flex items-center justify-center mb-3">
            <img src="/ico.svg" alt="" width={16} height={16} className="brightness-0 invert" />
          </div>
          <h1 className="text-[17px] font-semibold text-fg-default dark:text-fg-dark-default tracking-tight">
            Create your account
          </h1>
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
            Join thousands of students on Skillmate
          </p>
        </div>

        {/* step indicator */}
        <div className="flex items-center px-6 pt-4 gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
                  i < step  ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white'
                  : i === step ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white'
                  : 'bg-canvas-inset dark:bg-canvas-dark-inset text-fg-muted dark:text-fg-dark-muted border border-border-default dark:border-border-dark-default'
                }`}>
                  {i < step ? <HiOutlineCheck className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-[11px] font-medium transition-colors ${
                  i <= step ? 'text-fg-default dark:text-fg-dark-default' : 'text-fg-muted dark:text-fg-dark-muted'
                }`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px transition-colors ${i < step ? 'bg-brand dark:bg-brand-dark-DEFAULT' : 'bg-border-default dark:bg-border-dark-default'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">

            {/* ── step 0: account ── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); next() }}>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelCls}>First name</label>
                      <input type="text" placeholder="Jane" required value={form.first_name} onChange={set('first_name')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Last name</label>
                      <input type="text" placeholder="Doe" required value={form.last_name} onChange={set('last_name')} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>University email</label>
                    <input type="email" placeholder="you@university.edu" required value={form.email} onChange={set('email')} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        required minLength={8}
                        value={form.password} onChange={set('password')}
                        className={`${inputCls} pr-9`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer">
                        {showPassword ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer pt-0.5">
                    <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 rounded accent-brand shrink-0 cursor-pointer" />
                    <span className="text-[12px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-brand dark:text-brand-dark-DEFAULT hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-brand dark:text-brand-dark-DEFAULT hover:underline">Privacy Policy</a>
                    </span>
                  </label>

                  <button type="submit"
                    className="w-full py-2 rounded-lg text-[13px] font-semibold bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer mt-1">
                    Continue
                  </button>
                </form>

                <p className="text-center text-[12px] text-fg-muted dark:text-fg-dark-muted mt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand dark:text-brand-dark-DEFAULT font-medium hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── step 1: profile ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <button onClick={back} className="flex items-center gap-1 text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default mb-4 cursor-pointer transition-colors">
                  <HiOutlineChevronLeft className="w-3.5 h-3.5" /> Back
                </button>

                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); next() }}>
                  <div>
                    <label className={labelCls}>I am a</label>
                    <select required value={form.role} onChange={set('role')} className={`${inputCls} appearance-none`}>
                      <option value="" disabled>Select your role</option>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>University</label>
                    <select value={form.university} onChange={set('university')} className={`${inputCls} appearance-none`}>
                      <option value="" disabled>Select your university</option>
                      {universities.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Headline <span className="font-normal text-fg-muted dark:text-fg-dark-muted">(optional)</span>
                    </label>
                    <input type="text" placeholder="e.g. Frontend dev & UI designer" value={form.headline} onChange={set('headline')} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Portfolio / GitHub URL <span className="font-normal text-fg-muted dark:text-fg-dark-muted">(optional)</span>
                    </label>
                    <input type="url" placeholder="https://github.com/username" value={form.portfolio_url} onChange={set('portfolio_url')} className={inputCls} />
                  </div>

                  <button type="submit"
                    className="w-full py-2 rounded-lg text-[13px] font-semibold bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer mt-1">
                    Continue
                  </button>
                  <button type="button" onClick={next}
                    className="w-full text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default text-center cursor-pointer transition-colors py-1">
                    Skip for now
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── step 2: skills ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <button onClick={back} className="flex items-center gap-1 text-[12px] text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default mb-4 cursor-pointer transition-colors">
                  <HiOutlineChevronLeft className="w-3.5 h-3.5" /> Back
                </button>

                <div className="mb-4">
                  <p className="text-[14px] font-semibold text-fg-default dark:text-fg-dark-default">What can you offer?</p>
                  <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-0.5">Pick your skills — you can update these later</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-subtle dark:bg-danger-dark-subtle border border-danger-muted dark:border-danger-dark-muted text-[12px] text-danger-fg dark:text-danger-dark-fg mb-3">
                    <span className="shrink-0">⚠</span><span>{error}</span>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleFinish}>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => {
                      const active = selectedSkills.includes(skill)
                      return (
                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all cursor-pointer ${
                            active
                              ? 'bg-brand dark:bg-brand-dark-DEFAULT border-brand dark:border-brand-dark-DEFAULT text-white'
                              : 'bg-canvas-inset dark:bg-canvas-dark-inset border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT'
                          }`}>
                          {active && <HiOutlineCheck className="w-3 h-3 shrink-0" />}
                          {skill}
                        </button>
                      )
                    })}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-2 rounded-lg text-[13px] font-semibold bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                      ? 'Creating account…'
                      : selectedSkills.length > 0
                      ? `Get started with ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''}`
                      : 'Get started'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted text-center mt-5">
        © {new Date().getFullYear()} Skillmate. All rights reserved.
      </p>
    </div>
  )
}
