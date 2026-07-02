import { useState, useEffect } from "react";
import { Sparkles, Copy, Download, Check } from "lucide-react";
import { getSummary, saveSummary, getWorkLogs, today, weekday } from "../lib/db";

export default function Summary() {
  const [date, setDate] = useState(today());
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSummary(date).then(s => setContent(s.content || "")).catch(() => {});
  }, [date]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const logs = await getWorkLogs(date);
      const workData = logs.map(l => `${l.time} [${l.source}] ${l.title} ${l.description}`).join("\n");
      if (!workData.trim()) {
        setContent("今日暂无工作记录，请先在工作台添加记录。");
        setGenerating(false);
        return;
      }
      const apiKey = localStorage.getItem("wb_deepseek_key") || "";
      if (!apiKey) {
        setContent("请先在设置中配置 DeepSeek API Key（localStorage key: wb_deepseek_key）");
        setGenerating(false);
        return;
      }
      const { generateSummary } = await import("../lib/db");
      const result = await generateSummary(apiKey, `日期: ${date}\n\n工作记录:\n${workData}`);
      setContent(result);
      await saveSummary(date, result);
    } catch (e) {
      setContent(`生成失败: ${e}`);
    }
    setGenerating(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    const blob = new Blob([`# 日报 · ${date}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `daily-report-${date}.md`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">每日总结</h1>
          <p className="text-sm text-gray-500">{date} · {weekday(date)}</p>
        </div>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-1.5 text-sm bg-surface-3 dark:bg-surface-dark-3 rounded-lg outline-none" />
          <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-1.5">
            <Sparkles size={16} /> {generating ? "生成中…" : "AI 生成"}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <textarea
          value={content}
          onChange={e => { setContent(e.target.value); saveSummary(date, e.target.value); }}
          placeholder="点击「AI 生成」自动汇总今日工作，或手动编写日报…"
          className="w-full min-h-[400px] bg-transparent border-0 outline-none text-sm leading-relaxed resize-none"
        />
        {content && (
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "已复制" : "复制"}
            </button>
            <button onClick={handleExport} className="btn-ghost flex items-center gap-1.5">
              <Download size={14} /> 导出 Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
