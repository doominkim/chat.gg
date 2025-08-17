import React, { useEffect } from "react";

// Google AdSense 전역 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdSenseProps {
  client: string; // ca-pub-XXXXXXXXXXXXXXXX
  slot: string; // XXXXXXXXXX
  format?: string; // "auto" | "fluid" | "rectangle"
  responsive?: boolean;
  style?: React.CSSProperties;
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  client,
  slot,
  format = "auto",
  responsive = true,
  style = {},
}) => {
  useEffect(() => {
    // Google AdSense 스크립트 로드
    const loadAdSense = () => {
      if (typeof window !== "undefined" && !window.adsbygoogle) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
    };

    // AdSense 초기화
    const initAdSense = () => {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error("AdSense initialization error:", error);
        }
      }
    };

    loadAdSense();

    // 스크립트 로드 후 초기화
    const timer = setTimeout(initAdSense, 1000);

    return () => clearTimeout(timer);
  }, [client]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: "728px",
          height: "90px",
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default GoogleAdSense;
