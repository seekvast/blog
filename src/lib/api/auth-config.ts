import { FetchOptions } from "./types";

export interface AuthRequiredConfig {
  paths: string[];
  skipPaths?: string[];
  methods?: string[];
  onUnauthorized?: () => void;
}

// 需要认证的API配置
export const AUTH_REQUIRED_ENDPOINTS: AuthRequiredConfig = {
  paths: [
    "/api/user/refresh-token",
    "/api/user/confirm-email",
    "/api/user/password",
    "/api/user/board",
    "/api/user/preferences",
    "/api/user/block",
    "/api/user/posts",
    "/api/board",
    "/api/discussion",
    "/api/posts",
    "/api/upload/image",
    "/api/report",
  ],
  methods: ["POST", "PUT", "DELETE", "PATCH"],
};

export const SKIP_ENDPOINTS: {
  paths: string[];
  methods?: string[];
} = {
  paths: [
    "/api/notifications",
    "/api/discussion/draft",
    "/api/notification/unread-count",
  ],
  methods: ["GET"],
};

// 检查API是否需要认证
export function needsAuth(endpoint: string, options: FetchOptions): boolean {
  const method = options.method?.toUpperCase() || "GET";
  // 检查是否需要认证
  return (
    AUTH_REQUIRED_ENDPOINTS.paths.some((authPath) =>
      endpoint.startsWith(authPath)
    ) ||
    (AUTH_REQUIRED_ENDPOINTS.methods?.includes(method) ?? false)
  );
}
