import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProblemsListPage from "../pages/ProblemsListPage";
import ProblemDetailPage from "../pages/ProblemDetailPage";
import MainLayout from "../components/layout/MainLayout";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />

      <Route
        path="/problems"
        element={
          <MainLayout>
            <ProblemsListPage />
          </MainLayout>
        }
      />

      <Route
        path="/problems/:id"
        element={
          <MainLayout>
            <ProblemDetailPage />
          </MainLayout>
        }
      />
    </Routes>
  );
}
