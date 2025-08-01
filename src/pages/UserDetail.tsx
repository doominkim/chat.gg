// pages/UserDetail.tsx
import React, { useState } from "react";
import {
  Container,
  Header,
  ColumnLayout,
  Box,
  SpaceBetween,
  Tabs,
  TextContent,
  Grid,
  PieChart,
  DateRangePicker,
} from "@cloudscape-design/components";
import ReactWordCloud from "react-d3-cloud";
import type { DateRangePickerProps } from "@cloudscape-design/components";

import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Avatar from "@cloudscape-design/chat-components/avatar";

interface ChatMessage {
  id: string;
  timestamp: string;
  message: string;
  sentiment: "positive" | "negative" | "neutral";
  emotionScore: number;
}

interface WordRanking {
  rank: number;
  word: string;
  count: number;
  percentage: number;
}

const UserDetail: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("2025-07-30");
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatMessages, setSelectedChatMessages] = useState<
    ChatMessage[]
  >([]);

  // 사용자 정보
  const userInfo = {
    userId: "bas123",
    joinDate: "2024-01-15",
    totalMessages: 1847,
    avgDaily: 12.3,
    lastActive: "2시간 전",
  };

  const personalityTraits = [
    { trait: "친근함", score: 200 },
    { trait: "유머러스", score: 72 },
    { trait: "긍정", score: 68 },
    { trait: "활발함", score: 500 },
    { trait: "분노", score: 55 },
  ];

  // 시각화에 맞게 변환 - 더 큰 값으로 매핑
  const personalityTraitsData = personalityTraits.map((trait) => ({
    text: trait.trait,
    value: trait.score * 15, // 값을 5배로 증가
  }));

  // 단어 랭킹 데이터
  const wordRankings: WordRanking[] = [
    { rank: 1, word: "안녕하세요", count: 234, percentage: 12.7 },
    { rank: 2, word: "아이유입니다", count: 189, percentage: 10.2 },
    { rank: 3, word: "좋아요", count: 156, percentage: 8.4 },
    { rank: 4, word: "재미있어요", count: 143, percentage: 7.7 },
    { rank: 5, word: "최고", count: 127, percentage: 6.9 },
    { rank: 6, word: "재미있어요", count: 143, percentage: 7.7 },
    { rank: 7, word: "최고", count: 127, percentage: 6.9 },
  ];

  // 채팅 내역 샘플 데이터
  const chatHistory: Record<string, ChatMessage[]> = {
    "2024-07-30": [
      {
        id: "1",
        timestamp: "14:30",
        message: "안녕하세요! 오늘 방송 정말 재미있네요",
        sentiment: "positive",
        emotionScore: 0.8,
      },
      {
        id: "2",
        timestamp: "14:32",
        message: "이번 게임 진짜 어렵네요 ㅠㅠ",
        sentiment: "negative",
        emotionScore: 0.3,
      },
      {
        id: "3",
        timestamp: "14:35",
        message: "스트리머님 실력이 대박이에요!",
        sentiment: "positive",
        emotionScore: 0.9,
      },
    ],
    "2024-07-29": [
      {
        id: "4",
        timestamp: "20:15",
        message: "오늘도 좋은 방송 감사합니다",
        sentiment: "positive",
        emotionScore: 0.7,
      },
      {
        id: "5",
        timestamp: "20:45",
        message: "다음에 또 봐요~",
        sentiment: "neutral",
        emotionScore: 0.5,
      },
    ],
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    if (chatHistory[date]) {
      setSelectedChatMessages(chatHistory[date]);
      setShowChatModal(true);
    }
  };

  // 채팅 카테고리 데이터 (PieChart)
  const chatKindData = [
    { title: "텍스트", value: 60, lastUpdate: "Dec 7, 2020" },
    { title: "후원", value: 10, lastUpdate: "Dec 7, 2020" },
    { title: "이모티콘", value: 30, lastUpdate: "Dec 7, 2020" },
  ];

  const [value, setValue] = useState<DateRangePickerProps.Value | null>({
    type: "absolute",
    startDate: "2024-07-01",
    endDate: "2024-07-30",
  });

  const getRankBadge = (rank: number) => {
    const badgeMap = {
      1: { emoji: "🥇" },
      2: { emoji: "🥈" },
      3: { emoji: "🥉" },
    };
    const badge = badgeMap[rank] || { emoji: `...` };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 10px",
          fontSize: "30px",
          borderRadius: "12px",
          color: "#000",
          minWidth: "40px",
          textAlign: "center",
        }}
      >
        {badge.emoji}
      </span>
    );
  };

  return (
    <SpaceBetween size="l">
      <Box
        variant="h1"
        style={{
          minHeight: "80px", // 최소 높이로 변경
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "nowrap", // 줄바꿈 방지
        }}
      >
        <SpaceBetween size="l">
          <Box style={{ flex: "1 1 auto", minWidth: 0 }}>
            <Header variant="h1">
              🤖 a 유저의 채팅을 분석한 내용입니다.{" "}
              <Box
                display="inline"
                fontSize="heading-m"
                fontWeight="bold"
                color="text-status-info"
                margin={{ left: "l" }}
              ></Box>
            </Header>
          </Box>
        </SpaceBetween>
      </Box>

      <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
        {/* 왼쪽 8칸: 2x2 구조 내부 정렬 */}
        <Grid
          gridDefinition={[
            { colspan: 7 },
            { colspan: 5 }, // 1행
            { colspan: 7 },
            { colspan: 5 }, // 2행
          ]}
        >
          {/* 왼쪽 세트: 사용자 감정 분석 + 채팅 유형 */}
          <Container fitHeight header={<Header>사용자 감정 분석</Header>}>
            <Box
            // 단어 맵이 container 외부 벗어나면 해당 주석 풀기
            // style={{
            //   width: "100%",
            //   height: "400px",
            //   position: "relative",
            //   display: "flex",
            //   justifyContent: "center",
            //   alignItems: "center",
            //   overflow: "hidden", // SVG가 컨테이너를 벗어나지 않도록
            //   border: "1px solid #ddd", // 디버깅용 테두리
            //   borderRadius: "8px",
            // }}
            >
              <ReactWordCloud
                data={personalityTraitsData}
                width={400}
                height={400}
              />
            </Box>
          </Container>

          <Container
            fitHeight
            header={<Header variant="h2">💬 많이 쓴 단어 Top 3</Header>}
          >
            <SpaceBetween size="s">
              <Box>
                {wordRankings.map((item) => (
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      {getRankBadge(item.rank)}
                      {item.word}
                    </Box>

                    <Grid
                      gridDefinition={[
                        { colspan: 5 },
                        { colspan: 3 },
                        { colspan: 4 },
                      ]}
                    >
                      {" "}
                      <Box
                        textAlign="right"
                        fontSize="body-s"
                        color="text-body-secondary"
                      >
                        {item.count}회
                      </Box>
                      <Box textAlign="right" fontWeight="bold">
                        {item.percentage}%{" "}
                      </Box>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </SpaceBetween>
          </Container>

          <Container
            fitHeight
            header={<Header variant="h2">📊 채팅 유형 분포</Header>}
          >
            <PieChart
              data={chatKindData}
              // height={300}
              ariaLabel="Pie chart"
              ariaDescription="Chat categories"
              detailPopoverContent={(datum, sum) => [
                { key: "Resource count", value: datum.value },
                {
                  key: "Percentage",
                  value: `${((datum.value / sum) * 100).toFixed(0)}%`,
                },
                { key: "Last update on", value: datum.lastUpdate },
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value} units, ${((datum.value / sum) * 100).toFixed(
                  0
                )}%`
              }
            />
          </Container>

          <Container
            fitHeight
            header={<Header variant="h2">💬 시청 스트리머 Top 3</Header>}
          >
            <SpaceBetween size="s">
              <Box>
                {wordRankings.map((item) => (
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      {getRankBadge(item.rank)}
                      {item.word}
                    </Box>
                    <Grid
                      gridDefinition={[
                        { colspan: 5 },
                        { colspan: 3 },
                        { colspan: 4 },
                      ]}
                    >
                      {" "}
                      <Box
                        textAlign="right"
                        fontSize="body-s"
                        color="text-body-secondary"
                      >
                        {item.count}회
                      </Box>
                      <Box textAlign="right" fontWeight="bold">
                        {item.percentage}%{" "}
                      </Box>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </SpaceBetween>
          </Container>
        </Grid>

        {/* 오른쪽 4칸: 채팅 내역 전체 */}
        <Container fitHeight header={<Header>채팅 내역</Header>}>
          <SpaceBetween size="l">
            <Box fitWidth>
              <DateRangePicker
                onChange={({ detail }) => setValue(detail.value)}
                value={value}
                dateOnly
                expandToViewport
                isValidRange={(range) => {
                  if (!range) {
                    return {
                      valid: false,
                      errorMessage: "날짜 범위가 비어 있습니다.",
                    };
                  }

                  if (range.type === "absolute") {
                    if (!range.startDate || !range.endDate) {
                      return {
                        valid: false,
                        errorMessage: "시작일과 종료일을 모두 선택해야 합니다.",
                      };
                    }
                    if (new Date(range.startDate) > new Date(range.endDate)) {
                      return {
                        valid: false,
                        errorMessage: "시작일은 종료일보다 이전이어야 합니다.",
                      };
                    }
                  }

                  return { valid: true };
                }}
                i18nStrings={{
                  todayAriaLabel: "오늘 날짜",
                  nextMonthAriaLabel: "다음 달",
                  previousMonthAriaLabel: "이전 달",
                  customRelativeRangeOptionLabel: "사용자 지정 범위",
                  customRelativeRangeOptionDescription:
                    "사용자 지정 날짜 범위를 입력",
                  customRelativeRangeUnitLabel: "단위",
                  customRelativeRangeDurationLabel: "기간",
                  startDateLabel: "시작일",
                  endDateLabel: "종료일",
                  clearButtonLabel: "지우기",
                  cancelButtonLabel: "취소",
                  applyButtonLabel: "적용",
                  // validationError: "날짜 범위가 유효하지 않습니다.",
                  relativeModeTitle: "상대적 범위",
                  absoluteModeTitle: "절대적 범위",
                }}
                placeholder="날짜 범위를 선택하세요"
              />
            </Box>

            <Box
              padding="none"
              // backgroundColor="grey-100"
              // Cloudscape에서 지원하는 속성들만 사용
              display="block"
              textAlign="left"
            >
              <div style={{ minHeight: "800px", height: "100%" }}>
                <Tabs
                  // fitHeight
                  tabs={[
                    {
                      label: "All",
                      id: "first",
                      content: (
                        <Box
                          padding="s"
                          style={
                            {
                              // maxHeight, overflowY를 줘야 스크롤 작동함
                              minHeight: "1000px",
                              maxHeight: "400px",
                              overflowY: "auto",
                              backgroundColor: "#241c1cff",
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                            } as React.CSSProperties
                          }
                        >
                          <SpaceBetween size="s">
                            {/* <Box>
                              <TextContent>채팅 내용 1</TextContent>
                            </Box>

                            <Box>
                              <TextContent>안녕하시온1</TextContent>
                            </Box> */}

                            <ChatBubble
                              ariaLabel="John Doe at 5:29:02pm"
                              type="outgoing"
                              avatar={
                                <Avatar
                                  ariaLabel="John Doe"
                                  tooltipText="John Doe"
                                  initials="cd"
                                />
                              }
                            >
                              이번 게임 진짜 어렵네요 ㅠㅠ
                            </ChatBubble>
                            <ChatBubble
                              ariaLabel="John Doe at 5:29:02pm"
                              type="outgoing"
                              avatar={
                                <Avatar
                                  ariaLabel="John Doe"
                                  tooltipText="John Doe"
                                  initials="kD"
                                />
                              }
                            >
                              다음에 또 봐요~
                            </ChatBubble>
                            <ChatBubble
                              ariaLabel="John Doe at 5:29:02pm"
                              type="outgoing"
                              avatar={
                                <Avatar
                                  ariaLabel="John Doe"
                                  tooltipText="John Doe"
                                  initials="JD"
                                />
                              }
                            >
                              What can I do with Amazon S3?
                            </ChatBubble>

                            <ChatBubble
                              ariaLabel="John Doe at 5:29:02pm"
                              type="outgoing"
                              avatar={
                                <Avatar
                                  ariaLabel="John Doe"
                                  tooltipText="John Doe"
                                  initials="JD"
                                />
                              }
                            >
                              오늘도 좋은 방송 감사합니다
                            </ChatBubble>
                          </SpaceBetween>
                        </Box>
                      ),
                    },

                    // {
                    //   label: "스트리머 A",
                    //   id: "second",
                    //   content: "Second tab content area",
                    // },
                    // {
                    //   label: "스트리머 B",
                    //   id: "third",
                    //   content: "Third tab content area",
                    // },
                  ]}
                  variant="container"
                />
              </div>
            </Box>
          </SpaceBetween>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

export default UserDetail;
