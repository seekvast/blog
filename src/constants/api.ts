export const API_ROUTES = {
  // 看板相关
  BOARDS: {
    LIST: '/api/boards',
    DETAIL: (id: number | string) => `/api/boards/${id}`,
    CREATE: '/api/boards',
    UPDATE: (id: number | string) => `/api/boards/${id}`,
    DELETE: (id: number | string) => `/api/boards/${id}`,
    CHILDREN: '/api/board/children',
  },
  
  // 帖子相关
  DISCUSSIONS: {
    LIST: '/api/discussions',
    DETAIL: (id: number | string) => `/api/discussions/${id}`,
    CREATE: '/api/discussion',
    UPDATE: (id: number | string) => `/api/discussions/${id}`,
    DELETE: (id: number | string) => `/api/discussions/${id}`,
  },

  // 上传相关
  UPLOAD: {
    IMAGE: '/api/upload/image',
  },

  // 用户相关
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
  },

  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
} as const;

// 类型定义
export type ApiRoutes = typeof API_ROUTES;
export type BoardsApiRoutes = ApiRoutes['BOARDS'];
export type DiscussionsApiRoutes = ApiRoutes['DISCUSSIONS'];
export type UploadApiRoutes = ApiRoutes['UPLOAD'];
export type UserApiRoutes = ApiRoutes['USER'];
export type AuthApiRoutes = ApiRoutes['AUTH'];
