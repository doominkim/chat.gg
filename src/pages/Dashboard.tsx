// src/pages/Dashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
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

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "https://api.f-yourchat.com";

const ENDPOINTS = {
  summary: (dateYYYYMMDD: string) =>
    `${API_BASE_URL}/dashboard/summary?date=${dateYYYYMMDD}`,
};

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
  const [items, setItems] = React.useState([
    {
      type: "info",
      dismissible: true,
      dismissLabel: "닫기",
      onDismiss: () => setItems([]),
      content: (
        <>
          과거의 채팅 분석 정보를 확인해보세요.{" "}
          <Link color="inverted" href="/archive">
            지난 데이터 보기
          </Link>
        </>
      ),
      id: "notice_1",
    },
  ]);

  // 상단 3카드 상태
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [totalToday, setTotalToday] = useState(0);
  const [totalDelta, setTotalDelta] = useState(0);

  const [donToday, setDonToday] = useState(0);
  const [donDelta, setDonDelta] = useState(0);

  const [peakToday, setPeakToday] = useState<number | null>(null);
  const [peakYesterdayH, setPeakYesterdayH] = useState<number | null>(null);
  const [peakYesterdayM, setPeakYesterdayM] = useState<number | null>(0);

  // 그래프 상태
  // Pie
  const [chatKindData, setChatKindData] = useState<
    Array<{ title: string; value: number; lastUpdate?: string }>
  >([]);
  // Line
  const [chatCountData, setChatCountData] = useState<
    Array<{ x: Date; y: number }>
  >([]);
  const [maxY, setMaxY] = useState(0);
  const [peakPoint, setPeakPoint] = useState<{ x: Date; y: number } | null>(
    null
  );
  // Top 10
  const [userChatCountData, setUserChatCountData] = useState<
    Array<{ name: string; count: number }>
  >([]);

  // 새로 추가: 치즈 랭킹 (BarChart에서 기대하는 x/y 형태)
  const [streamerDonationData, setStreamerDonationData] = useState<
    Array<{ x: string; y: number }>
  >([]);
  const [userDonationData, setUserDonationData] = useState<
    Array<{ x: string; y: number }>
  >([]);

  const today = useMemo(todayKST, []);

  const todayAtKST = (h: number, m: number, s: number = 0) =>
    new Date(
      `${today}T${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}+09:00`
    );

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(ENDPOINTS.summary(today), {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: SummaryResponse = await res.json();
        console.log("[SummaryResponse]", json);

        if (!json?.success)
          throw new Error(json?.message || "요약 데이터 수신 실패");

        // 상단 3카드
        const { totals, donations, peaks } = json.data;
        setTotalToday(totals.todayCount ?? 0);
        setTotalDelta(totals.deltaPercent ?? 0);
        setDonToday(donations.todayCount ?? 0);
        setDonDelta(donations.deltaPercent ?? 0);
        setPeakToday(peaks.todayHour ?? null);
        setPeakYesterdayH(peaks.yesterdayHour ?? null);
        setPeakYesterdayM(peaks.yesterdayMinute ?? 0);

        // 그래프 섹션
        setChatKindData(mapPieDataFromSummary(json));
        const { line, maxY, peakPoint } = mapHourlyLineFromSummary(today, json);
        setChatCountData(line);
        setMaxY(maxY);
        setPeakPoint(peakPoint);
        setUserChatCountData(mapTopChattersFromSummary(json));

        // 치즈 랭킹 섹션 (이번에 API로 치환)
        setStreamerDonationData(mapStreamerDonationsFromSummary(json));
        setUserDonationData(mapTopDonorsFromSummary(json));
      } catch (e: any) {
        setErr(e?.message ?? "데이터 로드 실패");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [today]);

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

  // LineChart threshold 시리즈(피크 있을 때만)
  const thresholdSeries = peakPoint
    ? [{ title: "피크 시간대", type: "threshold" as const, x: peakPoint.x }]
    : [];

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
            <Box fontSize="display-l" fontWeight="bold">
              {fmtNumber(totalToday)}
            </Box>
            <Badge color={totalBadge.color}>
              {totalBadge.arrow} {totalBadge.pct}%{/* ▲ 12% */}
            </Badge>
          </SpaceBetween>
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">🧀 오늘의 치즈</Header>}
        >
          <SpaceBetween size="s">
            <Box fontSize="display-l" fontWeight="bold">
              {fmtNumber(donToday)}
            </Box>
            <Badge color={donBadge.color}>
              {donBadge.arrow} {donBadge.pct}%
            </Badge>
          </SpaceBetween>
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">🕓 오늘의 피크시간</Header>}
        >
          <SpaceBetween size="s">
            <Box fontSize="display-l" fontWeight="bold">
              {toHHmm(peakToday)}
              {/* 16:00 */}
            </Box>
            <Badge color="blue">
              전일 {toHHmm(peakYesterdayH, peakYesterdayM ?? 0)}
            </Badge>
          </SpaceBetween>
        </Container>
      </Grid>

      {/* 분석 섹션 */}
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
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
              `${datum.value}개, ${((datum.value / sum) * 100).toFixed(0)}%`
            }
            hideFilter
          />
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">📈 시간대별 채팅 수</Header>}
        >
          <LineChart
            series={[
              { title: "Chat count", type: "line", data: chatCountData },
              ...thresholdSeries,
              // { title: "피크 시간대", type: "threshold", x: peakPoint.x },
            ]}
            // xDomain={[
            //   new Date("2024-08-01T00:00:00+09:00"),
            //   new Date("2024-08-01T23:59:59+09:00"),
            // ]}
            xDomain={[
              todayAtKST(0, 0, 0), // 오늘 00:00:00
              todayAtKST(23, 59, 59), // 오늘 23:59:59
            ]}
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
          <SpaceBetween size="s">
            {[...userChatCountData]
              .sort((a, b) => b.count - a.count)
              .map((user, index) => {
                const rankIcon = ["🥇", "🥈", "🥉"][index] || `${index + 1}위`;
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
