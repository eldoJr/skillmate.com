import api from './api'

export interface SkillBrief { id: string; name: string; category: string }

export interface ListingOwner {
  id: string; first_name: string; last_name: string
  university: string | null; headline: string | null
  avatar_url: string | null; is_verified: boolean
}

export interface Listing {
  id: string; owner_id: string; title: string; description: string
  category: string; listing_type: string
  price: number | null; price_min: number | null; price_max: number | null
  delivery_days: number | null; cover_image: string | null
  is_active: boolean; skills: SkillBrief[]; owner: ListingOwner
  created_at: string; updated_at: string
}

export interface PaginatedListings {
  items: Listing[]; total: number; page: number; page_size: number; pages: number
}

export interface ListingCreate {
  title: string; description: string; category: string
  listing_type?: string; price?: number | null
  delivery_days?: number | null; skill_ids?: string[]
}

export const listingsService = {
  async getAll(params?: Record<string, string | number | undefined>): Promise<PaginatedListings> {
    const { data } = await api.get<PaginatedListings>('/listings/', { params })
    return data
  },
  async getMine(): Promise<Listing[]> {
    const { data } = await api.get<Listing[]>('/listings/mine')
    return data
  },
  async create(payload: ListingCreate): Promise<Listing> {
    const { data } = await api.post<Listing>('/listings/', payload)
    return data
  },
  async toggle(id: string): Promise<Listing> {
    const { data } = await api.post<Listing>(`/listings/${id}/toggle`)
    return data
  },
  async getById(id: string): Promise<Listing> {
    const { data } = await api.get<Listing>(`/listings/${id}`)
    return data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/listings/${id}`)
  },
}
