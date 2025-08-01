import React, { useState, useEffect } from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Grid,
  Box,
  ColumnLayout,
  Cards,
  Badge,
  PieChart,
  LineChart,
  BarChart,
  Flashbar,
  Link,
} from "@cloudscape-design/components";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
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
          const formattedDate = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });

    const formattedTime = now.toLocaleTimeString("ko-KR", {
      hour12: false,
    });
    setCurrentTime(`${formattedDate}  ${formattedTime}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Flash 메시지
  const [flashItems, setFlashItems] = useState([
    {
      type: "info",
      dismissible: true,
      dismissLabel: "닫기",
      onDismiss: () => setFlashItems([]),
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

  // 채팅 카테고리 데이터 (PieChart)
  const chatKindData = [
    { title: "의성어", value: 60, lastUpdate: "Dec 7, 2020" },
    { title: "반응형 채팅", value: 10, lastUpdate: "Dec 6, 2020" },
    { title: "악플", value: 10, lastUpdate: "Dec 6, 2020" },
    { title: "도네이션", value: 5, lastUpdate: "Dec 7, 2020" },
    { title: "이모티콘", value: 30, lastUpdate: "Dec 7, 2020" },
  ];

  // 시간대별 채팅 수 (LineChart)
  const chatCountData = [
    { x: new Date("2024-08-01T00:00:00+09:00"), y: 40 },
    { x: new Date("2024-08-01T01:00:00+09:00"), y: 60 },
    { x: new Date("2024-08-01T02:00:00+09:00"), y: 80 },
    { x: new Date("2024-08-01T03:00:00+09:00"), y: 150 },
    { x: new Date("2024-08-01T04:00:00+09:00"), y: 210 },
    { x: new Date("2024-08-01T05:00:00+09:00"), y: 300 },
    { x: new Date("2024-08-01T06:00:00+09:00"), y: 420 },
    { x: new Date("2024-08-01T07:00:00+09:00"), y: 470 },
    { x: new Date("2024-08-01T08:00:00+09:00"), y: 380 },
    { x: new Date("2024-08-01T09:00:00+09:00"), y: 350 },
    { x: new Date("2024-08-01T10:00:00+09:00"), y: 300 },
    { x: new Date("2024-08-01T11:00:00+09:00"), y: 250 },
    { x: new Date("2024-08-01T12:00:00+09:00"), y: 280 },
    { x: new Date("2024-08-01T13:00:00+09:00"), y: 320 },
    { x: new Date("2024-08-01T14:00:00+09:00"), y: 400 },
    { x: new Date("2024-08-01T15:00:00+09:00"), y: 450 },
    { x: new Date("2024-08-01T16:00:00+09:00"), y: 490 },
    { x: new Date("2024-08-01T17:00:00+09:00"), y: 410 },
    { x: new Date("2024-08-01T18:00:00+09:00"), y: 380 },
    { x: new Date("2024-08-01T19:00:00+09:00"), y: 300 },
    { x: new Date("2024-08-01T20:00:00+09:00"), y: 200 },
    { x: new Date("2024-08-01T21:00:00+09:00"), y: 100 },
    { x: new Date("2024-08-01T22:00:00+09:00"), y: 80 },
    { x: new Date("2024-08-01T23:00:00+09:00"), y: 50 },
  ];
  const maxY = Math.max(...chatCountData.map((d) => d.y));
  const peakPoint = chatCountData.reduce(
    (max, d) => (d.y > max.y ? d : max),
    chatCountData[0]
  );

  // 유저별 실시간 바차트 데이터
  // 백에서 정렬
  const [userChatCountData] = useState([
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
  ]);

  const streamerDonationData = [
    { x: "쏘쿨BJ", y: 8_500 },
    { x: "도라BJ", y: 6_200 },
    { x: "고양이BJ", y: 5_800 },
    { x: "치지직왕", y: 4_100 },
    { x: "노래하는형", y: 3_500 },
  ];

  const userDonationData = [
    { x: "기부왕123", y: 10000 },
    { x: "후원봇", y: 8_300 },
    { x: "팬클럽1호", y: 7000 },
    { x: "닉네임김치", y: 6_400 },
    { x: "익명기부", y: 5000 },
  ];

  const [value, setValue] = React.useState({
    type: "absolute",
    startDate: "2018-01-09T12:34:56",
    endDate: "2018-01-19T15:30:00"
  });

  return (
    <SpaceBetween size="l">
      <Box
        variant="h1"
      >
        <SpaceBetween size="l">
          <Box style={{ flex: "1 1 auto", minWidth: 0 }}>
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
          <Flashbar items={flashItems} />
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
              1,234
            </Box>
            <Badge color="green">▲ 12%</Badge>
          </SpaceBetween>
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">🧀 오늘의 치즈</Header>}
        >
          <SpaceBetween size="s">
            <Box fontSize="display-l" fontWeight="bold">
              45,678
            </Box>
            <Badge color="red">▼ 8%</Badge>
          </SpaceBetween>
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">🕓 오늘의 피크시간</Header>}
        >
          <SpaceBetween size="s">
            <Box fontSize="display-l" fontWeight="bold">
              16:00
            </Box>
            <Badge color="blue">전일 01:12</Badge>
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
              `${datum.value} units, ${((datum.value / sum) * 100).toFixed(0)}%`
            }
          />
        </Container>
        <Container
          fitHeight
          header={<Header variant="h2">📈 시간대별 채팅 수</Header>}
        >
          <LineChart
            series={[
              { title: "Chat count", type: "line", data: chatCountData },
              { title: "피크 시간대", type: "threshold", x: peakPoint.x },
            ]}
            xDomain={[
              new Date("2024-08-01T00:00:00+09:00"),
              new Date("2024-08-01T23:59:59+09:00"),
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
                  <Box
                    key={user.name}
                    display="inline-block"
                    justifyContent="space-between"
                    alignItems="center"
                  >
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
            yDomain={[0, 10000]}
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
            yDomain={[0, 10000]}
            height={300}
            horizontalBars
            hideFilter
            ariaLabel="User donation ranking chart"
          />
        </Container>
      </Grid>

      {/* 최근 활동 */}
      {/* <Container header={<Header variant="h2">Recent Activities</Header>}>
        <Cards
          cardDefinition={{
            header: (item) => item.title,
            sections: [
              { id: "description", content: (item) => item.description },
              {
                id: "status",
                content: (item) => (
                  <Badge color={item.status === "Active" ? "green" : "grey"}>
                    {item.status}
                  </Badge>
                ),
              },
            ],
          }}
          items={[
            {
              title: "User Registration",
              description: "New user signed up",
              status: "Active",
            },
            {
              title: "Order Placed",
              description: "Order #12345 placed",
              status: "Active",
            },
            {
              title: "Payment Processed",
              description: "Payment for order #12344",
              status: "Completed",
            },
          ]}
          loadingText="Loading activities"
          empty="No activities found"
        />
      </Container> */}
    </SpaceBetween>
  );
};

export default Dashboard;
