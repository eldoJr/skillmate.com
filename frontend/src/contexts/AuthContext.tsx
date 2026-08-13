import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, type AuthUser, type LoginPayload, type RegisterPayload } from '../services/auth'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateUser: (u: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('skillmate_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillmate_token'))
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('skillmate_token') && !localStorage.getItem('skillmate_user'))

  // Rehydrate user from /auth/me on mount if token exists but user is stale
  useEffect(() => {
    if (!token) return
    authService.me()
      .then((u) => {
        setUser(u)
        localStorage.setItem('skillmate_user', JSON.stringify(u))
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persist = (t: string, u: AuthUser, rt?: string) => {
    const enriched = { ...u, full_name: `${u.first_name} ${u.last_name}`.trim() }
    localStorage.setItem('skillmate_token', t)
    if (rt) localStorage.setItem('skillmate_refresh_token', rt)
    localStorage.setItem('skillmate_user', JSON.stringify(enriched))
    setToken(t)
    setUser(enriched)
  }

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload)
    persist(res.access_token, res.user, res.refresh_token)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload)
    persist(res.access_token, res.user, res.refresh_token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('skillmate_token')
    localStorage.removeItem('skillmate_user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((u: AuthUser) => {
    const enriched = { ...u, full_name: `${u.first_name} ${u.last_name}`.trim() }
    localStorage.setItem('skillmate_user', JSON.stringify(enriched))
    setUser(enriched)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
