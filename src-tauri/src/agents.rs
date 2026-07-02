use serde_json;
use std::path::PathBuf;

pub fn get_status() -> Result<String, Box<dyn std::error::Error>> {
    let mut agents = serde_json::json!({ "claudeCode": null, "codex": null });

    // Claude Code: read session history from ~/.claude/
    let claude_dir = dirs::home_dir().unwrap_or_default().join(".claude").join("projects");
    if claude_dir.exists() {
        let session_count = std::fs::read_dir(&claude_dir)
            .map(|entries| entries.filter_map(|e| e.ok()).count())
            .unwrap_or(0);
        agents["claudeCode"] = serde_json::json!({
            "installed": true,
            "projectCount": session_count,
            "configDir": claude_dir.to_string_lossy(),
        });
    }

    // Codex: check if codex CLI is available
    let codex_check = std::process::Command::new("which").arg("codex").output();
    if let Ok(out) = codex_check {
        if out.status.success() {
            agents["codex"] = serde_json::json!({
                "installed": true,
                "path": String::from_utf8_lossy(&out.stdout).trim().to_string(),
            });
        }
    }

    Ok(serde_json::to_string(&agents)?)
}
