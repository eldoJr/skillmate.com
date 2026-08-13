import api from './api'

export interface PortfolioEntry {
  id: string; userId: string; title: string; summary: string | null
  impactStatement: string | null; technologies: string[] | null
  projectUrl: string | null; imageUrl: string | null
  createdAt: string; updatedAt: string
}

export interface PortfolioCreate {
  title: string; summary?: string; impact_statement?: string
  technologies?: string[]; project_url?: string
}

export const portfolioService = {
  async getByUser(userId: string): Promise<PortfolioEntry[]> {
    const { data } = await api.get<PortfolioEntry[]>(`/portfolio/user/${userId}`)
    return data
  },
  async create(payload: PortfolioCreate): Promise<PortfolioEntry> {
    const { data } = await api.post<PortfolioEntry>('/portfolio/', payload)
    return data
  },
  async update(id: string, payload: Partial<PortfolioCreate>): Promise<PortfolioEntry> {
    const { data } = await api.patch<PortfolioEntry>(`/portfolio/${id}`, payload)
    return data
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/portfolio/${id}`)
  },
  async uploadImage(id: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<{ image_url: string }>(`/portfolio/${id}/image`, form)
    return data.image_url
  },
}
