/**
 * API configuration and environment-specific settings
 */

export const getBaseUrl = (isServer: boolean): string => {
  if (isServer) {
    return process.env.SERVER_API_URL || "http://api.kater.host";
  }
  return process.env.NEXT_PUBLIC_API_URL || "/api";
};

export const API_CONFIG = {
  DEFAULT_RETRY: 1,
  DEFAULT_TIMEOUT: 1000,
} as const;
