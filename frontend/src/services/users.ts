import api from './api'
import type { AuthUser } from './auth'

export interface ProfileCompletion { score: number; missing: string[] }

export interface UserUpdate {
  first_name?: string; last_name?: string; university?: string
  role?: string; headline?: string; bio?: string; portfolio_url?: string
}

export const usersService = {
  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/users/me')
    return data
  },
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
  async uploadAvatar(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<{ avatar_url: string }>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.avatar_url
  },
  async setSkills(skillIds: string[]): Promise<AuthUser> {
    const { data } = await api.put<AuthUser>('/users/me/skills', { skill_ids: skillIds })
    return data
  },
  async attachSkill(skillId: string): Promise<AuthUser> {
    const { data } = await api.post<AuthUser>(`/users/me/skills/${skillId}`)
    return data
  },
  async detachSkill(skillId: string): Promise<AuthUser> {
    const { data } = await api.delete<AuthUser>(`/users/me/skills/${skillId}`)
    return data
  },
}
