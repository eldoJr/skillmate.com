import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiEyeSlash, HiAcademicCap, HiLightBulb, HiStar, HiChatBubbleLeftRight } from 'react-icons/hi2'
import Logo from '../../components/atoms/logo'
import Button from '../../components/atoms/button'
import ThemeToggle from '../../components/atoms/themeToggle'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('skillmate_auth', 'true')
      navigate('/app')
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0d1117] flex">

      {/* Left panel — decorative */}
      <div className="hidden md:flex flex-col justify-between w-[40%] lg:w-[45%] bg-[#f6f8fa] dark:bg-[#161b22] border-r border-[#d0d7de] dark:border-[#30363d] p-8 lg:p-12">
        <Link to="/"><Logo width={26} height={26} /></Link>

        <div>
          <div className="flex flex-col gap-3 mb-10">
            {[
              { icon: HiAcademicCap, text: 'Verified student accounts via university email' },
              { icon: HiLightBulb,   text: 'Offer and discover skills within your campus' },
              { icon: HiStar,        text: 'Build your reputation with ratings & reviews' },
              { icon: HiChatBubbleLeftRight, text: 'Connect directly with peers in real time' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[#0969da] dark:text-[#2f81f7]" />
                <p className="text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 border-[#0969da] dark:border-[#2f81f7] pl-4">
            <p className="text-sm text-[#1f2328] dark:text-[#e6edf3] italic leading-relaxed">
              "Skillmate helped me find a design client within my own university. It's the platform I always wished existed."
            </p>
            <footer className="mt-2 text-xs text-[#636c76] dark:text-[#848d97]">— Student, Computer Science</footer>
          </blockquote>
        </div>

        <p className="text-xs text-[#636c76] dark:text-[#848d97]">© {new Date().getFullYear()} Skillmate. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative overflow-y-auto">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <Link to="/" className="mb-8 md:hidden">
          <Logo width={26} height={26} />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Welcome back</h1>
            <p className="text-sm text-[#636c76] dark:text-[#848d97]">Sign in to your Skillmate account</p>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-xs">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Username or email</label>
              <input
                type="text"
                placeholder="admin"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#0969da] dark:text-[#2f81f7] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#d0d7de] dark:border-[#30363d] accent-[#0969da]" />
              <span className="text-xs text-[#636c76] dark:text-[#848d97]">Remember me for 30 days</span>
            </label>

            <Button size="md" className="w-full rounded-xl mt-1">
              Sign in
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d0d7de] dark:border-[#30363d]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-[#636c76] dark:text-[#848d97] bg-white dark:bg-[#0d1117]">
                New to Skillmate?
              </span>
            </div>
          </div>

          <Link to="/register">
            <Button variant="secondary" size="md" className="w-full rounded-xl">
              Create an account
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
