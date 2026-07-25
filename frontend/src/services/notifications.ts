import api from './api'

export interface Notification {
  id: string; type: string; title: string
  body: string | null; is_read: boolean; created_at: string
}

export interface PaginatedNotifications {
  items: Notification[]; total: number; page: number; pages: number
}

export const notificationsService = {
  async getAll(page = 1): Promise<PaginatedNotifications> {
    const { data } = await api.get<PaginatedNotifications>('/notifications/', { params: { page } })
    return data
  },
  async markRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`)
  },
  async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all')
  },
  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ unread: number }>('/notifications/unread')
    return data.unread
  },
}
