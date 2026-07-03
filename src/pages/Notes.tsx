import { useState, useEffect } from "react";
import { Plus, Trash2, Pin } from "lucide-react";
import { getNotes, saveNote, deleteNote, type Note } from "../lib/db";

const COLORS: Record<string, string> = {
  yellow: "bg-yellow-50 border-yellow-200",
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  pink: "bg-pink-50 border-pink-200",
  purple: "bg-purple-50 border-purple-200",
};
const COLOR_KEYS = Object.keys(COLORS);

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const load = async () => { try { setNotes(await getNotes()); } catch { setNotes([]); } };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const id = crypto.randomUUID();
    await saveNote({ id, content: "", color: "yellow", x: 0, y: 0, w: 240, h: 200, pinned: false });
    load();
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-extrabold tracking-tight">备忘录</h1>
        <button onClick={handleAdd} className="btn btn-primary"><Plus size={12} /> 新建</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {notes.map(note => (
          <div key={note.id} className={`rounded-xl border p-3 min-h-[110px] flex flex-col ${COLORS[note.color] || COLORS.yellow}`}>
            <div className="flex justify-between text-[9px] text-gray-400 mb-1.5">
              <span className="cursor-pointer" onClick={() => { const idx = COLOR_KEYS.indexOf(note.color); saveNote({ ...note, color: COLOR_KEYS[(idx + 1) % COLOR_KEYS.length] }); load(); }}>🎨</span>
              <span className="cursor-pointer hover:text-red-400" onClick={() => { deleteNote(note.id); load(); }}>×</span>
            </div>
            <textarea defaultValue={note.content} onBlur={e => saveNote({ ...note, content: e.target.value })}
              placeholder="写点什么…" className="flex-1 bg-transparent border-0 outline-none text-[11px] text-gray-600 leading-relaxed resize-none" />
          </div>
        ))}
        {!notes.length && <div className="col-span-3 card text-center text-gray-400 text-xs py-8">暂无便签</div>}
      </div>
    </div>
  );
}
