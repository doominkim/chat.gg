// src/pages/UserList.tsx
import React, {useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  Table,
  Box,
  Spinner,
  Alert,
  Button,
} from "@cloudscape-design/components";

// 유저 채팅 데이터 타입 정의
interface UserChatRanking {
  userIdHash: string;
  nickname: string;
  chatCount: number;
  rank: number;
}

// API 응답 타입 정의
interface ApiResponse {
  success: boolean;
  data: UserChatRanking[];
  message?: string;
}

// 환경변수에서 API Base URL 사용 (Vite 기준)
// 예: VITE_API_BASE_URL=https://api.f-yourchat.com
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "https://api.f-yourchat.com";


// // (TEST) 예시 데이터
// const mockUserList = [
//   { userId: "abc123", nickname: "스트리머1", messages: 1200 },
//   { userId: "xyz456", nickname: "스트리머2", messages: 950 },
//   { userId: "test789", nickname: "스트리머3", messages: 870 },
//   { userId: "def456", nickname: "채팅왕", messages: 750 },
//   { userId: "ghi789", nickname: "방송러버", messages: 650 },
//   { userId: "jkl012", nickname: "댓글마스터", messages: 580 },
//   { userId: "mno345", nickname: "실시간뷰어", messages: 420 },
//   { userId: "pqr678", nickname: "스트림러버", messages: 350 },
// ];

// // // (TEST) 환경변수에서 테스트 모드 확인
// // const isTestMode = process.env.REACT_APP_TEST === 'true';
// // const apiUrl = process.env.REACT_APP_API_URL || 'https://api.f-yourchat.com';


export default function UserList() {
  const navigate = useNavigate();
  const [userRankings, setUserRankings] = useState<UserChatRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // // (TEST) 테스트 데이터를 시뮬레이션하는 함수
  // const fetchMockData = async (): Promise<void> => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       setUserRankings(mockUserList);
  //       setLastUpdated(new Date().toLocaleString('ko-KR'));
  //       resolve();
  //     }, 1000); // 1초 딜레이로 실제 API 호출 시뮬레이션
  //   });
  // };

  // // 실제 API에서 데이터 가져오기
  // const fetchRealApiData = async (): Promise<void> => {
  //   const response = await fetch(`${apiUrl}/api/chat-rankings/today`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       // 필요한 경우 Authorization 헤더 추가
  //       // 'Authorization': `Bearer ${token}`,
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   const result: ApiResponse = await response.json();
    
  //   if (result.success) {
  //     setUserRankings(result.data);
  //     setLastUpdated(new Date().toLocaleString('ko-KR'));
  //   } else {
  //     throw new Error(result.message || '데이터를 가져오는데 실패했습니다.');
  //   }
  // };

  
  // // 오늘 날짜 채팅 랭킹 데이터 가져오기
  // const fetchTodayChatRankings = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
      
  //     if (isTestMode) {
  //       console.log('🧪 테스트 모드: 목업 데이터를 사용합니다.');
  //       await fetchMockData();
  //     } else {
  //       console.log('🚀 프로덕션 모드: 실제 API를 호출합니다.');
  //       await fetchRealApiData();
  //     }
      
  //   } catch (err) {
  //     console.error('Error fetching chat rankings:', err);
  //     setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // 오늘 날짜 채팅 랭킹 데이터 가져오기
  // 오늘 날짜 채팅 랭킹 데이터 가져오기 (API only)
  const fetchTodayChatRankings = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/chat-rankings/today`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // 쿠키 기반 인증이면 아래 주석 해제
          // credentials: "include",
          // 토큰 인증이면 아래 주석 해제
          // Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result: ApiResponse = await res.json();

      if (!result.success) {
        throw new Error(result.message || "데이터를 가져오는데 실패했습니다.");
      }

      setUserRankings(result.data || []);
      setLastUpdated(new Date().toLocaleString("ko-KR"));
    } catch (err) {
      if ((err as any)?.name === "AbortError") return; // 언마운트/재요청 중단
      console.error("Error fetching chat rankings:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 1회 로드
  useEffect(() => {
    const controller = new AbortController();
    fetchTodayChatRankings(controller.signal);
    return () => controller.abort();
  }, []);

  // 새로고침
  const handleRefresh = () => {
    const controller = new AbortController();
    fetchTodayChatRankings(controller.signal);
  };

  // 로딩 상태
  if (loading) {
    return (
      <Container header={<Header variant="h2">🔥 실시간 유저 랭킹</Header>}>
        <Box textAlign="center" padding="xl">
          <Spinner size="large" />
          <Box variant="p" color="text-body-secondary">
            채팅 랭킹 데이터를 불러오는 중...
          </Box>
        </Box>
      </Container>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Container header={<Header variant="h2">🔥 실시간 유저 랭킹</Header>}>
        <Alert
          type="error"
          header="데이터 로드 실패"
          action={
            <Button onClick={handleRefresh} iconName="refresh">
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <Button onClick={handleRefresh} iconName="refresh">
              새로고침
            </Button>
          }
        >
          🔥 실시간 유저 랭킹
        </Header>
      }
    >
      {lastUpdated && (
        <Box
          variant="small"
          color="text-body-secondary"
          margin={{ bottom: "s" }}
        >
          마지막 업데이트: {lastUpdated}
        </Box>
      )}

      {userRankings.length === 0 ? (
        <Box textAlign="center" padding="xl">
          <Box variant="h3" color="text-body-secondary">
            오늘 채팅 데이터가 없습니다.
          </Box>
        </Box>
      ) : (
        <Table
          columnDefinitions={[
            {
              id: "rank",
              header: "순위",
              cell: (item: UserChatRanking) => (
                <Box fontWeight="bold">
                  {item.rank === 1 && "🥇"}
                  {item.rank === 2 && "🥈"}
                  {item.rank === 3 && "🥉"} {item.rank}위
                </Box>
              ),
              width: 80,
            },
            {
              id: "nickname",
              header: "닉네임",
              cell: (item: UserChatRanking) => (
                <Box fontWeight={item.rank <= 3 ? "bold" : "normal"}>
                  {item.nickname}
                </Box>
              ),
            },
            {
              id: "chatCount",
              header: "오늘 채팅 수",
              cell: (item: UserChatRanking) => (
                <Box
                  fontWeight="bold"
                  color={item.rank <= 3 ? "text-status-success" : "inherit"}
                >
                  {item.chatCount.toLocaleString()} 개
                </Box>
              ),
              width: 140,
            },
          ]}
          items={userRankings}
          onRowClick={({ detail }) => {
            const user = detail.item as UserChatRanking;
            navigate(`/user/${user.nickname}`);
          }}
          variant="full-page"
          stickyHeader
          stripedRows
          empty={
            <Box textAlign="center" color="inherit">
              <Box variant="strong">데이터가 없습니다</Box>
              <Box variant="p" padding={{ bottom: "s" }}>
                오늘 채팅한 유저가 없습니다.
              </Box>
            </Box>
          }
        />
      )}
    </Container>
  );
}