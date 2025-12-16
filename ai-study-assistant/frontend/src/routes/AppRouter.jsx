import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProblemsListPage from "../pages/ProblemsListPage";
import ProblemDetailPage from "../pages/ProblemDetailPage";
import MainLayout from "../components/layout/MainLayout";
import RequireAuth from "./RequireAuth"; //Route bảo vệ, chỉ cho phép user đã login đi tiếp

export default function AppRouter() { //AppRouter là bản đồ điều hướng của frontend
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* IMPORTANT: backend redirect OAuth về đây (vd: /oauth-success?token=xxx) */}
      <Route path="/oauth-success" element={<LoginPage />} />

      {/* Private */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/problems"
        element={
          <RequireAuth>
            <MainLayout>
              <ProblemsListPage />
            </MainLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/problems/:id"
        element={
          <RequireAuth>
            <MainLayout>
              <ProblemDetailPage />
            </MainLayout>
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
