import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
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
    if (email && password) {
      localStorage.setItem('skillmate_auth', 'true')
      navigate('/explore')
    } else {
      setError('Please fill in all fields.')
    }
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0d1117] flex">

      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#f6f8fa] dark:bg-[#161b22] border-r border-[#d0d7de] dark:border-[#30363d] p-12">
        <Link to="/"><Logo width={28} height={28} /></Link>

        <div>
          <div className="flex flex-col gap-4 mb-12">
            {[
              { emoji: '🎓', text: 'Verified student accounts via university email' },
              { emoji: '💡', text: 'Offer and discover skills within your campus' },
              { emoji: '⭐', text: 'Build your reputation with ratings & reviews' },
              { emoji: '💬', text: 'Connect directly with peers in real time' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{emoji}</span>
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <Link to="/" className="mb-10 lg:hidden">
          <Logo width={28} height={28} />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1">Welcome back</h1>
            <p className="text-sm text-[#636c76] dark:text-[#848d97]">Sign in to your Skillmate account</p>
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1f2328] dark:text-[#e6edf3]">University email</label>
              <input
                type="email"
                placeholder="you@university.edu"
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
                  className="auth-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer"
                >
                  {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" className="w-4 h-4 rounded border-[#d0d7de] dark:border-[#30363d] accent-[#0969da]" />
              <span className="text-xs text-[#636c76] dark:text-[#848d97]">Remember me for 30 days</span>
            </label>

            <Button size="lg" className="w-full rounded-xl mt-2">
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
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
            <Button variant="secondary" size="lg" className="w-full rounded-xl">
              Create an account
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
