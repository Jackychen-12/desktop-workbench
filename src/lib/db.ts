import { invoke } from "@tauri-apps/api/core";

export interface WorkLog {
  id: string; date: string; time: string; title: string;
  description: string; tags: string; source: string; sourceRef: string; done: boolean;
}

export interface Project {
  id: string; name: string; localPath: string; githubRepo: string; status: string;
}

export interface Note {
  id: string; content: string; color: string;
  x: number; y: number; w: number; h: number; pinned: boolean;
}

export interface StreakDay {
  date: string; hasActivity: boolean; focusMinutes: number;
}

export async function addWorkLog(date: string, time: string, title: string, description = "", tags = "[]", source = "manual"): Promise<WorkLog> {
  const result = await invoke<string>("add_work_log", { date, time, title, description, tags, source });
  return JSON.parse(result);
}

export async function getWorkLogs(date: string): Promise<WorkLog[]> {
  const result = await invoke<string>("get_work_logs", { date });
  return JSON.parse(result);
}

export async function toggleWorkLog(id: string): Promise<void> {
  await invoke("toggle_work_log", { id });
}

export async function deleteWorkLog(id: string): Promise<void> {
  await invoke("delete_work_log", { id });
}

export async function addProject(name: string, localPath: string, githubRepo: string): Promise<Project> {
  const result = await invoke<string>("add_project", { name, localPath, githubRepo });
  return JSON.parse(result);
}

export async function getProjects(): Promise<Project[]> {
  const result = await invoke<string>("get_projects");
  return JSON.parse(result);
}

export async function deleteProject(id: string): Promise<void> {
  await invoke("delete_project", { id });
}

export async function saveNote(note: Note): Promise<void> {
  await invoke("save_note", { ...note });
}

export async function getNotes(): Promise<Note[]> {
  const result = await invoke<string>("get_notes");
  return JSON.parse(result);
}

export async function deleteNote(id: string): Promise<void> {
  await invoke("delete_note", { id });
}

export async function saveSummary(date: string, content: string): Promise<void> {
  await invoke("save_summary", { date, content });
}

export async function getSummary(date: string): Promise<{ date: string; content: string }> {
  const result = await invoke<string>("get_summary", { date });
  return JSON.parse(result);
}

export async function addPomodoro(date: string, durationMin: number, projectId = ""): Promise<void> {
  await invoke("add_pomodoro", { date, durationMin, projectId });
}

export async function getStreakData(days = 180): Promise<StreakDay[]> {
  const result = await invoke<string>("get_streak_data", { days });
  return JSON.parse(result);
}

export async function recordActivity(date: string, focusMinutes: number): Promise<void> {
  await invoke("record_activity", { date, focusMinutes });
}

export async function getGitToday(paths: string[]): Promise<any[]> {
  const result = await invoke<string>("get_git_today", { paths });
  return JSON.parse(result);
}

export async function getGithubActivity(token: string, username: string): Promise<any[]> {
  const result = await invoke<string>("get_github_activity", { token, username });
  return JSON.parse(result);
}

export async function getGithubRepoInfo(token: string, repo: string): Promise<any> {
  const result = await invoke<string>("get_github_repo_info", { token, repo });
  return JSON.parse(result);
}

export async function getAgentStatus(): Promise<any> {
  const result = await invoke<string>("get_agent_status");
  return JSON.parse(result);
}

export async function generateSummary(apiKey: string, workData: string): Promise<string> {
  return await invoke<string>("generate_summary", { apiKey, workData });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
export function weekday(date: string): string {
  return "周" + WEEKDAYS[new Date(date).getDay()];
}
