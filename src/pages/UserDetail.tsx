import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  DateRangePicker,
  Grid,
  Header,
  PieChart,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";
import type { DateRangePickerProps } from "@cloudscape-design/components";
import ReactWordCloud from "react-d3-cloud";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import NotFoundUser from "./NotFoundUser";
import { useApi } from "../api/hooks";
import { userDetailService } from "../api/services";
import { ChatList } from "../components/ChatList";
import type {
  ChatMessage,
  WordCloudItem,
  FreqWordItem,
  AnalyzeLambdaResp,
  UserWordFrequencyItem,
  UserChatTypeDistributionItem,
  WatchedStreamerItem,
  StreamerResponse,
} from "../api/services/userDetailService";
import type { ApiResponse } from "../api/client";
import type { FindChatParams } from "../types/chat";

const LAMBDA_ANALYZE_URL = (import.meta as any)?.env
  ?.VITE_LAMBDA_ANALYZE_URL as string;

/** ===== helpers ===== */
const getRankBadge = (rank: number) => {
  const badge =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `···`;
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdHash = searchParams.get("userIdHash") || undefined;

  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  const { start, end } = useMemo(() => {
    if (range && range.type === "absolute") {
      return {
        start: range.startDate || undefined,
        end: range.endDate || undefined,
      };
    }
    return { start: undefined, end: undefined };
  }, [range]);

  // [Lambda] 호출 (start/end 변경 시 자동 재호출)
  const lambdaAnalyzeApiCall = useCallback(async (): Promise<
    ApiResponse<AnalyzeLambdaResp>
  > => {
    console.log("🚀 [LambdaAnalyze] 호출 시작", {
      userIdHash,
      LAMBDA_ANALYZE_URL,
      start,
      end,
    });

    if (!userIdHash) {
      console.error("[LambdaAnalyze] ❌ userIdHash is required");
      throw new Error("userIdHash is required");
    }
    if (!LAMBDA_ANALYZE_URL) {
      console.error("[LambdaAnalyze] ❌ Lambda URL is not configured");
      throw new Error("Lambda URL is not configured");
    }

    const body = {
      userIdHash,
      startDate: start,
      endDate: end,
      tasks: ["wordCloud", "frequentWords"],
      topN: 7,
      maxItems: 60,
      excludeEmotes: true,
    };
    console.log("📤 [LambdaAnalyze] 요청 바디", body);

    try {
      const res = await fetch(LAMBDA_ANALYZE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("📥 [LambdaAnalyze] 응답 상태", res.status);

      const json = await res.json();
      console.log("📦 [LambdaAnalyze] 응답 JSON", json);

      if (!res.ok) throw new Error(`Lambda(analyze) HTTP ${res.status}`);
      if (!json?.success) throw new Error(json?.message || "AI 분석 수신 실패");

      return {
        status: res.status,
        data: json,
        message: json.message,
      };
    } catch (err) {
      console.error("💥 [LambdaAnalyze] 호출 실패", err);
      throw err;
    }
  }, [userIdHash, start, end]);

  /** start/end가 변경되면 useApi 자동 재호출 */
  const {
    data: lambdaData,
    loading: lambdaLoading,
    error: lambdaError,
  } = useApi<AnalyzeLambdaResp>(lambdaAnalyzeApiCall, [lambdaAnalyzeApiCall]);

  // wordCloud 데이터 가공
  const wordCloudData: WordCloudItem[] = useMemo(
    () =>
      Array.isArray(lambdaData?.data?.wordCloud)
        ? lambdaData!.data!.wordCloud!
        : [],
    [lambdaData]
  );

  // frequentWords 데이터 가공
  const freqWords: FreqWordItem[] = useMemo(() => {
    const fw = lambdaData?.data?.frequentWords ?? [];
    return fw.map((it, idx) => ({
      rank: idx + 1,
      word: it.word,
      count: it.count,
      percentage: Math.round(it.percentage * 100) / 100,
    }));
  }, [lambdaData]);

  useEffect(() => {
    if (!lambdaLoading) {
      if (lambdaError) {
        console.error("[LambdaAnalyze] ❌ 로드 실패", lambdaError);
      } else {
        console.debug("[LambdaAnalyze] ✅ 로드 완료", lambdaData);
      }
    }
  }, [lambdaData, lambdaLoading, lambdaError]);

  // API calls using userIdHash
  const chatTypeApiCall = useCallback(() => {
    if (!userIdHash) throw new Error("userIdHash is required");
    return userDetailService.getUserChatType(userIdHash, { start, end });
  }, [userIdHash, start, end]);

  const watchedStreamersApiCall = useCallback(() => {
    if (!userIdHash) throw new Error("userIdHash is required");
    return userDetailService.getUserWatchedStreamers(userIdHash, {
      start,
      end,
      topN: 10,
    });
  }, [userIdHash, start, end]);

  const { data: chatTypeData, loading: chatTypeLoading } = useApi<
    UserChatTypeDistributionItem[]
  >(chatTypeApiCall, [chatTypeApiCall]);

  const { data: watchedStreamersData, loading: watchedStreamersLoading } =
    useApi<StreamerResponse>(watchedStreamersApiCall, [
      watchedStreamersApiCall,
    ]);

  const chatKindsData = useMemo(() => {
    type TypeCount = { type: string; count: number };

    const normalize = (input: unknown): TypeCount[] => {
      if (Array.isArray(input)) {
        return (input as Array<{ type?: string; count?: number }>).map((i) => ({
          type: String(i.type ?? "unknown"),
          count: typeof i.count === "number" ? i.count : 0,
        }));
      }

      const obj = input as { data?: unknown } | null;
      const data = (obj?.data ?? undefined) as
        | {
            types?: Array<{ type?: string; count?: number }>;
            distribution?:
              | Record<string, number>
              | Record<string, { count?: number; percentage?: number }>;
            chatTypes?:
              | Record<string, number>
              | Record<string, { count?: number; percentage?: number }>;
          }
        | undefined;

      // case: data.types as array
      if (Array.isArray(data?.types)) {
        return (data!.types as Array<{ type?: string; count?: number }>).map(
          (i) => ({
            type: String(i.type ?? "unknown"),
            count: typeof i.count === "number" ? i.count : 0,
          })
        );
      }

      // case: data.distribution as object
      const distUnknown = data?.distribution as unknown;
      if (distUnknown && typeof distUnknown === "object") {
        const distObj = distUnknown as Record<string, unknown>;
        const results: TypeCount[] = [];
        for (const key of Object.keys(distObj)) {
          const val = distObj[key];
          let count = 0;
          if (typeof val === "number") {
            count = val;
          } else if (
            val &&
            typeof (val as { count?: number }).count === "number"
          ) {
            count = (val as { count?: number }).count as number;
          }
          results.push({ type: key, count });
        }
        if (results.length > 0) return results;
      }

      // case: data.chatTypes as object
      const chatTypesUnknown = data?.chatTypes as unknown;
      if (chatTypesUnknown && typeof chatTypesUnknown === "object") {
        const ctObj = chatTypesUnknown as Record<string, unknown>;
        const results: TypeCount[] = [];
        for (const key of Object.keys(ctObj)) {
          const val = ctObj[key];
          let count = 0;
          if (typeof val === "number") {
            count = val;
          } else if (
            val &&
            typeof (val as { count?: number }).count === "number"
          ) {
            count = (val as { count?: number }).count as number;
          }
          results.push({ type: key, count });
        }
        if (results.length > 0) return results;
      }

      // case: data has flat numeric keys (chat, blind, donation, total)
      if (data && typeof data === "object") {
        const flat = data as Record<string, unknown>;
        const results: TypeCount[] = [];
        for (const key of Object.keys(flat)) {
          if (
            key === "total" ||
            key === "date" ||
            key === "userId" ||
            key === "timestamp"
          )
            continue;
          const val = flat[key];
          if (typeof val === "number") {
            results.push({ type: key, count: val });
          } else if (
            val &&
            typeof (val as { count?: number }).count === "number"
          ) {
            results.push({
              type: key,
              count: (val as { count?: number }).count as number,
            });
          }
        }
        if (results.length > 0) return results;
      }

      // case: top-level chatTypes object
      if (obj && typeof obj === "object") {
        const topChatTypes = (obj as Record<string, unknown>)[
          "chatTypes"
        ] as unknown;
        if (topChatTypes && typeof topChatTypes === "object") {
          const ctObj = topChatTypes as Record<string, unknown>;
          const results: TypeCount[] = [];
          for (const key of Object.keys(ctObj)) {
            const val = ctObj[key];
            let count = 0;
            if (typeof val === "number") {
              count = val;
            } else if (
              val &&
              typeof (val as { count?: number }).count === "number"
            ) {
              count = (val as { count?: number }).count as number;
            }
            results.push({ type: key, count });
          }
          if (results.length > 0) return results;
        }
      }

      return [];
    };

    const TYPE_LABELS: Record<string, string> = {
      chat: "채팅",
      blind: "채팅제한",
      donation: "후원",
    };

    const items = normalize(chatTypeData);
    return items.map((i) => ({
      title: TYPE_LABELS[i.type.toLowerCase()] ?? i.type,
      value: i.count,
      lastUpdate: undefined as string | undefined,
    }));
  }, [chatTypeData]);

  const topStreamersData = useMemo(() => {
    // 새로운 API 응답 구조 사용
    if (watchedStreamersData?.data?.streamers) {
      const streamers = watchedStreamersData.data.streamers;

      // 전체 시청 시간 계산 (null이 아닌 값들만)
      const totalWatchTime = streamers
        .map((s) => s.watchTime)
        .filter((time) => time !== null && time !== undefined)
        .reduce((sum, time) => sum + (time || 0), 0);

      return streamers.map((streamer) => {
        // 퍼센트 계산 (전체 시청 시간 대비)
        let percentage = 0;
        if (
          totalWatchTime > 0 &&
          streamer.watchTime !== null &&
          streamer.watchTime !== undefined
        ) {
          percentage = Math.round((streamer.watchTime / totalWatchTime) * 100);
        }

        return {
          name: streamer.channelName,
          count: streamer.chatCount || 0,
          percentage: percentage,
          rank: streamer.rank,
          lastWatched: streamer.lastWatched,
        };
      });
    }

    // 기존 API 응답 구조 (fallback)
    const items = Array.isArray(watchedStreamersData)
      ? watchedStreamersData
      : [];
    return items
      .slice(0, 3)
      .map((i) => ({ name: i.name, count: i.count, percentage: i.percentage }));
  }, [watchedStreamersData]);

  // 채팅 내역 필터 파라미터
  const chatFilterParams: FindChatParams = useMemo(() => {
    const params: FindChatParams = {
      limit: 50,
    };

    if (userIdHash) {
      params.userIdHash = userIdHash;
    }

    if (start) {
      params.from = new Date(start);
    }

    if (end) {
      params.to = new Date(end);
    }

    console.log("UserDetail - chatFilterParams 생성:", params);
    return params;
  }, [userIdHash, start, end]);

  if (!userFound) return <NotFoundUser />;

  return (
    <SpaceBetween size="l">
      <Box variant="h1">
        <SpaceBetween size="l">
          <Box>
            <Header variant="h1">
              🤖 [{nickname}] 유저의 채팅을 분석한 내용입니다.{" "}
              {userIdHash ? `(hash: ${userIdHash})` : ""}
              <Box
                display="inline"
                fontSize="heading-m"
                fontWeight="bold"
                color="text-status-info"
                margin={{ left: "l" }}
              ></Box>
            </Header>
          </Box>
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
                      errorMessage: "시작일이 종료일보다 이전이어야 합니다.",
                    };
                  }
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
                if (r.type === "relative") {
                  const rel = r as { amount: number; unit: string };
                  const ok =
                    typeof rel.amount === "number" &&
                    rel.amount > 0 &&
                    !!rel.unit;
                  return ok
                    ? { valid: true }
                    : {
                        valid: false,
                        errorMessage: "상대 범위를 올바르게 선택하세요.",
                      };
                }
                return {
                  valid: false,
                  errorMessage: "유효하지 않은 범위 형식입니다.",
                };
              }}
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
        </SpaceBetween>
      </Box>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        {/* 왼쪽 6칸: 분석 섹션들 */}
        <SpaceBetween size="l">
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
            {!chatTypeLoading && chatKindsData.length === 0 && (
              <Box margin={{ top: "s" }} color="text-body-secondary">
                채팅 데이터가 없습니다.
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
                {!watchedStreamersLoading && topStreamersData.length === 0 && (
                  <Box margin={{ top: "s" }} color="text-body-secondary">
                    데이터가 없습니다.
                  </Box>
                )}
              </Box>
            </SpaceBetween>
          </Container>
        </SpaceBetween>

        {/* 오른쪽 6칸: 채팅 내역 */}
        <Container fitHeight header={<Header>채팅 내역</Header>}>
          <div style={{ minHeight: "800px", height: "100%" }}>
            <ChatList params={chatFilterParams} />
          </div>
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

export default UserDetail;
