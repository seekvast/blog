export const getBaseUrl = (isServer: boolean) => {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return process.env.SERVER_API_URL || "http://106.55.228.122:8200";
};

export const API_CONFIG = {
  DEFAULT_RETRY: 1,
  DEFAULT_TIMEOUT: 10000 * 10,
} as const;
