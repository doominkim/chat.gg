import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Spinner,
  Alert,
  Button,
} from "@cloudscape-design/components";
import { useApi } from "../api/hooks";
import { userDetailService } from "../api/services";
import type { PersonalityAnalysis } from "../api/services/userDetailService";

const fmtNumber = (n: number) => n.toLocaleString("ko-KR");

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "success";
  if (confidence >= 0.6) return "info";
  if (confidence >= 0.4) return "pending";
  return "error";
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 0.8) return "높음";
  if (confidence >= 0.6) return "보통";
  if (confidence >= 0.4) return "낮음";
  return "매우 낮음";
};

export default function PersonalityAnalysis() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const personalityAnalysisApiCall = useCallback(
    () => userDetailService.getPersonalityAnalysis(userId!),
    [userId]
  );

  const {
    data: analysisData,
    loading,
    error,
    refetch,
  } = useApi<PersonalityAnalysis>(personalityAnalysisApiCall, []);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("분석 시작 실패:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!userId) {
    return (
      <Container>
        <Alert type="error" header="오류">
          사용자 ID가 없습니다.
        </Alert>
      </Container>
    );
  }

  if (loading || isAnalyzing) {
    return (
      <SpaceBetween size="l">
        <Container>
          <Header variant="h1">AI 성격 분석</Header>
          <Box textAlign="center" padding="xl">
            <Box
              fontSize="heading-l"
              color="text-status-info"
              margin={{ bottom: "l" }}
            >
              AI가 사용자의 채팅 패턴을 분석하고 있습니다...
            </Box>
            <Spinner size="large" />
            <Box
              fontSize="body-m"
              color="text-body-secondary"
              margin={{ top: "m", bottom: "m" }}
            >
              분석 중 (약 2-3분 소요)
            </Box>
            <Box
              fontSize="body-s"
              color="text-body-secondary"
              margin={{ top: "m" }}
            >
              채팅 내역, 시청 패턴, 활동 시간 등을 종합적으로 분석하여
              <br />
              사용자의 고유한 성격을 파악하고 있습니다.
            </Box>
          </Box>
        </Container>
      </SpaceBetween>
    );
  }

  if (error) {
    return (
      <SpaceBetween size="l">
        <Container>
          <Header variant="h1">AI 성격 분석</Header>
          <Alert type="error" header="분석 실패">
            {error.message}
          </Alert>
          <Box textAlign="center" padding="xl">
            <Button onClick={handleStartAnalysis} loading={isAnalyzing}>
              다시 분석하기
            </Button>
          </Box>
        </Container>
      </SpaceBetween>
    );
  }

  if (!analysisData) {
    return (
      <SpaceBetween size="l">
        <Container>
          <Header variant="h1">AI 성격 분석</Header>
          <Box textAlign="center" padding="xl">
            <Box fontSize="heading-l" margin={{ bottom: "l" }}>
              AI 성격 분석을 시작해보세요
            </Box>
            <Box
              fontSize="body-m"
              color="text-body-secondary"
              margin={{ bottom: "xl" }}
            >
              사용자의 채팅 패턴을 분석하여 고유한 성격을 파악합니다.
            </Box>
            <Button onClick={handleStartAnalysis} loading={isAnalyzing}>
              분석 시작하기
            </Button>
          </Box>
        </Container>
      </SpaceBetween>
    );
  }

  const { data } = analysisData;

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.6,
        color: "#333",
      }}
    >
      {/* 성격 요약 - 메인 섹션 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "60px",
          padding: "60px 40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
          color: "white",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>
          {data.personalityEmoji}
        </div>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "700",
            margin: "0 0 10px 0",
            letterSpacing: "-0.5px",
          }}
        >
          {data.personalityType}
        </h1>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "400",
            margin: "0 0 30px 0",
            opacity: 0.9,
          }}
        >
          {data.personalityCode}
        </h2>
        <p
          style={{
            fontSize: "28px",
            fontWeight: "500",
            margin: "0 0 30px 0",
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.4,
          }}
        >
          {data.summaryOneLine}
        </p>
        {data.personalityAka.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {data.personalityAka.map((aka, index) => (
              <span
                key={index}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {aka}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 상세 분석 섹션들 */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <SpaceBetween size="xxl">
          {/* 시청 행태 분석 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.viewingBehavior.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(
                      data.sections.viewingBehavior.confidence
                    ) === "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.viewingBehavior.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.viewingBehavior.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(
                      data.sections.viewingBehavior.confidence
                    ) === "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.viewingBehavior.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.viewingBehavior.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.viewingBehavior.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.viewingBehavior.content}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "30px",
                marginTop: "40px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(data.sections.viewingBehavior.metrics.HHI)}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  HHI 지수
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {data.sections.viewingBehavior.metrics.topChannel}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  최애 채널
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {data.sections.viewingBehavior.metrics.topSharePct}%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  점유율
                </div>
              </div>
            </div>
          </div>

          {/* 충성도 & 다양성 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.loyaltyDiversity.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(
                      data.sections.loyaltyDiversity.confidence
                    ) === "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.loyaltyDiversity.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.loyaltyDiversity.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(
                      data.sections.loyaltyDiversity.confidence
                    ) === "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.loyaltyDiversity.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.loyaltyDiversity.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.loyaltyDiversity.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.loyaltyDiversity.content}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "30px",
                marginTop: "40px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {data.sections.loyaltyDiversity.metrics.loyaltyLabel}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  충성도 유형
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(
                    data.sections.loyaltyDiversity.metrics.channelCount
                  )}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  시청 채널 수
                </div>
              </div>
            </div>
          </div>

          {/* 활동 패턴 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.activityPattern.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(
                      data.sections.activityPattern.confidence
                    ) === "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.activityPattern.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.activityPattern.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(
                      data.sections.activityPattern.confidence
                    ) === "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.activityPattern.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.activityPattern.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.activityPattern.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.activityPattern.content}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "30px",
                marginTop: "40px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {data.sections.activityPattern.metrics.peakHourKST}시
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  피크 시간
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {data.sections.activityPattern.metrics.nocturnalScore.toFixed(
                    1
                  )}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  야행성 점수
                </div>
              </div>
            </div>
          </div>

          {/* 후원 가능성 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.donationPotential.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(
                      data.sections.donationPotential.confidence
                    ) === "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.donationPotential.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.donationPotential.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(
                      data.sections.donationPotential.confidence
                    ) === "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.donationPotential.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.donationPotential.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.donationPotential.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.donationPotential.content}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(1, 1fr)",
                gap: "30px",
                marginTop: "40px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {data.sections.donationPotential.score}/100
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  후원 가능성 점수
                </div>
              </div>
            </div>
          </div>

          {/* 채팅 스타일 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.chatStyle.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(data.sections.chatStyle.confidence) ===
                    "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.chatStyle.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.chatStyle.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(data.sections.chatStyle.confidence) ===
                    "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.chatStyle.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.chatStyle.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도: {getConfidenceLabel(data.sections.chatStyle.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.chatStyle.content}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "30px",
                marginTop: "40px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(data.sections.chatStyle.metrics.exclamationRatio)}%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  감탄사 비율
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(data.sections.chatStyle.metrics.questionRatio)}%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  질문 비율
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(
                    data.sections.chatStyle.metrics.independentTurnRatio
                  )}
                  %
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  독립 대화 비율
                </div>
              </div>
            </div>
          </div>

          {/* 감정 톤 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.emotionalTone.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(
                      data.sections.emotionalTone.confidence
                    ) === "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.emotionalTone.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.emotionalTone.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(
                      data.sections.emotionalTone.confidence
                    ) === "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.emotionalTone.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.emotionalTone.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.emotionalTone.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.emotionalTone.content}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "30px",
                marginTop: "40px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(
                    data.sections.emotionalTone.metrics.positiveCuePct
                  )}
                  %
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  긍정적 표현
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "8px",
                  }}
                >
                  {fmtNumber(
                    data.sections.emotionalTone.metrics.negativeCuePct
                  )}
                  %
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#7f8c8d",
                  }}
                >
                  부정적 표현
                </div>
              </div>
            </div>
          </div>

          {/* 인구통계학적 특성 */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                }}
              >
                {data.sections.demographics.title}
              </h3>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    getConfidenceColor(
                      data.sections.demographics.confidence
                    ) === "success"
                      ? "#e8f5e8"
                      : getConfidenceColor(
                          data.sections.demographics.confidence
                        ) === "info"
                      ? "#e3f2fd"
                      : getConfidenceColor(
                          data.sections.demographics.confidence
                        ) === "pending"
                      ? "#fff3e0"
                      : "#ffebee",
                  color:
                    getConfidenceColor(
                      data.sections.demographics.confidence
                    ) === "success"
                      ? "#2e7d32"
                      : getConfidenceColor(
                          data.sections.demographics.confidence
                        ) === "info"
                      ? "#1976d2"
                      : getConfidenceColor(
                          data.sections.demographics.confidence
                        ) === "pending"
                      ? "#f57c00"
                      : "#d32f2f",
                }}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.demographics.confidence)}
              </div>
            </div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "500",
                margin: "0 0 40px 0",
                lineHeight: 1.6,
                color: "#34495e",
              }}
            >
              {data.sections.demographics.content}
            </p>
          </div>
        </SpaceBetween>
      </div>

      {/* 뒤로 가기 버튼 */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
      </div>
    </div>
  );
}
