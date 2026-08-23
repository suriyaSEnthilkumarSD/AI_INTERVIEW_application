import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Problems",
      path: "/problems",
      icon: "▤",
    },
    {
      name: "Submissions",
      path: "/submissions",
      icon: "⇄",
    },
    {
      name: "AI Assistant",
      path: "/ai",
      icon: "✦",
    },
    {
      name: "Bookmarks",
      path: "/bookmarks",
      icon: "♡",
    },
    {
      name: "Contests",
      path: "/contests",
      icon: "♜",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "♙",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[230px] flex-col border-r border-slate-800 bg-[#07101f]">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-800 px-5">
        <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-900/30">
          {"</>"}
        </div>

        <h1 className="text-xl font-bold text-white">
          CodeMentor{" "}
          <span className="text-blue-500">
            AI
          </span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`
              }
            >
              <span className="w-5 text-center text-lg">
                {item.icon}
              </span>

              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User / Logout */}
      <div className="border-t border-slate-800 p-4">
        {user && (
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {user.username
                ? user.username.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {user.username}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <span className="text-lg">
            ⇥
          </span>

          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;