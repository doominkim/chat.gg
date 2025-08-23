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
    activeChannelCount: number;
    currentViewerCount: number;
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
  data: {
    hourlyData: Array<{
      hour: string;
      chatTypes: {
        chat: number;
        blind: number;
        donation: number;
      };
    }>;
    summary: {
      totalChats: number;
      peakHour: string;
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

export interface DonationStreamerRanking {
  message: string;
  timestamp: string;
  date: string;
  channelId: string;
  ranking: Array<{
    rank: number;
    streamerName: string;
    receivedCheese: number;
    donorCount: number;
    profileImage: string;
    streamerId: string;
  }>;
  summary: {
    totalStreamers: number;
    totalDonors: number;
    totalDonatedCheese: number;
    averageDonation: number;
    lastUpdated: string;
  };
}

export interface DonationDonorRanking {
  message: string;
  timestamp: string;
  date: string;
  channelId: string;
  ranking: Array<{
    rank: number;
    username: string;
    donatedCheese: number;
    donationCount: number;
    profileImage: string;
    donorId: string;
  }>;
  summary: {
    totalStreamers: number;
    totalDonors: number;
    totalDonatedCheese: number;
    averageDonation: number;
    lastUpdated: string;
  };
}

export const dashboardService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },

  async getDashboardOverview(
    channelId?: number
  ): Promise<ApiResponse<DashboardOverview>> {
    const queryParams = new URLSearchParams();
    if (channelId) {
      queryParams.append("channelId", channelId.toString());
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/overview?${queryString}`
      : "/dashboard/overview";
    return apiClient.get<DashboardOverview>(endpoint);
  },

  async getDashboardOverviewByDate(
    period?: string
  ): Promise<ApiResponse<DashboardOverview>> {
    const queryParams = new URLSearchParams();
    if (period) {
      queryParams.append("period", period);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/overview?${queryString}`
      : "/dashboard/overview";
    return apiClient.get<DashboardOverview>(endpoint);
  },

  async getChatTypeDistribution(
    channelId?: number
  ): Promise<ApiResponse<ChatTypeDistribution>> {
    const queryParams = new URLSearchParams();
    if (channelId) {
      queryParams.append("channelId", channelId.toString());
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/chat-type/distribution?${queryString}`
      : "/dashboard/chat-type/distribution";
    return apiClient.get<ChatTypeDistribution>(endpoint);
  },

  async getChatTypeDistributionByDate(
    start?: string,
    end?: string
  ): Promise<ApiResponse<ChatTypeDistribution>> {
    const queryParams = new URLSearchParams();
    if (start) {
      queryParams.append("start", start);
    }
    if (end) {
      queryParams.append("end", end);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/chat-type/distribution?${queryString}`
      : "/dashboard/chat-type/distribution";
    return apiClient.get<ChatTypeDistribution>(endpoint);
  },

  async getHourlyChatTypeDistribution(
    channelId?: number
  ): Promise<ApiResponse<HourlyChatTypeDistribution>> {
    const queryParams = new URLSearchParams();
    if (channelId) {
      queryParams.append("channelId", channelId.toString());
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/chat-type/distribution/hourly?${queryString}`
      : "/dashboard/chat-type/distribution/hourly";
    return apiClient.get<HourlyChatTypeDistribution>(endpoint);
  },

  async getHourlyChatTypeDistributionByDate(
    start?: string,
    end?: string
  ): Promise<ApiResponse<HourlyChatTypeDistribution>> {
    const queryParams = new URLSearchParams();
    if (start) {
      queryParams.append("start", start);
    }
    if (end) {
      queryParams.append("end", end);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/chat-type/distribution/hourly?${queryString}`
      : "/dashboard/chat-type/distribution/hourly";
    return apiClient.get<HourlyChatTypeDistribution>(endpoint);
  },

  async getChatRanking(channelId?: number): Promise<ApiResponse<ChatRanking>> {
    const queryParams = new URLSearchParams();
    if (channelId) {
      queryParams.append("channelId", channelId.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/chat-ranking?${queryString}`
      : "/dashboard/chat-ranking";

    return apiClient.get<ChatRanking>(endpoint);
  },

  async getChatRankingByDate(params?: {
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

  async getDonationStreamerRanking(
    channelId?: number
  ): Promise<ApiResponse<DonationStreamerRanking>> {
    const queryParams = new URLSearchParams();
    if (channelId) {
      queryParams.append("channelId", channelId.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/donation-streamer-ranking?${queryString}`
      : "/dashboard/donation-streamer-ranking";

    return apiClient.get<DonationStreamerRanking>(endpoint);
  },

  async getDonationStreamerRankingByDate(params?: {
    period?: string;
    channelId?: string;
  }): Promise<ApiResponse<DonationStreamerRanking>> {
    const queryParams = new URLSearchParams();
    if (params?.period) {
      queryParams.append("period", params.period);
    }
    if (params?.channelId) {
      queryParams.append("channelId", params.channelId);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/donation-streamer-ranking?${queryString}`
      : "/dashboard/donation-streamer-ranking";

    return apiClient.get<DonationStreamerRanking>(endpoint);
  },

  async getDonationDonorRanking(
    channelId?: number
  ): Promise<ApiResponse<DonationDonorRanking>> {
    const queryParams = new URLSearchParams();
    if (channelId) {
      queryParams.append("channelId", channelId.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/donation-donor-ranking?${queryString}`
      : "/dashboard/donation-donor-ranking";

    return apiClient.get<DonationDonorRanking>(endpoint);
  },

  async getDonationDonorRankingByDate(params?: {
    period?: string;
    channelId?: string;
  }): Promise<ApiResponse<DonationDonorRanking>> {
    const queryParams = new URLSearchParams();
    if (params?.period) {
      queryParams.append("period", params.period);
    }
    if (params?.channelId) {
      queryParams.append("channelId", params.channelId);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dashboard/donation-donor-ranking?${queryString}`
      : "/dashboard/donation-donor-ranking";

    return apiClient.get<DonationDonorRanking>(endpoint);
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
