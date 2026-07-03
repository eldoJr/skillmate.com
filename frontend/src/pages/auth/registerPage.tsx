import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiEye, HiEyeSlash, HiChevronLeft } from 'react-icons/hi2'
import Logo from '../../components/atoms/logo'
import Button from '../../components/atoms/button'
import ThemeToggle from '../../components/atoms/themeToggle'

const universities = ['University of Cape Town', 'University of Pretoria', 'Wits University', 'Stellenbosch University', 'Other']
const skills = ['Programming', 'UI/UX Design', 'Writing', 'Tutoring', 'Video Editing', 'Digital Marketing', 'Photography', 'Music', 'Translation', 'Data Analysis']
const roles = ['Student', 'Graduate', 'Teaching Assistant', 'Researcher']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const navigate = useNavigate()

  const next = () => setStep((s) => Math.min(s + 1, 2))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )

  const stepLabels = ['Account', 'Profile', 'Skills']

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0d1117] flex">

      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between w-[40%] lg:w-[45%] bg-[#f6f8fa] dark:bg-[#161b22] border-r border-[#d0d7de] dark:border-[#30363d] p-8 lg:p-12">
        <Link to="/"><Logo width={26} height={26} /></Link>

        <div>
          <h2 className="text-lg font-bold text-[#1f2328] dark:text-[#e6edf3] mb-2">
            Turn your skills into opportunities
          </h2>
          <p className="text-sm text-[#636c76] dark:text-[#848d97] mb-8 leading-relaxed">
            Join thousands of students already offering and discovering skills within their university community.
          </p>

          <div className="flex flex-col gap-2.5">
            {[
              { step: '01', title: 'Create your account', desc: 'Verify with your university email' },
              { step: '02', title: 'Build your profile', desc: 'Showcase your skills and experience' },
              { step: '03', title: 'Start exchanging', desc: 'Offer services or hire fellow students' },
            ].map(({ step: s, title, desc }) => (
              <div key={s} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d]">
                <span className="text-xs font-bold text-[#0969da] dark:text-[#2f81f7] mt-0.5 shrink-0">{s}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">{title}</p>
                  <p className="text-xs text-[#636c76] dark:text-[#848d97] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#636c76] dark:text-[#848d97]">© {new Date().getFullYear()} Skillmate. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative overflow-y-auto">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <Link to="/" className="mb-6 md:hidden">
          <Logo width={26} height={26} />
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
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

        <div className="w-full max-w-[380px]">
          <AnimatePresence mode="wait">

            {/* Step 0 — Account */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-5">
                  <h1 className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Create your account</h1>
                  <p className="text-sm text-[#636c76] dark:text-[#848d97]">Use your university email to get verified.</p>
                </div>

                <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); next() }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">First name</label>
                      <input type="text" placeholder="Jane" required className="auth-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Last name</label>
                      <input type="text" placeholder="Doe" required className="auth-input" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">University email</label>
                    <input type="email" placeholder="you@university.edu" required className="auth-input" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        required
                        className="auth-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer"
                      >
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

            {/* Step 1 — Profile */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
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
                    <select required className="auth-input appearance-none">
                      <option value="" disabled>Select your role</option>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">University</label>
                    <select className="auth-input appearance-none">
                      <option value="" disabled>Select your university</option>
                      {universities.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Headline <span className="text-[#636c76] dark:text-[#848d97] font-normal">(optional)</span></label>
                    <input type="text" placeholder="e.g. Frontend Dev & UI Designer" className="auth-input" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Portfolio / GitHub URL <span className="text-[#636c76] dark:text-[#848d97] font-normal">(optional)</span></label>
                    <input type="url" placeholder="https://github.com/username" className="auth-input" />
                  </div>

                  <Button size="md" className="w-full rounded-xl mt-1">Continue</Button>
                  <button type="button" onClick={next} className="text-xs text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] text-center cursor-pointer transition-colors">
                    Skip for now
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2 — Skills */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button onClick={back} className="flex items-center gap-1 text-xs text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] mb-5 cursor-pointer">
                  <HiChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="mb-5">
                  <h1 className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">What can you offer?</h1>
                  <p className="text-sm text-[#636c76] dark:text-[#848d97]">Pick your skills. You can always update these later.</p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); navigate('/explore') }}>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
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

                  <Button size="md" className="w-full rounded-xl">
                    {selectedSkills.length > 0 ? `Get started with ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''}` : 'Get started'}
                  </Button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
