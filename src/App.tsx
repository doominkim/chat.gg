// App.tsx
import React from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import ChannelSelect from "./pages/ChannelSelect";
import UserDetail from "./pages/UserDetail";
import Archive from "./pages/Archive";
import NotFoundUser from "./pages/NotFoundUser";
import ChatAnalysis from "./pages/ChatAnalysis";
import UserSelect from "./pages/UserSelect";
import PersonalityAnalysis from "./pages/PersonalityAnalysis";
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
          {/* 홈페이지 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/channels" element={<ChannelSelect />} />
          <Route path="/dashboard/:channelId" element={<Dashboard />} />
          <Route path="/user-select" element={<UserSelect />} />
          <Route path="/user/:nickname" element={<UserDetail />} />
          <Route
            path="/personality-analysis/:userId"
            element={<PersonalityAnalysis />}
          />
          <Route path="/archive" element={<Archive />} />
          <Route path="/chat-analysis" element={<ChatAnalysis />} />
          <Route path="/not-found" element={<NotFoundUser />} />
        </Routes>
      </Layout>
    </Router>
  );
};
export default App;
