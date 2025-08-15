import { useState } from "react";
import { ChatList } from "../components/ChatList";
import { ChatFilter } from "../components/ChatFilter";
import type { FindChatParams } from "../types/chat";

export function ChatHistory() {
  const [filterParams, setFilterParams] = useState<FindChatParams>({
    limit: 20,
  });

  return (
    <div className="chat-history-page">
      <h1>채팅 내역</h1>
      <ChatFilter onFilterChange={setFilterParams} />
      <ChatList params={filterParams} />
    </div>
  );
}
