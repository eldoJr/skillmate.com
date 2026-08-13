import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiEye, HiEyeSlash, HiChevronLeft } from 'react-icons/hi2'
import Logo from '../../components/atoms/logo'
import Button from '../../components/atoms/button'
import ThemeToggle from '../../components/atoms/themeToggle'
import Dropdown, { DropdownItem } from '../../components/molecules/dropdown'
import ProgressBar from '../../components/atoms/progressBar'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../services/auth'

const universities = ['University of Cape Town', 'University of Pretoria', 'Wits University', 'Stellenbosch University', 'Other']
const skillOptions = ['Programming', 'UI/UX Design', 'Writing', 'Tutoring', 'Video Editing', 'Digital Marketing', 'Photography', 'Music', 'Translation', 'Data Analysis']
const roles = ['Student', 'Graduate', 'Teaching Assistant', 'Researcher']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    role: '', university: '', headline: '', portfolio_url: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const next = () => { setError(''); setStep((s) => Math.min(s + 1, 2)) }
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)) }

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
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

  const stepLabels = ['Account', 'Profile', 'Skills']

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center px-5 py-12 relative">
      <ProgressBar loading={loading} />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Dropdown
          trigger={
            <span className="text-xs font-semibold tracking-wider uppercase text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors">
              EN
            </span>
          }
        >
          <DropdownItem>🇬🇧 English</DropdownItem>
          <DropdownItem>🇵🇹 Português</DropdownItem>
          <DropdownItem>🇫🇷 Français</DropdownItem>
          <DropdownItem>🇪🇸 Español</DropdownItem>
          <DropdownItem>🇩🇪 Deutsch</DropdownItem>
        </Dropdown>
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center mb-6">
        <Link to="/" className="mb-6">
          <Logo width={32} height={32} />
        </Link>

        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  i < step
                    ? 'bg-[#1a7f37] dark:bg-[#238636] text-white'
                    : i === step
                    ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
                    : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                  i === step ? 'text-[#1f2328] dark:text-[#e6edf3]' : 'text-[#636c76] dark:text-[#848d97]'
                }`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`w-6 h-px transition-colors ${i < step ? 'bg-[#1a7f37] dark:bg-[#238636]' : 'bg-[#d0d7de] dark:bg-[#30363d]'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[380px]">
        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <div className="mb-5">
                <h1 className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Create your account</h1>
                <p className="text-sm text-[#636c76] dark:text-[#848d97]">Use your university email to get verified.</p>
              </div>

              <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); next() }}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">First name</label>
                    <input type="text" placeholder="Jane" required value={form.first_name} onChange={set('first_name')} className="auth-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Last name</label>
                    <input type="text" placeholder="Doe" required value={form.last_name} onChange={set('last_name')} className="auth-input" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">University email</label>
                  <input type="email" placeholder="you@university.edu" required value={form.email} onChange={set('email')} className="auth-input" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      value={form.password}
                      onChange={set('password')}
                      className="auth-input pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer">
                      {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 rounded border-[#d0d7de] dark:border-[#30363d] accent-[#0969da]" />
                  <span className="text-xs text-[#636c76] dark:text-[#848d97] leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-[#0969da] dark:text-[#2f81f7] hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-[#0969da] dark:text-[#2f81f7] hover:underline">Privacy Policy</a>.
                  </span>
                </label>

                <Button size="md" className="w-full rounded-xl mt-1">Continue</Button>
              </form>

              <p className="text-sm text-[#636c76] dark:text-[#848d97] text-center mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0969da] dark:text-[#2f81f7] font-semibold hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <button onClick={back} className="flex items-center gap-1 text-xs text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] mb-5 cursor-pointer">
                <HiChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="mb-5">
                <h1 className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Build your profile</h1>
                <p className="text-sm text-[#636c76] dark:text-[#848d97]">Help others know who you are.</p>
              </div>

              <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); next() }}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">I am a...</label>
                  <select required value={form.role} onChange={set('role')} className="auth-input appearance-none">
                    <option value="" disabled>Select your role</option>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">University</label>
                  <select value={form.university} onChange={set('university')} className="auth-input appearance-none">
                    <option value="" disabled>Select your university</option>
                    {universities.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Headline <span className="text-[#636c76] dark:text-[#848d97] font-normal">(optional)</span></label>
                  <input type="text" placeholder="e.g. Frontend Dev & UI Designer" value={form.headline} onChange={set('headline')} className="auth-input" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Portfolio / GitHub URL <span className="text-[#636c76] dark:text-[#848d97] font-normal">(optional)</span></label>
                  <input type="url" placeholder="https://github.com/username" value={form.portfolio_url} onChange={set('portfolio_url')} className="auth-input" />
                </div>

                <Button size="md" className="w-full rounded-xl mt-1">Continue</Button>
                <button type="button" onClick={next} className="text-xs text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] text-center cursor-pointer transition-colors">
                  Skip for now
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <button onClick={back} className="flex items-center gap-1 text-xs text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] mb-5 cursor-pointer">
                <HiChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="mb-5">
                <h1 className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">What can you offer?</h1>
                <p className="text-sm text-[#636c76] dark:text-[#848d97]">Pick your skills. You can always update these later.</p>
              </div>

              {error && (
                <div className="mb-3 px-3 py-2.5 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-xs">
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-5" onSubmit={handleFinish}>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => {
                    const active = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white border-[#0969da] dark:border-[#2f81f7]'
                            : 'bg-white dark:bg-[#0d1117] text-[#636c76] dark:text-[#848d97] border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7]'
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>

                <Button size="md" className="w-full rounded-xl" disabled={loading}>
                  {loading ? 'Creating account…' : selectedSkills.length > 0 ? `Get started with ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''}` : 'Get started'}
                </Button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-xs text-[#636c76] dark:text-[#848d97] text-center mt-8">
          © {new Date().getFullYear()} Skillmate
        </p>
      </div>
    </div>
  )
}
