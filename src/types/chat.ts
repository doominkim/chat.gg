export enum ChatType {
  CHAT = "CHAT",
  DONATION = "DONATION",
  FOLLOW = "FOLLOW",
  SYSTEM = "SYSTEM",
  BLIND = "BLIND",
}

export interface Badge {
  scope: string;
  badgeId: string;
  imageUrl: string;
}

export interface UserBadge {
  type: string;
  badge: Badge;
}

export interface ChatMessage {
  createdAt: string;
  chatType: ChatType;
  message: string;
  userIdHash: string;
  nickname: string;
  badge: UserBadge[];
  channelName?: string;
  channelImageUrl?: string;
  payAmount?: number;
}

export interface FindChatParams {
  uuid?: string;
  chatChannelId?: string;
  limit?: number;
  from?: Date;
  to?: Date;
  message?: string;
  userIdHash?: string;
  nickname?: string;
  chatType?: ChatType;
}
