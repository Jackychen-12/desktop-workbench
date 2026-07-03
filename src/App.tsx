import { useState } from "react";
import { LayoutDashboard, FolderKanban, FileText, StickyNote, Trophy } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Summary from "./pages/Summary";
import Notes from "./pages/Notes";
import Motivation from "./pages/Motivation";

const tabs = [
  { id: "dashboard", label: "工作台", icon: LayoutDashboard },
  { id: "projects", label: "项目", icon: FolderKanban },
  { id: "summary", label: "日报", icon: FileText },
  { id: "notes", label: "备忘录", icon: StickyNote },
  { id: "motivation", label: "激励", icon: Trophy },
] as const;

type TabId = typeof tabs[number]["id"];

export default function App() {
  const [active, setActive] = useState<TabId>("dashboard");

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-[52px] bg-white border-b border-gray-200 flex items-center px-5 gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-blue-500 font-bold text-sm">
          <div className="w-[22px] h-[22px] bg-blue-500 rounded-md grid place-items-center text-white text-[11px] font-extrabold">W</div>
          Workbench
        </div>

        <div className="flex gap-[1px] bg-gray-100 rounded-lg p-0.5 ml-4">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`px-3.5 py-[5px] rounded-md text-[11px] font-medium transition-colors ${
                active === id
                  ? "bg-white text-blue-500 font-semibold shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-5">
          {[
            { n: "12", l: "commits" }, { n: "3", l: "PRs" },
            { n: "5", l: "项目" }, { n: "12", l: "连续天" },
          ].map((s) => (
            <div key={s.l} className="text-center min-w-[44px]">
              <div className="text-base font-bold text-gray-800 leading-none">{s.n}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">{s.l}</div>
            </div>
          ))}
          <div className="w-[30px] h-[30px] rounded-full bg-blue-500 text-white grid place-items-center text-xs font-semibold ml-2">
            J
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-[18px]">
        <div className="animate-in">
          {active === "dashboard" && <Dashboard />}
          {active === "projects" && <Projects />}
          {active === "summary" && <Summary />}
          {active === "notes" && <Notes />}
          {active === "motivation" && <Motivation />}
        </div>
      </main>
    </div>
  );
}
