// components/Layout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppLayout,
  TopNavigation,
  Autosuggest,
  FormField,
} from "@cloudscape-design/components";
import { userService } from "../api/services";
import type { UserSearchResult } from "../api/services/userService";
import AdBanner from "./AdBanner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ value: string }[]>([]);

  // 홈페이지 또는 channels 페이지인지 확인
  const isGradientPage =
    location.pathname === "/" || location.pathname === "/channels";

  // 그라데이션 페이지일 때 body에 클래스 추가/제거
  useEffect(() => {
    if (isGradientPage) {
      document.body.classList.add("gradient-page");
    } else {
      document.body.classList.remove("gradient-page");
    }

    return () => {
      document.body.classList.remove("gradient-page");
    };
  }, [isGradientPage]);

  // 닉네임 규칙(예시): 한글/영문/숫자/언더바/하이픈/점/공백, 2~30자
  const isValidNickname = (s: string) =>
    /^[\p{L}\p{N}_\-. ]{2,30}$/u.test(s.trim());

  // 자동완성 로드: 실제 API 호출 (GET /user/search/userIdHash?nickname=&channelId=)
  const loadSuggestions = async (q: string) => {
    const query = q.trim();
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      const resp = await userService.searchUsers({ nickname: query });
      const data: UserSearchResult = resp.data;
      const names = (data.users || []).map((u) => u.name);
      setOptions(names.map((name) => ({ value: name })));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // 라우팅 헬퍼
  const toUserDetail = (q: string, hash?: string) =>
    navigate(
      `/user/${encodeURIComponent(q)}${
        hash ? `?userIdHash=${encodeURIComponent(hash)}` : ""
      }`
    );
  const toNotFound = (q: string) =>
    navigate(`/not-found?nickname=${encodeURIComponent(q)}`, { replace: true });

  const goToUserByNickname = async (nickname: string) => {
    const q = nickname.trim();
    if (!isValidNickname(q)) {
      setStatus("닉네임은 2~30자의 한글/영문/숫자만 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      setStatus(null);

      // 실제 API로 검색하여 userIdHashes 개수로 판단
      const resp = await userService.searchUsers({ nickname: q });
      const data: UserSearchResult = resp.data;
      const users = data.users || [];
      const count = Array.isArray(data.userIdHashes)
        ? data.userIdHashes.length
        : 0;

      if (count === 0) {
        toNotFound(q);
      } else if (count === 1) {
        const name = users[0]?.name || q;
        const hash = (data.userIdHashes && data.userIdHashes[0]) || undefined;
        toUserDetail(name, hash);
      } else {
        navigate("/user-select", {
          state: {
            users,
            userIdHashes: data.userIdHashes || [],
            searchTerm: q,
          },
        });
      }
    } catch (error) {
      console.error("User check failed:", error);
      toNotFound(q);
    } finally {
      setLoading(false);
      setSearchValue("");
      setOptions([]);
      setStatus(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isGradientPage
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          : undefined,
        fontFamily: isGradientPage
          ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          : undefined,
      }}
    >
      <TopNavigation
        // SPA 네비게이션: 새로고침 방지
        identity={{
          href: "/",
          title: "chat.gg",
          onFollow: (e) => {
            e.preventDefault();
            navigate("/");
          },
        }}
        utilities={[]}
        search={
          <FormField errorText={status || undefined}>
            <Autosuggest
              value={searchValue}
              onChange={({ detail }) => setSearchValue(detail.value)}
              onLoadItems={({ detail }) =>
                loadSuggestions(detail.filteringText || "")
              }
              loadingText="불러오는 중..."
              statusType={loading ? "loading" : status ? "error" : "finished"}
              options={options}
              placeholder="닉네임을 입력해주세요."
              expandToViewport
              onSelect={({ detail }) => {
                if (detail.value) goToUserByNickname(detail.value);
              }}
              onKeyDown={(e) => {
                if (e.detail.key === "Enter") {
                  e.preventDefault();
                  goToUserByNickname(searchValue);
                }
              }}
            />
          </FormField>
        }
      />

      <div
        style={{
          background: isGradientPage
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : undefined,
          minHeight: isGradientPage ? "calc(100vh - 60px)" : undefined,
        }}
      >
        <AppLayout
          content={children}
          navigationHide={true}
          toolsHide={true}
          data-testid="app-layout"
        />
      </div>

      {/* 광고 배너 - 항상 최하단에 고정 */}
      <AdBanner
        showPlaceholder={true} // 플레이스홀더 표시 (실제 AdSense 정보가 없을 때)
      />
    </div>
  );
};

export default Layout;
