import { useState, useEffect } from "react";
import { Copy, Download, Check, Sparkles } from "lucide-react";
import { getSummary, saveSummary, getWorkLogs, today } from "../lib/db";

export default function Summary() {
  const [date] = useState(today());
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { getSummary(date).then(s => setContent(s.content || "")).catch(() => {}); }, [date]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const logs = await getWorkLogs(date);
      const workData = logs.map(l => `${l.time} [${l.source}] ${l.title}`).join("\n");
      if (!workData.trim()) { setContent("今日暂无工作记录。"); setGenerating(false); return; }
      const apiKey = localStorage.getItem("wb_deepseek_key") || "";
      if (!apiKey) { setContent("请先配置 DeepSeek API Key。"); setGenerating(false); return; }
      const { generateSummary } = await import("../lib/db");
      const result = await generateSummary(apiKey, `日期: ${date}\n工作记录:\n${workData}`);
      setContent(result); await saveSummary(date, result);
    } catch (e) { setContent(`生成失败: ${e}`); }
    setGenerating(false);
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-[22px] font-extrabold tracking-tight">日报</h1><p className="text-xs text-gray-400 mt-0.5">7月3日 周四</p></div>
        <button onClick={handleGenerate} disabled={generating} className="btn btn-primary">
          <Sparkles size={12} /> {generating ? "生成中…" : "AI 生成"}
        </button>
      </div>
      <div className="card p-4">
        <textarea value={content} onChange={e => { setContent(e.target.value); saveSummary(date, e.target.value); }}
          placeholder="点击 AI 生成或手动编写日报…"
          className="w-full min-h-[360px] bg-transparent border-0 outline-none text-xs leading-relaxed resize-none text-gray-600" />
        {content && (
          <div className="flex gap-1.5 pt-3 border-t border-gray-100">
            <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn btn-ghost">
              {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? "已复制" : "复制"}
            </button>
            <button onClick={() => { const b = new Blob([`# 日报 ${date}\n\n${content}`], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `report-${date}.md`; a.click(); }} className="btn btn-ghost">
              <Download size={10} /> 导出
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
