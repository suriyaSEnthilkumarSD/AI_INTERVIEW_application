import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProblemsPage from "../pages/ProblemsPage";
import ProblemDetailPage from "../pages/ProblemDetailPage";
import NotFoundPage from "../pages/NotFoundPage";
import SubmissionsPage from "../pages/SubmissionsPage";
import SubmissionDetailPage from "../pages/SubmissionDetailPage";
import VerifyOtpPage from "../pages/VerifyOTPPage";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
              path="/verify-otp"
              element={<VerifyOtpPage />}
              />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/problems" element={<ProblemsPage />} />

          <Route
          path="/problems/:problemId"
          element={<ProblemDetailPage />}
        />
        <Route
          path="/submissions"
          element={<SubmissionsPage />}
        />
        </Route>
        <Route
          path="/submissions/:submissionId"
          element={<SubmissionDetailPage />}
        />
        

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;