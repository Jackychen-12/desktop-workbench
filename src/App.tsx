import { useState } from "react";
import { LayoutDashboard, FolderKanban, FileText, StickyNote, Trophy, Timer } from "lucide-react";
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-16 bg-surface-2 dark:bg-surface-dark-2 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-1">
        <div className="w-9 h-9 rounded-xl bg-brand-500 grid place-items-center mb-4">
          <span className="text-white text-sm font-bold">W</span>
        </div>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active === id
                ? "bg-brand-500 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-dark-3"
            }`}
            title={label}
          >
            <Icon size={18} />
            <span className="text-[9px] leading-none">{label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {active === "dashboard" && <Dashboard />}
        {active === "projects" && <Projects />}
        {active === "summary" && <Summary />}
        {active === "notes" && <Notes />}
        {active === "motivation" && <Motivation />}
      </main>
    </div>
  );
}
