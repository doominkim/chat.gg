// components/Layout.tsx
import React, { useState } from "react";
// import {Route, Routes} from "react-router-dom";
// import UserDetail from "@/pages/UserDetail";
import {
  AppLayout,
  TopNavigation,
  TextFilter,
} from "@cloudscape-design/components";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      <TopNavigation
        identity={{
          href: "#",
          title: "　F_ Your Chzzk",
          logo: {
            src: "/logo.png",
          },   
          onFollow: () => 
    window.location.href = "/dashboard" // 항상 /dashboard로 이동
        }}
        utilities={[
          { type: "button", text: "Dashboard", href: "/dashboard" },
          { type: "button", text: "User", href: "/users" },
          { type: "button", text: "Archive", href: "/archive" },
        ]}
        search={
          <TextFilter
            filteringText={searchValue}
            onChange={({ detail }) => setSearchValue(detail.filteringText)}
            filteringPlaceholder="유저 정보를 입력해주세요"
          />
        }
      />

      <AppLayout
        content={children}
        navigationHide={true}
        toolsHide={true}
      />
    </>
  );
};

export default Layout;
