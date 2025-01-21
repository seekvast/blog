import { create } from 'zustand'
import { logger, persist } from './middleware'
import type { UIState } from './types'

const initialState = {
  theme: 'light' as const,
  sidebarOpen: false,
  notifications: []
}

export const useUIStore = create<UIState>()(
  logger(
    persist({
      name: 'ui',
      whitelist: ['theme']
    })((set) => ({
      ...initialState,

      setTheme: (theme) => {
        set({ theme })
        // 同步更新 HTML 的 class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleSidebar: () => 
        set(state => ({ sidebarOpen: !state.sidebarOpen })),

      addNotification: (type, message) => 
        set(state => ({
          notifications: [
            ...state.notifications,
            {
              id: Date.now().toString(),
              type,
              message
            }
          ]
        })),

      removeNotification: (id) => 
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

      reset: () => set(initialState)
    }))
  )
)

// 选择器
export const selectTheme = (state: UIState) => state.theme
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen
export const selectNotifications = (state: UIState) => state.notifications
