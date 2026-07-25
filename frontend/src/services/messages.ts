import api from './api'

export interface UserBrief {
  id: string; first_name: string; last_name: string; avatar_url: string | null
}

export interface Message {
  id: string; sender: UserBrief; receiver_id: string
  content: string; is_read: boolean; created_at: string
}

export interface ConversationSummary {
  partner: UserBrief; last_message: string
  last_message_at: string; unread_count: number
}

export const messagesService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const { data } = await api.get<ConversationSummary[]>('/messages/conversations')
    return data
  },
  async getThread(partnerId: string, page = 1): Promise<Message[]> {
    const { data } = await api.get<Message[]>(`/messages/thread/${partnerId}`, { params: { page } })
    return data
  },
  async send(receiverId: string, content: string): Promise<Message> {
    const { data } = await api.post<Message>('/messages/', { receiver_id: receiverId, content })
    return data
  },
  async markRead(partnerId: string): Promise<void> {
    await api.post(`/messages/thread/${partnerId}/read`)
  },
  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ unread: number }>('/messages/unread')
    return data.unread
  },
}
