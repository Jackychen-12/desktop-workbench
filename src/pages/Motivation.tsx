import { useState, useEffect, useRef } from "react";
import { Flame, Award, Play, Pause, RotateCcw } from "lucide-react";
import { getStreakData, addPomodoro, today, type StreakDay } from "../lib/db";

const ACHIEVEMENTS = [
  { id: "first", name: "新手上路", icon: "🌱", desc: "第一次记录工作" },
  { id: "streak7", name: "7 日连续", icon: "🔥", desc: "连续 7 天打卡" },
  { id: "streak30", name: "月度坚持", icon: "💪", desc: "连续 30 天打卡" },
  { id: "focus6h", name: "效率大师", icon: "⚡", desc: "单日专注超 6 小时" },
  { id: "projects10", name: "项目达人", icon: "📦", desc: "管理 10+ 项目" },
  { id: "agent100", name: "Agent 达人", icon: "🤖", desc: "累计 100 次 Agent 调用" },
];

function HeatMap({ data }: { data: StreakDay[] }) {
  const cells = [];
  const d = new Date();
  for (let i = 179; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const ds = date.toISOString().slice(0, 10);
    const entry = data.find(s => s.date === ds);
    const level = entry?.focusMinutes ? Math.min(4, Math.ceil(entry.focusMinutes / 60)) : 0;
    const colors = ["bg-gray-100 dark:bg-gray-800", "bg-green-200 dark:bg-green-900", "bg-green-300 dark:bg-green-700", "bg-green-500 dark:bg-green-500", "bg-green-700 dark:bg-green-400"];
    cells.push(<div key={ds} className={`w-3 h-3 rounded-sm ${colors[level]}`} title={`${ds}: ${entry?.focusMinutes || 0}min`} />);
  }
  return <div className="flex flex-wrap gap-[3px]">{cells}</div>;
}

function Pomodoro() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const interval = useRef<number>();

  useEffect(() => {
    if (running) {
      interval.current = window.setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            if (!isBreak) {
              addPomodoro(today(), 25).catch(() => {});
              setIsBreak(true);
              return 5 * 60;
            } else {
              setIsBreak(false);
              return 25 * 60;
            }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [running, isBreak]);

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    <div className="card p-6 text-center">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
        {isBreak ? "休息时间" : "专注时间"}
      </div>
      <div className="text-5xl font-mono font-bold mb-4 tabular-nums">
        {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={() => setRunning(!running)} className="btn-primary flex items-center gap-1.5">
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "暂停" : "开始"}
        </button>
        <button onClick={() => { setRunning(false); setIsBreak(false); setSeconds(25 * 60); }} className="btn-ghost flex items-center gap-1.5">
          <RotateCcw size={16} /> 重置
        </button>
      </div>
    </div>
  );
}

export default function Motivation() {
  const [streakData, setStreakData] = useState<StreakDay[]>([]);

  useEffect(() => {
    getStreakData(180).then(setStreakData).catch(() => {});
  }, []);

  const currentStreak = (() => {
    let count = 0;
    const sorted = [...streakData].sort((a, b) => b.date.localeCompare(a.date));
    for (const s of sorted) {
      if (s.hasActivity) count++;
      else break;
    }
    return count;
  })();

  const totalFocus = streakData.reduce((sum, s) => sum + s.focusMinutes, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in">
      <h1 className="text-xl font-bold mb-6">激励中心</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
            <Flame size={24} /> {currentStreak}
          </div>
          <div className="text-xs text-gray-500 mt-1">连续打卡天数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-brand-500">{streakData.filter(s => s.hasActivity).length}</div>
          <div className="text-xs text-gray-500 mt-1">总打卡天数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-green-500">{Math.round(totalFocus / 60)}h</div>
          <div className="text-xs text-gray-500 mt-1">总专注时长</div>
        </div>
      </div>

      {/* Heat map */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">贡献热力图（近 6 个月）</h2>
        <HeatMap data={streakData} />
      </div>

      {/* Pomodoro */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">番茄钟</h2>
        <Pomodoro />
      </div>

      {/* Achievements */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5"><Award size={16} /> 成就徽章</h2>
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(a => {
            const unlocked = (a.id === "first" && streakData.length > 0) ||
                             (a.id === "streak7" && currentStreak >= 7) ||
                             (a.id === "streak30" && currentStreak >= 30) ||
                             (a.id === "focus6h" && streakData.some(s => s.focusMinutes >= 360));
            return (
              <div key={a.id} className={`card p-3 text-center transition-opacity ${unlocked ? "" : "opacity-40"}`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-xs font-medium">{a.name}</div>
                <div className="text-[10px] text-gray-400">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
