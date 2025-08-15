import { useChat } from "../api/hooks";
import type { FindChatParams, ChatMessage, UserBadge } from "../types/chat";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ChatListProps {
  params?: FindChatParams;
}

export function ChatList({ params = {} }: ChatListProps) {
  const { data: chats, loading, error, refetch } = useChat(params);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const chatListRef = useRef<HTMLDivElement>(null);
  const previousChatsLength = useRef(0);
  const navigate = useNavigate();

  console.log("ChatList 렌더링:", {
    params,
    chats,
    loading,
    error,
    chatsType: typeof chats,
    chatsIsArray: Array.isArray(chats),
    chatsLength: Array.isArray(chats) ? chats.length : "N/A",
  });

  // 5초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  // 컴포넌트 마운트 시 맨 아래로 스크롤
  useEffect(() => {
    if (Array.isArray(chats) && chats.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, []);

  // 스크롤 위치 감지
  useEffect(() => {
    const chatList = chatListRef.current;
    if (!chatList) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatList;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setIsScrolledToBottom(isAtBottom);
    };

    chatList.addEventListener("scroll", handleScroll);
    return () => chatList.removeEventListener("scroll", handleScroll);
  }, []);

  // 새 메시지 카운트 관리 및 자동 스크롤
  useEffect(() => {
    if (Array.isArray(chats)) {
      const currentLength = chats.length;
      const previousLength = previousChatsLength.current;

      console.log("새 메시지 감지:", {
        currentLength,
        previousLength,
        isScrolledToBottom,
        newMessageCount,
      });

      if (previousLength > 0 && currentLength > previousLength) {
        const newCount = currentLength - previousLength;
        console.log("새 메시지 개수:", newCount);

        if (!isScrolledToBottom) {
          setNewMessageCount((prev) => {
            const updated = prev + newCount;
            console.log("새 메시지 카운트 업데이트:", {
              prev,
              newCount,
              updated,
            });
            return updated;
          });
        } else {
          // 스크롤이 맨 아래에 있으면 자동으로 새 메시지로 스크롤
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      } else if (previousLength === 0 && currentLength > 0) {
        // 첫 로딩 시 맨 아래로 스크롤
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }

      previousChatsLength.current = currentLength;
    }
  }, [chats, isScrolledToBottom]);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    if (chatListRef.current) {
      const chatList = chatListRef.current;
      chatList.scrollTop = chatList.scrollHeight;
      setNewMessageCount(0);
      console.log("스크롤을 맨 아래로 이동:", {
        scrollTop: chatList.scrollTop,
        scrollHeight: chatList.scrollHeight,
        clientHeight: chatList.clientHeight,
      });
    }
  };

  // 새 메시지 알림 클릭 시 스크롤
  const handleNewMessageClick = () => {
    scrollToBottom();
  };

  // AI 분석 페이지로 이동
  const handleAnalysisClick = () => {
    navigate("/chat-analysis", { state: { chatParams: params } });
  };

  // 채팅 내역을 텍스트 파일로 추출
  const handleExportClick = () => {
    if (!Array.isArray(chats) || chats.length === 0) {
      alert("추출할 채팅 내역이 없습니다.");
      return;
    }

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "날짜 없음";
        return date.toLocaleString();
      } catch (error) {
        return "날짜 오류";
      }
    };

    // 파일명 생성
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `채팅내역_${timestamp}.txt`;

    // 채팅 내역 텍스트 생성
    let content = `=== 채팅 내역 추출 ===\n`;
    content += `추출 시간: ${now.toLocaleString()}\n`;
    content += `총 메시지 수: ${chats.length}개\n\n`;

    // 필터 정보 추가
    if (params.userIdHash) content += `사용자 ID: ${params.userIdHash}\n`;
    if (params.nickname) content += `닉네임: ${params.nickname}\n`;
    if (params.from)
      content += `시작일: ${new Date(params.from).toLocaleDateString()}\n`;
    if (params.to)
      content += `종료일: ${new Date(params.to).toLocaleDateString()}\n`;
    if (params.chatType) content += `채팅 타입: ${params.chatType}\n`;
    content += `\n=== 채팅 내용 ===\n\n`;

    // 각 채팅 메시지 추가
    chats.forEach((chat, index) => {
      const date = formatDate(chat.createdAt);
      const nickname = chat.nickname || "익명";
      const message = chat.message || "메시지 없음";
      const chatType = chat.chatType || "CHAT";

      content += `[${index + 1}] ${date}\n`;
      content += `닉네임: ${nickname}\n`;
      content += `타입: ${chatType}\n`;
      if (chat.channelName) content += `채널: ${chat.channelName}\n`;
      content += `메시지: ${message}\n`;

      // 뱃지 정보 추가
      if (chat.badge && Array.isArray(chat.badge) && chat.badge.length > 0) {
        const badgeNames = chat.badge
          .map((b: UserBadge) => b.badge.badgeId)
          .join(", ");
        content += `뱃지: ${badgeNames}\n`;
      }

      content += `\n`;
    });

    // 파일 다운로드
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("채팅 내역 추출 완료:", filename);
  };

  if (loading && !Array.isArray(chats)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: "#666",
        }}
      >
        채팅 내역을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#dc3545",
        }}
      >
        <p>채팅 내역을 불러오는데 실패했습니다.</p>
        <p>에러: {error.message}</p>
        <p>상태: {error.status}</p>
        <button
          onClick={refetch}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!chats || !Array.isArray(chats) || chats.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#666",
        }}
      >
        <p>채팅 내역이 없습니다.</p>
        <p style={{ fontSize: "12px", marginTop: "8px" }}>
          파라미터: {JSON.stringify(params)}
        </p>
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

  // 현재 사용자 ID (필터에서 가져온 userIdHash)
  const currentUserId = params.userIdHash;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {/* 새 메시지 알림 */}
      {newMessageCount > 0 && (
        <div
          onClick={handleNewMessageClick}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: "#007bff",
            color: "white",
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          새 메시지 {newMessageCount}개
        </div>
      )}

      <div
        ref={chatListRef}
        className="chat-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "20px",
          background: "white",
          borderRadius: "16px",
          maxHeight: "600px",
          overflowY: "auto",
          border: "1px solid #e9ecef",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          scrollbarWidth: "thin",
          scrollbarColor: "#e9ecef #ffffff",
        }}
      >
        {chats.map((chat: ChatMessage, index: number) => {
          console.log(`채팅 ${index}:`, chat);

          // 현재 사용자의 메시지인지 확인
          const isOwnMessage =
            currentUserId && chat.userIdHash === currentUserId;

          // 채팅 타입에 따른 CSS 클래스 생성
          const chatTypeClass = `chat-type-${chat.chatType || "CHAT"}`;

          // 채팅 타입에 따른 배경색 결정
          const getBubbleStyle = () => {
            const baseStyle = {
              background: "#f8f9fa",
              borderRadius: "20px",
              padding: "12px 16px",
              position: "relative" as const,
              wordWrap: "break-word" as const,
              maxWidth: "100%",
              border: "1px solid #e9ecef",
              transition: "all 0.2s ease",
              marginBottom: "4px",
            };

            if (chat.chatType === "DONATION") {
              return {
                ...baseStyle,
                background: "linear-gradient(135deg, #ff6b6b, #ff8e8e)",
                color: "white",
                border: "1px solid #dc3545",
                boxShadow: "0 4px 16px rgba(255, 107, 107, 0.25)",
              };
            } else if (chat.chatType === "BLIND") {
              return {
                ...baseStyle,
                background: "#f1f3f4",
                color: "#6c757d",
                border: "1px solid #dee2e6",
                opacity: 0.8,
                fontStyle: "italic",
              };
            } else if (isOwnMessage) {
              return {
                ...baseStyle,
                background: "#007bff",
                color: "white",
                border: "1px solid #0056b3",
              };
            }

            return baseStyle;
          };

          return (
            <div
              key={`${chat.userIdHash}-${chat.createdAt}-${index}`}
              className={`chat-item ${
                isOwnMessage ? "own-message" : "other-message"
              } ${chatTypeClass}`}
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "85%",
                alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                marginLeft: isOwnMessage ? "auto" : "0",
                marginRight: isOwnMessage ? "0" : "auto",
              }}
            >
              {/* 채널 정보 표시 */}
              {chat.channelName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                    padding: "6px 10px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    border: "1px solid #e9ecef",
                    fontSize: "11px",
                    color: "#6c757d",
                    maxWidth: "fit-content",
                    alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                    marginLeft: isOwnMessage ? "auto" : "0",
                    marginRight: isOwnMessage ? "0" : "auto",
                  }}
                >
                  {chat.channelImageUrl && (
                    <img
                      src={chat.channelImageUrl}
                      alt={chat.channelName}
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <span style={{ fontWeight: "600" }}>{chat.channelName}</span>
                </div>
              )}

              <div
                className="chat-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                  fontSize: "12px",
                  padding: "0 4px",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  color: "#6c757d",
                }}
              >
                {chat.badge &&
                  Array.isArray(chat.badge) &&
                  chat.badge.length > 0 && (
                    <div
                      className="badges"
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {chat.badge.map(
                        (userBadge: UserBadge, badgeIndex: number) => (
                          <img
                            key={badgeIndex}
                            src={userBadge.badge.imageUrl}
                            alt={userBadge.badge.badgeId}
                            className="badge-icon"
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                            }}
                          />
                        )
                      )}
                    </div>
                  )}
                <span
                  className="nickname"
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: isOwnMessage ? "#007bff" : "#495057",
                  }}
                >
                  {chat.nickname || "익명"}
                </span>
                <span
                  className="timestamp"
                  style={{
                    fontSize: "11px",
                    opacity: 0.6,
                    color: "#6c757d",
                  }}
                >
                  {formatDate(chat.createdAt)}
                </span>
              </div>

              <div className="chat-bubble" style={getBubbleStyle()}>
                <div
                  className="chat-content"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  <span
                    className="message"
                    style={{
                      flex: 1,
                      lineHeight: 1.5,
                      fontSize: "14px",
                      fontWeight: 400,
                      color:
                        chat.chatType === "DONATION"
                          ? "white"
                          : chat.chatType === "BLIND"
                          ? "inherit"
                          : isOwnMessage
                          ? "white"
                          : "#212529",
                    }}
                  >
                    {chat.message || "메시지 없음"}
                  </span>
                </div>
                {chat.chatType !== "CHAT" && (
                  <div
                    className="chat-type"
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "12px",
                      background:
                        chat.chatType === "DONATION"
                          ? "#dc3545"
                          : chat.chatType === "BLIND"
                          ? "#6c757d"
                          : isOwnMessage
                          ? "#0056b3"
                          : "#e9ecef",
                      color: "white",
                      fontSize: "10px",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    {chat.chatType || "UNKNOWN"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 액션 버튼들 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "20px",
          padding: "20px",
        }}
      >
        <button
          onClick={handleExportClick}
          style={{
            background: "linear-gradient(135deg, #28a745, #20c997)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(40, 167, 69, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(40, 167, 69, 0.3)";
          }}
        >
          <span style={{ fontSize: "16px" }}>📄</span>
          채팅 내역 추출하기
        </button>

        <button
          onClick={handleAnalysisClick}
          style={{
            background: "linear-gradient(135deg, #007bff, #0056b3)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(0, 123, 255, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0, 123, 255, 0.3)";
          }}
        >
          <span style={{ fontSize: "16px" }}>🤖</span>
          채팅 내역 분석하기 (AI)
        </button>
      </div>
    </div>
  );
}
