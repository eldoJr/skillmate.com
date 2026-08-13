import api from './api'

export interface Skill { id: string; name: string; category: string }
export interface SkillsByCategory { category: string; skills: Skill[] }

export const skillsService = {
  async getAll(): Promise<Skill[]> {
    const { data } = await api.get<SkillsByCategory[]>('/skills/')
    return data.flatMap((g) => g.skills)
  },
  async getAllGrouped(): Promise<SkillsByCategory[]> {
    const { data } = await api.get<SkillsByCategory[]>('/skills/')
    return data
  },
  async create(name: string, category: string = 'Custom'): Promise<Skill> {
    const { data } = await api.post<Skill>('/skills/', { name, category })
    return data
  },
}
