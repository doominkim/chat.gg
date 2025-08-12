// // src/pages/UserDetail.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  DateRangePicker,
  Grid,
  Header,
  PieChart,
  SpaceBetween,
  Tabs,
} from "@cloudscape-design/components";
import type { DateRangePickerProps } from "@cloudscape-design/components";
import ReactWordCloud from "react-d3-cloud";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Avatar from "@cloudscape-design/chat-components/avatar";

import { useParams } from "react-router-dom";
import NotFoundUser from "./NotFoundUser";

/**
 * 테스트 데이터 설계
 * - 닉네임: Layout.tsx의 testNicknames와 일부 매칭 (hanaro, seobin, johndoe 등)
 * - 채널: 채널ID → 채널명
 * - 채팅: messageType(text/emote/donation), createdAt, channelId, message, emoji 포함 여부
 */

type MessageType = "text" | "emote" | "donation";

interface ChatRow {
  id: string;
  nickname: string;     // 식별자 = 닉네임
  channelId: string;    // 어떤 스트리머 채널에서 쳤는지
  channelName: string;
  message: string;
  messageType: MessageType;
  createdAt: string;    // ISO string
}

interface WordRanking {
  rank: number;
  word: string;
  count: number;
  percentage: number;
}

/** 채널 사전 */
const CHANNELS: Record<string, string> = {
  ch_iu: "아이유 IU",
  ch_aws: "AWS Korea",
  ch_dev: "개발자의 품격",
  ch_fun: "Fun&Games",
};


/** 닉네임별 더미 채팅 데이터 */
const MOCK_CHAT_BY_USER: Record<string, ChatRow[]> = {
  hanaro: [
    // 7월 28일
    {
      id: "h1",
      nickname: "hanaro",
      channelId: "ch_iu",
      channelName: CHANNELS["ch_iu"],
      message: "안녕하세요! 오늘도 재밌게 볼게요",
      messageType: "text",
      createdAt: "2024-07-28T14:30:10Z",
    },
    {
      id: "h2",
      nickname: "hanaro",
      channelId: "ch_dev",
      channelName: CHANNELS["ch_dev"],
      message: "이 라이브 너무 유익합니다 🙌",
      messageType: "emote",
      createdAt: "2024-07-28T15:12:44Z",
    },
    // 7월 29일
    {
      id: "h3",
      nickname: "hanaro",
      channelId: "ch_aws",
      channelName: CHANNELS["ch_aws"],
      message: "What can I do with Amazon S3?",
      messageType: "text",
      createdAt: "2024-07-29T09:05:02Z",
    },
    {
      id: "h4",
      nickname: "hanaro",
      channelId: "ch_aws",
      channelName: CHANNELS["ch_aws"],
      message: "소소하지만 응원합니다! ₩5000",
      messageType: "donation",
      createdAt: "2024-07-29T09:06:30Z",
    },
    // 7월 30일
    {
      id: "h5",
      nickname: "hanaro",
      channelId: "ch_fun",
      channelName: CHANNELS["ch_fun"],
      message: "이번 게임 진짜 어렵네요 ㅠㅠ",
      messageType: "text",
      createdAt: "2024-07-30T20:15:11Z",
    },
    {
      id: "h6",
      nickname: "hanaro",
      channelId: "ch_fun",
      channelName: CHANNELS["ch_fun"],
      message: "다음에 또 봐요~ 😊",
      messageType: "emote",
      createdAt: "2024-07-30T20:45:58Z",
    },
  ],
  seobin: [
    {
      id: "s1",
      nickname: "seobin",
      channelId: "ch_dev",
      channelName: CHANNELS["ch_dev"],
      message: "테스트 데이터로 대시보드 확인 중",
      messageType: "text",
      createdAt: "2024-07-29T12:21:10Z",
    },
    {
      id: "s2",
      nickname: "seobin",
      channelId: "ch_dev",
      channelName: CHANNELS["ch_dev"],
      message: "👍👍👍",
      messageType: "emote",
      createdAt: "2024-07-29T12:25:10Z",
    },
    {
      id: "s3",
      nickname: "seobin",
      channelId: "ch_iu",
      channelName: CHANNELS["ch_iu"],
      message: "최고의 무대였습니다!",
      messageType: "text",
      createdAt: "2024-07-30T17:00:00Z",
    },
  ],
  johndoe: [
    {
      id: "j1",
      nickname: "johndoe",
      channelId: "ch_aws",
      channelName: CHANNELS["ch_aws"],
      message: "오늘도 좋은 방송 감사합니다",
      messageType: "text",
      createdAt: "2024-07-30T11:00:00Z",
    },
    {
      id: "j2",
      nickname: "johndoe",
      channelId: "ch_aws",
      channelName: CHANNELS["ch_aws"],
      message: "응원합니다! ₩10000",
      messageType: "donation",
      createdAt: "2024-07-30T11:10:00Z",
    },
  ],
};

/** 닉네임별 사용자 성향(워드클라우드) 샘플 */
const MOCK_TRAITS: Record<
  string,
  { trait: string; score: number }[]
> = {
  hanaro: [
    { trait: "친근함", score: 200 },
    { trait: "유머러스", score: 120 },
    { trait: "긍정", score: 90 },
    { trait: "활발함", score: 160 },
    { trait: "분석적", score: 60 },
    { trait: "공감", score: 80 },
  ],
  seobin: [
    { trait: "성실함", score: 180 },
    { trait: "호기심", score: 140 },
    { trait: "긍정", score: 100 },
    { trait: "차분함", score: 80 },
  ],
  johndoe: [
    { trait: "활발함", score: 150 },
    { trait: "친근함", score: 110 },
    { trait: "공감", score: 90 },
    { trait: "도전적", score: 70 },
  ],
};

/** 닉네임별 많이 쓴 단어 Top N (샘플) */
const MOCK_WORDS: Record<string, WordRanking[]> = {
  hanaro: [
    { word: "안녕하세요", count: 23 },
    { word: "재미있어요", count: 19 },
    { word: "최고", count: 15 },
    { word: "AWS", count: 12 },
    { word: "감사합니다", count: 10 },
  ],
  seobin: [
    { word: "좋아요", count: 14 },
    { word: "대박", count: 11 },
    { word: "유익해요", count: 9 },
  ],
  johndoe: [
    { word: "감사합니다", count: 12 },
    { word: "응원합니다", count: 9 },
    { word: "S3", count: 7 },
  ],
};

const UserDetail: React.FC = () => {
  const { nickname = "" } = useParams<{ nickname : string }>();

  const [selectedDate, setSelectedDate] = useState("2025-07-30");
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatMessages, setSelectedChatMessages] = useState<
    ChatMessage[]
  >([]);

  // 사용자 정보
  // 💡 예시: userId에 따라 동적으로 유저 정보 가져오기 (mock 처리)
  const mockUsers = {
    abc123: {
      nickname: "abc123",
      joinDate: "2024-01-15",
      totalMessages: 1847,
      avgDaily: 12.3,
      lastActive: "2시간 전",
    },
    xyz456: {
      nickname: "xyz456",
      joinDate: "2023-11-01",
      totalMessages: 900,
      avgDaily: 10.5,
      lastActive: "3일 전",
    },
    test789: {
      nickname: "seobin",
      joinDate: "2025-01-01",
      totalMessages: 500,
      avgDaily: 6.1,
      lastActive: "1시간 전",
    },
  };
  
  const userInfo = nickname ? mockUsers[nickname] : undefined;

  if (!userInfo) {
    return  < NotFoundUser />;
  }

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
      >
        <SpaceBetween size="l">
          <Box 
          // style={{ flex: "1 1 auto", minWidth: 0 }}
          >
            <Header variant="h1">
              🤖 [{nickname}] 유저의 채팅을 분석한 내용입니다.{" "}
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
          <Container fitHeight header={<Header>사용자 분석</Header>}>
            <Box
            >
              <ReactWordCloud

                // Bedrock 처리

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
                  <Box 
                  >
                    <Box 
                    >

                      
                // Bedrock 처리



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
                  <Box 
                  >
                    <Box 
                    >
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
            <Box >
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
