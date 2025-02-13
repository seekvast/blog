export const API_ROUTES = {
  // 看板相关
  BOARDS: {
    LIST: "/b",
    DETAIL: (id: number | string) => `/b/${id}`,
    CREATE: "/b",
    UPDATE: (id: number | string) => `/b/${id}`,
    DELETE: (id: number | string) => `/b/${id}`,
    CHILDREN: '/board/children',
  },
  
  // 帖子相关
  DISCUSSIONS: {
    LIST: '/discussions',
    DETAIL: (id: number | string) => `/discussions/${id}`,
    CREATE: '/discussion',
    UPDATE: (id: number | string) => `/discussions/${id}`,
    DELETE: (id: number | string) => `/discussions/${id}`,
  },

  // 上传相关
  UPLOAD: {
    IMAGE: '/upload/image',
  },

  // 用户相关
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
  },

  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
} as const;

// 类型定义
export type ApiRoutes = typeof API_ROUTES;
export type BoardsApiRoutes = ApiRoutes['BOARDS'];
export type DiscussionsApiRoutes = ApiRoutes['DISCUSSIONS'];
export type UploadApiRoutes = ApiRoutes['UPLOAD'];
export type UserApiRoutes = ApiRoutes['USER'];
export type AuthApiRoutes = ApiRoutes['AUTH'];
