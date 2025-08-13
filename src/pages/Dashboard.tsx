// src/pages/Dashboard.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Grid,
  Box,
  Badge,
  PieChart,
  LineChart,
  BarChart,
  Flashbar,
  Link,
} from "@cloudscape-design/components";
import type { FlashbarProps } from "@cloudscape-design/components";
import { useApi } from "../api/hooks";
import { dashboardService } from "../api/services";
import type {
  DashboardOverview,
  ChatTypeDistribution,
  HourlyChatTypeDistribution,
  ChatRanking,
} from "../api/services/dashboardService";

type SummaryResponse = {
  success: boolean;
  data: {
    // 상단 3카드
    totals: {
      todayCount: number;
      yesterdayCount: number;
      deltaPercent: number;
    };
    donations: {
      todayCount: number;
      yesterdayCount: number;
      deltaPercent: number;
    };
    peaks: {
      todayHour: number | null;
      yesterdayHour: number | null;
      yesterdayMinute?: number | null;
    };

    // 그래프 섹션
    charts: {
      // Pie
      chatKinds: Array<{ label: string; count: number; updatedAt?: string }>;
      // Line / Bar
      hourly: Array<{ hour: number; count: number }>; // 0..23
      // Top 10
      topChatters: Array<{ name: string; count: number }>;

      // 도네이션 섹션
      streamerDonations: Array<{ name: string; amount: number }>;
      topDonors: Array<{ name: string; amount: number }>;
    };
  };
  message?: string;
};

const formatKstDate = (d = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

const todayKST = () => formatKstDate(new Date());

const toHHmm = (h: number | null, m: number | null = 0) => {
  if (h == null) return "-";
  return `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
};

const fmtNumber = (n: number) => n.toLocaleString("ko-KR");

// deltaPercent(양수/음수)에 따라 뱃지 색/기호를 그대로 표시
const badgeFromDelta = (deltaPercent: number) => {
  const arrow = deltaPercent >= 0 ? "▲" : "▼";
  const color = deltaPercent > 0 ? "red" : deltaPercent < 0 ? "green" : "blue";
  const pct = Math.abs(deltaPercent).toFixed(1).replace(/\.0$/, "");
  return { arrow, color: color as "red" | "green" | "blue", pct };
};

// Pie/Line/Top 변환 유틸
const mapPieDataFromSummary = (res: SummaryResponse) =>
  (res.data.charts.chatKinds ?? []).map((r) => ({
    title: r.label,
    value: r.count,
    lastUpdate: r.updatedAt
      ? new Date(r.updatedAt).toLocaleString("ko-KR")
      : "",
  }));

const mapHourlyLineFromSummary = (
  dateYYYYMMDD: string,
  res: SummaryResponse
) => {
  const base = new Date(`${dateYYYYMMDD}T00:00:00+09:00`);
  const line = (res.data.charts.hourly ?? []).map(({ hour, count }) => {
    const x = new Date(base);
    x.setHours(hour, 0, 0, 0);
    return { x, y: count };
  });
  const maxY = line.length ? Math.max(...line.map((d) => d.y)) : 0;
  const peakPoint = line.length
    ? line.reduce((a, b) => (a.y >= b.y ? a : b))
    : { x: base, y: 0 };
  return { line, maxY, peakPoint };
};

const mapTopChattersFromSummary = (res: SummaryResponse) =>
  (res.data.charts.topChatters ?? []).map((r) => ({
    name: r.name,
    count: r.count,
  }));

const mapStreamerDonationsFromSummary = (res: SummaryResponse) =>
  (res.data.charts.streamerDonations ?? []).map((r) => ({
    x: r.name,
    y: r.amount,
  }));

const mapTopDonorsFromSummary = (res: SummaryResponse) =>
  (res.data.charts.topDonors ?? []).map((r) => ({ x: r.name, y: r.amount }));

// 컴포넌트 시작
export default function Dashboard() {
  // 실시간 날짜 및 시간 표시 (요일 포함)
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    })} ${now.toLocaleTimeString("ko-KR", { hour12: false })}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const d = now.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
      });
      const t = now.toLocaleTimeString("ko-KR", { hour12: false });
      setCurrentTime(`${d}  ${t}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Flash 메시지
  const [items, setItems] = useState<FlashbarProps.MessageDefinition[]>([
    {
      id: "notice_1",
      type: "info",
      dismissible: true,
      dismissLabel: "닫기",
      onDismiss: () => setItems([]),
      // content: <div>알림 메시지</div>,
      content: (
        <>
          과거의 채팅 분석 정보를 확인해보세요.{" "}
          <Link color="inverted" href="/archive">
            지난 데이터 보기
          </Link>
        </>
      ),
    },
  ]);

  // API 호출 함수들을 useCallback으로 메모이제이션
  const overviewApiCall = useCallback(
    () => dashboardService.getDashboardOverview(),
    []
  );

  const chatTypeApiCall = useCallback(
    () => dashboardService.getChatTypeDistribution(),
    []
  );

  const hourlyChatTypeApiCall = useCallback(
    () => dashboardService.getHourlyChatTypeDistribution(),
    []
  );

  const chatRankingApiCall = useCallback(
    () => dashboardService.getChatRanking(),
    []
  );

  // 상단 3카드 상태 - 새로운 API 사용
  const {
    data: overviewData,
    loading,
    error,
  } = useApi<DashboardOverview>(overviewApiCall, []);

  // 채팅 유형 분포 API 호출
  const {
    data: chatTypeData,
    loading: chatTypeLoading,
    error: chatTypeError,
  } = useApi<ChatTypeDistribution>(chatTypeApiCall, []);

  // 시간대별 채팅 수 API 호출
  const {
    data: hourlyData,
    loading: hourlyLoading,
    error: hourlyError,
  } = useApi<HourlyChatTypeDistribution>(hourlyChatTypeApiCall, []);

  // 실시간 채팅 랭킹 API 호출
  const {
    data: chatRankingData,
    loading: chatRankingLoading,
    error: chatRankingError,
  } = useApi<ChatRanking>(chatRankingApiCall, []);

  // 실제 API 응답 구조에 맞게 데이터 추출
  const totalToday = overviewData?.data?.todayChatCount ?? 0;
  const totalDelta = overviewData?.data?.todayChatCountChange ?? 0;
  const donToday = overviewData?.data?.todayCheeseCount ?? 0;
  const donDelta = overviewData?.data?.todayCheeseCountChange ?? 0;

  // 시간 문자열을 파싱 (예: "12:00" -> 12, 0)
  const parseTimeString = (timeStr: string | undefined) => {
    if (!timeStr) return { hour: null, minute: 0 };
    const [hour, minute] = timeStr.split(":").map(Number);
    return { hour, minute };
  };

  const todayPeak = parseTimeString(overviewData?.data?.todayPeakTime);
  const yesterdayPeak = parseTimeString(overviewData?.data?.yesterdayPeakTime);

  const peakToday = todayPeak.hour;
  const peakYesterdayH = yesterdayPeak.hour;
  const peakYesterdayM = yesterdayPeak.minute;

  const today = useMemo(todayKST, []);

  // 그래프 상태
  // Pie - 채팅 유형 분포 API 데이터
  const chatKindData = chatTypeData?.data
    ? [
        {
          title: "채팅",
          value: chatTypeData.data.distribution?.chat.count ?? 0,
          lastUpdate: new Date().toLocaleString("ko-KR"),
        },
        {
          title: "후원",
          value: chatTypeData.data.distribution?.donation.count ?? 0,
          lastUpdate: new Date().toLocaleString("ko-KR"),
        },
        {
          title: "블라인드",
          value: chatTypeData.data.distribution?.blind.count ?? 0,
          lastUpdate: new Date().toLocaleString("ko-KR"),
        },
      ]
    : [
        {
          title: "채팅",
          value: 0,
          lastUpdate: new Date().toLocaleString("ko-KR"),
        },
        {
          title: "후원",
          value: 0,
          lastUpdate: new Date().toLocaleString("ko-KR"),
        },
        {
          title: "블라인드",
          value: 0,
          lastUpdate: new Date().toLocaleString("ko-KR"),
        },
      ];
  // Line - 시간대별 채팅 수 API 데이터
  const chatCountData = hourlyData?.data?.hourlyData
    ? hourlyData.data.hourlyData.map((item) => ({
        x: new Date(
          `${hourlyData.date}T${String(item.hour).padStart(2, "0")}:00:00+09:00`
        ),
        y: item.chatTypes.chat,
      }))
    : [];

  const blindCountData = hourlyData?.data?.hourlyData
    ? hourlyData.data.hourlyData.map((item) => ({
        x: new Date(
          `${hourlyData.date}T${String(item.hour).padStart(2, "0")}:00:00+09:00`
        ),
        y: item.chatTypes.blind,
      }))
    : [];

  const donationCountData = hourlyData?.data?.hourlyData
    ? hourlyData.data.hourlyData.map((item) => ({
        x: new Date(
          `${hourlyData.date}T${String(item.hour).padStart(2, "0")}:00:00+09:00`
        ),
        y: item.chatTypes.donation,
      }))
    : [];

  // 최대값 계산 (모든 시리즈 중 최대값)
  const allData = [...chatCountData, ...blindCountData, ...donationCountData];
  const maxY = allData.length > 0 ? Math.max(...allData.map((d) => d.y)) : 0;

  // 피크 포인트 계산
  const peakPoint =
    hourlyData?.data?.summary?.peakHour !== undefined
      ? {
          x: new Date(
            `${hourlyData.date}T${String(
              hourlyData.data.summary.peakHour
            ).padStart(2, "0")}:00:00+09:00`
          ),
          y: hourlyData.data.summary.peakChats,
        }
      : null;

  // Top 10 - 사용자 채팅 랭킹 API 데이터
  const userChatCountData = chatRankingData?.ranking
    ? chatRankingData.ranking.map((user) => ({
        name: user.username,
        count: user.chatCount,
      }))
    : [
        { name: "치지직이", count: 6800 },
        { name: "악플러123", count: 5400 },
        { name: "고양이짱", count: 3600 },
        { name: "채팅봇", count: 2000 },
        { name: "시청자1", count: 1200 },
        { name: "사랑해요BJ", count: 500 },
        { name: "스누피", count: 450 },
        { name: "배추도사", count: 300 },
        { name: "히히123", count: 180 },
        { name: "무야호", count: 100 },
      ];

  // 치즈 랭킹 더미 데이터
  const streamerDonationData = [
    { x: "쏘쿨BJ", y: 8500 },
    { x: "도라BJ", y: 6200 },
    { x: "고양이BJ", y: 5800 },
    { x: "치지직왕", y: 4100 },
    { x: "노래하는형", y: 3500 },
  ];

  const userDonationData = [
    { x: "기부왕123", y: 10000 },
    { x: "후원봇", y: 8300 },
    { x: "팬클럽1호", y: 7000 },
    { x: "닉네임김치", y: 6400 },
    { x: "익명기부", y: 5000 },
  ];

  const todayAtKST = (h: number, m: number, s: number = 0) =>
    new Date(
      `${today}T${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}+09:00`
    );

  // 에러 처리
  const err = error?.message ?? null;

  // 상단 3카드 뱃지 색깔
  const totalBadge = badgeFromDelta(totalDelta);
  const donBadge = badgeFromDelta(donDelta);

  // BarChart yDomain 계산 (금액 최대치 기반, 1만 단위 올림)
  const maxStreamerY = streamerDonationData.length
    ? Math.max(...streamerDonationData.map((d) => d.y))
    : 0;
  const maxUserY = userDonationData.length
    ? Math.max(...userDonationData.map((d) => d.y))
    : 0;
  const roundUp = (v: number, step: number) =>
    Math.max(step, Math.ceil(v / step) * step);

  // LineChart 시리즈 구성 (채팅, 블라인드, 후원, 피크 시간대)
  const lineChartSeries = [
    { title: "채팅", type: "line" as const, data: chatCountData },
    { title: "블라인드", type: "line" as const, data: blindCountData },
    { title: "후원", type: "line" as const, data: donationCountData },
    ...(peakPoint
      ? [{ title: "피크 시간대", type: "threshold" as const, x: peakPoint.x }]
      : []),
  ];

  // 고정 차트용 더미 데이터 (백엔드 붙이면 교체)
  // 채팅 카테고리 데이터 (PieChart)
  // const chatKindData = [
  //   { title: "의성어", value: 60, lastUpdate: "Dec 7, 2020" },
  //   { title: "반응형 채팅", value: 10, lastUpdate: "Dec 6, 2020" },
  //   { title: "악플", value: 10, lastUpdate: "Dec 6, 2020" },
  //   { title: "도네이션", value: 5, lastUpdate: "Dec 7, 2020" },
  //   { title: "이모티콘", value: 30, lastUpdate: "Dec 7, 2020" },
  // ];

  // // 시간대별 채팅 수 (LineChart)
  // const chatCountData = [
  //   { x: new Date("2024-08-01T00:00:00+09:00"), y: 40 },
  //   { x: new Date("2024-08-01T01:00:00+09:00"), y: 60 },
  //   { x: new Date("2024-08-01T02:00:00+09:00"), y: 80 },
  //   { x: new Date("2024-08-01T03:00:00+09:00"), y: 150 },
  //   { x: new Date("2024-08-01T04:00:00+09:00"), y: 210 },
  //   { x: new Date("2024-08-01T05:00:00+09:00"), y: 300 },
  //   { x: new Date("2024-08-01T06:00:00+09:00"), y: 420 },
  //   { x: new Date("2024-08-01T07:00:00+09:00"), y: 470 },
  //   { x: new Date("2024-08-01T08:00:00+09:00"), y: 380 },
  //   { x: new Date("2024-08-01T09:00:00+09:00"), y: 350 },
  //   { x: new Date("2024-08-01T10:00:00+09:00"), y: 300 },
  //   { x: new Date("2024-08-01T11:00:00+09:00"), y: 250 },
  //   { x: new Date("2024-08-01T12:00:00+09:00"), y: 280 },
  //   { x: new Date("2024-08-01T13:00:00+09:00"), y: 320 },
  //   { x: new Date("2024-08-01T14:00:00+09:00"), y: 400 },
  //   { x: new Date("2024-08-01T15:00:00+09:00"), y: 450 },
  //   { x: new Date("2024-08-01T16:00:00+09:00"), y: 490 },
  //   { x: new Date("2024-08-01T17:00:00+09:00"), y: 410 },
  //   { x: new Date("2024-08-01T18:00:00+09:00"), y: 380 },
  //   { x: new Date("2024-08-01T19:00:00+09:00"), y: 300 },
  //   { x: new Date("2024-08-01T20:00:00+09:00"), y: 200 },
  //   { x: new Date("2024-08-01T21:00:00+09:00"), y: 100 },
  //   { x: new Date("2024-08-01T22:00:00+09:00"), y: 80 },
  //   { x: new Date("2024-08-01T23:00:00+09:00"), y: 50 },
  // ];
  // const maxY = Math.max(...chatCountData.map((d) => d.y));
  // const peakPoint = chatCountData.reduce(
  //   (max, d) => (d.y > max.y ? d : max),
  //   chatCountData[0]
  // );

  // 유저별 실시간 바차트 데이터
  // 백에서 정렬
  // const [userChatCountData] = useState([
  //   { name: "치지직이", count: 6800 },
  //   { name: "악플러123", count: 5400 },
  //   { name: "고양이짱", count: 3600 },
  //   { name: "채팅봇", count: 2000 },
  //   { name: "시청자1", count: 1200 },
  //   { name: "사랑해요BJ", count: 500 },
  //   { name: "스누피", count: 450 },
  //   { name: "배추도사", count: 300 },
  //   { name: "히히123", count: 180 },
  //   { name: "무야호", count: 100 },
  // ]);

  // const streamerDonationData = [
  //   { x: "쏘쿨BJ", y: 8_500 },
  //   { x: "도라BJ", y: 6_200 },
  //   { x: "고양이BJ", y: 5_800 },
  //   { x: "치지직왕", y: 4_100 },
  //   { x: "노래하는형", y: 3_500 },
  // ];

  // const userDonationData = [
  //   { x: "기부왕123", y: 10000 },
  //   { x: "후원봇", y: 8_300 },
  //   { x: "팬클럽1호", y: 7000 },
  //   { x: "닉네임김치", y: 6_400 },
  //   { x: "익명기부", y: 5000 },
  // ];

  return (
    <SpaceBetween size="l">
      <Box variant="h1">
        <SpaceBetween size="l">
          <Box>
            <Header variant="h1">
              🚀 실시간 치지직 채팅 분석{" "}
              <Box
                display="inline"
                fontSize="heading-m"
                fontWeight="bold"
                color="text-status-info"
                margin={{ left: "l" }}
              >
                {currentTime}
              </Box>
            </Header>
          </Box>
          <Flashbar items={items} />
        </SpaceBetween>
      </Box>

      {/* 상단 요약 */}
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          fitHeight
          header={<Header variant="h2">💤 오늘의 누적 채팅수</Header>}
        >
          <SpaceBetween size="s">
            {loading ? (
              <Box textAlign="center" padding="xl">
                로딩 중...
              </Box>
            ) : error ? (
              <Box textAlign="center" padding="xl" color="text-status-error">
                오류: {err}
              </Box>
            ) : (
              <>
                <Box fontSize="display-l" fontWeight="bold">
                  {fmtNumber(totalToday)}
                </Box>
                <Badge color={totalBadge.color}>
                  {totalBadge.arrow} {totalBadge.pct}%
                </Badge>
              </>
            )}
          </SpaceBetween>
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">🧀 오늘의 치즈</Header>}
        >
          <SpaceBetween size="s">
            {loading ? (
              <Box textAlign="center" padding="xl">
                로딩 중...
              </Box>
            ) : error ? (
              <Box textAlign="center" padding="xl" color="text-status-error">
                오류: {err}
              </Box>
            ) : (
              <>
                <Box fontSize="display-l" fontWeight="bold">
                  {fmtNumber(donToday)}
                </Box>
                <Badge color={donBadge.color}>
                  {donBadge.arrow} {donBadge.pct}%
                </Badge>
              </>
            )}
          </SpaceBetween>
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">🕓 오늘의 피크시간</Header>}
        >
          <SpaceBetween size="s">
            {loading ? (
              <Box textAlign="center" padding="xl">
                로딩 중...
              </Box>
            ) : error ? (
              <Box textAlign="center" padding="xl" color="text-status-error">
                오류: {err}
              </Box>
            ) : (
              <>
                <Box fontSize="display-l" fontWeight="bold">
                  {toHHmm(peakToday)}
                </Box>
                <Badge color="blue">
                  전일 {toHHmm(peakYesterdayH, peakYesterdayM ?? 0)}
                </Badge>
              </>
            )}
          </SpaceBetween>
        </Container>
      </Grid>

      {/* 분석 섹션 */}
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          fitHeight
          header={<Header variant="h2">📊 채팅 유형 분포</Header>}
        >
          {chatTypeLoading ? (
            <Box textAlign="center" padding="xl">
              로딩 중...
            </Box>
          ) : chatTypeError ? (
            <Box textAlign="center" padding="xl" color="text-status-error">
              오류: {chatTypeError.message}
            </Box>
          ) : (
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
                `${datum.value}개, ${((datum.value / sum) * 100).toFixed(0)}%`
              }
              hideFilter
            />
          )}
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">📈 시간대별 채팅 수</Header>}
        >
          {hourlyLoading ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-info">
                데이터를 불러오는 중...
              </Box>
            </Box>
          ) : hourlyError ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-error">
                데이터 로드 중 오류가 발생했습니다.
              </Box>
            </Box>
          ) : (
            <LineChart
              series={lineChartSeries}
              xDomain={
                hourlyData?.date
                  ? [
                      new Date(`${hourlyData.date}T00:00:00+09:00`), // 해당 날짜 00:00:00
                      new Date(`${hourlyData.date}T23:59:59+09:00`), // 해당 날짜 23:59:59
                    ]
                  : [
                      todayAtKST(0, 0, 0), // 오늘 00:00:00
                      todayAtKST(23, 59, 59), // 오늘 23:59:59
                    ]
              }
              yDomain={[0, Math.ceil(maxY / 100) * 100]}
              height={300}
              xScaleType="time"
              xTitle="시간 (한국 기준)"
              yTitle="채팅 수"
              hideFilter
              ariaLabel="채팅 수 라인 차트"
              detailPopoverSeriesContent={({ series, x, y }) => ({
                key: `🌟 ${series.title}`,
                value: `${y}개 (${x.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })})`,
              })}
            />
          )}
        </Container>

        {/* // 사용자 채팅 랭킹 - 바 차트
        <Container header={<Header variant="h2">📊 사용자 채팅 랭킹</Header>}>
          <BarChart
            series={[{ title: "채팅 수", type: "bar", data: userChatCountData }]}
            xDomain={users}
            yDomain={[0, 10000]}
            height={300}
            horizontalBars
            hideFilter
            ariaLabel="User chat ranking chart"
          />
        </Container> */}
        {/* 사용자 채팅 랭킹 - 텍스트 */}
        <Container
          fitHeight
          header={<Header variant="h2">💬 실시간 채팅 랭킹 (Top 10)</Header>}
        >
          {chatRankingLoading ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-info">
                랭킹 데이터를 불러오는 중...
              </Box>
            </Box>
          ) : chatRankingError ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-error">
                랭킹 데이터 로드 중 오류가 발생했습니다.
              </Box>
            </Box>
          ) : (
            <SpaceBetween size="s">
              {[...userChatCountData]
                .sort((a, b) => b.count - a.count)
                .map((user, index) => {
                  const rankIcon =
                    ["🥇", "🥈", "🥉"][index] || `${index + 1}위`;
                  return (
                    <Box key={user.name} display="inline-block">
                      <SpaceBetween direction="horizontal" size="m">
                        <Box fontWeight="bold">
                          {rankIcon} {user.name}
                        </Box>
                        <Box color="text-status-info" fontWeight="bold">
                          {user.count.toLocaleString()}개
                        </Box>
                      </SpaceBetween>
                    </Box>
                  );
                })}
            </SpaceBetween>
          )}
        </Container>
      </Grid>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          // fitHeight
          header={<Header variant="h2">🤑 치즈 후원 스트리머 랭킹</Header>}
        >
          <BarChart
            series={[
              { title: "받은 🧀", type: "bar", data: streamerDonationData },
            ]}
            xDomain={streamerDonationData.map((d) => d.x)}
            yDomain={[0, 100000000]}
            height={300}
            horizontalBars
            hideFilter
            ariaLabel="Streamer donation ranking chart"
          />
        </Container>

        <Container
          // fitHeight
          header={<Header variant="h2">💸 치즈 도네이션 랭킹</Header>}
        >
          <BarChart
            series={[{ title: "보낸 🧀", type: "bar", data: userDonationData }]}
            xDomain={userDonationData.map((d) => d.x)}
            yDomain={[0, 10000000]}
            height={300}
            horizontalBars
            hideFilter
            ariaLabel="User donation ranking chart"
          />
        </Container>
      </Grid>
    </SpaceBetween>
  );
}
