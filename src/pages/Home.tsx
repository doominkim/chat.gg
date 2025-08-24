import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from "@cloudscape-design/components";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "실시간 채팅 분석",
      description:
        "라이브 스트리밍 채팅을 실시간으로 분석하여 시청자들의 반응과 참여도를 파악합니다.",
      icon: "💬",
      color: "#667eea",
    },
    {
      title: "AI 성격 분석",
      description:
        "사용자의 채팅 패턴을 AI가 분석하여 고유한 성격 유형을 도출합니다.",
      icon: "🧠",
      color: "#764ba2",
    },
    {
      title: "채널별 통계",
      description: "각 채널별 상세한 통계와 분석 데이터를 제공합니다.",
      icon: "📊",
      color: "#f093fb",
    },
    {
      title: "사용자 상세 분석",
      description:
        "개별 사용자의 채팅 내역과 행동 패턴을 깊이 있게 분석합니다.",
      icon: "👤",
      color: "#4facfe",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              letterSpacing: "-1px",
            }}
          >
            chat.gg
          </h1>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "400",
              margin: "0 0 40px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            라이브 스트리밍 채팅 데이터를 AI로 분석하여
            <br />
            시청자들의 성격과 행동 패턴을 파악하세요
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/channels")}
              style={{
                background: "white",
                color: "#667eea",
                border: "none",
                padding: "16px 32px",
                fontSize: "18px",
                fontWeight: "600",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              시작하기
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "60px 40px",
            marginTop: "60px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "48px",
                fontWeight: "700",
                margin: "0 0 20px 0",
                color: "#2c3e50",
              }}
            >
              주요 기능
            </h2>
            <p
              style={{
                fontSize: "20px",
                color: "#7f8c8d",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              chat.gg가 제공하는 강력한 분석 도구들을 만나보세요
            </p>
          </div>

          <Grid
            gridDefinition={[
              { colspan: 6 },
              { colspan: 6 },
              { colspan: 6 },
              { colspan: 6 },
            ]}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  borderRadius: "16px",
                  background: "#f8f9fa",
                  margin: "10px",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "20px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    margin: "0 0 15px 0",
                    color: "#2c3e50",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#7f8c8d",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </Grid>
        </div>

        {/* CTA Section */}
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "white",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              margin: "0 0 20px 0",
            }}
          >
            지금 바로 시작하세요
          </h2>
          <p
            style={{
              fontSize: "18px",
              margin: "0 0 40px 0",
              opacity: 0.9,
            }}
          >
            AI 기반 채팅 분석으로 시청자들을 더 깊이 이해하세요
          </p>
          <button
            onClick={() => navigate("/channels")}
            style={{
              background: "white",
              color: "#667eea",
              border: "none",
              padding: "16px 32px",
              fontSize: "18px",
              fontWeight: "600",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            무료로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
