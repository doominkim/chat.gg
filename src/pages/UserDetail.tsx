// // src/pages/UserDetail.tsx
import React, { useState, useEffect, useMemo } from "react";
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

/** ===== env & endpoints ===== */
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "https://api.f-yourchat.com";

/** 프론트에서 직접 람다 호출 (Function URL 또는 API Gateway URL) */
const LAMBDA_ANALYZE_URL = (import.meta as any)?.env
  ?.VITE_LAMBDA_ANALYZE_URL as string;

const ENDPOINTS = {
  chatKinds: (nickname: string, start: string, end: string) =>
    `${API_BASE_URL}/user/chat-kinds?nickname=${encodeURIComponent(
      nickname
    )}&start=${start}&end=${end}`,
  topStreamers: (nickname: string, start: string, end: string) =>
    `${API_BASE_URL}/user/top-streamers?nickname=${encodeURIComponent(
      nickname
    )}&start=${start}&end=${end}`,
  chatHistory: (nickname: string, start: string, end: string) =>
    `${API_BASE_URL}/user/chat-history?nickname=${encodeURIComponent(
      nickname
    )}&start=${start}&end=${end}`,
};

type MessageType = "text" | "emote" | "donation";

interface ChatMessage {
  id: string;
  nickname: string; // 식별자 = 닉네임
  channelId: string; // 어떤 스트리머 채널에서 쳤는지
  channelName: string;
  message: string;
  messageType: MessageType;
  createdAt: string; // ISO string
}

type ChatKindsItem = { title: string; value: number; lastUpdate?: string };
type ChatKindsResponse = {
  success: boolean;
  data: ChatKindsItem[];
  message?: string;
};

type TopStreamersItem = { name: string; count: number; percentage?: number };
type TopStreamersResponse = {
  success: boolean;
  data: TopStreamersItem[];
  message?: string;
};

type ChatHistoryResponse = {
  success: boolean;
  data: ChatMessage[];
  message?: string;
};

type WordCloudItem = { text: string; value: number };

type FreqWordItem = {
  rank: number;
  word: string;
  count: number;
  percentage: number;
};

/** 단일 람다 응답 타입 */
type AnalyzeLambdaResp = {
  success: boolean;
  data: {
    wordCloud?: WordCloudItem[];
    frequentWords?: Array<{ word: string; count: number; percentage: number }>;
    persona?: {
      favoriteStreamers?: Array<{ name: string; score: number }>;
      traits?: Array<{ text: string; value: number }>;
    };
  };
  message?: string;
};

/** ===== helpers ===== */
const toLocalTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

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

  /** 로딩/에러 */
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** 데이터 상태 */
  const [wordCloudData, setWordCloudData] = useState<WordCloudItem[]>([]);
  const [freqWords, setFreqWords] = useState<FreqWordItem[]>([]);
  const [chatKinds, setChatKinds] = useState<ChatKindsItem[]>([]);
  const [topStreamers, setTopStreamers] = useState<TopStreamersItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  /** 유저 존재 여부: 백엔드에서 NotFound를 404로 준다면 여기서 체크 */
  const userFound = !!nickname; // 필요시 API로 프로필 조회해 validate 가능

  /** API/Lambda 호출 */
  useEffect(() => {
    if (!nickname) return;
    if (
      !range ||
      range.type !== "absolute" ||
      !range.startDate ||
      !range.endDate
    )
      return;

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { startDate, endDate } = range;

        // 1, 2) 단일 람다 호출: 워드클라우드 + 많이 쓴 단어
        const pLambda = (async () => {
          if (!LAMBDA_ANALYZE_URL) {
            setWordCloudData([]);
            setFreqWords([]);
            return;
          }
          const res = await fetch(LAMBDA_ANALYZE_URL, {
            method: "POST",
            signal: ac.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nickname,
              startDate,
              endDate,
              // 옵션(람다에서 사용): 분석 항목 지정
              tasks: ["wordCloud", "frequentWords", "persona"],
              topN: 10,
              maxItems: 60,
              excludeEmotes: true,
            }),
          });
          if (!res.ok) throw new Error(`Lambda(analyze) HTTP ${res.status}`);
          const json: AnalyzeLambdaResp = await res.json();
          if (!json?.success)
            throw new Error(json?.message || "AI 분석 수신 실패");

          // 워드클라우드: 우선 data.wordCloud, 없으면 persona.traits 사용
          const wc = json.data?.wordCloud ?? json.data?.persona?.traits ?? [];
          setWordCloudData(Array.isArray(wc) ? wc : []);

          // 많이 쓴 단어: rank가 없다고 가정하고 프론트에서 순위 부여
          const fw = json.data?.frequentWords ?? [];
          const ranked: FreqWordItem[] = fw.map((it, i) => ({
            rank: i + 1,
            word: it.word,
            count: it.count,
            percentage: it.percentage,
          }));
          setFreqWords(ranked);
        })();

        // 2) API: 채팅 유형 분포
        const pKinds = (async () => {
          const res = await fetch(
            ENDPOINTS.chatKinds(nickname, startDate!, endDate!),
            { signal: ac.signal }
          );
          if (!res.ok) throw new Error(`chat-kinds HTTP ${res.status}`);
          const json: ChatKindsResponse = await res.json();
          if (!json?.success)
            throw new Error(json?.message || "채팅 유형 수신 실패");
          setChatKinds(json.data || []);
        })();

        // 3) API: 시청 스트리머 Top3
        const pTop = (async () => {
          const res = await fetch(
            ENDPOINTS.topStreamers(nickname, startDate!, endDate!),
            { signal: ac.signal }
          );
          if (!res.ok) throw new Error(`top-streamers HTTP ${res.status}`);
          const json: TopStreamersResponse = await res.json();
          if (!json?.success)
            throw new Error(json?.message || "Top 스트리머 수신 실패");
          setTopStreamers(json.data || []);
        })();

        // 4) API: 채팅 내역(기간)
        const pHist = (async () => {
          const res = await fetch(
            ENDPOINTS.chatHistory(nickname, startDate!, endDate!),
            { signal: ac.signal }
          );
          if (!res.ok) throw new Error(`chat-history HTTP ${res.status}`);
          const json: ChatHistoryResponse = await res.json();
          if (!json?.success)
            throw new Error(json?.message || "채팅 내역 수신 실패");
          setChatHistory(json.data || []);
        })();

        await Promise.all([pLambda, pKinds, pTop, pHist]);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "데이터 로드 실패");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [nickname, range]);

  /** 스트리머별 탭 구성 */
  const tabs = useMemo(() => {
    const byStreamer = new Map<
      string,
      { name: string; messages: ChatMessage[] }
    >();

    for (const m of chatHistory) {
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
            {chatHistory
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
  }, [chatHistory]);

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
              data={chatKinds}
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
            {!loading && chatKinds.length === 0 && (
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
                {topStreamers.slice(0, 3).map((item, idx) => (
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
                {!loading && topStreamers.length === 0 && (
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
                        const ok =
                          typeof (r as any).amount === "number" &&
                          (r as any).amount > 0 &&
                          !!(r as any).unit;
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
