import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, FolderOpen, GitBranch } from "lucide-react";
import { addProject, getProjects, deleteProject, type Project } from "../lib/db";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState(""); const [path, setPath] = useState(""); const [repo, setRepo] = useState("");

  const load = async () => { try { setProjects(await getProjects()); } catch { setProjects([]); } };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => { if (!name.trim()) return; await addProject(name, path, repo); setName(""); setPath(""); setRepo(""); setShowAdd(false); load(); };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-[22px] font-extrabold tracking-tight">项目看板</h1><p className="text-xs text-gray-400 mt-0.5">管理所有项目状态</p></div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary">+ 添加</button>
      </div>
      {showAdd && (
        <div className="card mb-3 space-y-2">
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="项目名称" />
          <input className="input" value={path} onChange={e => setPath(e.target.value)} placeholder="本地路径" />
          <input className="input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="GitHub 仓库 (owner/repo)" />
          <div className="flex gap-2"><button onClick={handleAdd} className="btn btn-primary">保存</button><button onClick={() => setShowAdd(false)} className="btn btn-ghost">取消</button></div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {projects.map(p => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-semibold">{p.name}</span>
              <span className={`text-[10px] font-medium ${p.status === "active" ? "text-green-500" : "text-orange-500"}`}>
                {p.status === "active" ? "● 活跃" : "○ 维护"}
              </span>
            </div>
            {p.localPath && <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1"><FolderOpen size={10} />{p.localPath}</div>}
            {p.githubRepo && <div className="flex items-center gap-1 text-[10px] text-gray-400"><GitBranch size={10} />{p.githubRepo}</div>}
            <div className="flex gap-1 mt-2">
              <button className="btn btn-ghost text-[10px]">目录</button>
              {p.githubRepo && <button className="btn btn-ghost text-[10px]">GitHub</button>}
              <button onClick={() => { deleteProject(p.id); load(); }} className="btn btn-ghost text-[10px] text-red-400 hover:text-red-600 ml-auto"><Trash2 size={10} /></button>
            </div>
          </div>
        ))}
        {!projects.length && <div className="col-span-3 card text-center text-gray-400 text-xs py-8">暂无项目</div>}
      </div>
    </div>
  );
}
