// src/pages/Archive.tsx
import React, { useState, useEffect } from "react";
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
  DatePicker,
  FormField,
} from "@cloudscape-design/components";

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "https://api.f-yourchat.com";

const ENDPOINTS = {
  summary: (dateYYYYMMDD: string) =>
    `${API_BASE_URL}/dashboard/summary?date=${dateYYYYMMDD}`,
};

// === Dashboard.tsx 과 동일한 타입 ===
type SummaryResponse = {
  success: boolean;
  data: {
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
    charts: {
      chatKinds: Array<{ label: string; count: number; updatedAt?: string }>;
      hourly: Array<{ hour: number; count: number }>; // 0..23
      topChatters: Array<{ name: string; count: number }>;
      streamerDonations: Array<{ name: string; amount: number }>;
      topDonors: Array<{ name: string; amount: number }>;
    };
  };
  message?: string;
};

const fmtNumber = (n: number) => n.toLocaleString("ko-KR");
const toHHmm = (h: number | null, m: number | null = 0) =>
  h == null
    ? "-"
    : `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
const badgeFromDelta = (deltaPercent: number) => {
  const arrow = deltaPercent >= 0 ? "▲" : "▼";
  const color = deltaPercent > 0 ? "red" : deltaPercent < 0 ? "green" : "blue";
  const pct = Math.abs(deltaPercent).toFixed(1).replace(/\.0$/, "");
  return { arrow, color: color as "red" | "green" | "blue", pct };
};

// === Dashboard.tsx 과 동일한 매핑 유틸 ===
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
    : null;
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

export default function Archive() {
  // 기본값: 오늘 날짜 문자열 (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
  );

  // 상단 카드 상태
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
  const [chatKindData, setChatKindData] = useState<
    Array<{ title: string; value: number; lastUpdate?: string }>
  >([]);
  const [chatCountData, setChatCountData] = useState<
    Array<{ x: Date; y: number }>
  >([]);
  const [maxY, setMaxY] = useState(0);
  const [peakPoint, setPeakPoint] = useState<{ x: Date; y: number } | null>(
    null
  );
  const [userChatCountData, setUserChatCountData] = useState<
    Array<{ name: string; count: number }>
  >([]);

  // 치즈 랭킹
  const [streamerDonationData, setStreamerDonationData] = useState<
    Array<{ x: string; y: number }>
  >([]);
  const [userDonationData, setUserDonationData] = useState<
    Array<{ x: string; y: number }>
  >([]);

  // 데이터 로드 (selectedDate 변경 때마다)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      if (!selectedDate) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(ENDPOINTS.summary(selectedDate), {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: SummaryResponse = await res.json();
        if (!json?.success)
          throw new Error(json?.message || "요약 데이터 수신 실패");

        // 상단 카드
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
        const { line, maxY, peakPoint } = mapHourlyLineFromSummary(
          selectedDate,
          json
        );
        setChatCountData(line);
        setMaxY(maxY);
        setPeakPoint(peakPoint);
        setUserChatCountData(mapTopChattersFromSummary(json));

        // 치즈 랭킹
        setStreamerDonationData(mapStreamerDonationsFromSummary(json));
        setUserDonationData(mapTopDonorsFromSummary(json));
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message ?? "데이터 로드 실패");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [selectedDate]);

  const totalBadge = badgeFromDelta(totalDelta);
  const donBadge = badgeFromDelta(donDelta);

  const maxStreamerY = streamerDonationData.length
    ? Math.max(...streamerDonationData.map((d) => d.y))
    : 0;
  const maxUserY = userDonationData.length
    ? Math.max(...userDonationData.map((d) => d.y))
    : 0;
  const roundUp = (v: number, step: number) =>
    Math.max(step, Math.ceil(v / step) * step);

  const thresholdSeries = peakPoint
    ? [{ title: "피크 시간대", type: "threshold" as const, x: peakPoint.x }]
    : [];

  return (
    <SpaceBetween size="l">
      {/* 헤더 + 날짜 선택 */}
      <Grid gridDefinition={[{ colspan: 9 }, { colspan: 3 }]}>
        <Header variant="h1">
          🗂️ {selectedDate} 치지직 채팅 분석 (아카이브)
        </Header>
        <Box>

          <FormField>
            <DatePicker
              onChange={({ detail }) => setSelectedDate(detail.value)}
              value={selectedDate}
              placeholder="YYYY-MM-DD"
              openCalendarAriaLabel={(selectedDate) =>
                `날짜 선택 ${
                  selectedDate ? `, 선택된 날짜: ${selectedDate}` : ""
                }`
              }
              expandToViewport
            />
          </FormField>
        </Box>
      </Grid>

      {/* 상단 요약 */}
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          fitHeight
          header={<Header variant="h2">💤 누적 채팅수</Header>}
        >
          <SpaceBetween size="s">
            <Box fontSize="display-l" fontWeight="bold">
              {fmtNumber(totalToday)}
            </Box>
            <Badge color={totalBadge.color}>
              {totalBadge.arrow} {totalBadge.pct}%
            </Badge>
          </SpaceBetween>
        </Container>

        <Container
          fitHeight
          header={<Header variant="h2">🧀 누적 치즈</Header>}
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

        <Container fitHeight header={<Header variant="h2">🕓 피크시간</Header>}>
          <SpaceBetween size="s">
            <Box fontSize="display-l" fontWeight="bold">
              {toHHmm(peakToday)}
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
        </Container>

        <Container
          fitHeight
          header={<Header variant="h2">📈 시간대별 채팅 수</Header>}
        >
          <LineChart
            series={[
              { title: "Chat count", type: "line", data: chatCountData },
              ...thresholdSeries,
            ]}
            xDomain={
              chatCountData.length
                ? [
                    chatCountData[0].x,
                    chatCountData[chatCountData.length - 1].x,
                  ]
                : [
                    new Date(`${selectedDate}T00:00:00+09:00`),
                    new Date(`${selectedDate}T23:59:59+09:00`),
                  ]
            }
            yDomain={[0, Math.max(100, Math.ceil((maxY || 0) / 100) * 100)]}
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

        {/* 실시간 채팅 랭킹 (Top 10) */}
        <Container
          fitHeight
          header={<Header variant="h2">💬 채팅 랭킹 (Top 10)</Header>}
        >
          <SpaceBetween size="s">
            {[...userChatCountData]
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
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

      {/* 치즈 랭킹 */}
      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          header={<Header variant="h2">🤑 치즈 후원 스트리머 랭킹</Header>}
        >
          <BarChart
            series={[
              { title: "받은 🧀", type: "bar", data: streamerDonationData },
            ]}
            xDomain={streamerDonationData.map((d) => d.x)}
            yDomain={[
              0,
              100000000
            ]}
            height={300}
            horizontalBars
            hideFilter
            ariaLabel="Streamer donation ranking chart"
          />
        </Container>

        <Container header={<Header variant="h2">💸 치즈 도네이션 랭킹</Header>}>
          <BarChart
            series={[{ title: "보낸 🧀", type: "bar", data: userDonationData }]}
            xDomain={userDonationData.map((d) => d.x)}
            yDomain={[
              0,
              10000000
            ]}
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