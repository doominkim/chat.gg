import React, { useState, useMemo } from "react";
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
import type {
  ChatMessage,
  WordCloudItem,
  FreqWordItem,
} from "../api/services/userDetailService";

/** ===== helpers ===== */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "U";

const getRankBadge = (rank: number) => {
  const badge =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}위`;
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
      {badge}
    </span>
  );
};

/** ===== component ===== */
const UserDetail: React.FC = () => {
  const { nickname = "" } = useParams<{ nickname: string }>();

  /** 날짜 범위(기본: 지난 한 달) */
  const [range, setRange] = useState<DateRangePickerProps.Value | null>({
    type: "absolute",
    startDate: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
    }).format(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)),
    endDate: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
    }).format(new Date()),
  });

  /** 유저 존재 여부 */
  const userFound = !!nickname;

  /** 더미 데이터 */
  const wordCloudData: WordCloudItem[] = [
    { text: "안녕하세요", value: 50 },
    { text: "좋아요", value: 40 },
    { text: "대박", value: 35 },
    { text: "ㅋㅋㅋ", value: 30 },
    { text: "응원", value: 25 },
    { text: "사랑해요", value: 20 },
    { text: "최고", value: 18 },
    { text: "화이팅", value: 15 },
    { text: "멋져요", value: 12 },
    { text: "감사합니다", value: 10 },
  ];

  const freqWords: FreqWordItem[] = [
    { rank: 1, word: "안녕하세요", count: 150, percentage: 25 },
    { rank: 2, word: "좋아요", count: 120, percentage: 20 },
    { rank: 3, word: "대박", count: 90, percentage: 15 },
  ];

  const chatKindsData = [
    { title: "일반 채팅", value: 1500, lastUpdate: "2024-01-15" },
    { title: "이모티콘", value: 800, lastUpdate: "2024-01-15" },
    { title: "후원", value: 300, lastUpdate: "2024-01-15" },
  ];

  const topStreamersData = [
    { name: "치지직이", count: 450, percentage: 45 },
    { name: "고양이짱", count: 320, percentage: 32 },
    { name: "악플러123", count: 230, percentage: 23 },
  ];

  const chatHistoryData: ChatMessage[] = [
    {
      id: "1",
      nickname: nickname,
      channelId: "channel1",
      channelName: "치지직이",
      message: "안녕하세요! 오늘도 좋은 방송 감사합니다 😊",
      messageType: "text",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      nickname: nickname,
      channelId: "channel1",
      channelName: "치지직이",
      message: "대박! 정말 재미있어요",
      messageType: "text",
      createdAt: "2024-01-15T10:25:00Z",
    },
    {
      id: "3",
      nickname: nickname,
      channelId: "channel2",
      channelName: "고양이짱",
      message: "고양이 너무 귀여워요 🐱",
      messageType: "text",
      createdAt: "2024-01-15T09:15:00Z",
    },
    {
      id: "4",
      nickname: nickname,
      channelId: "channel2",
      channelName: "고양이짱",
      message: "사랑해요!",
      messageType: "text",
      createdAt: "2024-01-15T09:10:00Z",
    },
    {
      id: "5",
      nickname: nickname,
      channelId: "channel3",
      channelName: "악플러123",
      message: "화이팅!",
      messageType: "text",
      createdAt: "2024-01-15T08:45:00Z",
    },
  ];

  /** 로딩 상태 */
  const loading = false;

  /** 스트리머별 탭 구성 */
  const tabs = useMemo(() => {
    const byStreamer = new Map<
      string,
      { name: string; messages: ChatMessage[] }
    >();

    for (const m of chatHistoryData) {
      const k = m.channelId || m.channelName;
      if (!byStreamer.has(k)) {
        byStreamer.set(k, { name: m.channelName, messages: [] });
      }
      byStreamer.get(k)!.messages.push(m);
    }

    const allTab = {
      label: "All",
      id: "tab_all",
      content: (
        <Box padding="s">
          <SpaceBetween size="s">
            {chatHistoryData
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((row) => (
                <ChatBubble
                  key={row.id}
                  ariaLabel={`${row.channelName} at ${row.createdAt}`}
                  type="outgoing"
                  avatar={
                    <Avatar
                      ariaLabel={row.channelName}
                      tooltipText={row.channelName}
                      initials={initialsOf(row.channelName)}
                    />
                  }
                >
                  {row.message}
                </ChatBubble>
              ))}
          </SpaceBetween>
        </Box>
      ),
    };

    const streamerTabs = Array.from(byStreamer.entries()).map(([id, v]) => ({
      label: v.name,
      id: `tab_${id}`,
      content: (
        <Box padding="s">
          <SpaceBetween size="s">
            {v.messages
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((row) => (
                <ChatBubble
                  key={row.id}
                  ariaLabel={`${row.channelName} at ${row.createdAt}`}
                  type="outgoing"
                  avatar={
                    <Avatar
                      ariaLabel={row.channelName}
                      tooltipText={row.channelName}
                      initials={initialsOf(row.channelName)}
                    />
                  }
                >
                  {row.message}
                </ChatBubble>
              ))}
          </SpaceBetween>
        </Box>
      ),
    }));

    return [allTab, ...streamerTabs];
  }, [chatHistoryData]);

  if (!userFound) return <NotFoundUser />;

  return (
    <SpaceBetween size="l">
      <Box variant="h1">
        <SpaceBetween size="l">
          <Box>
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
          {/* 사용자 분석(WordCloud) */}
          <Container fitHeight header={<Header>사용자 분석</Header>}>
            <Box>
              <ReactWordCloud data={wordCloudData} width={400} height={400} />
              {!loading && wordCloudData.length === 0 && (
                <Box margin={{ top: "s" }} color="text-body-secondary">
                  데이터가 없습니다.
                </Box>
              )}
            </Box>
          </Container>

          {/* 많이 쓴 단어 Top N (Lambda) */}
          <Container
            fitHeight
            header={<Header variant="h2">💬 많이 쓴 단어 Top 3</Header>}
          >
            <SpaceBetween size="s">
              <Box>
                {freqWords.map((item) => (
                  <Box
                    key={`${item.rank}-${item.word}`}
                    padding={{ bottom: "xs" }}
                  >
                    <Box display="inline-block" margin={{ right: "s" }}>
                      {getRankBadge(item.rank)}
                    </Box>
                    <Box display="inline-block" fontWeight="bold">
                      {item.word}
                    </Box>
                    <Grid
                      gridDefinition={[
                        { colspan: 5 },
                        { colspan: 3 },
                        { colspan: 4 },
                      ]}
                    >
                      <Box
                        textAlign="right"
                        fontSize="body-s"
                        color="text-body-secondary"
                      >
                        {item.count}회
                      </Box>
                      <Box textAlign="right" fontWeight="bold">
                        {item.percentage}%
                      </Box>
                    </Grid>
                  </Box>
                ))}
                {!loading && freqWords.length === 0 && (
                  <Box margin={{ top: "s" }} color="text-body-secondary">
                    데이터가 없습니다.
                  </Box>
                )}
              </Box>
            </SpaceBetween>
          </Container>

          {/* 채팅 유형 분포 (PieChart) */}
          <Container
            fitHeight
            header={<Header variant="h2">📊 채팅 유형 분포</Header>}
          >
            <PieChart
              data={chatKindsData}
              ariaLabel="Pie chart"
              ariaDescription="Chat categories"
              detailPopoverContent={(datum, sum) => [
                { key: "Count", value: datum.value },
                {
                  key: "Percentage",
                  value: `${((datum.value / sum) * 100).toFixed(0)}%`,
                },
                { key: "Last update", value: datum.lastUpdate || "-" },
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.value}개, ${((datum.value / sum) * 100).toFixed(0)}%`
              }
              hideFilter
            />
            {!loading && chatKindsData.length === 0 && (
              <Box margin={{ top: "s" }} color="text-body-secondary">
                데이터가 없습니다.
              </Box>
            )}
          </Container>

          {/* 시청 스트리머 Top 3 */}
          <Container
            fitHeight
            header={<Header variant="h2">💬 시청 스트리머 Top 3</Header>}
          >
            <SpaceBetween size="s">
              <Box>
                {topStreamersData.slice(0, 3).map((item, idx) => (
                  <Box key={`${item.name}-${idx}`} padding={{ bottom: "xs" }}>
                    <Box display="inline-block" margin={{ right: "s" }}>
                      {getRankBadge(idx + 1)}
                    </Box>
                    <Box display="inline-block" fontWeight="bold">
                      {item.name}
                    </Box>
                    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                      <Box
                        textAlign="right"
                        fontSize="body-s"
                        color="text-body-secondary"
                      >
                        {item.count}회
                      </Box>
                      <Box textAlign="right" fontWeight="bold">
                        {item.percentage != null ? `${item.percentage}%` : ""}
                      </Box>
                    </Grid>
                  </Box>
                ))}
                {!loading && topStreamersData.length === 0 && (
                  <Box margin={{ top: "s" }} color="text-body-secondary">
                    데이터가 없습니다.
                  </Box>
                )}
              </Box>
            </SpaceBetween>
          </Container>
        </Grid>

        {/* 오른쪽 4칸: 채팅 내역 전체 */}
        <Container
          fitHeight
          header={
            <Header
              actions={
                <Box>
                  <DateRangePicker
                    onChange={({ detail }) => {
                      if (!detail.value) return; // null이면 무시
                      setRange(detail.value);
                    }}
                    value={range}
                    dateOnly
                    expandToViewport
                    relativeOptions={[
                      {
                        key: "last-7-days",
                        type: "relative",
                        amount: 7,
                        unit: "day",
                      },
                      {
                        key: "last-14-days",
                        type: "relative",
                        amount: 14,
                        unit: "day",
                      },
                      {
                        key: "last-30-days",
                        type: "relative",
                        amount: 30,
                        unit: "day",
                      },
                      {
                        key: "last-90-days",
                        type: "relative",
                        amount: 90,
                        unit: "day",
                      },
                      {
                        key: "last-12-months",
                        type: "relative",
                        amount: 12,
                        unit: "month",
                      },
                    ]}
                    isValidRange={(r) => {
                      if (!r)
                        return {
                          valid: false,
                          errorMessage: "날짜 범위를 선택하세요.",
                        };

                      if (r.type === "absolute") {
                        if (!r.startDate || !r.endDate) {
                          return {
                            valid: false,
                            errorMessage: "시작·종료일을 모두 선택하세요.",
                          };
                        }
                        if (new Date(r.startDate) > new Date(r.endDate)) {
                          return {
                            valid: false,
                            errorMessage:
                              "시작일이 종료일보다 이전이어야 합니다.",
                          };
                        }
                        // ✅ 미래 날짜 방지
                        const today = new Date();
                        if (
                          new Date(r.startDate) > today ||
                          new Date(r.endDate) > today
                        ) {
                          return {
                            valid: false,
                            errorMessage: "미래 날짜는 선택할 수 없습니다.",
                          };
                        }
                        return { valid: true };
                      }

                      // ✅ relative 타입 검증
                      if (r.type === "relative") {
                        // amount > 0 이어야 하고 unit(day|week|month|year 등) 필요
                        // (Cloudscape 내부에서 실제 날짜 계산은 컴포넌트가 처리)
                        const relativeRange = r as {
                          amount: number;
                          unit: string;
                        };
                        const ok =
                          typeof relativeRange.amount === "number" &&
                          relativeRange.amount > 0 &&
                          !!relativeRange.unit;
                        return ok
                          ? { valid: true }
                          : {
                              valid: false,
                              errorMessage:
                                "상대 범위(기간/단위)를 올바르게 선택하세요.",
                            };
                      }

                      return {
                        valid: false,
                        errorMessage: "유효하지 않은 범위 형식입니다.",
                      };
                    }}
                    // ✅ 미래 날짜 비활성화
                    isDateEnabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date <= today;
                    }}
                    i18nStrings={{
                      todayAriaLabel: "오늘 날짜",
                      nextMonthAriaLabel: "다음 달",
                      previousMonthAriaLabel: "이전 달",
                      customRelativeRangeOptionLabel: "사용자 지정 범위",
                      customRelativeRangeOptionDescription:
                        "사용자 지정 날짜 범위 입력",
                      customRelativeRangeUnitLabel: "단위",
                      customRelativeRangeDurationLabel: "기간",
                      startDateLabel: "시작일",
                      endDateLabel: "종료일",
                      clearButtonLabel: "지우기",
                      cancelButtonLabel: "취소",
                      applyButtonLabel: "적용",
                      relativeModeTitle: "상대적 범위",
                      absoluteModeTitle: "절대적 범위",
                    }}
                    placeholder="날짜 범위를 선택하세요"
                  />
                </Box>
              }
            >
              채팅 내역
            </Header>
          }
        >
          <div style={{ minHeight: "800px", height: "100%" }}>
            <Tabs tabs={tabs} variant="container" />
          </div>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

export default UserDetail;
