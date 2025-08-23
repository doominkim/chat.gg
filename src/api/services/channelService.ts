import { apiClient } from "../client";
import type { ApiResponse } from "../client";

export interface ChannelLiveCategory {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categoryType: string;
  liveCategory: string;
  liveCategoryValue: string;
}

export interface ChannelLive {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  liveId: number;
  liveTitle: string;
  chatChannelId: string;
  chatActive: boolean;
  status: boolean;
  liveCategory: ChannelLiveCategory;
}

export interface Channel {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  uuid: string;
  channelName: string;
  channelImageUrl: string;
  channelDescription: string;
  openLive: boolean;
  follower: number;
  isChatCollected: boolean;
  isAudioCollected: boolean;
  isCaptureCollected: boolean;
  isEnabledAi: boolean;
  channelLive: ChannelLive;
}

export interface ChannelListResponse {
  success: boolean;
  data: Channel[];
  message?: string;
  status: number;
}

class ChannelService {
  async getChannels(): Promise<ApiResponse<Channel[]>> {
    return apiClient.get<Channel[]>("/channel");
  }
}

export const channelService = new ChannelService();
