import { useCallback } from "react";
import { useApi } from "./useApi";
import { chatService } from "../services/chatService";
import type { ChatMessage, FindChatParams } from "../../types/chat";
import type { ApiResponse } from "../client";

export function useChat(params: FindChatParams = {}) {
  const fetchChats = useCallback(async (): Promise<
    ApiResponse<ChatMessage[]>
  > => {
    const data = await chatService.getChats(params);
    return {
      data,
      status: 200,
    };
  }, [params]);

  return useApi(fetchChats, [fetchChats]);
}
