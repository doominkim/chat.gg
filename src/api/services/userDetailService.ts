import type { ApiResponse } from "../client";
import { apiClient } from "../client";

export interface ChatMessage {
  id: string;
  nickname: string;
  channelId: string;
  channelName: string;
  message: string;
  messageType: "text" | "emote" | "donation";
  createdAt: string;
}

export interface ChatKindsItem {
  title: string;
  value: number;
  lastUpdate?: string;
}

export interface TopStreamersItem {
  name: string;
  count: number;
  percentage?: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
}

export interface FreqWordItem {
  rank: number;
  word: string;
  count: number;
  percentage: number;
}

export interface AnalyzeLambdaResp {
  success: boolean;
  data: {
    wordCloud?: WordCloudItem[];
    frequentWords?: Array<{ word: string; count: number; percentage: number }>;
  };
  message?: string;
}

// Swagger 기반 사용자 상세 타입들
export interface UserAnalysis {
  wordCloud?: WordCloudItem[];
  frequentWords?: Array<{ word: string; count: number; percentage?: number }>;
}

export interface UserWordFrequencyItem {
  word: string;
  count: number;
  percentage?: number;
}

export interface UserChatTypeDistributionItem {
  type: string; // "text" | "emote" | "donation" 등
  count: number;
  percentage?: number;
}

export interface WatchedStreamerItem {
  name: string;
  count: number;
  percentage?: number;
}

export const userDetailService = {
  // 기존 별칭 기반 API들은 유지하되, 신규 userId 기반 엔드포인트 추가
  async getUserAnalysis(
    userId: string,
    params?: { start?: string; end?: string }
  ): Promise<ApiResponse<UserAnalysis>> {
    const qs = new URLSearchParams();
    if (params?.start) qs.set("start", params.start);
    if (params?.end) qs.set("end", params.end);
    const endpoint = qs.toString()
      ? `/user/${encodeURIComponent(userId)}/analysis?${qs}`
      : `/user/${encodeURIComponent(userId)}/analysis`;
    return apiClient.get<UserAnalysis>(endpoint);
  },

  async getUserWordFrequency(
    userId: string,
    params?: { start?: string; end?: string; topN?: number }
  ): Promise<ApiResponse<UserWordFrequencyItem[]>> {
    const qs = new URLSearchParams();
    if (params?.start) qs.set("start", params.start);
    if (params?.end) qs.set("end", params.end);
    if (typeof params?.topN === "number") qs.set("topN", String(params.topN));
    const endpoint = qs.toString()
      ? `/user/${encodeURIComponent(userId)}/word-frequency?${qs}`
      : `/user/${encodeURIComponent(userId)}/word-frequency`;
    return apiClient.get<UserWordFrequencyItem[]>(endpoint);
  },

  async getUserChatHistory(
    userId: string,
    params?: { start?: string; end?: string; channelId?: string }
  ): Promise<ApiResponse<ChatMessage[]>> {
    const qs = new URLSearchParams();
    if (params?.start) qs.set("start", params.start);
    if (params?.end) qs.set("end", params.end);
    if (params?.channelId) qs.set("channelId", params.channelId);
    const endpoint = qs.toString()
      ? `/user/${encodeURIComponent(userId)}/chat-history?${qs}`
      : `/user/${encodeURIComponent(userId)}/chat-history`;
    return apiClient.get<ChatMessage[]>(endpoint);
  },

  async getUserChatType(
    userId: string,
    params?: { start?: string; end?: string }
  ): Promise<ApiResponse<UserChatTypeDistributionItem[]>> {
    const qs = new URLSearchParams();
    if (params?.start) qs.set("start", params.start);
    if (params?.end) qs.set("end", params.end);
    const endpoint = qs.toString()
      ? `/user/${encodeURIComponent(userId)}/chat-type?${qs}`
      : `/user/${encodeURIComponent(userId)}/chat-type`;
    return apiClient.get<UserChatTypeDistributionItem[]>(endpoint);
  },

  async getUserWatchedStreamers(
    userId: string,
    params?: { start?: string; end?: string; topN?: number }
  ): Promise<ApiResponse<WatchedStreamerItem[]>> {
    const qs = new URLSearchParams();
    if (params?.start) qs.set("start", params.start);
    if (params?.end) qs.set("end", params.end);
    if (typeof params?.topN === "number") qs.set("topN", String(params.topN));
    const endpoint = qs.toString()
      ? `/user/${encodeURIComponent(userId)}/watched-streamers?${qs}`
      : `/user/${encodeURIComponent(userId)}/watched-streamers`;
    return apiClient.get<WatchedStreamerItem[]>(endpoint);
  },
};
