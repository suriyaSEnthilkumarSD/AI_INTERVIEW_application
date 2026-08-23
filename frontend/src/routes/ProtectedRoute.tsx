import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } =
    useAuth();

  const [collapsed, setCollapsed] =
    useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div className="protected-layout">
      <Navbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={
          collapsed
            ? "main-content sidebar-collapsed"
            : "main-content"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedRoute;