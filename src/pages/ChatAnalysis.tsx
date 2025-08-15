import { useLocation, useNavigate } from "react-router-dom";
import type { FindChatParams } from "../types/chat";

export function ChatAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const chatParams = location.state?.chatParams as FindChatParams;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            marginRight: "16px",
          }}
        >
          ← 뒤로 가기
        </button>
        <h1 style={{ margin: "0", color: "#495057" }}>채팅 내역 AI 분석</h1>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #007bff, #0056b3)",
              color: "white",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🤖
          </div>
          <div>
            <h2 style={{ margin: "0", color: "#495057" }}>AI 분석 중...</h2>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#6c757d",
                fontSize: "14px",
              }}
            >
              채팅 데이터를 분석하여 인사이트를 제공합니다
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#f8f9fa",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{ color: "#495057", marginTop: "0", marginBottom: "15px" }}
          >
            분석 대상 정보
          </h3>
          {chatParams?.userIdHash && (
            <div>
              <strong>사용자 ID:</strong> {chatParams.userIdHash}
            </div>
          )}
          {chatParams?.nickname && (
            <div>
              <strong>닉네임:</strong> {chatParams.nickname}
            </div>
          )}
          {chatParams?.from && (
            <div>
              <strong>시작일:</strong>{" "}
              {new Date(chatParams.from).toLocaleDateString()}
            </div>
          )}
          {chatParams?.to && (
            <div>
              <strong>종료일:</strong>{" "}
              {new Date(chatParams.to).toLocaleDateString()}
            </div>
          )}
          {chatParams?.chatType && (
            <div>
              <strong>채팅 타입:</strong> {chatParams.chatType}
            </div>
          )}
          {chatParams?.limit && (
            <div>
              <strong>조회 개수:</strong> {chatParams.limit}개
            </div>
          )}
        </div>

        <div
          style={{
            background: "#e3f2fd",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid #bbdefb",
          }}
        >
          <h3
            style={{ color: "#1976d2", marginTop: "0", marginBottom: "15px" }}
          >
            분석 기능 준비 중
          </h3>
          <p style={{ margin: "0", color: "#1976d2" }}>
            고급 AI 기능이 곧 제공될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatAnalysis;
