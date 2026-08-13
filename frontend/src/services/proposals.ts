import api from './api'

export interface ProposalResponse {
  id: string; ownerId: string; listingId: string; status: string
  intro: string; understanding: string; plan: string; timeline: string; pricing: string
  createdAt: string; updatedAt: string
}

export interface ProposalBrief {
  id: string; listingId: string; status: string; createdAt: string; updatedAt: string
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
  async create(payload: { listing_id: string; intro: string; understanding: string; plan: string; timeline: string; pricing: string }): Promise<ProposalResponse> {
    const { data } = await api.post<ProposalResponse>('/proposals/', payload)
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
