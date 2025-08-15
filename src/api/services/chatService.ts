import { apiClient } from "../client";
import type { ChatMessage, FindChatParams } from "../../types/chat";

export const chatService = {
  async getChats(params: FindChatParams = {}): Promise<ChatMessage[]> {
    const searchParams = new URLSearchParams();

    if (params.uuid) searchParams.append("uuid", params.uuid);
    if (params.chatChannelId)
      searchParams.append("chatChannelId", params.chatChannelId);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.from) searchParams.append("from", params.from.toISOString());
    if (params.to) searchParams.append("to", params.to.toISOString());
    if (params.message) searchParams.append("message", params.message);
    if (params.userIdHash) searchParams.append("userIdHash", params.userIdHash);
    if (params.nickname) searchParams.append("nickname", params.nickname);
    if (params.chatType) searchParams.append("chatType", params.chatType);

    const endpoint = `/chat${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    console.log("chatService.getChats API 호출:", endpoint);
    console.log("chatService.getChats 파라미터:", params);

    try {
      const response = await apiClient.get<any>(endpoint);
      console.log("chatService.getChats API 응답 전체:", response);
      console.log("chatService.getChats response.data:", response.data);

      // API 응답 구조에 맞게 items 배열에서 데이터 추출
      let chatData: ChatMessage[];
      if (
        response.data &&
        response.data.items &&
        Array.isArray(response.data.items)
      ) {
        chatData = response.data.items;
        console.log("items 배열에서 데이터 추출 성공:", chatData.length, "개");
      } else if (Array.isArray(response.data)) {
        chatData = response.data;
        console.log("직접 배열 데이터 사용:", chatData.length, "개");
      } else {
        console.warn("예상치 못한 응답 구조:", response.data);
        chatData = [];
      }

      console.log("chatService.getChats 최종 반환 데이터:", chatData);
      return chatData;
    } catch (error) {
      console.error("API 호출 실패, 더미 데이터 반환:", error);

      // API 호출 실패 시 더미 데이터 반환
      const dummyData: ChatMessage[] = [
        {
          createdAt: "2025-01-13T11:41:32.408Z",
          chatType: "CHAT" as any,
          message: "안녕하세요! 오늘 날씨가 정말 좋네요.",
          userIdHash: "67fa1d509dab5fd691f6e4742132fb81",
          nickname: "웹개발자 도미닉",
          badge: [
            {
              type: "STANDARD",
              badge: {
                scope: "CHANNEL",
                badgeId: "donation_newbie",
                imageUrl:
                  "https://ssl.pstatic.net/static/nng/glive/badge/fan_03.png",
              },
            },
          ],
        },
        {
          createdAt: "2025-01-13T11:42:15.123Z",
          chatType: "CHAT" as any,
          message: "스트리밍 재미있게 보고 있어요!",
          userIdHash: "67fa1d509dab5fd691f6e4742132fb81",
          nickname: "웹개발자 도미닉",
          badge: [],
        },
      ];

      return dummyData;
    }
  },
};
