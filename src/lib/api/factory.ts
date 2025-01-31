import { http } from "./http";
import type { Attachment, Pagination, QueryParams, UploadResponse } from "@/types/common";
import type {
  Discussion,
  Board,
  Post,
  BoardChild,
  LoginResponse,
  User,
} from "@/types";

export interface ApiOptions {
  prefix?: string;
  next?: {
    revalidate?: number;
  };
}

export function createApi(options: ApiOptions = {}) {
  const { prefix = "", next } = options;
  return {
    users: {
      login: (data: any) => http.post<LoginResponse>(`${prefix}/login`, data),
      list: (params?: QueryParams) =>
        http.get<Pagination<User>>(`${prefix}/users`, params, { next }),

      get: (id: number) =>
        http.get<User>(`${prefix}/users/${id}`, undefined, { next }),

      me: () => http.get<User>(`${prefix}/users/me`, undefined, { next }),

      updateProfile: (data: any) =>
        http.patch<User>(`${prefix}/users/me`, data),

      changePassword: (data: any) =>
        http.post<void>(`${prefix}/users/me/password`, data),
    },

    boards: {
      list: (params?: QueryParams) =>
        http.get<Pagination<Board>>(`${prefix}/boards`, params, { next }),

      get: (slug: string) =>
        http.get<Board>(`${prefix}/boards/${slug}`, undefined, { next }),

      getChildren: (boardId: number) =>
        http.get<Pagination<BoardChild>>(
          `${prefix}/board/children?board_id=${boardId}`,
          undefined,
          { next }
        ),
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

      create: (data: any) =>
        http.post<Discussion>(`${prefix}/discussions`, data),
      createPost: (data: any) =>
        http.post<Post>(`${prefix}/discussion/post`, data),
      update: (slug: string, data: any) =>
        http.patch<Discussion>(`${prefix}/discussions/${slug}`, data),

      delete: (slug: string) => http.delete(`${prefix}/discussions/${slug}`),

      posts: (params?: QueryParams) =>
        http.get<Pagination<Post>>(
          `${prefix}/discussion/posts`,
          params,
          { next }
        ),

      like: (slug: string) =>
        http.post<Discussion>(`${prefix}/discussions/${slug}/like`),

      unlike: (slug: string) =>
        http.delete(`${prefix}/discussions/${slug}/like`),
    },

    posts: {
      list: (params?: QueryParams) =>
        http.get<Pagination<Post>>(`${prefix}/posts`, params, { next }),

      get: (slug: string) =>
        http.get<Post>(`${prefix}/posts/${slug}`, undefined, { next }),

      create: (data: any) => http.post<Post>(`${prefix}/posts`, data),

      update: (slug: string, data: any) =>
        http.patch<Post>(`${prefix}/posts/${slug}`, data),

      delete: (slug: string) => http.delete(`${prefix}/posts/${slug}`),
    },

    upload: {
      image: (data: any) =>
        http.post<Attachment>(`${prefix}/upload/image`, data),
    },
  };
}
