import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, GitBranch, Star, AlertCircle, FolderOpen } from "lucide-react";
import { addProject, getProjects, deleteProject, type Project } from "../lib/db";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [repo, setRepo] = useState("");

  async function load() {
    try { setProjects(await getProjects()); } catch { setProjects([]); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    await addProject(name.trim(), path.trim(), repo.trim());
    setName(""); setPath(""); setRepo(""); setShowAdd(false);
    load();
  }

  async function handleDelete(id: string) {
    await deleteProject(id);
    load();
  }

  const statusColors: Record<string, string> = {
    active: "text-green-500",
    maintenance: "text-yellow-500",
    archived: "text-gray-400",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">项目看板</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> 添加项目
        </button>
      </div>

      {showAdd && (
        <div className="card p-4 mb-6 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="项目名称" className="w-full px-3 py-2 text-sm bg-surface-3 dark:bg-surface-dark-3 rounded-lg outline-none" />
          <input value={path} onChange={e => setPath(e.target.value)} placeholder="本地路径（如 /Users/you/projects/my-app）" className="w-full px-3 py-2 text-sm bg-surface-3 dark:bg-surface-dark-3 rounded-lg outline-none" />
          <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="GitHub 仓库（如 Jackychen-12/Career-Search）" className="w-full px-3 py-2 text-sm bg-surface-3 dark:bg-surface-dark-3 rounded-lg outline-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary">保存</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">暂无项目，点击「添加项目」开始</div>
        )}
        {projects.map(p => (
          <div key={p.id} className="card card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className={`text-xs ${statusColors[p.status] || "text-gray-400"}`}>● {p.status === "active" ? "活跃" : p.status === "maintenance" ? "维护" : "归档"}</span>
                </div>
                {p.localPath && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <FolderOpen size={12} /> {p.localPath}
                  </div>
                )}
                {p.githubRepo && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <GitBranch size={12} /> {p.githubRepo}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {p.githubRepo && (
                  <a href={`https://github.com/${p.githubRepo}`} target="_blank" rel="noopener" className="btn-ghost p-1.5" title="打开 GitHub">
                    <ExternalLink size={14} />
                  </a>
                )}
                <button onClick={() => handleDelete(p.id)} className="btn-danger p-1.5" title="删除">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
