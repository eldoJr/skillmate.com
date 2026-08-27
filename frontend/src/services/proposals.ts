import api from './api'

export interface ProposalResponse {
  id: string; owner_id: string; listing_id: string; status: string
  intro: string; understanding: string; plan: string; timeline: string; pricing: string
  created_at: string; updated_at: string
}

export interface ProposalBrief {
  id: string; listing_id: string; status: string; created_at: string; updated_at: string
}

export const proposalsService = {
  async list(): Promise<ProposalBrief[]> {
    const { data } = await api.get<ProposalBrief[]>('/proposals/')
    return data
  },
  async get(id: string): Promise<ProposalResponse> {
    const { data } = await api.get<ProposalResponse>(`/proposals/${id}`)
    return data
  },
  async update(id: string, payload: Partial<Pick<ProposalResponse, 'intro' | 'understanding' | 'plan' | 'timeline' | 'pricing'>>): Promise<ProposalResponse> {
    const { data } = await api.patch<ProposalResponse>(`/proposals/${id}`, payload)
    return data
  },
  async send(id: string): Promise<ProposalResponse> {
    const { data } = await api.post<ProposalResponse>(`/proposals/${id}/send`)
    return data
  },
}
