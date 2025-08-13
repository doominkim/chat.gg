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
    persona?: {
      favoriteStreamers?: Array<{ name: string; score: number }>;
      traits?: Array<{ text: string; value: number }>;
    };
  };
  message?: string;
}

export const userDetailService = {
  async getChatKinds(
    nickname: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ChatKindsItem[]>> {
    const endpoint = `/user/chat-kinds?nickname=${encodeURIComponent(
      nickname
    )}&start=${startDate}&end=${endDate}`;
    return apiClient.get<ChatKindsItem[]>(endpoint);
  },

  async getTopStreamers(
    nickname: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<TopStreamersItem[]>> {
    const endpoint = `/user/top-streamers?nickname=${encodeURIComponent(
      nickname
    )}&start=${startDate}&end=${endDate}`;
    return apiClient.get<TopStreamersItem[]>(endpoint);
  },

  async getChatHistory(
    nickname: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ChatMessage[]>> {
    const endpoint = `/user/chat-history?nickname=${encodeURIComponent(
      nickname
    )}&start=${startDate}&end=${endDate}`;
    return apiClient.get<ChatMessage[]>(endpoint);
  },

  async analyzeUser(
    nickname: string,
    startDate: string,
    endDate: string,
    lambdaUrl?: string
  ): Promise<AnalyzeLambdaResp> {
    if (!lambdaUrl) {
      throw new Error("Lambda 분석 URL이 설정되지 않았습니다.");
    }

    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname,
        startDate,
        endDate,
        tasks: ["wordCloud", "frequentWords", "persona"],
        topN: 10,
        maxItems: 60,
        excludeEmotes: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lambda 분석 요청 실패: ${response.status}`);
    }

    return response.json();
  },
};
