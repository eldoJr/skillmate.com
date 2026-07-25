import api from './api'

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
