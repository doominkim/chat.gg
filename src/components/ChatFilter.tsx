import { useState } from "react";
import type { FindChatParams } from "../types/chat";
import { ChatType } from "../types/chat";

interface ChatFilterProps {
  onFilterChange: (params: FindChatParams) => void;
}

export function ChatFilter({ onFilterChange }: ChatFilterProps) {
  const [filters, setFilters] = useState<FindChatParams>({
    limit: 20,
  });

  const handleFilterChange = (key: keyof FindChatParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="chat-filter">
      <div className="filter-row">
        <input
          type="text"
          placeholder="채널 UUID"
          value={filters.uuid || ""}
          onChange={(e) =>
            handleFilterChange("uuid", e.target.value || undefined)
          }
        />
        <input
          type="text"
          placeholder="채널 ID"
          value={filters.chatChannelId || ""}
          onChange={(e) =>
            handleFilterChange("chatChannelId", e.target.value || undefined)
          }
        />
      </div>

      <div className="filter-row">
        <input
          type="number"
          placeholder="페이지 크기"
          value={filters.limit || 20}
          onChange={(e) =>
            handleFilterChange("limit", parseInt(e.target.value) || 20)
          }
          min="1"
        />
        <select
          value={filters.chatType || ""}
          onChange={(e) =>
            handleFilterChange("chatType", e.target.value || undefined)
          }
        >
          <option value="">모든 타입</option>
          <option value={ChatType.CHAT}>채팅</option>
          <option value={ChatType.DONATION}>도네이션</option>
          <option value={ChatType.FOLLOW}>팔로우</option>
          <option value={ChatType.SYSTEM}>시스템</option>
        </select>
      </div>

      <div className="filter-row">
        <input
          type="datetime-local"
          value={
            filters.from
              ? new Date(filters.from).toISOString().slice(0, 16)
              : ""
          }
          onChange={(e) =>
            handleFilterChange(
              "from",
              e.target.value ? new Date(e.target.value) : undefined
            )
          }
        />
        <input
          type="datetime-local"
          value={
            filters.to ? new Date(filters.to).toISOString().slice(0, 16) : ""
          }
          onChange={(e) =>
            handleFilterChange(
              "to",
              e.target.value ? new Date(e.target.value) : undefined
            )
          }
        />
      </div>

      <div className="filter-row">
        <input
          type="text"
          placeholder="메시지 검색"
          value={filters.message || ""}
          onChange={(e) =>
            handleFilterChange("message", e.target.value || undefined)
          }
        />
        <input
          type="text"
          placeholder="사용자 ID 해시"
          value={filters.userIdHash || ""}
          onChange={(e) =>
            handleFilterChange("userIdHash", e.target.value || undefined)
          }
        />
      </div>

      <div className="filter-row">
        <input
          type="text"
          placeholder="닉네임 검색"
          value={filters.nickname || ""}
          onChange={(e) =>
            handleFilterChange("nickname", e.target.value || undefined)
          }
        />
      </div>
    </div>
  );
}
