function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-end border-b border-slate-800 bg-[#020617]/95 px-6 backdrop-blur lg:px-10">
      <div className="flex items-center gap-5">
        {/* Search */}

        <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 md:flex">
          <span className="text-slate-500">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search problems..."
            className="w-48 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />

          <span className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-500">
            Ctrl K
          </span>
        </div>

        {/* Notification */}

        <button className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200">
          🔔

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        {/* User */}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
          U
        </div>
      </div>
    </header>
  );
}

export default Topbar;