import { useChat } from "../api/hooks";
import type { FindChatParams, ChatMessage, UserBadge } from "../types/chat";

interface ChatListProps {
  params?: FindChatParams;
}

export function ChatList({ params = {} }: ChatListProps) {
  const { data: chats, loading, error, refetch } = useChat(params);

  console.log("ChatList 렌더링:", {
    params,
    chats,
    loading,
    error,
    chatsType: typeof chats,
    chatsIsArray: Array.isArray(chats),
    chatsLength: Array.isArray(chats) ? chats.length : "N/A",
  });

  if (loading) {
    return <div>채팅 내역을 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div>
        <p>채팅 내역을 불러오는데 실패했습니다.</p>
        <p>에러: {error.message}</p>
        <p>상태: {error.status}</p>
        <button onClick={refetch}>다시 시도</button>
      </div>
    );
  }

  if (!chats || !Array.isArray(chats) || chats.length === 0) {
    return (
      <div>
        <p>채팅 내역이 없습니다.</p>
        <p>파라미터: {JSON.stringify(params)}</p>
        <p>chats 값: {JSON.stringify(chats)}</p>
      </div>
    );
  }

  console.log("ChatList 채팅 데이터 렌더링:", chats);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "날짜 없음";
      }
      return date.toLocaleString();
    } catch (error) {
      console.warn("Date parsing error:", error, "for date:", dateString);
      return "날짜 오류";
    }
  };

  return (
    <div className="chat-list">
      {chats.map((chat: ChatMessage, index: number) => {
        console.log(`채팅 ${index}:`, chat);
        return (
          <div
            key={`${chat.userIdHash}-${chat.createdAt}-${index}`}
            className="chat-item"
          >
            <div className="chat-header">
              <span className="nickname">{chat.nickname || "익명"}</span>
              <span className="timestamp">{formatDate(chat.createdAt)}</span>
            </div>
            <div className="chat-content">
              <span className="message">{chat.message || "메시지 없음"}</span>
              {chat.badge &&
                Array.isArray(chat.badge) &&
                chat.badge.length > 0 && (
                  <div className="badges">
                    {chat.badge.map(
                      (userBadge: UserBadge, badgeIndex: number) => (
                        <img
                          key={badgeIndex}
                          src={userBadge.badge.imageUrl}
                          alt={userBadge.badge.badgeId}
                          className="badge-icon"
                        />
                      )
                    )}
                  </div>
                )}
            </div>
            <div className="chat-type">{chat.chatType || "UNKNOWN"}</div>
          </div>
        );
      })}
    </div>
  );
}
