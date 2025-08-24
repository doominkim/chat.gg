import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../api/hooks";
import { channelService } from "../api/services";
import type { Channel } from "../api/services/channelService";

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

  return (
    <div
      style={{
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "white",
          }}
        >
          <p
            style={{
              fontSize: "30px",
              fontWeight: "400",
              margin: "0 0 10px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            분석하고 싶은 채널을 선택하세요
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "400",
              margin: "0 0 40px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
              opacity: 0.7,
              color: "#bdc3c7",
            }}
          >
            내 채널이 보이지 않는다면 고객센터에 문의해주세요
          </p>
        </div>

        {/* Content Section */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                fontSize: "18px",
                color: "#7f8c8d",
              }}
            >
              로딩 중...
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                fontSize: "18px",
                color: "#e74c3c",
              }}
            >
              오류: {error.message}
            </div>
          ) : channels.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                fontSize: "18px",
                color: "#7f8c8d",
              }}
            >
              채널이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                maxWidth: "100%",
              }}
            >
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelClick(channel.id)}
                  style={{
                    background: channel.openLive ? "#f8f9fa" : "#f1f2f6",
                    borderRadius: "16px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: channel.openLive
                      ? "2px solid #667eea"
                      : "2px solid transparent",
                    opacity: channel.openLive ? 1 : 0.7,
                    height: "320px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Channel Image and Status */}
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={channel.channelImageUrl}
                        alt={channel.channelName}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid white",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          background: channel.openLive ? "#27ae60" : "#95a5a6",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          border: "2px solid white",
                        }}
                      >
                        {channel.openLive ? "LIVE" : "OFFLINE"}
                      </div>
                    </div>
                  </div>

                  {/* Channel Name */}
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      margin: "0 0 10px 0",
                      color: "#2c3e50",
                      textAlign: "center",
                    }}
                  >
                    {channel.channelName}
                  </h3>

                  {/* Live Title */}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#7f8c8d",
                      margin: "0 0 15px 0",
                      textAlign: "center",
                      lineHeight: 1.4,
                      height: "40px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {channel.channelLive?.liveTitle || "방송 중이 아닙니다"}
                  </p>

                  {/* Category */}
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <span
                      style={{
                        background: "#667eea",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {channel.channelLive?.liveCategory?.liveCategoryValue ||
                        "카테고리 없음"}
                    </span>
                  </div>

                  {/* Follower Count */}
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid #e1e8ed",
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#2c3e50",
                      }}
                    >
                      {fmtNumber(channel.follower)}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#7f8c8d",
                        marginTop: "2px",
                      }}
                    >
                      팔로워
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
