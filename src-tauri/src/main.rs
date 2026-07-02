mod storage;
mod git;
mod github;
mod agents;
mod summary;

use storage::Storage;
use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    db: Mutex<Storage>,
}

#[tauri::command]
fn add_work_log(state: tauri::State<AppState>, date: String, time: String, title: String, description: String, tags: String, source: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_work_log(&date, &time, &title, &description, &tags, &source).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_work_logs(state: tauri::State<AppState>, date: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_work_logs(&date).map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_work_log(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.toggle_work_log(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_work_log(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_work_log(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_project(state: tauri::State<AppState>, name: String, local_path: String, github_repo: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_project(&name, &local_path, &github_repo).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_projects(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_projects().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_project(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_project(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_note(state: tauri::State<AppState>, id: String, content: String, color: String, x: f64, y: f64, w: f64, h: f64, pinned: bool) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_note(&id, &content, &color, x, y, w, h, pinned).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_notes(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_notes().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_note(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_summary(state: tauri::State<AppState>, date: String, content: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_summary(&date, &content).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_summary(state: tauri::State<AppState>, date: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_summary(&date).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_pomodoro(state: tauri::State<AppState>, date: String, duration_min: i32, project_id: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_pomodoro(&date, duration_min, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_streak_data(state: tauri::State<AppState>, days: i32) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_streak_data(days).map_err(|e| e.to_string())
}

#[tauri::command]
fn record_activity(state: tauri::State<AppState>, date: String, focus_minutes: i32) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.record_activity(&date, focus_minutes).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_git_today(paths: Vec<String>) -> Result<String, String> {
    git::get_today_commits(&paths).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_github_activity(token: String, username: String) -> Result<String, String> {
    github::get_today_activity(&token, &username).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_github_repo_info(token: String, repo: String) -> Result<String, String> {
    github::get_repo_info(&token, &repo).await.map_err(|e| e.to_string())
}

#[tauri::command]
fn get_agent_status() -> Result<String, String> {
    agents::get_status().map_err(|e| e.to_string())
}

#[tauri::command]
async fn generate_summary(api_key: String, work_data: String) -> Result<String, String> {
    summary::generate(&api_key, &work_data).await.map_err(|e| e.to_string())
}

fn main() {
    let db_path = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("desktop-workbench")
        .join("workbench.db");

    std::fs::create_dir_all(db_path.parent().unwrap()).ok();

    let storage = Storage::new(db_path.to_str().unwrap())
        .expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState { db: Mutex::new(storage) })
        .invoke_handler(tauri::generate_handler![
            add_work_log, get_work_logs, toggle_work_log, delete_work_log,
            add_project, get_projects, delete_project,
            save_note, get_notes, delete_note,
            save_summary, get_summary,
            add_pomodoro, get_streak_data, record_activity,
            get_git_today, get_github_activity, get_github_repo_info,
            get_agent_status, generate_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
