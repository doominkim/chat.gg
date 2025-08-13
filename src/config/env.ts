export const API_CONFIG = {
  baseURL: import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://api.f-yourchat.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
} as const;

export const LAMBDA_CONFIG = {
  analyzeUrl: import.meta.env.VITE_LAMBDA_ANALYZE_URL as string,
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
