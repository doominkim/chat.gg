// components/Layout.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppLayout,
  TopNavigation,
  Autosuggest,
  FormField,
} from "@cloudscape-design/components";
import { userService } from "../api/services";
import type { UserSearchResult } from "../api/services/userService";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ value: string }[]>([]);

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
        toUserDetail(name);
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
