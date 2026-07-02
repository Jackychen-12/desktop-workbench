import { useState, useEffect } from "react";
import { Plus, Trash2, Pin, PinOff } from "lucide-react";
import { getNotes, saveNote, deleteNote, type Note } from "../lib/db";

const COLORS = ["yellow", "blue", "green", "pink", "purple"] as const;
const COLOR_MAP: Record<string, string> = {
  yellow: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
  blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  pink: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800",
  purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);

  async function load() {
    try { setNotes(await getNotes()); } catch { setNotes([]); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    const id = crypto.randomUUID();
    const note: Note = { id, content: "", color: "yellow", x: 0, y: 0, w: 240, h: 200, pinned: false };
    await saveNote(note);
    load();
  }

  async function handleUpdate(note: Note) {
    await saveNote(note);
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    load();
  }

  async function togglePin(note: Note) {
    const updated = { ...note, pinned: !note.pinned };
    await saveNote(updated);
    load();
  }

  async function cycleColor(note: Note) {
    const idx = COLORS.indexOf(note.color as any);
    const next = COLORS[(idx + 1) % COLORS.length];
    const updated = { ...note, color: next };
    await saveNote(updated);
    load();
  }

  return (
    <div className="p-6 animate-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">备忘录</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> 新建便签
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {notes.length === 0 && (
          <div className="col-span-full card p-8 text-center text-gray-400 text-sm">
            暂无便签，点击「新建便签」开始
          </div>
        )}
        {notes.map(note => (
          <div key={note.id} className={`rounded-xl border p-4 flex flex-col min-h-[160px] ${COLOR_MAP[note.color] || COLOR_MAP.yellow}`}>
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => cycleColor(note)} className="w-4 h-4 rounded-full bg-current opacity-40 hover:opacity-70 transition" title="换颜色" />
              <div className="flex gap-1">
                <button onClick={() => togglePin(note)} className="text-gray-400 hover:text-gray-600 transition" title={note.pinned ? "取消置顶" : "置顶"}>
                  {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-500 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <textarea
              defaultValue={note.content}
              onBlur={e => handleUpdate({ ...note, content: e.target.value })}
              placeholder="写点什么…"
              className="flex-1 bg-transparent border-0 outline-none text-sm resize-none leading-relaxed"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
