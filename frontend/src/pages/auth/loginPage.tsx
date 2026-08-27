import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import ThemeToggle from '../../components/atoms/themeToggle'
import ProgressBar from '../../components/atoms/progressBar'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../services/auth'

const lCls = 'font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted mb-1 block'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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

      <div className="absolute top-4 left-5 flex items-center gap-2">
        <img src="/ico.svg" alt="Skillmate" width={22} height={22} />
        <span className="font-mono text-[11px] font-bold text-fg-default dark:text-fg-dark-default tracking-tight">skillmate</span>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* terminal window */}
      <div className="w-full max-w-[400px] border border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default">

        {/* title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-fg-muted dark:text-fg-dark-muted">
              skillmate — sign in
            </span>
          </div>
          <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">auth/login</span>
        </div>

        <div className="p-6 space-y-5">

          {/* header */}
          <div>
            <p className="font-mono text-[15px] font-bold text-fg-default dark:text-fg-dark-default">welcome back</p>
            <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              sign in to your skillmate account
            </p>
          </div>

          {/* error */}
          {error && (
            <div className="px-3 py-2 border border-danger-fg dark:border-danger-dark-fg bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[10px] text-danger-fg dark:text-danger-dark-fg">
              <span className="mr-1.5">!</span>{error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className={lCls}>email</label>
              <div className="flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors">
                <span className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT px-2.5 py-2.5 border-r border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset shrink-0 select-none">$</span>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={lCls}>password</label>
                <Link to="/forgot-password" className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT hover:underline">
                  forgot password?
                </Link>
              </div>
              <div className="flex items-center border border-border-default dark:border-border-dark-default focus-within:border-brand dark:focus-within:border-brand-dark-DEFAULT transition-colors">
                <span className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT px-2.5 py-2.5 border-r border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset shrink-0 select-none">$</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-canvas-inset dark:bg-canvas-dark-inset font-mono text-[11px] text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-2.5 text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
                >
                  {showPassword ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3 h-3 border-border-default dark:border-border-dark-default accent-brand" />
              <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">remember me for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand dark:bg-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT font-mono text-[11px] text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '> signing in...' : '> sign in'}
            </button>
          </form>

          <div className="border-t border-border-default dark:border-border-dark-default pt-4 flex items-center justify-between">
            <span className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">~ new to skillmate?</span>
            <Link
              to="/register"
              className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT border border-brand dark:border-brand-dark-DEFAULT px-3 py-1.5 hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors"
            >
              create account
            </Link>
          </div>
        </div>
      </div>

      <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted text-center mt-5">
        © {new Date().getFullYear()} skillmate.com
      </p>
    </div>
  )
}
