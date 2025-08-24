import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Box,
  Grid,
} from "@cloudscape-design/components";

export default function About() {
  const navigate = useNavigate();

  const serviceFeatures = [
    {
      title: "실시간 채팅 수집",
      description:
        "라이브 스트리밍 중 발생하는 모든 채팅 메시지를 실시간으로 수집하고 저장합니다.",
      details: [
        "다양한 채팅 플랫폼 지원",
        "실시간 데이터 처리",
        "고성능 메시지 저장",
      ],
    },
    {
      title: "AI 기반 성격 분석",
      description:
        "사용자의 채팅 패턴을 분석하여 MBTI와 유사한 성격 유형을 도출합니다.",
      details: [
        "채팅 스타일 분석",
        "감정 톤 분석",
        "활동 패턴 분석",
        "개인화된 성격 리포트",
      ],
    },
    {
      title: "상세한 통계 분석",
      description:
        "채널별, 사용자별, 시간대별 다양한 관점에서 데이터를 분석합니다.",
      details: [
        "채널별 시청자 통계",
        "사용자 참여도 분석",
        "시간대별 활동 패턴",
        "채팅 유형 분포",
      ],
    },
    {
      title: "사용자 행동 분석",
      description:
        "개별 사용자의 채팅 내역과 행동 패턴을 깊이 있게 분석합니다.",
      details: [
        "개인 채팅 히스토리",
        "시청 스트리머 분석",
        "후원 패턴 분석",
        "활동 시간대 분석",
      ],
    },
  ];

  const benefits = [
    {
      title: "스트리머를 위한 인사이트",
      description:
        "시청자들의 성격과 선호도를 파악하여 더 나은 콘텐츠를 제작할 수 있습니다.",
    },
    {
      title: "데이터 기반 의사결정",
      description:
        "실제 데이터를 바탕으로 한 객관적인 분석으로 더 나은 전략을 수립할 수 있습니다.",
    },
    {
      title: "시청자 참여도 향상",
      description:
        "시청자들의 행동 패턴을 이해하여 더 효과적인 상호작용을 유도할 수 있습니다.",
    },
    {
      title: "AI 기술 활용",
      description:
        "최신 AI 기술을 활용하여 인간의 직관으로는 파악하기 어려운 패턴을 발견합니다.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "40px 20px",
      }}
    >
      <Container>
        {/* Header Section */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "24px",
            color: "white",
            marginBottom: "60px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              margin: "0 0 20px 0",
            }}
          >
            chat.gg 소개
          </h1>
          <p
            style={{
              fontSize: "20px",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.6,
              opacity: 0.9,
            }}
          >
            라이브 스트리밍 채팅 데이터를 AI로 분석하여 시청자들의 성격과 행동
            패턴을 파악하는 혁신적인 분석 플랫폼입니다.
          </p>
        </div>

        {/* Service Features */}
        <div style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "700",
                margin: "0 0 20px 0",
                color: "#2c3e50",
              }}
            >
              서비스 특징
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#7f8c8d",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              chat.gg만의 독특한 기능들을 소개합니다
            </p>
          </div>

          <SpaceBetween size="xl">
            {serviceFeatures.map((feature, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "40px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <h3
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    margin: "0 0 15px 0",
                    color: "#2c3e50",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#7f8c8d",
                    margin: "0 0 25px 0",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {feature.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      style={{
                        padding: "8px 0",
                        fontSize: "16px",
                        color: "#34495e",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#667eea",
                          marginRight: "12px",
                          fontSize: "18px",
                        }}
                      >
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </SpaceBetween>
        </div>

        {/* Benefits Section */}
        <div style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "700",
                margin: "0 0 20px 0",
                color: "#2c3e50",
              }}
            >
              서비스 혜택
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#7f8c8d",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              chat.gg를 통해 얻을 수 있는 다양한 혜택들
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
            {benefits.map((benefit, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "30px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #f0f0f0",
                  margin: "10px",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    margin: "0 0 15px 0",
                    color: "#2c3e50",
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#7f8c8d",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </Grid>
        </div>

        {/* Technology Section */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "60px 40px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #f0f0f0",
            marginBottom: "80px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "700",
                margin: "0 0 20px 0",
                color: "#2c3e50",
              }}
            >
              사용 기술
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#7f8c8d",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              최신 기술을 활용하여 정확하고 빠른 분석을 제공합니다
            </p>
          </div>

          <Grid
            gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "15px",
                }}
              >
                🤖
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  margin: "0 0 10px 0",
                  color: "#2c3e50",
                }}
              >
                AI & 머신러닝
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#7f8c8d",
                  margin: 0,
                }}
              >
                자연어 처리 및 패턴 인식
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "15px",
                }}
              >
                ⚡
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  margin: "0 0 10px 0",
                  color: "#2c3e50",
                }}
              >
                실시간 처리
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#7f8c8d",
                  margin: 0,
                }}
              >
                고성능 실시간 데이터 처리
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "15px",
                }}
              >
                🔒
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  margin: "0 0 10px 0",
                  color: "#2c3e50",
                }}
              >
                보안 & 개인정보
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#7f8c8d",
                  margin: 0,
                }}
              >
                데이터 암호화 및 보안 처리
              </p>
            </div>
          </Grid>
        </div>

        {/* CTA Section */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "24px",
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
            chat.gg와 함께 시청자들을 더 깊이 이해하세요
          </p>
          <SpaceBetween size="l" direction="horizontal">
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate("/channels")}
              style={{
                background: "white",
                color: "#667eea",
                border: "none",
                padding: "16px 32px",
                fontSize: "18px",
                fontWeight: "600",
                borderRadius: "12px",
              }}
            >
              무료로 시작하기
            </Button>
            <Button
              variant="link"
              size="large"
              onClick={() => navigate("/")}
              style={{
                color: "white",
                border: "2px solid white",
                padding: "14px 30px",
                fontSize: "18px",
                fontWeight: "600",
                borderRadius: "12px",
                background: "transparent",
              }}
            >
              홈으로 돌아가기
            </Button>
          </SpaceBetween>
        </div>
      </Container>
    </div>
  );
}
