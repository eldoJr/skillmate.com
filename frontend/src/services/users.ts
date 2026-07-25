import api from './api'
import type { AuthUser } from './auth'

export interface ProfileCompletion { score: number; missing: string[] }

export interface UserUpdate {
  first_name?: string; last_name?: string; university?: string
  role?: string; headline?: string; bio?: string; portfolio_url?: string
}

export const usersService = {
  async updateMe(payload: UserUpdate): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>('/users/me', payload)
    return data
  },
  async getCompletion(): Promise<ProfileCompletion> {
    const { data } = await api.get<ProfileCompletion>('/users/me/completion')
    return data
  },
  async getPublicProfile(userId: string) {
    const { data } = await api.get(`/users/${userId}`)
    return data
  },
}
