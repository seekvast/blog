// import { create } from 'zustand'
// import type { Board, Discussion } from '@/types'
// import { boardService } from '@/services/board'

// interface BoardState {
//   board: Board | null
//   discussions: Discussion[]
//   isLoading: boolean
//   isError: boolean
//   currentPage: number
//   totalPages: number
//   fetchBoard: (slug: string) => Promise<void>
//   fetchDiscussions: (slug: string, page?: number) => Promise<void>
//   reset: () => void
// }

// export const useBoardStore = create<BoardState>((set, get) => ({
//   board: null,
//   discussions: [],
//   isLoading: false,
//   isError: false,
//   currentPage: 1,
//   totalPages: 1,

//   fetchBoard: async (slug: string) => {
//     try {
//       set({ isLoading: true, isError: false })
//       const response = await boardService.getBoard(slug)
//       set({ board: response.data })
//     } catch (error) {
//       set({ isError: true })
//       console.error('Failed to fetch board:', error)
//     } finally {
//       set({ isLoading: false })
//     }
//   },

//   fetchDiscussions: async (slug: string, page = 1) => {
//     try {
//       const response = await boardService.getBoardDiscussions(slug, { page })
      
//       if (page === 1) {
//         set({ 
//           discussions: response.data.items,
//           totalPages: response.data.last_page,
//           currentPage: page
//         })
//       } else {
//         set(state => ({ 
//           discussions: [...state.discussions, ...response.data.items],
//           totalPages: response.data.last_page,
//           currentPage: page
//         }))
//       }
//     } catch (error) {
//       set({ isError: true })
//       console.error('Failed to fetch discussions:', error)
//     }
//   },

//   reset: () => {
//     set({
//       board: null,
//       discussions: [],
//       isLoading: false,
//       isError: false,
//       currentPage: 1,
//       totalPages: 1
//     })
//   }
// }))
