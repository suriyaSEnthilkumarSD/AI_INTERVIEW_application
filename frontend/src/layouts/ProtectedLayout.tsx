import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function ProtectedLayout() {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      <Sidebar />

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProtectedLayout;