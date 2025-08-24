import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  SpaceBetween,
  Grid,
  Box,
  Badge,
  Spinner,
  Alert,
  Button,
  StatusIndicator,
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
          <Box textAlign="center" margin={{ top: "l" }}>
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
              아직 분석이 시작되지 않았습니다
            </Box>
            <Box
              fontSize="body-m"
              color="text-body-secondary"
              margin={{ bottom: "l" }}
            >
              AI가 사용자의 채팅 패턴을 분석하여 성격을 파악합니다.
              <br />
              분석에는 약 2-3분이 소요됩니다.
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
    <SpaceBetween size="xl">
      <Box>
        {/* 성격 요약 - 메인 섹션 */}
        <Grid gridDefinition={[{ colspan: 2 }, { colspan: 8 }, { colspan: 2 }]}>
          <Box></Box>
          <Box>
            <Box textAlign="center" padding="xxl" margin={{ bottom: "xl" }}>
              <Box fontSize="display-l" margin={{ bottom: "m" }}>
                {data.personalityEmoji}
              </Box>
              <Box
                fontSize="heading-xl"
                fontWeight="bold"
                margin={{ bottom: "s" }}
              >
                {data.personalityType}
              </Box>
              <Box
                fontSize="heading-xl"
                color="text-body-secondary"
                margin={{ bottom: "l" }}
              >
                {data.personalityCode}
              </Box>
              <Box
                fontSize="heading-xl"
                color="text-body-secondary"
                margin={{ bottom: "l" }}
              >
                {data.summaryOneLine}
              </Box>
              {data.personalityAka.length > 0 && (
                <SpaceBetween size="xs" direction="horizontal">
                  {data.personalityAka.map((aka, index) => (
                    <Badge key={index} color="blue">
                      {/* {aka} */}
                    </Badge>
                  ))}
                </SpaceBetween>
              )}
            </Box>
          </Box>
          <Box></Box>
        </Grid>

        {/* 상세 분석 섹션들 */}
        <Grid gridDefinition={[{ colspan: 2 }, { colspan: 8 }, { colspan: 2 }]}>
          <Box></Box>
          <Box>
            <SpaceBetween size="xxl">
              {/* 시청 행태 분석 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.viewingBehavior.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.viewingBehavior.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(
                        data.sections.viewingBehavior.confidence
                      )}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.viewingBehavior.content}
                </Box>
                <Grid
                  gridDefinition={[
                    { colspan: 4 },
                    { colspan: 4 },
                    { colspan: 4 },
                  ]}
                >
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {fmtNumber(data.sections.viewingBehavior.metrics.HHI)}
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      HHI 지수
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.viewingBehavior.metrics.topChannel}
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      최애 채널
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.viewingBehavior.metrics.topSharePct}%
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      점유율
                    </Box>
                  </Box>
                </Grid>
              </Box>

              {/* 충성도 & 다양성 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.loyaltyDiversity.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.loyaltyDiversity.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(
                        data.sections.loyaltyDiversity.confidence
                      )}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.loyaltyDiversity.content}
                </Box>
                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.loyaltyDiversity.metrics.loyaltyLabel}
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      충성도 유형
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.loyaltyDiversity.metrics.channelCount}개
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      시청 채널 수
                    </Box>
                  </Box>
                </Grid>
              </Box>

              {/* 활동 패턴 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.activityPattern.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.activityPattern.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(
                        data.sections.activityPattern.confidence
                      )}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.activityPattern.content}
                </Box>
                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.activityPattern.metrics.nocturnalScore.toFixed(
                        1
                      )}
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      야행성 점수
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.activityPattern.metrics.peakHourKST}시
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      피크 시간
                    </Box>
                  </Box>
                </Grid>
              </Box>

              {/* 후원 가능성 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.donationPotential.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.donationPotential.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(
                        data.sections.donationPotential.confidence
                      )}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.donationPotential.content}
                </Box>
                <Box textAlign="center" padding="m" margin={{ bottom: "l" }}>
                  <Box
                    fontSize="heading-xl"
                    fontWeight="bold"
                    color="text-status-info"
                  >
                    {data.sections.donationPotential.score}/100
                  </Box>
                  <Box
                    fontSize="heading-xl"
                    fontWeight="bold"
                    color="text-body-secondary"
                  >
                    후원 가능성 점수
                  </Box>
                </Box>
                {data.sections.donationPotential.actions.length > 0 && (
                  <Box></Box>
                )}
              </Box>

              {/* 채팅 스타일 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.chatStyle.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.chatStyle.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(data.sections.chatStyle.confidence)}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.chatStyle.content}
                </Box>
                <Grid
                  gridDefinition={[
                    { colspan: 4 },
                    { colspan: 4 },
                    { colspan: 4 },
                  ]}
                >
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.chatStyle.metrics.exclamationRatio}%
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      감탄사 비율
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.chatStyle.metrics.questionRatio}%
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      질문 비율
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-info"
                    >
                      {data.sections.chatStyle.metrics.independentTurnRatio}%
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      독립 대화 비율
                    </Box>
                  </Box>
                </Grid>
              </Box>

              {/* 감정 & 톤 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.emotionalTone.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.emotionalTone.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(
                        data.sections.emotionalTone.confidence
                      )}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.emotionalTone.content}
                </Box>
                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-success"
                    >
                      {data.sections.emotionalTone.metrics.positiveCuePct}%
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      긍정적 표현
                    </Box>
                  </Box>
                  <Box textAlign="center" padding="m">
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-status-error"
                    >
                      {data.sections.emotionalTone.metrics.negativeCuePct}%
                    </Box>
                    <Box
                      fontSize="heading-xl"
                      fontWeight="bold"
                      color="text-body-secondary"
                    >
                      부정적 표현
                    </Box>
                  </Box>
                </Grid>
              </Box>

              {/* 인구통계 가설 */}
              <Box textAlign="center" padding="l">
                <Box textAlign="center" margin={{ bottom: "l" }}>
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.demographics.title}
                  </Box>
                  <Box margin={{ top: "s" }}>
                    <StatusIndicator
                      type={getConfidenceColor(
                        data.sections.demographics.confidence
                      )}
                    >
                      신뢰도:{" "}
                      {getConfidenceLabel(
                        data.sections.demographics.confidence
                      )}
                    </StatusIndicator>
                  </Box>
                </Box>
                <Box
                  fontSize="heading-xl"
                  fontWeight="bold"
                  margin={{ bottom: "xl" }}
                >
                  {data.sections.demographics.content}
                </Box>
              </Box>
            </SpaceBetween>
          </Box>
          <Box></Box>
        </Grid>

        <Box textAlign="center" margin={{ top: "xl" }}>
          <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
        </Box>
      </Box>
    </SpaceBetween>
  );
}
