import api from './api'

export interface Certificate {
  id: string
  user_id: string
  title: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  credential_id: string | null
  credential_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface CertificateCreate {
  title: string
  issuer: string
  issue_date: string
  expiry_date?: string | null
  credential_id?: string | null
  credential_url?: string | null
  description?: string | null
}

export interface CertificateUpdate {
  title?: string
  issuer?: string
  issue_date?: string
  expiry_date?: string | null
  credential_id?: string | null
  credential_url?: string | null
  description?: string | null
}

export const certificatesService = {
  async getMine(): Promise<Certificate[]> {
    const { data } = await api.get<Certificate[]>('/certificates/')
    return data
  },
  async getByUser(userId: string): Promise<Certificate[]> {
    const { data } = await api.get<Certificate[]>(`/certificates/user/${userId}`)
    return data
  },
  async create(payload: CertificateCreate): Promise<Certificate> {
    const { data } = await api.post<Certificate>('/certificates/', payload)
    return data
  },
  async update(certId: string, payload: CertificateUpdate): Promise<Certificate> {
    const { data } = await api.patch<Certificate>(`/certificates/${certId}`, payload)
    return data
  },
  async delete(certId: string): Promise<void> {
    await api.delete(`/certificates/${certId}`)
  },
}
