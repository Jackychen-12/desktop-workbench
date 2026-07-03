import { useState, useEffect, useCallback } from "react";
import { Plus, Check } from "lucide-react";
import { addWorkLog, getWorkLogs, toggleWorkLog, today, nowTime, type WorkLog } from "../lib/db";

const AGENT_DATA = [
  { color: "#9f7aea", name: "Claude Code", info: "4 sessions · 68 calls" },
  { color: "#48bb78", name: "Codex", info: "2 tasks done" },
  { color: "#cbd5e0", name: "Git", info: "12 commits · 5 repos" },
  { color: "#cbd5e0", name: "GitHub", info: "3 PRs merged" },
];

const OPS = [
  { icon: "📝", bg: "#ebf8ff", label: "更新", detail: "简历数据" },
  { icon: "🚀", bg: "#f0fff4", label: "推送", detail: "CLI flags" },
  { icon: "🔧", bg: "#fffaf0", label: "修复", detail: "pnpm-lock" },
  { icon: "✨", bg: "#faf5ff", label: "新增", detail: "项目卡片" },
  { icon: "🐛", bg: "#fff5f5", label: "修复", detail: "登录 bug" },
];

const BARS = [35, 65, 50, 90, 15, 8, 5];
const DAYS = ["一", "二", "三", "四", "五", "六", "日"];

export default function Dashboard() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [input, setInput] = useState("");
  const [tag, setTag] = useState("feat");
  const d = today();

  const load = useCallback(async () => {
    try { setLogs(await getWorkLogs(d)); } catch { setLogs([]); }
  }, [d]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!input.trim()) return;
    await addWorkLog(d, nowTime(), input.trim(), "", JSON.stringify([tag]));
    setInput(""); load();
  }

  const done = logs.filter(l => l.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-0.5">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">Welcome, Jacky</h1>
          <p className="text-xs text-gray-400 mt-0.5">7月3日 周四 · 今日完成 {done} 项</p>
        </div>
      </div>

      {/* Bento 3-col grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "260px 1fr 180px" }}>
        {/* Col 1: Tasks + Quick access */}
        <div className="flex flex-col gap-3">
          <div className="card">
            <div className="card-head"><span className="card-title">工作记录</span><span className="card-link">全部 →</span></div>
            <div className="flex gap-1 mb-2">
              <input className="input flex-1" placeholder="记录…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} />
              <button onClick={handleAdd} className="btn btn-primary px-2.5">+</button>
            </div>
            {logs.map(log => {
              const tags: string[] = (() => { try { return JSON.parse(log.tags); } catch { return []; } })();
              return (
                <div key={log.id} className="log-row">
                  <div className={`check ${log.done ? "done" : ""}`} onClick={() => { toggleWorkLog(log.id); load(); }}>
                    {log.done && <Check size={8} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[10px] text-gray-400 min-w-[30px] tabular-nums">{log.time}</span>
                  <span className={`flex-1 text-xs ${log.done ? "line-through text-gray-400" : ""}`}>{log.title}</span>
                  {tags[0] && <span className={`tag ${tags[0] === "fix" ? "tag-blue" : tags[0] === "feat" ? "tag-green" : tags[0] === "review" ? "tag-orange" : "tag-red"}`}>#{tags[0]}</span>}
                </div>
              );
            })}
            {!logs.length && <div className="text-center text-gray-400 text-[11px] py-4">还没有记录</div>}
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">快捷入口</span></div>
            <div className="flex gap-1.5">
              {[{ icon: "📊", label: "统计", bg: "#ebf8ff" }, { icon: "💻", label: "开发", bg: "#f0fff4" }, { icon: "🔧", label: "工具", bg: "#fffaf0" }, { icon: "👤", label: "个人", bg: "#faf5ff" }].map(q => (
                <div key={q.label} className="flex flex-col items-center gap-1 w-[50px] cursor-pointer">
                  <div className="w-9 h-9 rounded-[10px] grid place-items-center text-base" style={{ background: q.bg }}>{q.icon}</div>
                  <span className="text-[9px] text-gray-500">{q.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Charts + Calendar */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="card flex-1">
              <div className="card-head"><span className="card-title">本周统计</span><span className="card-link">→</span></div>
              <div className="flex items-end gap-1.5 h-[68px] pt-1">
                {BARS.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-blue-500 min-h-[3px]" style={{ height: `${h}%`, opacity: i >= 4 ? 0.2 : 0.7 }} />
                    <span className="text-[8px] text-gray-400">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-blue flex-1">
              <div className="card-head"><span className="card-title">✦ AI 助手</span></div>
              <div className="text-[11px] text-blue-700 leading-relaxed">
                <div className="mb-1.5">💡 还有 2 项待办，建议优先 Review PR</div>
                <div>📊 本周效率较上周提升 <b className="text-green-600">23%</b></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">2026年07月</span></div>
            <div className="grid grid-cols-7 text-center mb-0.5">
              {["一","二","三","四","五","六","日"].map(d => <span key={d} className="text-[9px] text-gray-400 font-medium">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-[1px]">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(n => (
                <div key={n} className={`aspect-square grid place-items-center text-[11px] rounded-md cursor-pointer hover:bg-blue-50 ${n === 3 ? "bg-blue-500 text-white font-semibold !rounded-full" : "text-gray-500"}`}>{n}</div>
              ))}
            </div>
            <div className="flex gap-1 items-center mt-1.5">
              <span className="text-[10px] text-gray-400">心情</span>
              {["😊","😐","😫","🔥","💪"].map((e, i) => <span key={e} className={`text-base cursor-pointer transition-transform ${i === 0 ? "opacity-100 scale-110" : "opacity-40 hover:opacity-100"}`}>{e}</span>)}
            </div>
          </div>
        </div>

        {/* Col 3: Agent + Ops */}
        <div className="flex flex-col gap-3">
          <div className="card card-blue text-center py-4">
            <div className="text-[28px] mb-1">🎯</div>
            <div className="text-xl font-extrabold text-blue-700">5k→1万</div>
            <div className="text-[10px] text-blue-500 my-1">关注目标 14 天截止</div>
            <button className="btn btn-primary w-full justify-center text-[10px]">查看全部</button>
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">Agent</span></div>
            {AGENT_DATA.map(a => (
              <div key={a.name} className="flex items-center gap-1.5 py-1 text-[11px] text-gray-600">
                <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: a.color }} />
                <b className="font-semibold text-gray-800">{a.name}</b>
                <span className="text-gray-400">{a.info}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">最近操作</span></div>
            {OPS.map((op, i) => (
              <div key={i} className={`flex items-center gap-2 py-1 text-[11px] ${i > 0 ? "border-t border-gray-100" : ""}`}>
                <div className="w-6 h-6 rounded-md grid place-items-center text-[11px] flex-shrink-0" style={{ background: op.bg }}>{op.icon}</div>
                <span className="text-gray-500"><b className="font-semibold text-gray-800">{op.label}</b> {op.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
