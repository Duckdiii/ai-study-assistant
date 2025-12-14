import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProblemsListPage from "../pages/ProblemsListPage";
import ProblemDetailPage from "../pages/ProblemDetailPage";
import MainLayout from "../components/layout/MainLayout";
import RequireAuth from "./RequireAuth";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<RequireAuth><MainLayout><DashboardPage /></MainLayout></RequireAuth>} />
      <Route path="/problems" element={<RequireAuth><MainLayout><ProblemsListPage /></MainLayout></RequireAuth>} />
      <Route path="/problems/:id" element={<RequireAuth><MainLayout><ProblemDetailPage /></MainLayout></RequireAuth>} />

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
