import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type NavbarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

function Navbar({
  collapsed,
  setCollapsed,
}: NavbarProps) {
  const { logout, user } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const getInitial = () => {
    if (!user?.username) {
      return "U";
    }

    return user.username
      .charAt(0)
      .toUpperCase();
  };

  return (
    <aside
      className={
        collapsed
          ? "sidebar collapsed"
          : "sidebar"
      }
    >
      {/* LOGO */}

      <div className="sidebar-logo">
        <NavLink
          to="/dashboard"
          className="sidebar-brand"
        >
          <div className="logo-icon">
            &lt;/&gt;
          </div>

          {!collapsed && (
            <span className="brand-text">
              CodeMentor <strong>AI</strong>
            </span>
          )}
        </NavLink>

        <button
          className="sidebar-toggle"
          onClick={() =>
            setCollapsed((previous) => !previous)
          }
        >
          {collapsed ? "☰" : "✕"}
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="sidebar-icon">
            ▦
          </span>

          {!collapsed && (
            <span>Dashboard</span>
          )}
        </NavLink>

        <NavLink
          to="/problems"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="sidebar-icon">
            ▤
          </span>

          {!collapsed && (
            <span>Problems</span>
          )}
        </NavLink>

        <NavLink
          to="/submissions"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="sidebar-icon">
            ↔
          </span>

          {!collapsed && (
            <span>Submissions</span>
          )}
        </NavLink>
      </nav>

      {/* BOTTOM */}

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {getInitial()}
          </div>

          {!collapsed && user && (
            <div className="user-info">
              <span className="user-name">
                {user.username}
              </span>

              <span className="user-email">
                {user.email}
              </span>
            </div>
          )}
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">
            ↪
          </span>

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Navbar;