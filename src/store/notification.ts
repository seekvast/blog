import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (
    type: NotificationType,
    message: string,
    title?: string,
    duration?: number
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (type, message, title, duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type, message, title, duration }
      ]
    }))

    // 自动移除通知
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }))
    }, duration)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  }
}))
