// App.tsx
import React from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UserDetail from "./pages/UserDetail";
import Archive from "./pages/Archive";
import NotFoundUser from "./pages/NotFoundUser";
import UserList from "./pages/UserList";
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
          {/* 메인 진입 시 자동으로 /dashboard로 이동 */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-rank" element={<UserList />} />
          <Route path="/user-select" element={<UserSelect />} />
          <Route path="/user/:nickname" element={<UserDetail />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/not-found" element={<NotFoundUser />} />
        </Routes>
      </Layout>
    </Router>
  );
};
export default App;
