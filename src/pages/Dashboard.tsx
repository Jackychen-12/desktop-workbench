import { useState, useEffect, useCallback } from "react";
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Clock, GitCommit, Bot } from "lucide-react";
import { addWorkLog, getWorkLogs, toggleWorkLog, deleteWorkLog, today, nowTime, weekday, type WorkLog } from "../lib/db";

export default function Dashboard() {
  const [date, setDate] = useState(today());
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [input, setInput] = useState("");
  const [tag, setTag] = useState("feat");

  const load = useCallback(async () => {
    try { setLogs(await getWorkLogs(date)); } catch { setLogs([]); }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!input.trim()) return;
    const tags = JSON.stringify([tag]);
    await addWorkLog(date, nowTime(), input.trim(), "", tags);
    setInput("");
    load();
  }

  async function handleToggle(id: string) {
    await toggleWorkLog(id);
    load();
  }

  async function handleDelete(id: string) {
    await deleteWorkLog(id);
    load();
  }

  function shiftDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  }

  const done = logs.filter(l => l.done).length;

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in">
      {/* Date header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => shiftDate(-1)} className="btn-ghost p-1.5"><ChevronLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold">{date}</h1>
            <p className="text-sm text-gray-500">{weekday(date)}</p>
          </div>
          <button onClick={() => shiftDate(1)} className="btn-ghost p-1.5"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{done}/{logs.length} 完成</span>
        </div>
      </div>

      {/* Quick add */}
      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="记录工作内容…"
            className="flex-1 px-3 py-2 text-sm bg-surface-3 dark:bg-surface-dark-3 rounded-lg border-0 outline-none focus:ring-2 focus:ring-brand-400/30"
          />
          <select value={tag} onChange={e => setTag(e.target.value)} className="px-2 py-1 text-xs bg-surface-3 dark:bg-surface-dark-3 rounded-lg border-0 outline-none">
            <option value="feat">feat</option>
            <option value="fix">fix</option>
            <option value="review">review</option>
            <option value="meeting">meeting</option>
            <option value="research">research</option>
            <option value="other">other</option>
          </select>
          <button onClick={handleAdd} className="btn-primary px-3"><Plus size={16} /></button>
        </div>
      </div>

      {/* Work logs */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">今日记录</h2>
        {logs.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">
            还没有记录，开始你的第一条吧
          </div>
        )}
        {logs.map(log => {
          const tags: string[] = (() => { try { return JSON.parse(log.tags); } catch { return []; } })();
          return (
            <div key={log.id} className={`card card-hover p-3 flex items-center gap-3 ${log.done ? "opacity-60" : ""}`}>
              <button onClick={() => handleToggle(log.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${log.done ? "bg-brand-500 border-brand-500" : "border-gray-300 dark:border-gray-600"}`}>
                {log.done && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{log.time}</span>
                  <span className={`text-sm ${log.done ? "line-through text-gray-400" : ""}`}>{log.title}</span>
                </div>
              </div>
              {tags.map(t => <span key={t} className="tag">#{t}</span>)}
              {log.source !== "manual" && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  {log.source === "git" && <GitCommit size={12} />}
                  {log.source === "claude" && <Bot size={12} />}
                  {log.source}
                </span>
              )}
              <button onClick={() => handleDelete(log.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
