use rusqlite::{Connection, params};
use uuid::Uuid;
use chrono::Utc;

pub struct Storage {
    conn: Connection,
}

impl Storage {
    pub fn new(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let conn = Connection::open(path)?;
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS work_logs (
                id TEXT PRIMARY KEY, date TEXT NOT NULL, time TEXT, title TEXT NOT NULL,
                description TEXT DEFAULT '', tags TEXT DEFAULT '[]', source TEXT DEFAULT 'manual',
                source_ref TEXT DEFAULT '', done INTEGER DEFAULT 0, created_at TEXT
            );
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, local_path TEXT DEFAULT '',
                github_repo TEXT DEFAULT '', status TEXT DEFAULT 'active', created_at TEXT
            );
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY, content TEXT DEFAULT '', color TEXT DEFAULT 'yellow',
                x REAL DEFAULT 100, y REAL DEFAULT 100, w REAL DEFAULT 240, h REAL DEFAULT 200,
                pinned INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT
            );
            CREATE TABLE IF NOT EXISTS daily_summaries (
                date TEXT PRIMARY KEY, content TEXT DEFAULT '', generated_at TEXT
            );
            CREATE TABLE IF NOT EXISTS pomodoros (
                id TEXT PRIMARY KEY, date TEXT, start_time TEXT, end_time TEXT,
                duration_min INTEGER, project_id TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS streaks (
                date TEXT PRIMARY KEY, has_activity INTEGER DEFAULT 0, focus_minutes INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY, name TEXT, icon TEXT, unlocked_at TEXT
            );
        ")?;
        Ok(Self { conn })
    }

    pub fn add_work_log(&self, date: &str, time: &str, title: &str, description: &str, tags: &str, source: &str) -> Result<String, Box<dyn std::error::Error>> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO work_logs (id, date, time, title, description, tags, source, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
            params![id, date, time, title, description, tags, source, now],
        )?;
        Ok(serde_json::json!({"id": id, "date": date, "time": time, "title": title, "description": description, "tags": tags, "source": source, "done": false}).to_string())
    }

    pub fn get_work_logs(&self, date: &str) -> Result<String, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare("SELECT id, date, time, title, description, tags, source, source_ref, done FROM work_logs WHERE date = ?1 ORDER BY time DESC")?;
        let rows: Vec<serde_json::Value> = stmt.query_map(params![date], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_,String>(0)?, "date": row.get::<_,String>(1)?,
                "time": row.get::<_,String>(2).unwrap_or_default(),
                "title": row.get::<_,String>(3)?, "description": row.get::<_,String>(4).unwrap_or_default(),
                "tags": row.get::<_,String>(5).unwrap_or_else(|_| "[]".to_string()),
                "source": row.get::<_,String>(6).unwrap_or_else(|_| "manual".to_string()),
                "sourceRef": row.get::<_,String>(7).unwrap_or_default(),
                "done": row.get::<_,bool>(8).unwrap_or(false),
            }))
        })?.filter_map(|r| r.ok()).collect();
        Ok(serde_json::to_string(&rows)?)
    }

    pub fn toggle_work_log(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.conn.execute("UPDATE work_logs SET done = NOT done WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn delete_work_log(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.conn.execute("DELETE FROM work_logs WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn add_project(&self, name: &str, local_path: &str, github_repo: &str) -> Result<String, Box<dyn std::error::Error>> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO projects (id, name, local_path, github_repo, created_at) VALUES (?1,?2,?3,?4,?5)",
            params![id, name, local_path, github_repo, now],
        )?;
        Ok(serde_json::json!({"id": id, "name": name, "localPath": local_path, "githubRepo": github_repo, "status": "active"}).to_string())
    }

    pub fn get_projects(&self) -> Result<String, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare("SELECT id, name, local_path, github_repo, status FROM projects ORDER BY created_at DESC")?;
        let rows: Vec<serde_json::Value> = stmt.query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_,String>(0)?, "name": row.get::<_,String>(1)?,
                "localPath": row.get::<_,String>(2).unwrap_or_default(),
                "githubRepo": row.get::<_,String>(3).unwrap_or_default(),
                "status": row.get::<_,String>(4).unwrap_or_else(|_| "active".to_string()),
            }))
        })?.filter_map(|r| r.ok()).collect();
        Ok(serde_json::to_string(&rows)?)
    }

    pub fn delete_project(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn save_note(&self, id: &str, content: &str, color: &str, x: f64, y: f64, w: f64, h: f64, pinned: bool) -> Result<(), Box<dyn std::error::Error>> {
        let now = Utc::now().to_rfc3339();
        self.conn.execute(
            "INSERT OR REPLACE INTO notes (id, content, color, x, y, w, h, pinned, created_at, updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8, COALESCE((SELECT created_at FROM notes WHERE id=?1), ?9), ?9)",
            params![id, content, color, x, y, w, h, pinned, now],
        )?;
        Ok(())
    }

    pub fn get_notes(&self) -> Result<String, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare("SELECT id, content, color, x, y, w, h, pinned FROM notes ORDER BY updated_at DESC")?;
        let rows: Vec<serde_json::Value> = stmt.query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_,String>(0)?, "content": row.get::<_,String>(1).unwrap_or_default(),
                "color": row.get::<_,String>(2).unwrap_or_else(|_| "yellow".to_string()),
                "x": row.get::<_,f64>(3).unwrap_or(100.0), "y": row.get::<_,f64>(4).unwrap_or(100.0),
                "w": row.get::<_,f64>(5).unwrap_or(240.0), "h": row.get::<_,f64>(6).unwrap_or(200.0),
                "pinned": row.get::<_,bool>(7).unwrap_or(false),
            }))
        })?.filter_map(|r| r.ok()).collect();
        Ok(serde_json::to_string(&rows)?)
    }

    pub fn delete_note(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.conn.execute("DELETE FROM notes WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn save_summary(&self, date: &str, content: &str) -> Result<(), Box<dyn std::error::Error>> {
        let now = Utc::now().to_rfc3339();
        self.conn.execute("INSERT OR REPLACE INTO daily_summaries (date, content, generated_at) VALUES (?1,?2,?3)", params![date, content, now])?;
        Ok(())
    }

    pub fn get_summary(&self, date: &str) -> Result<String, Box<dyn std::error::Error>> {
        let result: Option<String> = self.conn.query_row(
            "SELECT content FROM daily_summaries WHERE date = ?1", params![date],
            |row| row.get(0),
        ).ok();
        Ok(serde_json::json!({"date": date, "content": result.unwrap_or_default()}).to_string())
    }

    pub fn add_pomodoro(&self, date: &str, duration_min: i32, project_id: &str) -> Result<String, Box<dyn std::error::Error>> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        self.conn.execute(
            "INSERT INTO pomodoros (id, date, start_time, duration_min, project_id) VALUES (?1,?2,?3,?4,?5)",
            params![id, date, now, duration_min, project_id],
        )?;
        self.record_activity(date, duration_min)?;
        Ok(serde_json::json!({"id": id}).to_string())
    }

    pub fn record_activity(&self, date: &str, focus_minutes: i32) -> Result<(), Box<dyn std::error::Error>> {
        self.conn.execute(
            "INSERT INTO streaks (date, has_activity, focus_minutes) VALUES (?1, 1, ?2) ON CONFLICT(date) DO UPDATE SET has_activity=1, focus_minutes=focus_minutes+?2",
            params![date, focus_minutes],
        )?;
        Ok(())
    }

    pub fn get_streak_data(&self, days: i32) -> Result<String, Box<dyn std::error::Error>> {
        let mut stmt = self.conn.prepare("SELECT date, has_activity, focus_minutes FROM streaks ORDER BY date DESC LIMIT ?1")?;
        let rows: Vec<serde_json::Value> = stmt.query_map(params![days], |row| {
            Ok(serde_json::json!({
                "date": row.get::<_,String>(0)?,
                "hasActivity": row.get::<_,bool>(1).unwrap_or(false),
                "focusMinutes": row.get::<_,i32>(2).unwrap_or(0),
            }))
        })?.filter_map(|r| r.ok()).collect();
        Ok(serde_json::to_string(&rows)?)
    }
}
