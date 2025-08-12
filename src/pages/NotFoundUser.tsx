// src/pages/UserNotFound.tsx
// import {Box} from "@cloudscape-design/components";
// export default function NotFound() {
//   return (
//     <Box
//       textAlign="center"
//       fontSize="heading-l"
//       color="text-status-error"
//       margin={{ top: "xxxl" }}
//     >
//       🚫 해당하는 유저가 없습니다 !
//     </Box>
//   );
// }


// src/pages/NotFoundUser.tsx
import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Container,
  Header,
  Box,
  Button,
  SpaceBetween,
  Alert,
} from "@cloudscape-design/components";

export default function NotFoundUser() {
  const navigate = useNavigate();
  const { nickname } = useParams<{ nickname: string }>();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터에서 검색한 닉네임 가져오기
  const searchedNickname = nickname || searchParams.get('nickname') || '알 수 없는 사용자';

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleGoToUserList = () => {
    navigate('/user-rank'); // 유저 랭킹 페이지로 이동
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard'); // 대시보드로 이동
  };

  return (
    <Container
      header={
        <Header variant="h1">
          🔍 사용자를 찾을 수 없습니다
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <Alert type="warning" header="검색 결과가 없습니다">
          <Box variant="p">
            '<strong>{decodeURIComponent(searchedNickname)}</strong>' 닉네임을 가진 사용자를 찾을 수 없습니다.
          </Box>
          <Box variant="p" color="text-body-secondary">
            다음을 확인해보세요:
          </Box>
          <ul>
            <li>닉네임 철자가 정확한지 확인해주세요</li>
            <li>해당 사용자가 최근에 채팅 활동을 했는지 확인해주세요</li>
            <li>닉네임에 특수문자가 포함되어 있는지 확인해주세요</li>
          </ul>
        </Alert>

        <Box>
          <SpaceBetween direction="horizontal" size="s">
            <Button onClick={handleGoBack} variant="normal">
              ← 이전 페이지
            </Button>
            <Button onClick={handleGoToUserList} variant="primary">
              📊 유저 랭킹 보기
            </Button>
            <Button onClick={handleGoToDashboard} variant="normal">
              🏠 대시보드로 가기
            </Button>
          </SpaceBetween>
        </Box>

        <Box variant="small" color="text-body-secondary">
          <Box variant="h3" color="text-body-secondary" margin={{ top: "l" }}>
            💡 도움말
          </Box>
          <Box variant="p">
            • 유저 랭킹 페이지에서 활발한 사용자들을 확인할 수 있습니다
          </Box>
          <Box variant="p">
            • 검색창의 자동완성 기능을 활용해보세요
          </Box>
        </Box>
      </SpaceBetween>
    </Container>
  );
}