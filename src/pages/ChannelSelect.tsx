import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Header,
  SpaceBetween,
  Grid,
  Box,
  Badge,
  StatusIndicator,
  Cards,
} from "@cloudscape-design/components";
import { useApi } from "../api/hooks";
import { channelService } from "../api/services";
import type {
  Channel,
  ChannelListResponse,
} from "../api/services/channelService";

const fmtNumber = (n: number) => n.toLocaleString("ko-KR");

export default function ChannelSelect() {
  const navigate = useNavigate();

  const channelsApiCall = useCallback(() => channelService.getChannels(), []);

  const {
    data: channelsData,
    loading,
    error,
  } = useApi<Channel[]>(channelsApiCall, []);

  const handleChannelClick = (channelId: number) => {
    navigate(`/dashboard/${channelId}`);
  };

  // 라이브 중인 채널만 필터링
  const channels = (channelsData || []).filter(
    (channel: Channel) => channel.openLive === true
  );

  return (
    <SpaceBetween size="l">
      <Box variant="h1">📺 채널 선택</Box>

      <Container>
        <Header variant="h2">라이브 중인 채널</Header>
        {loading ? (
          <Box textAlign="center" padding="xl">
            로딩 중...
          </Box>
        ) : error ? (
          <Box textAlign="center" padding="xl" color="text-status-error">
            오류: {error.message}
          </Box>
        ) : channels.length === 0 ? (
          <Box textAlign="center" padding="xl" color="text-body-secondary">
            라이브 중인 채널이 없습니다.
          </Box>
        ) : (
          <Cards
            cardDefinition={{
              header: (item: Channel) => (
                <Header
                  variant="h3"
                  actions={
                    <StatusIndicator
                      type={item.channelLive.status ? "success" : "pending"}
                    >
                      {item.channelLive.status ? "라이브" : "대기"}
                    </StatusIndicator>
                  }
                >
                  {item.channelName}
                </Header>
              ),
              sections: [
                {
                  id: "image",
                  header: "",
                  content: (item: Channel) => (
                    <div
                      onClick={() => handleChannelClick(item.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Box textAlign="center">
                        <img
                          src={item.channelImageUrl}
                          alt={item.channelName}
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </div>
                  ),
                },
                {
                  id: "info",
                  header: "",
                  content: (item: Channel) => (
                    <SpaceBetween size="s">
                      <Box>
                        <Box fontWeight="bold" fontSize="heading-s">
                          {item.channelLive.liveTitle}
                        </Box>
                        <Box color="text-body-secondary" fontSize="body-s">
                          {item.channelLive.liveCategory.liveCategoryValue}
                        </Box>
                      </Box>

                      <Box textAlign="center">
                        <Badge color="blue">
                          {fmtNumber(item.follower)} 팔로워
                        </Badge>
                      </Box>
                    </SpaceBetween>
                  ),
                },
              ],
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 },
              { minWidth: 800, cards: 3 },
            ]}
            items={channels}
            loadingText="로딩 중..."
            empty={
              <Box textAlign="center" padding="xl" color="text-body-secondary">
                라이브 중인 채널이 없습니다.
              </Box>
            }
          />
        )}
      </Container>
    </SpaceBetween>
  );
}
