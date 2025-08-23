import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  SpaceBetween,
  Grid,
  Box,
  Badge,
  ProgressBar,
  Alert,
  Button,
  Cards,
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
          <Header variant="h1">🧠 AI 성격 분석</Header>
          <Box textAlign="center" padding="xl">
            <Box
              fontSize="heading-l"
              color="text-status-info"
              margin={{ bottom: "l" }}
            >
              AI가 사용자의 채팅 패턴을 분석하고 있습니다...
            </Box>
            <ProgressBar
              value={undefined}
              description="분석 중 (약 2-3분 소요)"
              status="in-progress"
            />
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
          <Header variant="h1">🧠 AI 성격 분석</Header>
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
          <Header variant="h1">🧠 AI 성격 분석</Header>
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
    <SpaceBetween size="l">
      <Container>
        <Header variant="h1">🧠 AI 성격 분석</Header>

        {/* 성격 요약 */}
        <Container>
          <Header variant="h2">
            {data.personalityEmoji} {data.personalityType}
          </Header>
          <SpaceBetween size="m">
            <Box fontSize="heading-m" fontWeight="bold">
              {data.personalityCode}
            </Box>
            <Box fontSize="body-m" color="text-body-secondary">
              {data.personalityTagline}
            </Box>
            <Box fontSize="body-m">{data.summaryOneLine}</Box>
            {data.personalityAka.length > 0 && (
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  별칭
                </Box>
                <SpaceBetween size="xs" direction="horizontal">
                  {data.personalityAka.map((aka, index) => (
                    <Badge key={index} color="blue">
                      {aka}
                    </Badge>
                  ))}
                </SpaceBetween>
              </Box>
            )}
          </SpaceBetween>
        </Container>

        {/* 상세 분석 섹션들 */}
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          {/* 시청 행태 분석 */}
          <Container>
            <Header variant="h3">
              📺 {data.sections.viewingBehavior.title}
              <StatusIndicator
                type={getConfidenceColor(
                  data.sections.viewingBehavior.confidence
                )}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.viewingBehavior.confidence)}
              </StatusIndicator>
            </Header>
            <SpaceBetween size="s">
              <Box>{data.sections.viewingBehavior.content}</Box>
              <Grid
                gridDefinition={[
                  { colspan: 4 },
                  { colspan: 4 },
                  { colspan: 4 },
                ]}
              >
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {fmtNumber(data.sections.viewingBehavior.metrics.HHI)}
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    HHI 지수
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.viewingBehavior.metrics.topChannel}
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    최애 채널
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.viewingBehavior.metrics.topSharePct}%
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    점유율
                  </Box>
                </Box>
              </Grid>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  근거
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.viewingBehavior.evidence.map(
                    (evidence, index) => (
                      <Box key={index} fontSize="body-s">
                        • {evidence}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>

          {/* 충성도 & 다양성 */}
          <Container>
            <Header variant="h3">
              🥇 {data.sections.loyaltyDiversity.title}
              <StatusIndicator
                type={getConfidenceColor(
                  data.sections.loyaltyDiversity.confidence
                )}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.loyaltyDiversity.confidence)}
              </StatusIndicator>
            </Header>
            <SpaceBetween size="s">
              <Box>{data.sections.loyaltyDiversity.content}</Box>
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.loyaltyDiversity.metrics.loyaltyLabel}
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    충성도 유형
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.loyaltyDiversity.metrics.channelCount}개
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    시청 채널 수
                  </Box>
                </Box>
              </Grid>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  근거
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.loyaltyDiversity.evidence.map(
                    (evidence, index) => (
                      <Box key={index} fontSize="body-s">
                        • {evidence}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>

          {/* 활동 패턴 */}
          <Container>
            <Header variant="h3">
              🌙 {data.sections.activityPattern.title}
              <StatusIndicator
                type={getConfidenceColor(
                  data.sections.activityPattern.confidence
                )}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.activityPattern.confidence)}
              </StatusIndicator>
            </Header>
            <SpaceBetween size="s">
              <Box>{data.sections.activityPattern.content}</Box>
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.activityPattern.metrics.nocturnalScore.toFixed(
                      1
                    )}
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    야행성 점수
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.activityPattern.metrics.peakHourKST}시
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    피크 시간
                  </Box>
                </Box>
              </Grid>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  근거
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.activityPattern.evidence.map(
                    (evidence, index) => (
                      <Box key={index} fontSize="body-s">
                        • {evidence}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>

          {/* 후원 가능성 */}
          <Container>
            <Header variant="h3">
              💰 {data.sections.donationPotential.title}
              <StatusIndicator
                type={getConfidenceColor(
                  data.sections.donationPotential.confidence
                )}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.donationPotential.confidence)}
              </StatusIndicator>
            </Header>
            <SpaceBetween size="s">
              <Box>{data.sections.donationPotential.content}</Box>
              <Box textAlign="center">
                <Box fontSize="heading-l" fontWeight="bold">
                  {data.sections.donationPotential.score}/100
                </Box>
                <Box fontSize="body-s" color="text-body-secondary">
                  후원 가능성 점수
                </Box>
              </Box>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  근거
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.donationPotential.evidence.map(
                    (evidence, index) => (
                      <Box key={index} fontSize="body-s">
                        • {evidence}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
              {data.sections.donationPotential.actions.length > 0 && (
                <Box>
                  <Box
                    fontSize="body-s"
                    color="text-body-secondary"
                    margin={{ bottom: "xs" }}
                  >
                    추천 액션
                  </Box>
                  <SpaceBetween size="xs">
                    {data.sections.donationPotential.actions.map(
                      (action, index) => (
                        <Box key={index} fontSize="body-s">
                          • {action}
                        </Box>
                      )
                    )}
                  </SpaceBetween>
                </Box>
              )}
            </SpaceBetween>
          </Container>

          {/* 채팅 스타일 */}
          <Container>
            <Header variant="h3">
              💬 {data.sections.chatStyle.title}
              <StatusIndicator
                type={getConfidenceColor(data.sections.chatStyle.confidence)}
              >
                신뢰도: {getConfidenceLabel(data.sections.chatStyle.confidence)}
              </StatusIndicator>
            </Header>
            <SpaceBetween size="s">
              <Box>{data.sections.chatStyle.content}</Box>
              <Grid
                gridDefinition={[
                  { colspan: 4 },
                  { colspan: 4 },
                  { colspan: 4 },
                ]}
              >
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.chatStyle.metrics.exclamationRatio}%
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    감탄사 비율
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.chatStyle.metrics.questionRatio}%
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    질문 비율
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box fontSize="heading-l" fontWeight="bold">
                    {data.sections.chatStyle.metrics.independentTurnRatio}%
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    독립 대화 비율
                  </Box>
                </Box>
              </Grid>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  근거
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.chatStyle.evidence.map((evidence, index) => (
                    <Box key={index} fontSize="body-s">
                      • {evidence}
                    </Box>
                  ))}
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>

          {/* 감정 & 톤 */}
          <Container>
            <Header variant="h3">
              😊 {data.sections.emotionalTone.title}
              <StatusIndicator
                type={getConfidenceColor(
                  data.sections.emotionalTone.confidence
                )}
              >
                신뢰도:{" "}
                {getConfidenceLabel(data.sections.emotionalTone.confidence)}
              </StatusIndicator>
            </Header>
            <SpaceBetween size="s">
              <Box>{data.sections.emotionalTone.content}</Box>
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <Box textAlign="center">
                  <Box
                    fontSize="heading-l"
                    fontWeight="bold"
                    color="text-status-success"
                  >
                    {data.sections.emotionalTone.metrics.positiveCuePct}%
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    긍정적 표현
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Box
                    fontSize="heading-l"
                    fontWeight="bold"
                    color="text-status-error"
                  >
                    {data.sections.emotionalTone.metrics.negativeCuePct}%
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    부정적 표현
                  </Box>
                </Box>
              </Grid>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  근거
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.emotionalTone.evidence.map(
                    (evidence, index) => (
                      <Box key={index} fontSize="body-s">
                        • {evidence}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>
        </Grid>

        {/* 인구통계 가설 */}
        <Container>
          <Header variant="h3">
            👥 {data.sections.demographics.title}
            <StatusIndicator
              type={getConfidenceColor(data.sections.demographics.confidence)}
            >
              신뢰도:{" "}
              {getConfidenceLabel(data.sections.demographics.confidence)}
            </StatusIndicator>
          </Header>
          <SpaceBetween size="s">
            <Box>{data.sections.demographics.content}</Box>
            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  가정
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.demographics.assumptions.map(
                    (assumption, index) => (
                      <Box key={index} fontSize="body-s">
                        • {assumption}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
              <Box>
                <Box
                  fontSize="body-s"
                  color="text-body-secondary"
                  margin={{ bottom: "xs" }}
                >
                  반례
                </Box>
                <SpaceBetween size="xs">
                  {data.sections.demographics.counterExamples.map(
                    (counterExample, index) => (
                      <Box key={index} fontSize="body-s">
                        • {counterExample}
                      </Box>
                    )
                  )}
                </SpaceBetween>
              </Box>
            </Grid>
          </SpaceBetween>
        </Container>

        <Box textAlign="center" margin={{ top: "l" }}>
          <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
        </Box>
      </Container>
    </SpaceBetween>
  );
}
