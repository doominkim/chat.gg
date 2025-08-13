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
import { useNavigate, useSearchParams } from "react-router-dom";
import type { User, UserSearchResult } from "../api/services/userService";

export default function UserList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const [isSearching, setIsSearching] = useState(false);

  // 더미 데이터 (실제 API가 없으므로)
  const dummyUsers: User[] = [
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

  // 더미 검색 결과 (테스트용)
  const getDummySearchResult = (searchTerm: string): UserSearchResult => {
    const filteredUsers = dummyUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      userIdHashes: filteredUsers.map((user) => user.id),
      users: filteredUsers,
    };
  };

  const handleSearch = () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setSearchParams({ search: searchValue.trim() });

    // 실제 API가 없으므로 더미 데이터로 테스트
    setTimeout(() => {
      const dummyResult = getDummySearchResult(searchValue.trim());

      // 여러 유저가 있으면 선택 페이지로, 1명이면 바로 상세 페이지로
      if (dummyResult.users.length > 1) {
        navigate("/user-select", {
          state: {
            users: dummyResult.users,
            userIdHashes: dummyResult.userIdHashes,
            searchTerm: searchValue,
          },
        });
      } else if (dummyResult.users.length === 1) {
        navigate(`/user/${dummyResult.users[0].name}`);
      }
      setIsSearching(false);
    }, 500); // 로딩 효과를 위한 지연
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchParams({});
  };

  const handleUserClick = (user: User) => {
    navigate(`/user/${user.name}`);
  };

  const handleKeyDown = (event: CustomEvent<{ key: string }>) => {
    if (event.detail.key === "Enter") {
      handleSearch();
    }
  };

  // 검색 결과가 없을 때 표시할 유저 목록
  const displayUsers = useMemo(() => {
    return dummyUsers;
  }, []);

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">사용자 검색</Header>

        <SpaceBetween size="m">
          <Box>
            <SpaceBetween size="s" direction="horizontal">
              <Input
                value={searchValue}
                onChange={({ detail }) => setSearchValue(detail.value)}
                placeholder="유저명 또는 ID를 입력하세요"
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
              <Button
                variant="link"
                onClick={handleClearSearch}
                disabled={isSearching}
              >
                지우기
              </Button>
            </SpaceBetween>
          </Box>

          {searchValue && (
            <Box color="text-status-info">
              "{searchValue}"에 대한 검색 결과를 확인하세요.
            </Box>
          )}

          <Box>
            <Box margin={{ bottom: "m" }} color="text-body-secondary">
              유저명 또는 ID를 입력하여 검색하세요.
            </Box>

            <Table
              items={displayUsers}
              columnDefinitions={[
                { id: "id", header: "ID", cell: (item: User) => item.id },
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
                  cell: (item: User) => item.email || "-",
                },
                {
                  id: "createdAt",
                  header: "가입일",
                  cell: (item: User) =>
                    new Date(item.createdAt).toLocaleDateString("ko-KR"),
                },
              ]}
              loading={isSearching}
              loadingText="사용자 목록을 불러오는 중..."
              empty={
                <Box textAlign="center" color="text-status-info">
                  사용자가 없습니다.
                </Box>
              }
            />
          </Box>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}
