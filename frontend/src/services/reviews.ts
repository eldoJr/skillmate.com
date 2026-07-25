import api from './api'

export interface ReviewerBrief {
  id: string; first_name: string; last_name: string; avatar_url: string | null
}

export interface Review {
  id: string; reviewer: ReviewerBrief; reviewee_id: string
  listing_id: string | null
  reliability_score: number; professionalism_score: number; growth_score: number
  comment: string | null; created_at: string
}

export interface AggregateScores {
  total_reviews: number; avg_reliability: number
  avg_professionalism: number; avg_growth: number; overall_avg: number
}

export interface PaginatedReviews {
  items: Review[]; total: number; page: number; pages: number
}

export const reviewsService = {
  async getForUser(userId: string, page = 1): Promise<PaginatedReviews> {
    const { data } = await api.get<PaginatedReviews>(`/reviews/user/${userId}`, { params: { page } })
    return data
  },
  async getAggregate(userId: string): Promise<AggregateScores> {
    const { data } = await api.get<AggregateScores>(`/reviews/user/${userId}/aggregate`)
    return data
  },
  async submit(payload: {
    reviewee_id: string; listing_id?: string
    reliability_score: number; professionalism_score: number
    growth_score: number; comment?: string
  }): Promise<Review> {
    const { data } = await api.post<Review>('/reviews/', payload)
    return data
  },
}
