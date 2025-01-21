import { api } from '@/lib/api'

export const authService = {
  logout: () => 
    api.post<void>('/api/auth/logout'),
}
