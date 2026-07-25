import api from './api'
import type { Listing } from './listings'

// ── Skill Gap ──────────────────────────────────────────────────────────────
export interface MissingSkill { skill: string; priority: number; reason: string; estimated_weeks: number }
export interface SkillGapReport {
  id: string; user_id: string; target_role: string
  present_skills: string[]; missing_skills: MissingSkill[]
  summary: string; estimated_weeks: number | null
  created_at: string; updated_at: string
}

// ── Roadmap ────────────────────────────────────────────────────────────────
export interface Milestone {
  title: string; description: string; skills: string[]
  week_start: number; week_end: number
  certifications: string[]; projects: string[]
}
export interface WeekPlan { week: number; focus: string; tasks: string[]; resources: string[] }
export interface RoadmapReport {
  id: string; user_id: string; target_role: string; version: number
  milestones: Milestone[]; weekly_plan: WeekPlan[]
  summary: string; total_weeks: number; created_at: string
}

// ── Mentor ─────────────────────────────────────────────────────────────────
export interface ConversationBrief { id: string; title: string; updated_at: string }
export interface MentorMessage { id: string; role: string; content: string; created_at: string }
export interface Conversation { id: string; title: string; created_at: string; updated_at: string; messages: MentorMessage[] }
export interface ProactiveSuggestion { type: string; message: string; action_label?: string; action_url?: string }

// ── Matching ───────────────────────────────────────────────────────────────
export interface MatchResult { listing: Listing; score: number; explanation?: string }
export interface PaginatedMatches { items: MatchResult[]; total: number }

// ── Recommendations ────────────────────────────────────────────────────────
export interface AggregateScores { overall_avg: number; avg_reliability: number; avg_professionalism: number; avg_growth: number; total_reviews: number }
export interface PublicUser { id: string; first_name: string; last_name: string; university: string | null; headline: string | null; avatar_url: string | null; is_verified: boolean; skills: { id: string; name: string; category: string }[] }
export interface ListingRecommendation { listing: Listing; vector_score: number; reputation_score: number; activity_score: number; final_score: number; reason?: string }
export interface StudentRecommendation { student: PublicUser; vector_score: number; reputation_score: number; activity_score: number; final_score: number; scores: AggregateScores }
export interface HomeFeed { recommended_listings: ListingRecommendation[]; recommended_students: StudentRecommendation[] }

// ── Proposals ──────────────────────────────────────────────────────────────
export interface ProposalResponse { id: string; owner_id: string; listing_id: string; status: string; intro: string; understanding: string; plan: string; timeline: string; pricing: string; created_at: string; updated_at: string }
export interface ProposalBrief { id: string; listing_id: string; status: string; created_at: string; updated_at: string }
export interface ProposalUpdate { intro: string; understanding: string; plan: string; timeline: string; pricing: string }

// ── Portfolio ──────────────────────────────────────────────────────────────
export interface PortfolioEntry { id: string; user_id: string; title: string; summary?: string; impact_statement?: string; technologies?: string[]; project_url?: string; image_url?: string; created_at: string; updated_at: string }
export interface PortfolioCreate { title: string; summary?: string; impact_statement?: string; technologies?: string[]; project_url?: string }
export interface AnalyzeResponse { entry: PortfolioEntry; extracted_text_length: number; source_filename: string }

// ── Company ────────────────────────────────────────────────────────────────
export interface RequirementCreate { company_name: string; role_title: string; description: string; required_skills: string[]; preferred_university?: string }
export interface RequirementResponse { id: string; posted_by: string; company_name: string; role_title: string; description: string; required_skills: string[]; preferred_university?: string; is_active: boolean; created_at: string; updated_at: string }
export interface CandidateResult { student: PublicUser; vector_score: number; reputation_score: number; activity_score: number; final_score: number; scores: AggregateScores; summary?: string }
export interface CompanyMatchResponse { requirement: RequirementResponse; candidates: CandidateResult[]; total: number }

export const aiService = {
  // Skill Gap
  async analyzeSkillGap(target_role: string): Promise<SkillGapReport> {
    const { data } = await api.post<SkillGapReport>('/skill-gap/analyze', { target_role })
    return data
  },
  async getSkillGapReports(): Promise<SkillGapReport[]> {
    const { data } = await api.get<SkillGapReport[]>('/skill-gap/')
    return data
  },

  // Roadmap
  async generateRoadmap(target_role: string): Promise<RoadmapReport> {
    const { data } = await api.post<RoadmapReport>('/roadmap/generate', { target_role })
    return data
  },
  async getLatestRoadmap(target_role: string): Promise<RoadmapReport> {
    const { data } = await api.get<RoadmapReport>(`/roadmap/${encodeURIComponent(target_role)}/latest`)
    return data
  },

  // Mentor
  async getConversations(): Promise<ConversationBrief[]> {
    const { data } = await api.get<ConversationBrief[]>('/mentor/conversations')
    return data
  },
  async getConversation(id: string): Promise<Conversation> {
    const { data } = await api.get<Conversation>(`/mentor/conversations/${id}`)
    return data
  },
  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/mentor/conversations/${id}`)
  },
  async getProactiveSuggestions(): Promise<ProactiveSuggestion[]> {
    const { data } = await api.get<ProactiveSuggestion[]>('/mentor/proactive')
    return data
  },

  // Matching
  async getMatches(limit = 10): Promise<PaginatedMatches> {
    const { data } = await api.get<PaginatedMatches>('/matching/', { params: { limit, explain: true } })
    return data
  },
  async refreshMatches(): Promise<void> {
    await api.post('/matching/refresh')
  },

  // Recommendations
  async getRecommendedListings(limit = 10): Promise<ListingRecommendation[]> {
    const { data } = await api.get<ListingRecommendation[]>('/recommendations/listings', { params: { limit } })
    return data
  },
  async getHomeFeed(): Promise<HomeFeed> {
    const { data } = await api.get<HomeFeed>('/recommendations/feed')
    return data
  },

  // Proposals
  async generateProposal(listing_id: string): Promise<ProposalResponse> {
    const { data } = await api.post<ProposalResponse>('/proposals/generate', { listing_id })
    return data
  },
  async listProposals(): Promise<ProposalBrief[]> {
    const { data } = await api.get<ProposalBrief[]>('/proposals/')
    return data
  },
  async getProposal(id: string): Promise<ProposalResponse> {
    const { data } = await api.get<ProposalResponse>(`/proposals/${id}`)
    return data
  },
  async updateProposal(id: string, payload: Partial<ProposalUpdate>): Promise<ProposalResponse> {
    const { data } = await api.patch<ProposalResponse>(`/proposals/${id}`, payload)
    return data
  },
  async sendProposal(id: string): Promise<ProposalResponse> {
    const { data } = await api.post<ProposalResponse>(`/proposals/${id}/send`)
    return data
  },

  // Portfolio
  async getMyPortfolio(userId: string): Promise<PortfolioEntry[]> {
    const { data } = await api.get<PortfolioEntry[]>(`/portfolio/user/${userId}`)
    return data
  },
  async createPortfolioEntry(payload: PortfolioCreate): Promise<PortfolioEntry> {
    const { data } = await api.post<PortfolioEntry>('/portfolio/', payload)
    return data
  },
  async updatePortfolioEntry(id: string, payload: Partial<PortfolioCreate>): Promise<PortfolioEntry> {
    const { data } = await api.patch<PortfolioEntry>(`/portfolio/${id}`, payload)
    return data
  },
  async deletePortfolioEntry(id: string): Promise<void> {
    await api.delete(`/portfolio/${id}`)
  },
  async analyzePortfolioFile(file: File): Promise<AnalyzeResponse> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<AnalyzeResponse>('/portfolio/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Company
  async postRequirement(payload: RequirementCreate): Promise<RequirementResponse> {
    const { data } = await api.post<RequirementResponse>('/company/requirements', payload)
    return data
  },
  async listRequirements(): Promise<RequirementResponse[]> {
    const { data } = await api.get<RequirementResponse[]>('/company/requirements')
    return data
  },
  async getMatches_company(requirementId: string, limit = 10): Promise<CompanyMatchResponse> {
    const { data } = await api.get<CompanyMatchResponse>(`/company/requirements/${requirementId}/matches`, { params: { limit } })
    return data
  },
  async toggleRequirement(requirementId: string): Promise<RequirementResponse> {
    const { data } = await api.post<RequirementResponse>(`/company/requirements/${requirementId}/toggle`)
    return data
  },

  // Resume
  downloadResumePdf(): void {
    const token = localStorage.getItem('skillmate_token')
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
    const a = document.createElement('a')
    a.href = `${base}/resume/pdf?token=${token}`
    a.download = 'resume.pdf'
    a.click()
  },
  downloadResumeDocx(): void {
    const token = localStorage.getItem('skillmate_token')
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
    const a = document.createElement('a')
    a.href = `${base}/resume/docx?token=${token}`
    a.download = 'resume.docx'
    a.click()
  },
}
