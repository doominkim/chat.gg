import { apiClient, ApiResponse } from "../client";

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

export const dashboardService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },

  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    return apiClient.get<DashboardOverview>("/dashboard/overview");
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
