import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  DateRangePicker,
  Grid,
  Header,
  PieChart,
  SpaceBetween,
  Tabs,
  Input,
  Button,
} from "@cloudscape-design/components";
import type { DateRangePickerProps } from "@cloudscape-design/components";
import ReactWordCloud from "react-d3-cloud";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Avatar from "@cloudscape-design/chat-components/avatar";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import NotFoundUser from "./NotFoundUser";
import { useApi } from "../api/hooks";
import { userDetailService } from "../api/services";
import type {
  ChatMessage,
  WordCloudItem,
  FreqWordItem,
  UserAnalysis,
  UserWordFrequencyItem,
  UserChatTypeDistributionItem,
  WatchedStreamerItem,
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

  // API calls using userIdHash
  const analysisApiCall = useCallback(() => {
    if (!userIdHash) throw new Error("userIdHash is required");
    return userDetailService.getUserAnalysis(userIdHash, { start, end });
  }, [userIdHash, start, end]);

  const wordFreqApiCall = useCallback(() => {
    if (!userIdHash) throw new Error("userIdHash is required");
    return userDetailService.getUserWordFrequency(userIdHash, {
      start,
      end,
      topN: 3,
    });
  }, [userIdHash, start, end]);

  const chatHistoryApiCall = useCallback(() => {
    if (!userIdHash) throw new Error("userIdHash is required");
    return userDetailService.getUserChatHistory(userIdHash, { start, end });
  }, [userIdHash, start, end]);

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

  const { data: analysisData, loading: analysisLoading } = useApi<UserAnalysis>(
    analysisApiCall,
    [analysisApiCall]
  );
  const { data: wordFreqData, loading: wordFreqLoading } = useApi<
    UserWordFrequencyItem[]
  >(wordFreqApiCall, [wordFreqApiCall]);
  const { data: chatHistoryApiData } = useApi<ChatMessage[]>(
    chatHistoryApiCall,
    [chatHistoryApiCall]
  );
  const { data: chatTypeData, loading: chatTypeLoading } = useApi<
    UserChatTypeDistributionItem[]
  >(chatTypeApiCall, [chatTypeApiCall]);
  const { data: watchedStreamersData, loading: watchedStreamersLoading } =
    useApi<WatchedStreamerItem[]>(watchedStreamersApiCall, [
      watchedStreamersApiCall,
    ]);

  /** 데이터 변환 (배열 가드) */
  const wordCloudData: WordCloudItem[] = useMemo(() => {
    return Array.isArray(analysisData?.wordCloud)
      ? analysisData!.wordCloud!
      : [];
  }, [analysisData]);

  const freqWords: FreqWordItem[] = useMemo(() => {
    if (Array.isArray(wordFreqData)) {
      return wordFreqData.map((item, idx) => {
        const asAny = item as unknown as {
          count?: number;
          frequency?: number;
          percentage?: number;
          word: string;
        };
        const countValue =
          typeof asAny.count === "number"
            ? asAny.count
            : typeof asAny.frequency === "number"
            ? asAny.frequency
            : 0;
        const percentageValue =
          typeof asAny.percentage === "number" ? asAny.percentage : 0;
        return {
          rank: idx + 1,
          word: asAny.word,
          count: countValue,
          percentage: Math.round(percentageValue * 100) / 100,
        };
      });
    }

    type WordFrequencyApiResponse = {
      data?: {
        words?: Array<{ word: string; frequency: number; length?: number }>;
        totalWords?: number;
      };
    } | null;

    const resp: WordFrequencyApiResponse =
      wordFreqData as unknown as WordFrequencyApiResponse;
    const words = resp?.data?.words || [];
    const total = resp?.data?.totalWords || 0;

    return words.slice(0, 3).map((w, idx) => ({
      rank: idx + 1,
      word: w.word,
      count: w.frequency,
      percentage:
        total > 0 ? Math.round((w.frequency / total) * 100 * 100) / 100 : 0,
    }));
  }, [wordFreqData]);

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
    const items = Array.isArray(watchedStreamersData)
      ? watchedStreamersData
      : [];
    return items
      .slice(0, 3)
      .map((i) => ({ name: i.name, count: i.count, percentage: i.percentage }));
  }, [watchedStreamersData]);

  const chatHistoryData: ChatMessage[] = useMemo(() => {
    if (Array.isArray(chatHistoryApiData)) return chatHistoryApiData;
    const maybeObj = chatHistoryApiData as unknown as {
      messages?: ChatMessage[];
    } | null;
    const messages =
      maybeObj && Array.isArray(maybeObj.messages) ? maybeObj.messages : [];
    return messages;
  }, [chatHistoryApiData]);

  /** 로딩 상태 */
  // 섹션별 로딩 플래그 사용

  // 검색 처리 (더미 데이터 사용 그대로 유지)
  const handleSearch = () => {
    if (!searchValue.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const dummyUsers = [
        {
          id: "1",
          name: "테스트유저1",
          email: "test1@example.com",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "테스트유저2",
          email: "test2@example.com",
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "3",
          name: "테스트유저3",
          email: "test3@example.com",
          createdAt: "2024-01-03T00:00:00Z",
          updatedAt: "2024-01-03T00:00:00Z",
        },
      ];
      const filteredUsers = dummyUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.id.toLowerCase().includes(searchValue.toLowerCase())
      );
      const dummyResult = {
        userIdHashes: filteredUsers.map((user) => user.id),
        users: filteredUsers,
      } as { userIdHashes: string[]; users: { name: string }[] };
      if (dummyResult.users.length > 1) {
        navigate("/user-select", {
          state: {
            users: filteredUsers,
            userIdHashes: dummyResult.userIdHashes,
            searchTerm: searchValue,
          },
        });
      } else if (dummyResult.users.length === 1) {
        const only = filteredUsers[0];
        navigate(
          `/user/${encodeURIComponent(
            only.name
          )}?userIdHash=${encodeURIComponent(only.id)}`
        );
      }
      setIsSearching(false);
    }, 500);
  };

  const handleKeyDown = (event: CustomEvent<{ key: string }>) => {
    if (event.detail.key === "Enter") {
      handleSearch();
    }
  };

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

          {/* 닉네임 검색 영역 */}
          <Box>
            <SpaceBetween size="s" direction="horizontal">
              <Input
                value={searchValue}
                onChange={({ detail }) => setSearchValue(detail.value)}
                placeholder="다른 유저의 닉네임을 입력하세요"
                onKeyDown={handleKeyDown}
                disabled={isSearching}
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                loading={isSearching}
                disabled={!searchValue.trim()}
              >
                검색
              </Button>
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Box>

      <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
        {/* 왼쪽 8칸: 2x2 구조 내부 정렬 */}
        <Grid
          gridDefinition={[
            { colspan: 7 },
            { colspan: 5 },
            { colspan: 7 },
            { colspan: 5 },
          ]}
        >
          {/* 사용자 분석(WordCloud) */}
          <Container fitHeight header={<Header>사용자 분석</Header>}>
            <Box>
              <ReactWordCloud data={wordCloudData} width={400} height={400} />
              {!analysisLoading && wordCloudData.length === 0 && (
                <Box margin={{ top: "s" }} color="text-body-secondary">
                  데이터가 없습니다.
                </Box>
              )}
            </Box>
          </Container>

          {/* 많이 쓴 단어 Top N */}
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
                {!wordFreqLoading && freqWords.length === 0 && (
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
            {!chatTypeLoading && chatKindsData.length === 0 && (
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
                {!watchedStreamersLoading && topStreamersData.length === 0 && (
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
