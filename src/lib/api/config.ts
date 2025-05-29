/**
 * API configuration and environment-specific settings
 */

export const getBaseUrl = (isServer: boolean): string => {
  if (isServer) {
    return process.env.SERVER_API_URL || "http://106.55.228.122:8200";
  }
  return process.env.NEXT_PUBLIC_API_URL || "/api";
};

export const API_CONFIG = {
  DEFAULT_RETRY: 1,
  DEFAULT_TIMEOUT: 10000 * 10,
} as const;
