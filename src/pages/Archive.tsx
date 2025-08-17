// src/pages/Archive.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Flashbar,
  Link,
} from "@cloudscape-design/components";
import type { FlashbarProps } from "@cloudscape-design/components";
import { useApi } from "../api/hooks";
import { dashboardService, userService } from "../api/services";
import type {
  DashboardOverview,
  ChatTypeDistribution,
  HourlyChatTypeDistribution,
  ChatRanking,
  DonationStreamerRanking,
  DonationDonorRanking,
} from "../api/services/dashboardService";

const fmtNumber = (n: number) => n.toLocaleString("ko-KR");

// deltaPercent(양수/음수)에 따라 뱃지 색/기호를 그대로 표시
const badgeFromDelta = (deltaPercent: number) => {
  const arrow = deltaPercent >= 0 ? "▲" : "▼";
  const color = deltaPercent > 0 ? "red" : deltaPercent < 0 ? "green" : "blue";
  const pct = Math.abs(deltaPercent).toFixed(1).replace(/\.0$/, "");
  return { arrow, color: color as "red" | "green" | "blue", pct };
};

// 컴포넌트 시작
export default function Archive() {
  const navigate = useNavigate();

  const handleUserClick = async (userName: string) => {
    try {
      // 유저 검색 API 호출
      const response = await userService.searchUsers({ nickname: userName });
      const data = response.data;
      const users = data.users || [];
      const userIdHashes = data.userIdHashes || [];

      if (userIdHashes.length === 0) {
        // 유저를 찾을 수 없는 경우
        navigate(`/not-found?nickname=${encodeURIComponent(userName)}`);
      } else if (userIdHashes.length === 1) {
        // 단일 유저인 경우 바로 상세 페이지로 이동
        const hash = userIdHashes[0];
        const name = users[0]?.name || userName;
        navigate(
          `/user/${encodeURIComponent(name)}?userIdHash=${encodeURIComponent(
            hash
          )}`
        );
      } else {
        // 여러 유저인 경우 선택 페이지로 이동
        navigate("/user-select", {
          state: {
            users,
            userIdHashes,
            searchTerm: userName,
          },
        });
      }
    } catch (error) {
      console.error("User search failed:", error);
      // 에러 발생 시 not-found 페이지로 이동
      navigate(`/not-found?nickname=${encodeURIComponent(userName)}`);
    }
  };

  // KST 기준 포맷터
  const kstFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // 오늘/어제 (KST)
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = kstFmt.format(today);
  const yesterdayStr = kstFmt.format(yesterday);

  // ✅ 초기값: 어제
  const [selectedDate, setSelectedDate] = useState(yesterdayStr);

  // Flash 메시지
  const [items, setItems] = useState<FlashbarProps.MessageDefinition[]>([
    {
      id: "notice_1",
      type: "info",
      dismissible: true,
      dismissLabel: "닫기",
      onDismiss: () => setItems([]),
      content: (
        <>
          과거의 채팅 분석 정보를 확인해보세요.{" "}
          <Link color="inverted" href="/dashboard">
            실시간 데이터 보기
          </Link>
        </>
      ),
    },
  ]);

  // API 호출 함수들을 useCallback으로 메모이제이션
  const overviewApiCall = useCallback(
    () => dashboardService.getDashboardOverview(selectedDate),
    [selectedDate]
  );

  const chatTypeApiCall = useCallback(
    () => dashboardService.getChatTypeDistribution(selectedDate),
    [selectedDate]
  );

  const hourlyChatTypeApiCall = useCallback(
    () =>
      dashboardService.getHourlyChatTypeDistribution(
        selectedDate,
        selectedDate
      ),
    [selectedDate]
  );

  const chatRankingApiCall = useCallback(
    () => dashboardService.getChatRanking({ period: selectedDate }),
    [selectedDate]
  );

  const donationStreamerRankingApiCall = useCallback(
    () => dashboardService.getDonationStreamerRanking({ period: selectedDate }),
    [selectedDate]
  );

  const donationDonorRankingApiCall = useCallback(
    () => dashboardService.getDonationDonorRanking({ period: selectedDate }),
    [selectedDate]
  );

  // 상단 3카드 상태 - 새로운 API 사용
  const {
    data: overviewData,
    loading,
    error,
  } = useApi<DashboardOverview>(overviewApiCall, [overviewApiCall]);

  // 채팅 유형 분포 API 호출
  const {
    data: chatTypeData,
    loading: chatTypeLoading,
    error: chatTypeError,
  } = useApi<ChatTypeDistribution>(chatTypeApiCall, [chatTypeApiCall]);

  // 시간대별 채팅 수 API 호출
  const {
    data: hourlyData,
    loading: hourlyLoading,
    error: hourlyError,
  } = useApi<HourlyChatTypeDistribution>(hourlyChatTypeApiCall, [
    hourlyChatTypeApiCall,
  ]);

  // 실시간 채팅 랭킹 API 호출
  const {
    data: chatRankingData,
    loading: chatRankingLoading,
    error: chatRankingError,
  } = useApi<ChatRanking>(chatRankingApiCall, [chatRankingApiCall]);

  // 후원 스트리머 랭킹 API 호출
  const {
    data: donationStreamerData,
    loading: donationStreamerLoading,
    error: donationStreamerError,
  } = useApi<DonationStreamerRanking>(donationStreamerRankingApiCall, [
    donationStreamerRankingApiCall,
  ]);

  // 치즈 도네이션 랭킹 API 호출
  const {
    data: donationDonorData,
    loading: donationDonorLoading,
    error: donationDonorError,
  } = useApi<DonationDonorRanking>(donationDonorRankingApiCall, [
    donationDonorRankingApiCall,
  ]);

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

  const toHHmm = (h: number | null, m: number | null = 0) => {
    if (h == null) return "-";
    return `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  };

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
  const hourlyLineData = hourlyData?.data?.hourlyData
    ? hourlyData.data.hourlyData.map((item) => ({
        x: new Date(
          `${selectedDate}T${String(item.hour).padStart(2, "0")}:00:00+09:00`
        ),
        y: item.chatTypes.chat + item.chatTypes.donation + item.chatTypes.blind,
      }))
    : [];

  const maxY = hourlyLineData.length
    ? Math.max(...hourlyLineData.map((d) => d.y))
    : 0;
  const peakPoint = hourlyLineData.length
    ? hourlyLineData.reduce((a, b) => (a.y >= b.y ? a : b))
    : null;

  const thresholdSeries = peakPoint
    ? [{ title: "피크 시간대", type: "threshold" as const, x: peakPoint.x }]
    : [];

  // Top 10 - 실시간 채팅 랭킹 API 데이터
  const userChatCountData = chatRankingData?.data?.ranking
    ? chatRankingData.data.ranking.map((item) => ({
        name: item.username,
        count: item.chatCount,
      }))
    : [];

  // 치즈 랭킹 - 후원 스트리머 랭킹 API 데이터
  const streamerDonationData = donationStreamerData?.data?.ranking
    ? donationStreamerData.data.ranking.map((item) => ({
        x: item.streamerName,
        y: item.receivedCheese,
      }))
    : [];

  // 치즈 랭킹 - 도네이션 랭킹 API 데이터
  const userDonationData = donationDonorData?.data?.ranking
    ? donationDonorData.data.ranking.map((item) => ({
        x: item.username,
        y: item.donatedCheese,
      }))
    : [];

  const maxStreamerY = streamerDonationData.length
    ? Math.max(...streamerDonationData.map((d) => d.y))
    : 0;
  const maxUserY = userDonationData.length
    ? Math.max(...userDonationData.map((d) => d.y))
    : 0;

  const calculateYDomain = (maxValue: number) => {
    const step =
      maxValue >= 1000000
        ? 1000000
        : maxValue >= 100000
        ? 100000
        : maxValue >= 10000
        ? 10000
        : 1000;
    const max = Math.max(step, Math.ceil(maxValue / step) * step);
    return [0, max];
  };

  const totalBadge = badgeFromDelta(totalDelta);
  const donBadge = badgeFromDelta(donDelta);

  return (
    <SpaceBetween size="l">
      <Flashbar items={items} />

      {/* 헤더 + 날짜 선택 */}
      <Grid gridDefinition={[{ colspan: 9 }, { colspan: 3 }]}>
        <Header variant="h1">
          🗂️ {selectedDate} 치지직 채팅 분석 (아카이브)
        </Header>
        <Box>
          <FormField>
            <DatePicker
              value={selectedDate}
              onChange={({ detail }) => setSelectedDate(detail.value)}
              placeholder="YYYY-MM-DD"
              // ✅ 미래 날짜 비활성화 (KST 기준)
              isDateEnabled={(date) => kstFmt.format(date) <= todayStr}
              openCalendarAriaLabel={(d) =>
                `날짜 선택${d ? `, 선택된 날짜: ${d}` : ""}`
              }
              expandToViewport
            />
          </FormField>
        </Box>
      </Grid>

      {/* 상단 요약 - 2개 박스 (피크시간 제외) */}
      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          fitHeight
          header={<Header variant="h2">💬 누적 채팅수</Header>}
        >
          <SpaceBetween size="s">
            {loading ? (
              <Box textAlign="center" padding="xl">
                <Box fontSize="heading-m" color="text-status-info">
                  데이터를 불러오는 중...
                </Box>
              </Box>
            ) : error ? (
              <Box textAlign="center" padding="xl">
                <Box fontSize="heading-m" color="text-status-error">
                  데이터 로드 중 오류가 발생했습니다.
                </Box>
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
          header={<Header variant="h2">🧀 누적 치즈</Header>}
        >
          <SpaceBetween size="s">
            {loading ? (
              <Box textAlign="center" padding="xl">
                <Box fontSize="heading-m" color="text-status-info">
                  데이터를 불러오는 중...
                </Box>
              </Box>
            ) : error ? (
              <Box textAlign="center" padding="xl">
                <Box fontSize="heading-m" color="text-status-error">
                  데이터 로드 중 오류가 발생했습니다.
                </Box>
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
      </Grid>

      {/* 분석 섹션 */}
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Container
          fitHeight
          header={<Header variant="h2">📊 채팅 유형 분포</Header>}
        >
          {chatTypeLoading ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-info">
                차트 데이터를 불러오는 중...
              </Box>
            </Box>
          ) : chatTypeError ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-error">
                차트 데이터 로드 중 오류가 발생했습니다.
              </Box>
            </Box>
          ) : (
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
          )}
        </Container>

        <Container
          fitHeight
          header={<Header variant="h2">📈 시간대별 채팅 수</Header>}
        >
          {hourlyLoading ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-info">
                차트 데이터를 불러오는 중...
              </Box>
            </Box>
          ) : hourlyError ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-error">
                차트 데이터 로드 중 오류가 발생했습니다.
              </Box>
            </Box>
          ) : (
            <LineChart
              series={[
                { title: "Chat count", type: "line", data: hourlyLineData },
                ...thresholdSeries,
              ]}
              xDomain={
                hourlyLineData.length
                  ? [
                      hourlyLineData[0].x,
                      hourlyLineData[hourlyLineData.length - 1].x,
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
          )}
        </Container>

        {/* 실시간 채팅 랭킹 (Top 10) */}
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
            <SpaceBetween size="xxs">
              {[...userChatCountData]
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((user, index) => {
                  const rank = index + 1;
                  const rankIcon = rank <= 3 ? ["🥇", "🥈", "🥉"][index] : null;
                  const rankColor =
                    rank <= 3 ? "#FFD700" : rank <= 10 ? "#C0C0C0" : "#CD7F32";

                  return (
                    <div
                      key={user.name}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                        background:
                          rank <= 3
                            ? "linear-gradient(135deg, #fff9e6, #fff5d6)"
                            : "#ffffff",
                        transition: "all 0.2s ease",
                        marginBottom: "4px",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                      onClick={() => handleUserClick(user.name)}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                        }}
                      >
                        {/* 순위 */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            minWidth: "50px",
                            flexShrink: 0,
                          }}
                        >
                          {rankIcon ? (
                            <span
                              style={{ fontSize: "24px", marginRight: "8px" }}
                            >
                              {rankIcon}
                            </span>
                          ) : (
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background:
                                  rankColor === "#FFD700"
                                    ? "#fff3cd"
                                    : "#f8f9fa",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `2px solid ${rankColor}`,
                                fontSize: "12px",
                                fontWeight: "bold",
                                color: rankColor,
                              }}
                            >
                              {rank}
                            </div>
                          )}
                        </div>

                        {/* 사용자 정보 */}
                        <div
                          style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "16px",
                              color: "#495057",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {user.name}
                          </div>
                        </div>

                        {/* 채팅 수 */}
                        <div
                          style={{
                            textAlign: "right",
                            minWidth: "70px",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "#007bff",
                            }}
                          >
                            {user.count.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </SpaceBetween>
          )}
        </Container>
      </Grid>

      {/* 치즈 랭킹 */}
      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container
          header={<Header variant="h2">🤑 치즈 후원 스트리머 랭킹</Header>}
        >
          {donationStreamerLoading ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-info">
                스트리머 랭킹 데이터를 불러오는 중...
              </Box>
            </Box>
          ) : donationStreamerError ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-error">
                스트리머 랭킹 데이터 로드 중 오류가 발생했습니다.
              </Box>
            </Box>
          ) : (
            <BarChart
              series={[
                { title: "받은 🧀", type: "bar", data: streamerDonationData },
              ]}
              xDomain={streamerDonationData.map((d) => d.x)}
              yDomain={calculateYDomain(maxStreamerY)}
              height={300}
              horizontalBars
              hideFilter
              ariaLabel="Streamer donation ranking chart"
            />
          )}
        </Container>

        <Container header={<Header variant="h2">💸 치즈 도네이션 랭킹</Header>}>
          {donationDonorLoading ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-info">
                도네이션 랭킹 데이터를 불러오는 중...
              </Box>
            </Box>
          ) : donationDonorError ? (
            <Box textAlign="center" padding="xl">
              <Box fontSize="heading-m" color="text-status-error">
                도네이션 랭킹 데이터 로드 중 오류가 발생했습니다.
              </Box>
            </Box>
          ) : (
            <BarChart
              series={[
                { title: "보낸 🧀", type: "bar", data: userDonationData },
              ]}
              xDomain={userDonationData.map((d) => d.x)}
              yDomain={calculateYDomain(maxUserY)}
              height={300}
              horizontalBars
              hideFilter
              ariaLabel="User donation ranking chart"
            />
          )}
        </Container>
      </Grid>
    </SpaceBetween>
  );
}
