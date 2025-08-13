import React from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
  Button,
} from "@cloudscape-design/components";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "../api/services/userService";

interface UserSelectState {
  users: User[];
  userIdHashes: string[];
  searchTerm: string;
}

interface RowItem {
  hash: string;
  name: string;
  id: string;
  createdAt: string;
}

export default function UserSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as UserSelectState;

  React.useEffect(() => {
    if (!state || !state.users) {
      navigate("/user-rank");
    }
  }, [navigate, state]);

  if (!state || !state.users) {
    return null;
  }

  const { users, userIdHashes, searchTerm } = state;

  const rows: RowItem[] = userIdHashes.map((hash, idx) => {
    const user = users[idx];
    return {
      hash,
      name: user?.name ?? "-",
      id: user?.id ?? "-",
      createdAt: user?.createdAt ?? "-",
    };
  });

  const handleSelectHash = (row: RowItem) => {
    const nickname = row.name && row.name !== "-" ? row.name : searchTerm;
    navigate(
      `/user/${encodeURIComponent(nickname)}?userIdHash=${encodeURIComponent(
        row.hash
      )}`
    );
  };

  const handleBackToSearch = () => {
    navigate(`/user-rank?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          actions={
            <Button variant="link" onClick={handleBackToSearch}>
              ← 검색으로 돌아가기
            </Button>
          }
        >
          유저 선택
        </Header>

        <Box>
          <Box margin={{ bottom: "m" }}>
            <strong>"{searchTerm}"</strong> 검색 결과로 {userIdHashes.length}
            개의 사용자 해시를 찾았습니다. 원하는 항목을 선택해주세요.
          </Box>

          <Table<RowItem>
            items={rows}
            columnDefinitions={[
              {
                id: "hash",
                header: "userIdHash",
                cell: (row) => (
                  <span style={{ fontFamily: "monospace" }}>{row.hash}</span>
                ),
                sortingField: "hash",
              },
              {
                id: "name",
                header: "유저명",
                cell: (row) => row.name,
                sortingField: "name",
              },
              {
                id: "action",
                header: "선택",
                cell: (row) => (
                  <Button
                    variant="primary"
                    onClick={() => handleSelectHash(row)}
                  >
                    이 해시 선택
                  </Button>
                ),
              },
            ]}
            loading={false}
            loadingText="유저 목록을 불러오는 중..."
            empty={
              <Box textAlign="center" color="text-status-info">
                검색된 사용자 해시가 없습니다.
              </Box>
            }
          />
        </Box>
      </SpaceBetween>
    </Container>
  );
}
