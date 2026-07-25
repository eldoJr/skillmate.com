import api from './api'

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name?: string          // computed client-side
  avatar_url: string | null
  university: string | null
  headline: string | null
  bio: string | null
  portfolio_url: string | null
  role: string | null
  is_verified: boolean
  skills: { id: string; name: string; category: string }[]
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  university?: string
  headline?: string
  portfolio_url?: string
  role?: string
  skills?: string[]
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // FastAPI OAuth2 expects form data for /auth/login
    const form = new URLSearchParams()
    form.append('username', payload.email)
    form.append('password', payload.password)
    const { data } = await api.post<AuthResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },
}
