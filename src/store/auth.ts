import { create } from 'zustand'
import { logger, persist } from './middleware'
import type { AuthState } from './types'
import { userService } from '@/services'

const initialState = {
  user: null,
  isLoading: false,
  error: null
}

export const useAuthStore = create<AuthState>()(
  logger(
    persist({
      name: 'auth',
      whitelist: ['user']
    })((set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await userService.getCurrentUser()
          set({ user, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        
        try {
          // 调用登出 API
          set({ user: null, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
          throw error
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await userService.updateProfile(data)
          set({ user, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
          throw error
        }
      }
    }))
  )
)

// 选择器
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => !!state.user
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectError = (state: AuthState) => state.error
