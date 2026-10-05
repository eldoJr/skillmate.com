import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import ThemeToggle from '../../components/atoms/themeToggle'
import ProgressBar from '../../components/atoms/progressBar'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../services/auth'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }   = useAuth()
  const navigate    = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/app')
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Invalid email or password.'))
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
      <div className="w-full max-w-[380px] bg-canvas-default dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default rounded-xl shadow-sm overflow-hidden">

        {/* card header */}
        <div className="px-6 pt-6 pb-5 border-b border-border-default dark:border-border-dark-default">
          <div className="w-8 h-8 rounded-lg bg-brand dark:bg-brand-dark-DEFAULT flex items-center justify-center mb-3">
            <img src="/ico.svg" alt="" width={16} height={16} className="brightness-0 invert" />
          </div>
          <h1 className="text-[17px] font-semibold text-fg-default dark:text-fg-dark-default tracking-tight">
            Welcome back
          </h1>
          <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
            Sign in to your Skillmate account
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-subtle dark:bg-danger-dark-subtle border border-danger-muted dark:border-danger-dark-muted text-[12px] text-danger-fg dark:text-danger-dark-fg">
              <span className="shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>

            {/* email */}
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-fg-default dark:text-fg-dark-default">
                Email address
              </label>
              <input
                type="text"
                placeholder="you@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-muted dark:placeholder-fg-dark-muted outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-dark-DEFAULT/20 transition-all"
              />
            </div>

            {/* password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-medium text-fg-default dark:text-fg-dark-default">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-brand dark:text-brand-dark-DEFAULT hover:underline">
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
                  className="w-full px-3 py-2 pr-9 rounded-lg text-[13px] bg-canvas-inset dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-muted dark:placeholder-fg-dark-muted outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-dark-DEFAULT/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors cursor-pointer"
                >
                  {showPassword ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-border-default dark:border-border-dark-default accent-brand cursor-pointer" />
              <span className="text-[12px] text-fg-muted dark:text-fg-dark-muted">Remember me for 30 days</span>
            </label>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-[13px] font-semibold bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* footer */}
          <p className="text-center text-[12px] text-fg-muted dark:text-fg-dark-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand dark:text-brand-dark-DEFAULT font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted text-center mt-5">
        © {new Date().getFullYear()} Skillmate. All rights reserved.
      </p>
    </div>
  )
}
