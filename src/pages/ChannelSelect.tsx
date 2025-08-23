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

  // 모든 채널을 가져와서 라이브 상태에 따라 정렬
  const channels = (channelsData || []).sort((a: Channel, b: Channel) => {
    // 라이브 중인 채널을 먼저, 라이브가 아닌 채널을 나중에
    if (a.openLive && !b.openLive) return -1;
    if (!a.openLive && b.openLive) return 1;
    return 0;
  });

  // 라이브 중인 채널과 라이브가 아닌 채널 분리
  const liveChannels = channels.filter(
    (channel: Channel) => channel.openLive === true
  );
  const nonLiveChannels = channels.filter(
    (channel: Channel) => channel.openLive === false
  );

  return (
    <SpaceBetween size="l">
      <Box variant="h1">📺 채널 선택</Box>

      {loading ? (
        <Box textAlign="center" padding="xl">
          로딩 중...
        </Box>
      ) : error ? (
        <Box textAlign="center" padding="xl" color="text-status-error">
          오류: {error.message}
        </Box>
      ) : (
        <Container>
          {channels.length === 0 ? (
            <Box textAlign="center" padding="xl" color="text-body-secondary">
              채널이 없습니다.
            </Box>
          ) : (
            <Cards
              cardDefinition={{
                header: (item: Channel) => (
                  <Header
                    variant="h3"
                    actions={
                      <StatusIndicator
                        type={
                          item.openLive
                            ? item.channelLive.status
                              ? "success"
                              : "pending"
                            : "stopped"
                        }
                      >
                        {item.openLive
                          ? item.channelLive.status
                            ? "LIVE"
                            : "대기"
                          : "OFFLINE"}
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
                              opacity: item.openLive ? 1 : 0.6,
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
                          <Box
                            fontWeight="bold"
                            fontSize="heading-s"
                            color={
                              item.openLive ? undefined : "text-body-secondary"
                            }
                          >
                            {item.channelLive?.liveTitle ||
                              "방송 중이 아닙니다"}
                          </Box>
                          <Box color="text-body-secondary" fontSize="body-s">
                            {item.channelLive?.liveCategory
                              ?.liveCategoryValue || "카테고리 없음"}
                          </Box>
                        </Box>

                        <Box textAlign="center">
                          <Badge color={item.openLive ? "blue" : "grey"}>
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
                <Box
                  textAlign="center"
                  padding="xl"
                  color="text-body-secondary"
                >
                  채널이 없습니다.
                </Box>
              }
            />
          )}
        </Container>
      )}
    </SpaceBetween>
  );
}
