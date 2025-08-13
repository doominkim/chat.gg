// src/pages/UserList.tsx
import React from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
} from "@cloudscape-design/components";
import { useApi } from "../api/hooks";
import { userService, User } from "../api/services";

export default function UserList() {
  const {
    data: users,
    loading,
    error,
    refetch,
  } = useApi(() => userService.getUsers(), []);

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
          오류가 발생했습니다: {error.message}
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Header variant="h1">사용자 목록</Header>
      <Table
        items={users?.data || []}
        columnDefinitions={[
          {
            id: "id",
            header: "ID",
            cell: (item: User) => item.id,
          },
          {
            id: "name",
            header: "이름",
            cell: (item: User) => item.name,
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
        loading={loading}
        loadingText="사용자 목록을 불러오는 중..."
        empty={
          <Box textAlign="center" color="text-status-info">
            사용자가 없습니다.
          </Box>
        }
      />
    </Container>
  );
}
