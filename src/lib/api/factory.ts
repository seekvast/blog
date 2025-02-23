import { http } from "./http";
import type {
  Attachment,
  Pagination,
  QueryParams,
  UploadResponse,
  Category,
} from "@/types/common";
import type {
  Discussion,
  Board,
  Post,
  BoardChild,
  LoginResponse,
  User,
} from "@/types";
import { signIn } from "next-auth/react";

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
    },
    users: {
      login: (data: any) => http.post<User>(`${prefix}/login`, data),
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
      updateRule: (data: any) =>
        http.patch<Board>(`${prefix}/board/rule`, data),
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
        http.get<Pagination<Post>>(`${prefix}/discussion/posts`, params, {
          next,
        }),

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
