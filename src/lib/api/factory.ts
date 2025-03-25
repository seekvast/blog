import { http } from "./http";
import type {
  Attachment,
  Pagination,
  QueryParams,
  Category,
} from "@/types/common";
import type {
  Discussion,
  Board,
  Post,
  BoardChild,
  LoginResponse,
  User,
  BoardRule,
  BoardUser,
  BoardBlacklist,
  Report,
  PollVoter,
  BoardHistory,
} from "@/types";
import { Draft } from "@/types/draft";

export interface ApiOptions {
  prefix?: string;
  next?: {
    revalidate?: number;
  };
}

export function createApi(options: ApiOptions = {}) {
  const { prefix = "", next } = options;
  return {
    common: {
      categories: () =>
        http.get<Category[]>(`${prefix}/categories`, undefined, { next }),
      parse: (data: any) => http.post<any>(`${prefix}/parse`, data),
      preview: (data: any) => http.post<any>(`${prefix}/preview`, data),
    },
    users: {
      login: (data: any) => http.post<User>(`${prefix}/login`, data),
      logout: () => http.get<void>(`${prefix}/logout`, undefined, { next }),
      signUp: (data: any) => http.post<User>(`${prefix}/user`, data),
      list: (params?: QueryParams) =>
        http.get<Pagination<User>>(`${prefix}/users`, params, { next }),

      get: (params: any) =>
        http.get<User>(`${prefix}/user/profile`, params, { next }),

      me: () => http.get<User>(`${prefix}/user/me`, undefined, { next }),

      update: (data: any) => http.patch<User>(`${prefix}/user`, data),
      updateBirthday: (data: { birthday: string }) =>
        http.patch<User>(`${prefix}/user/birthday`, data),
      changePassword: (data: any) =>
        http.patch<void>(`${prefix}/user/password`, data),
      joinBoard: (data: any) => http.post<any>(`${prefix}/user/board`, data),
      saveCategory: (data: any) =>
        http.post<any>(`${prefix}/user/category`, data),
      getCategory: (params?: QueryParams) =>
        http.get<any>(`${prefix}/user/category`, params, { next }),
      block: (data: any) => http.post<any>(`${prefix}/user/block`, data),
    },

    boards: {
      list: (params?: QueryParams) =>
        http.get<Pagination<Board>>(`${prefix}/boards`, params, { next }),

      get: (params: any) =>
        http.get<Board>(`${prefix}/board`, params, { next }),

      getChildren: (boardId: number) =>
        http.get<Pagination<BoardChild>>(
          `${prefix}/board/children?board_id=${boardId}`,
          undefined,
          { next }
        ),
      create: (data: any) => http.post<Board>(`${prefix}/board`, data),
      update: (data: any) => http.post<Board>(`${prefix}/board`, data),
      delete: (slug: string) => http.delete<void>(`${prefix}/board/${slug}`),
      saveChild: (data: any) => http.post<Board>(`${prefix}/board/child`, data),
      updateChild: (slug: string, data: any) =>
        http.patch<Board>(`${prefix}/board/${slug}`, data),
      deleteChild: (data: any) =>
        http.delete<void>(`${prefix}/board/child`, data),
      saveRule: (data: any) => http.post<Board>(`${prefix}/board/rule`, data),
      getRules: (data: any) =>
        http.get<BoardRule[]>(`${prefix}/board/rules`, data),
      deleteRule: (data: any) =>
        http.delete<void>(`${prefix}/board/rule`, data),
      getMembers: (data: any) =>
        http.get<Pagination<User>>(`${prefix}/board/users`, data),
      manageUser: (data: any) =>
        http.post<BoardUser>(`${prefix}/board/manage-user`, data),
      changeUserRole: (data: any) =>
        http.post<BoardUser>(`${prefix}/board/user-role`, data),
      getBlacklist: (data: any) =>
        http.get<Pagination<BoardBlacklist>>(`${prefix}/board/blacklist`, data),
      getHistory: (data: any) =>
        http.get<Pagination<BoardHistory>>(`${prefix}/board/history`, data),
      getManagers: (data: any) =>
        http.get<BoardUser[]>(`${prefix}/board/managers`, data),
      approve: (data: any) => http.post<any>(`${prefix}/board/approve`, data),
      join: (data: any) => http.post<any>(`${prefix}/board/join`, data),
      recommend: (params?: QueryParams) =>
        http.get<Board[]>(`${prefix}/board/recommend`, params, { next }),
    },

    discussions: {
      list: (params?: QueryParams) =>
        http.get<Pagination<Discussion>>(`${prefix}/discussions`, params, {
          next,
        }),

      get: (slug: string) =>
        http.get<Discussion>(`${prefix}/discussion?slug=${slug}`, undefined, {
          next,
        }),
      getRaw: (slug: string) =>
        http.get<Discussion>(`${prefix}/discussion/raw?slug=${slug}`, undefined, {
          next,
        }),

      create: (data: any) =>
        http.post<Discussion>(`${prefix}/discussions`, data),
      createPost: (data: any) =>
        http.post<Post>(`${prefix}/discussion/post`, data),
      update: (slug: string, data: any) =>
        http.patch<Discussion>(`${prefix}/discussions/${slug}`, data),
      changeBoard: (data: any) =>
        http.put<Discussion>(`${prefix}/discussion/board`, data),
      changePostType: (data: any) =>
        http.put<Discussion>(`${prefix}/discussion/post-type`, data),
      setting: (data: any) =>
        http.put<Discussion>(`${prefix}/discussion/setting`, data),
      delete: (data: any) => http.delete(`${prefix}/discussion`, data),
      draft: () =>
        http.get<Draft>(`${prefix}/discussion/draft`, undefined, { next }),
      saveDraft: (data: any) =>
        http.post<Draft>(`${prefix}/discussion/draft`, data),
      posts: (params?: QueryParams) =>
        http.get<Pagination<Post>>(`${prefix}/discussion/posts`, params, {
          next,
        }),

      like: (slug: string) =>
        http.post<Discussion>(`${prefix}/discussions/${slug}/like`),

      unlike: (slug: string) =>
        http.delete(`${prefix}/discussions/${slug}/like`),

      store: (data: any) => http.post<Discussion>(`${prefix}/discussion`, data),
      saveBookmark: (data: any) =>
        http.post<any>(`${prefix}/discussion/bookmark`, data),
      saveFollow: (data: any) =>
        http.post<any>(`${prefix}/discussion/follow`, data),
      votePoll: (data: any) =>
        http.post<any>(`${prefix}/discussion/vote-poll`, data),
      getPollVotes: (params?: QueryParams) =>
        http.get<Pagination<PollVoter>>(
          `${prefix}/discussion/poll-votes`,
          params,
          { next }
        ),
      getRandom: () =>
        http.get<Discussion[]>(`${prefix}/discussion/random`, undefined, {
          next,
        }),
    },

    posts: {
      list: (params?: QueryParams) =>
        http.get<Pagination<Post>>(`${prefix}/posts`, params, { next }),

      get: (slug: string) =>
        http.get<Post>(`${prefix}/posts/${slug}`, undefined, { next }),

      create: (data: any) => http.post<Post>(`${prefix}/posts`, data),

      update: (slug: string, data: any) =>
        http.patch<Post>(`${prefix}/posts/${slug}`, data),

      delete: (data: any) => http.delete(`${prefix}/post`, data),

      updatePost: (data: any) => http.put<Post>(`${prefix}/post`, data),
      vote: (data: any) => http.post<any>(`${prefix}/post/vote`, data),
    },

    upload: {
      image: (data: any) =>
        http.post<Attachment>(`${prefix}/upload/image`, data),
    },

    reports: {
      create: (data: any) => http.post<any>(`${prefix}/report`, data),
      list: (params?: QueryParams) =>
        http.get<Pagination<Report>>(`${prefix}/reports`, params, { next }),
      get: (params: any) =>
        http.get<Report>(`${prefix}/report`, params, { next }),
    },
  };
}
