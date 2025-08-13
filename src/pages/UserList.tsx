// src/pages/UserList.tsx
import React, { useState, useMemo } from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
  Input,
  Button,
  Link,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import type { User } from "../api/services/userService";

export default function UserList() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // API 호출 대신 더미 데이터 사용 (404 에러 방지)
  const loading = false;
  const error = null;

  // 더미 사용자 데이터 (검색용)
  const dummyUsers: User[] = [
    {
      id: "1",
      name: "치지직이",
      email: "chijik@example.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      name: "악플러123",
      email: "hater123@example.com",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      name: "고양이짱",
      email: "catlover@example.com",
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "4",
      name: "채팅봇",
      email: "chatbot@example.com",
      createdAt: "2024-01-04T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "5",
      name: "시청자1",
      email: "viewer1@example.com",
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "6",
      name: "사랑해요BJ",
      email: "lovebj@example.com",
      createdAt: "2024-01-06T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "7",
      name: "스누피",
      email: "snoopy@example.com",
      createdAt: "2024-01-07T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "8",
      name: "배추도사",
      email: "cabbage@example.com",
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "9",
      name: "히히123",
      email: "hihi123@example.com",
      createdAt: "2024-01-09T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "10",
      name: "무야호",
      email: "muyaho@example.com",
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
  ];

  // 검색 필터링
  const filteredUsers = useMemo(() => {
    if (!searchValue.trim()) {
      return dummyUsers;
    }

    // 검색어가 있으면 항상 더미 데이터 반환 (테스트용)
    return dummyUsers;
  }, [searchValue, dummyUsers]);

  // 검색 실행
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchValue("");
    setIsSearching(false);
  };

  // 유저 클릭 시 상세 페이지로 이동
  const handleUserClick = (user: User) => {
    navigate(`/user/${user.name}`);
  };

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding="xl">
          사용자 목록을 불러오는 중...
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box textAlign="center" padding="xl" color="text-status-error">
          오류가 발생했습니다.
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">사용자 목록</Header>

        {/* 검색 영역 */}
        <SpaceBetween direction="horizontal" size="s">
          <Input
            type="search"
            placeholder="사용자 이름, 이메일로 검색..."
            value={searchValue}
            onChange={({ detail }) => setSearchValue(detail.value)}
            onKeyDown={({ detail }) => {
              if (detail.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} loading={isSearching}>
            검색
          </Button>
          <Button onClick={handleClearSearch} disabled={!searchValue}>
            초기화
          </Button>
        </SpaceBetween>

        {/* 검색 결과 정보 */}
        {searchValue && (
          <Box fontSize="body-s" color="text-status-info">
            "{searchValue}" 검색 결과: {filteredUsers.length}명
          </Box>
        )}

        <Table
          items={filteredUsers}
          columnDefinitions={[
            {
              id: "id",
              header: "ID",
              cell: (item: User) => item.id,
            },
            {
              id: "name",
              header: "이름",
              cell: (item: User) => (
                <Link
                  onFollow={() => handleUserClick(item)}
                  variant="primary"
                  fontSize="body-m"
                >
                  {item.name}
                </Link>
              ),
            },
            {
              id: "email",
              header: "이메일",
              cell: (item: User) => item.email,
            },
            {
              id: "createdAt",
              header: "생성일",
              cell: (item: User) =>
                new Date(item.createdAt).toLocaleDateString("ko-KR"),
            },
          ]}
          loading={loading || isSearching}
          loadingText="사용자 목록을 불러오는 중..."
          empty={
            <Box textAlign="center" color="text-status-info">
              사용자가 없습니다.
            </Box>
          }
        />
      </SpaceBetween>
    </Container>
  );
}
