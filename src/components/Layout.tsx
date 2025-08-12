// components/Layout.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppLayout,
  TopNavigation,
  Autosuggest,
  FormField,
} from "@cloudscape-design/components";

interface LayoutProps {
  children: React.ReactNode;
}

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "https://api.f-yourchat.com";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ value: string }[]>([]);

  // 닉네임 규칙(예시): 한글/영문/숫자/언더바/하이픈/점/공백, 2~30자
  const isValidNickname = (s: string) =>
    /^[\p{L}\p{N}_\-. ]{2,30}$/u.test(s.trim());

  // 자동완성 로드: 테스트 모드면 로컬 데이터, 아니면 API 호출
  const loadSuggestions = async (q: string) => {
    const query = q.trim();
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      const resp = await fetch(
        `${API_BASE_URL}/users/search?nickname=${encodeURIComponent(
          query
        )}&limit=10`,
        { credentials: "include" }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: string[] = await resp.json(); // 닉네임 목록만 반환
      setOptions(data.map((name) => ({ value: name })));
    } catch {
      setOptions([]);
      // setStatus("검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 라우팅 헬퍼
  const toUserDetail = (q: string) =>
    navigate(`/user/${encodeURIComponent(q)}`);
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

      // 유저 존재 여부 확인
      const response = await fetch(
        `${API_BASE_URL}/user/check/${encodeURIComponent(q)}`,
        { credentials: "include", method: "GET" }
      );

      if (response.ok) {
        const result = await response.json();
        result?.exists ? toUserDetail(q) : toNotFound(q);
      } else if (response.status === 404) {
        toNotFound(q);
      } else {
        toNotFound(q);
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
    <>
      <TopNavigation
        // SPA 네비게이션: 새로고침 방지
        identity={{
          href: "/dashboard",
          title: "　F_ Your Chzzk",
          logo: { src: "/logo.png" },
          onFollow: (e) => {
            e.preventDefault();
            navigate("/dashboard");
          },
        }}
        utilities={[
          { type: "button", text: "Ranking", href: "/user-rank" },
          { type: "button", text: "Archive", href: "/archive" },
        ]}
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

      <AppLayout content={children} navigationHide={true} toolsHide={true} />
    </>
  );
};

export default Layout;
