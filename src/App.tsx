// App.tsx
import React from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ChannelSelect from "./pages/ChannelSelect";
import UserDetail from "./pages/UserDetail";
import Archive from "./pages/Archive";
import NotFoundUser from "./pages/NotFoundUser";
import ChatAnalysis from "./pages/ChatAnalysis";
import UserSelect from "./pages/UserSelect";
import "@cloudscape-design/global-styles/index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* 메인 진입 시 채널 선택 페이지로 이동 */}
          <Route path="/" element={<Navigate to="/channels" />} />
          <Route path="/channels" element={<ChannelSelect />} />
          <Route path="/dashboard/:channelId" element={<Dashboard />} />
          <Route path="/user-select" element={<UserSelect />} />
          <Route path="/user/:nickname" element={<UserDetail />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/chat-analysis" element={<ChatAnalysis />} />
          <Route path="/not-found" element={<NotFoundUser />} />
        </Routes>
      </Layout>
    </Router>
  );
};
export default App;
