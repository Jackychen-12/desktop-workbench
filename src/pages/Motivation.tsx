import { useState, useEffect, useRef } from "react";
import { Flame, Play, Pause, RotateCcw } from "lucide-react";
import { getStreakData, addPomodoro, today, type StreakDay } from "../lib/db";

const ACHIEVEMENTS = [
  { id: "first", name: "新手上路", icon: "🌱", desc: "完成第一次记录" },
  { id: "streak7", name: "7 日连续", icon: "🔥", desc: "连续 7 天打卡" },
  { id: "focus6h", name: "效率大师", icon: "⚡", desc: "单日超 6 小时" },
  { id: "streak30", name: "月度坚持", icon: "💪", desc: "连续 30 天" },
  { id: "projects10", name: "项目达人", icon: "📦", desc: "10+ 项目" },
  { id: "agent100", name: "Agent 达人", icon: "🤖", desc: "100 次调用" },
];

function HeatMap({ data }: { data: StreakDay[] }) {
  const cells = [];
  const d = new Date();
  for (let i = 179; i >= 0; i--) {
    const date = new Date(d); date.setDate(date.getDate() - i);
    const ds = date.toISOString().slice(0, 10);
    const entry = data.find(s => s.date === ds);
    const level = entry?.focusMinutes ? Math.min(4, Math.ceil(entry.focusMinutes / 60)) : 0;
    const colors = ["bg-gray-100", "bg-green-200", "bg-green-400", "bg-green-600", "bg-green-800"];
    cells.push(<div key={ds} className={`hm-cell ${colors[level]}`} title={`${ds}: ${entry?.focusMinutes || 0}min`} />);
  }
  return <div className="flex flex-wrap gap-[2px]">{cells}</div>;
}

export default function Motivation() {
  const [streakData, setStreakData] = useState<StreakDay[]>([]);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const interval = useRef<number>();

  useEffect(() => { getStreakData(180).then(setStreakData).catch(() => {}); }, []);

  useEffect(() => {
    if (running) {
      interval.current = window.setInterval(() => {
        setSeconds(s => { if (s <= 1) { setRunning(false); addPomodoro(today(), 25).catch(() => {}); return 25 * 60; } return s - 1; });
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [running]);

  const currentStreak = (() => { let c = 0; const sorted = [...streakData].sort((a, b) => b.date.localeCompare(a.date)); for (const s of sorted) { if (s.hasActivity) c++; else break; } return c; })();
  const min = Math.floor(seconds / 60); const sec = seconds % 60;

  return (
    <div className="animate-in">
      <h1 className="text-[22px] font-extrabold tracking-tight mb-4">激励中心</h1>
      <div className="flex gap-2.5 mb-3">
        {[{ n: `🔥 ${currentStreak || 12}`, l: "连续打卡", c: "text-orange-500" }, { n: "47", l: "总天数", c: "text-blue-500" }, { n: "126h", l: "总专注", c: "text-green-500" }].map(s => (
          <div key={s.l} className="card flex-1 text-center py-2.5">
            <div className={`text-lg font-bold leading-none ${s.c}`}>{s.n}</div>
            <div className="text-[9px] text-gray-400 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          <div className="card">
            <div className="card-head"><span className="card-title">贡献热力图</span></div>
            <HeatMap data={streakData} />
          </div>
          <div className="card text-center py-3.5">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">番茄钟</div>
            <div className="text-[36px] font-light tabular-nums tracking-wider my-1.5">
              {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
            </div>
            <div className="flex justify-center gap-1.5">
              <button onClick={() => setRunning(!running)} className="btn btn-primary">
                {running ? <Pause size={10} /> : <Play size={10} />} {running ? "暂停" : "开始"}
              </button>
              <button onClick={() => { setRunning(false); setSeconds(25 * 60); }} className="btn btn-ghost">
                <RotateCcw size={10} /> 重置
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">成就徽章</span></div>
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = i < 3;
            return (
              <div key={a.id} className={`flex items-center gap-2 py-1.5 ${i > 0 ? "border-t border-gray-100" : ""} ${unlocked ? "" : "opacity-25"}`}>
                <div className="w-8 h-8 rounded-lg bg-gray-50 grid place-items-center text-xl">{a.icon}</div>
                <div><div className="text-[11px] font-semibold">{a.name}</div><div className="text-[9px] text-gray-400">{a.desc}</div></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
