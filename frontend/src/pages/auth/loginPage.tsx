import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import Logo from '../../components/atoms/logo'
import Button from '../../components/atoms/button'
import ThemeToggle from '../../components/atoms/themeToggle'
import Dropdown, { DropdownItem } from '../../components/molecules/dropdown'

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
    <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center px-5 py-12 relative">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[380px]"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="mb-6">
            <Logo width={32} height={32} />
          </Link>
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

        <p className="text-xs text-[#636c76] dark:text-[#848d97] text-center mt-8">
          © {new Date().getFullYear()} Skillmate
        </p>
      </motion.div>
    </div>
  )
}
