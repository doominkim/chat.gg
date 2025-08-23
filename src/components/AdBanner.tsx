import React, { useState } from "react";
import GoogleAdSense from "./GoogleAdSense";

interface AdBannerProps {
  className?: string;
  adClient?: string; // Google AdSense 클라이언트 ID
  adSlot?: string; // Google AdSense 슬롯 ID
  showPlaceholder?: boolean; // 플레이스홀더 표시 여부
}

const AdBanner: React.FC<AdBannerProps> = ({
  className,
  adClient,
  adSlot,
  showPlaceholder = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  // 새로고침마다 랜덤 배너 선택
  React.useEffect(() => {
    const randomBanner = Math.floor(Math.random() * 3);
    setCurrentBanner(randomBanner);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    document.body.classList.add("ad-banner-closed");
  };

  // 3개의 다른 배너 데이터
  const bannerData = [
    {
      title: "🎮 치지직 채팅 분석 도구",
      description: "실시간 채팅 통계와 분석을 한눈에 확인하세요",
      rating: "⭐ 4.8/5.0",
      users: "10,000+ 사용자",
      price: "무료",
      cta: "지금 시작하기",
      imageColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      buttonColor: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
      icon: "🎮",
    },
    {
      title: "📊 실시간 채팅 모니터링",
      description: "스트리머와 시청자 간의 소통을 분석해보세요",
      rating: "⭐ 4.9/5.0",
      users: "15,000+ 사용자",
      price: "무료",
      cta: "무료 체험하기",
      imageColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      buttonColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "📊",
    },
    {
      title: "🔥 인기 채팅 트렌드",
      description: "가장 핫한 채팅 키워드와 트렌드를 발견하세요",
      rating: "⭐ 4.7/5.0",
      users: "8,500+ 사용자",
      price: "무료",
      cta: "트렌드 보기",
      imageColor: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
      buttonColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      icon: "🔥",
    },
  ];

  const currentBannerInfo = bannerData[currentBanner];

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "90px",
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #e9ecef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Google AdSense 광고 영역 */}
      <div
        style={{
          width: "728px",
          height: "90px",
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "#6c757d",
          fontWeight: "500",
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "24px",
            height: "24px",
            border: "none",
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "14px",
            color: "#6c757d",
            transition: "all 0.2s ease",
            zIndex: 1001,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.2)";
            e.currentTarget.style.color = "#495057";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.1)";
            e.currentTarget.style.color = "#6c757d";
          }}
          title="광고 닫기"
        >
          ✕
        </button>

        {/* Google AdSense 광고 영역 */}
        {adClient && adSlot ? (
          <GoogleAdSense
            client={adClient}
            slot={adSlot}
            format="auto"
            responsive={true}
          />
        ) : showPlaceholder ? (
          <div
            id="google-ad-banner"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* 실제 광고와 유사한 이미지 */}
            <div
              style={{
                width: "100%",
                maxWidth: "728px",
                height: "90px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "1px solid #e9ecef",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                position: "relative",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* 광고 이미지 영역 */}
              <div
                style={{
                  width: "100px",
                  height: "60px",
                  background: currentBannerInfo.imageColor,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "white",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    background:
                      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.2)"/><circle cx="100" cy="40" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="80" cy="15" r="1.5" fill="rgba(255,255,255,0.2)"/></svg>\')',
                    opacity: 0.6,
                  }}
                />
                <span style={{ zIndex: 1, fontWeight: "bold" }}>
                  {currentBannerInfo.icon}
                </span>
              </div>

              {/* 광고 텍스트 영역 */}
              <div
                style={{
                  flex: 1,
                  marginLeft: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: 0, // 텍스트 오버플로우 방지
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#1a1a1a",
                    marginBottom: "4px",
                    lineHeight: "1.2",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentBannerInfo.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666666",
                    lineHeight: "1.3",
                    marginBottom: "3px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentBannerInfo.description}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999999",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "3px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{currentBannerInfo.rating}</span>
                  <span>•</span>
                  <span>{currentBannerInfo.users}</span>
                  <span>•</span>
                  <span>{currentBannerInfo.price}</span>
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#cccccc",
                    fontStyle: "italic",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "3px",
                    marginTop: "3px",
                  }}
                >
                  Google AdSense 배너 광고
                </div>
              </div>

              {/* CTA 버튼 */}
              <div
                style={{
                  background: currentBannerInfo.buttonColor,
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  textAlign: "center",
                  minWidth: "100px",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(0,0,0,0.2)";
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  {currentBannerInfo.cta}
                </span>
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdBanner;
