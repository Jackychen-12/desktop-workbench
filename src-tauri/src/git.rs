use std::process::Command;
use serde_json;

pub fn get_today_commits(paths: &[String]) -> Result<String, Box<dyn std::error::Error>> {
    let mut all_commits: Vec<serde_json::Value> = Vec::new();

    for path in paths {
        let output = Command::new("git")
            .args(["log", "--since=midnight", "--format=%H|%s|%an|%ai", "--no-merges"])
            .current_dir(path)
            .output();

        let repo_name = std::path::Path::new(path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout);
            for line in stdout.lines() {
                let parts: Vec<&str> = line.splitn(4, '|').collect();
                if parts.len() >= 4 {
                    all_commits.push(serde_json::json!({
                        "repo": repo_name,
                        "path": path,
                        "sha": parts[0],
                        "message": parts[1],
                        "author": parts[2],
                        "date": parts[3],
                    }));
                }
            }
        }
    }

    Ok(serde_json::to_string(&all_commits)?)
}
