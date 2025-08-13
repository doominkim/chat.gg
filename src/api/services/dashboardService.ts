import { apiClient } from "../client";
import type { ApiResponse } from "../client";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalChats: number;
  totalMessages: number;
}

export interface DashboardOverview {
  message: string;
  timestamp: string;
  data: {
    todayChatCount: number;
    todayChatCountChange: number;
    todayCheeseCount: number;
    todayCheeseCountChange: number;
    todayPeakTime: string;
    yesterdayPeakTime: string;
  };
}

export interface ChatTypeDistribution {
  message: string;
  timestamp: string;
  date: string;
  channelId: string;
  data: {
    totalChats: number;
    distribution: {
      chat: {
        count: number;
        percentage: number;
      };
      blind: {
        count: number;
        percentage: number;
      };
      donation: {
        count: number;
        percentage: number;
      };
    };
  };
}

export interface ChatData {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageData {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
}

export interface HourlyChatTypeDistribution {
  message: string;
  timestamp: string;
  date: string;
  data: {
    hourlyData: Array<{
      hour: number;
      chatTypes: {
        chat: number;
        blind: number;
        donation: number;
      };
    }>;
    summary: {
      totalChats: number;
      peakHour: number;
      peakChats: number;
    };
  };
}

export interface ChatRanking {
  message: string;
  timestamp: string;
  date: string;
  channelId: string;
  ranking: Array<{
    rank: number;
    username: string;
    chatCount: number;
    profileImage: string;
    userId: string;
  }>;
  summary: {
    totalUsers: number;
    totalChats: number;
    averageChats: number;
    lastUpdated: string;
  };
}

export const dashboardService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },

  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    return apiClient.get<DashboardOverview>("/dashboard/overview");
  },

  async getChatTypeDistribution(): Promise<ApiResponse<ChatTypeDistribution>> {
    return apiClient.get<ChatTypeDistribution>(
      "/dashboard/chat-type/distribution"
    );
  },

  async getHourlyChatTypeDistribution(): Promise<
    ApiResponse<HourlyChatTypeDistribution>
  > {
    return apiClient.get<HourlyChatTypeDistribution>(
      "/dashboard/chat-type/distribution/hourly"
    );
  },

  async getChatRanking(params?: {
    period?: string;
    channelId?: string;
  }): Promise<ApiResponse<ChatRanking>> {
    const queryParams = new URLSearchParams();
    if (params?.period) {
      queryParams.append("period", params.period);
    }
    if (params?.channelId) {
      queryParams.append("channelId", params.channelId);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/chat-ranking?${queryString}`
      : "/dashboard/chat-ranking";

    return apiClient.get<ChatRanking>(endpoint);
  },

  async getRecentChats(limit: number = 10): Promise<ApiResponse<ChatData[]>> {
    return apiClient.get<ChatData[]>(`/dashboard/chats?limit=${limit}`);
  },

  async getChatMessages(chatId: string): Promise<ApiResponse<MessageData[]>> {
    return apiClient.get<MessageData[]>(`/dashboard/chats/${chatId}/messages`);
  },

  async getChatAnalytics(chatId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/dashboard/chats/${chatId}/analytics`);
  },
};
